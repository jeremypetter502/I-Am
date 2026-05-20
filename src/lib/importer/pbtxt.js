import protobuf from 'protobufjs';

// Serialize/parse a human-readable protobuf text format (pbtxt) for the
// ContextFile contract. This implementation uses protobufjs to validate
// the object against the .proto contract and implements a small
// text-format writer/parser that is sufficient for export/import round-trips
// used by the UI and tests.

// Use a relative path string so bundlers don't pull in Node 'path' module.
// In browser environments the proto file won't be loadable and loadRoot
// will gracefully fall back to null (no validation).
const PROTO_PATH = 'specs/001-personality-context-site/contextfile.proto';
let _root = null;
function loadRoot() {
  if (_root) return _root;
  try {
    _root = protobuf.loadSync(PROTO_PATH);
  } catch (e) {
    // If proto cannot be loaded, keep root null — validation will be skipped
    _root = null;
  }
  return _root;
}

function isPlainObject(v) {
  return v && typeof v === 'object' && !Array.isArray(v);
}

function escapeString(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function primitiveToPbtxt(v) {
  if (typeof v === 'string') return `"${escapeString(v)}"`;
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : '0';
  return '""';
}

function objectToPbtxt(obj, indent = '', type = null) {
  // Convert a JS object into pbtxt-style string (no top-level field name)
  const lines = [];
  const pad = indent;
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val === null || val === undefined) continue;

    // Determine field metadata from provided type, if available
    let field = null;
    let fieldType = null;
    if (type && type.fields && Object.prototype.hasOwnProperty.call(type.fields, key)) {
      field = type.fields[key];
      fieldType = field.resolvedType || null;
    }

    if (Array.isArray(val)) {
      for (const v of val) {
        if (isPlainObject(v)) {
          lines.push(`${pad}${key} {`);
          lines.push(objectToPbtxt(v, pad + '  ', fieldType));
          lines.push(`${pad}}`);
        } else {
          lines.push(`${pad}${key}: ${primitiveToPbtxt(v)}`);
        }
      }
      continue;
    }

    if (isPlainObject(val)) {
      // If proto metadata says this field is a map, emit map entries
      if (field && field.map) {
        for (const k of Object.keys(val)) {
          const v = val[k];
          lines.push(`${pad}${key} {`);
          lines.push(`${pad}  key: "${escapeString(k)}"`);
          if (v !== null && v !== undefined) {
            if (typeof v === 'string') lines.push(`${pad}  value: "${escapeString(v)}"`);
            else lines.push(`${pad}  value: ${primitiveToPbtxt(v)}`);
          }
          lines.push(`${pad}}`);
        }
        continue;
      }

      // Otherwise treat as nested message when possible
      if (fieldType) {
        lines.push(`${pad}${key} {`);
        lines.push(objectToPbtxt(val, pad + '  ', fieldType));
        lines.push(`${pad}}`);
        continue;
      }

      // Fallback: if all child values are primitives, prefer nested message (avoid map heuristic)
      const childKeys = Object.keys(val);
      const allPrimitive = childKeys.length > 0 && childKeys.every(k => (typeof val[k] !== 'object' || val[k] === null));
      if (allPrimitive) {
        // Nested message
        lines.push(`${pad}${key} {`);
        lines.push(objectToPbtxt(val, pad + '  ', null));
        lines.push(`${pad}}`);
      } else {
        // Nested message with structure
        lines.push(`${pad}${key} {`);
        lines.push(objectToPbtxt(val, pad + '  ', null));
        lines.push(`${pad}}`);
      }
      continue;
    }

    // primitive
    lines.push(`${pad}${key}: ${primitiveToPbtxt(val)}`);
  }
  return lines.join('\n');
}

export function serializePbtxt(json) {
  // Validate against proto when possible
  const root = loadRoot();
  if (root) {
    const Type = root.lookupType('personality.ContextFile');
    const err = Type.verify(json);
    if (err) {
      const comment = `// pbtxt-serialize-warning: ${String(err).replace(/\n/g, ' ')}\n`;
      // Even when verification fails we'll attempt to serialize using available type info
      return comment + objectToPbtxt(json, '', Type) + '\n';
    }
    return objectToPbtxt(json, '', Type) + '\n';
  }
  // No proto available: best-effort
  return objectToPbtxt(json, '', null) + '\n';
}

// Simple tokenizer for pbtxt produced by objectToPbtxt
function tokenize(text) {
  const tokens = [];
  const re = /\s*(?:([A-Za-z_][A-Za-z0-9_]*)|("(?:[^\\"]|\\.)*")|([{}:])|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?))\s*/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m[1]) tokens.push({ type: 'ident', value: m[1] });
    else if (m[2]) tokens.push({ type: 'string', value: m[2].slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\') });
    else if (m[3]) tokens.push({ type: 'symbol', value: m[3] });
    else if (m[4]) tokens.push({ type: 'number', value: m[4] });
  }
  return tokens;
}

function parseTokens(tokens) {
  let i = 0;
  function peek() { return tokens[i]; }
  function consume() { return tokens[i++]; }

  function parseValue() {
    const t = peek();
    if (!t) return null;
    if (t.type === 'string') { consume(); return t.value; }
    if (t.type === 'number') { consume(); return Number(t.value); }
    if (t.type === 'ident') {
      // identifiers shouldn't be bare values in our format
      consume(); return t.value;
    }
    if (t.type === 'symbol' && t.value === '{') {
      consume();
      const obj = {};
      while (peek() && !(peek().type === 'symbol' && peek().value === '}')) {
        const field = consume();
        if (!field || field.type !== 'ident') throw new Error('Expected field name');
        const fname = field.value;
        const colonOrBrace = peek();
        if (!colonOrBrace) throw new Error('Unexpected EOF');
        if (colonOrBrace.type === 'symbol' && colonOrBrace.value === ':') {
          consume();
          const val = parseValue();
          if (obj.hasOwnProperty(fname)) {
            if (!Array.isArray(obj[fname])) obj[fname] = [obj[fname]];
            obj[fname].push(val);
          } else obj[fname] = val;
        } else if (colonOrBrace.type === 'symbol' && colonOrBrace.value === '{') {
          const val = parseValue();
          if (obj.hasOwnProperty(fname)) {
            if (!Array.isArray(obj[fname])) obj[fname] = [obj[fname]];
            obj[fname].push(val);
          } else obj[fname] = val;
        } else {
          throw new Error('Unexpected token in message');
        }
      }
      // consume '}'
      if (peek() && peek().type === 'symbol' && peek().value === '}') consume();
      // detect map-like entries: if all keys are entries with { key: k value: v }
      const keys = Object.keys(obj);
      for (const k of keys) {
        const v = obj[k];
        if (Array.isArray(v)) {
          // check if each item has 'key' and 'value'
          const allEntries = v.every(it => isPlainObject(it) && Object.prototype.hasOwnProperty.call(it, 'key') && Object.prototype.hasOwnProperty.call(it, 'value'));
          if (allEntries) {
            const map = {};
            for (const entry of v) map[String(entry.key)] = entry.value;
            obj[k] = map;
          }
        } else if (isPlainObject(v) && Object.prototype.hasOwnProperty.call(v, 'key') && Object.prototype.hasOwnProperty.call(v, 'value')) {
          // single map entry
          const map = {}; map[String(v.key)] = v.value; obj[k] = map;
        }
      }

      return obj;
    }
    return null;
  }

  // top-level: expects repeated field entries or a single message body
  // We'll allow both 'field: value' and top-level message body
  // To be compatible with serializePbtxt, parse top-level as a message body
  const rootObj = {};
  while (i < tokens.length) {
    const t = peek();
    if (t.type === 'ident') {
      const field = consume();
      const next = peek();
      if (!next) break;
      if (next.type === 'symbol' && next.value === ':') {
        consume();
        const val = parseValue();
        if (rootObj.hasOwnProperty(field.value)) {
          if (!Array.isArray(rootObj[field.value])) rootObj[field.value] = [rootObj[field.value]];
          rootObj[field.value].push(val);
        } else rootObj[field.value] = val;
      } else if (next.type === 'symbol' && next.value === '{') {
        const val = parseValue();
        if (rootObj.hasOwnProperty(field.value)) {
          if (!Array.isArray(rootObj[field.value])) rootObj[field.value] = [rootObj[field.value]];
          rootObj[field.value].push(val);
        } else rootObj[field.value] = val;
      } else {
        // unexpected
        throw new Error('Unexpected token at top-level');
      }
    } else {
      // skip unexpected tokens
      i++;
    }
  }
  return rootObj;
}

export function parsePbtxt(text) {
  if (typeof text !== 'string') throw new Error('Expected text');
  // Allow old JSON-prefixed pbtxt for backward compatibility
  if (text.startsWith('//pbtxt\n')) {
    return JSON.parse(text.slice('//pbtxt\n'.length));
  }
  // Strip leading comment warnings emitted by serializer
  const lines = text.split(/\r?\n/).filter(Boolean);
  const body = lines.filter(l => !l.startsWith('//')).join('\n');
  const tokens = tokenize(body);
  const obj = parseTokens(tokens);
  return obj;
}

