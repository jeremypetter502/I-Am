import { cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseUsageMarkdown } from '../src/ui/services/usageResults.js';

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const usageDir = join(rootDir, 'docs', 'usage');
const distDir = join(rootDir, 'dist');

async function findMarkdown(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return findMarkdown(path);
    return entry.isFile() && entry.name.toLowerCase().endsWith('.md') ? [path] : [];
  }));
  return nested.flat();
}

const files = await findMarkdown(usageDir);
const seenStems = new Set();
for (const sourcePath of files) {
  const filename = sourcePath.split(/[\\/]/).pop();
  const stem = filename.replace(/\.md$/i, '');
  if (seenStems.has(stem)) throw new Error(`Duplicate usage filename: ${filename}`);
  seenStems.add(stem);

  const source = await readFile(sourcePath, 'utf8');
  const session = parseUsageMarkdown(source, stem);
  if (session.errors.length) throw new Error(`Invalid usage result ${relative(rootDir, sourcePath)}:\n${session.errors.join('\n')}`);

  const outputDir = join(distDir, 'usage', stem);
  await mkdir(outputDir, { recursive: true });
  await cp(join(distDir, 'index.html'), join(outputDir, 'index.html'));
  console.log(`generated usage page /usage/${stem}/`);
}
