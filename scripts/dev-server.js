const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { scoreIpip } = require('../src/lib/scorer/ipipScorer');
const { toContextFile } = require('../src/lib/serializer/toContextFile');

const PORT = process.env.PORT || 5173;
const PUBLIC = path.join(__dirname, '..', 'public');

function sendJSON(res, obj){ res.writeHead(200, {'Content-Type':'application/json'}); res.end(JSON.stringify(obj)); }

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url);
  if (req.method === 'GET' && (parsed.pathname === '/' || parsed.pathname === '/index.html')){
    const p = path.join(PUBLIC, 'index.html');
    fs.readFile(p, 'utf8', (err, data)=>{
      if (err){ res.writeHead(500); res.end('Error'); return; }
      res.writeHead(200, {'Content-Type':'text/html'});
      res.end(data);
    });
    return;
  }
  if (req.method === 'POST' && parsed.pathname === '/generate'){
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', ()=>{
      try{
        const obj = JSON.parse(body);
        const responses = Array.isArray(obj.responses) ? obj.responses : [];
        const scored = scoreIpip(responses);
        const ctx = toContextFile({ id: 'web', summary: 'Generated from dev server', traits: { raw: scored.raw, normalized: scored.normalized } }, { ipipResponses: responses });
        const outPath = path.join('specs','001-personality-context-site','example.generated.json');
        fs.writeFileSync(outPath, JSON.stringify(ctx, null, 2), 'utf8');
        sendJSON(res, { ok: true, path: outPath, ctx });
      } catch (e){ sendJSON(res, { ok: false, error: e.message }); }
    });
    return;
  }
  // serve other static files
  const file = path.join(PUBLIC, parsed.pathname || '');
  if (fs.existsSync(file) && fs.statSync(file).isFile()){
    const ext = path.extname(file).toLowerCase();
    const map = { '.js':'application/javascript', '.css':'text/css', '.html':'text/html' };
    res.writeHead(200, {'Content-Type': map[ext] || 'application/octet-stream'});
    fs.createReadStream(file).pipe(res);
    return;
  }
  res.writeHead(404); res.end('Not found');
});

server.listen(PORT, ()=> console.log('Dev server listening on http://localhost:'+PORT));
