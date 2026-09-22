// Copies raw markdown docs into public/ so they are served as-is (not SPA-rendered HTML),
// making them directly fetchable and indexable by search engines and AI crawlers.
import { mkdir, copyFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));

const files = [
  { src: 'README.md', dest: 'public/README.md' },
  { src: 'docs/iam.md', dest: 'public/docs/iam.md' },
  { src: 'docs/iam-usecase.md', dest: 'public/docs/iam-usecase.md' },
  { src: 'docs/example-iam.md', dest: 'public/docs/example-iam.md' }
];

for (const { src, dest } of files) {
  const srcPath = join(rootDir, src);
  const destPath = join(rootDir, dest);
  await mkdir(dirname(destPath), { recursive: true });
  await copyFile(srcPath, destPath);
  console.log(`synced ${src} -> ${dest}`);
}
