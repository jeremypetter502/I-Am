import fs from 'fs';
import path from 'path';

// Minimal scaffold to normalize O*NET-style rows into compact lookup records.
// Input: JSON array with fields like { soc_code, title, aliases }
// Output: src/lib/baseContext/onet-index.json

function normalizeRecord(row) {
  const soc = String(row.soc_code || row.code || '').trim();
  const title = String(row.title || row.name || '').trim();
  const aliases = Array.isArray(row.aliases)
    ? row.aliases.map((a) => String(a).trim()).filter(Boolean)
    : [];
  if (!soc || !title) return null;
  return { soc_code: soc, title, aliases };
}

function main() {
  const inputPath = process.argv[2];
  const outputPath = process.argv[3] || path.resolve(process.cwd(), 'src/lib/baseContext/onet-index.json');

  if (!inputPath) {
    console.error('Usage: node scripts/onet/import_onet.js <input.json> [output.json]');
    process.exit(1);
  }

  const raw = fs.readFileSync(path.resolve(process.cwd(), inputPath), 'utf8');
  const rows = JSON.parse(raw);
  const normalized = Array.isArray(rows)
    ? rows.map(normalizeRecord).filter(Boolean)
    : [];

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(normalized, null, 2), 'utf8');
  console.log(`Wrote ${normalized.length} O*NET records to ${outputPath}`);
}

main();
