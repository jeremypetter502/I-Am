import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SITE_URL = (process.env.SITE_URL || 'http://localhost:5178').replace(/\/$/, '');

const routes = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/readme', changefreq: 'monthly', priority: '0.8' },
  { path: '/iam', changefreq: 'monthly', priority: '0.8' },
  { path: '/iam-usecase', changefreq: 'monthly', priority: '0.8' }
];

const now = new Date().toISOString();

const urls = routes
  .map((route) => {
    const loc = `${SITE_URL}${route.path}`;
    return [
      '  <url>',
      `    <loc>${loc}</loc>`,
      `    <lastmod>${now}</lastmod>`,
      `    <changefreq>${route.changefreq}</changefreq>`,
      `    <priority>${route.priority}</priority>`,
      '  </url>'
    ].join('\n');
  })
  .join('\n');

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  urls,
  '</urlset>',
  ''
].join('\n');

const outputPath = resolve(process.cwd(), 'public', 'sitemap.xml');
writeFileSync(outputPath, xml, 'utf8');

console.log(`Generated sitemap at ${outputPath}`);
