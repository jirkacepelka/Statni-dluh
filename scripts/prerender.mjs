/**
 * Poslední krok buildu: vykreslí aplikaci do statického HTML, doplní
 * značky odvozené od adresy webu a vygeneruje robots.txt a sitemap.xml.
 *
 * Spouští se až po `vite build` a `vite build --ssr`, protože importuje
 * serverový bundle.
 */

import { readFile, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const ssr = join(root, 'dist-ssr');

const { render, head, meta, robots, sitemap, summary } = await import(
  join(ssr, 'entry-server.js')
);

let html = await readFile(join(dist, 'index.html'), 'utf8');

const body = render();
if (!body.includes('Státní dluh')) {
  throw new Error('Prerender vrátil prázdný nebo neočekávaný obsah.');
}

// Obsah do kořene aplikace; klient ho pak jen zhydratuje.
html = html.replace('<div id="root"></div>', `<div id="root">${body}</div>`);

// Titulek a popisek žijí v entry-server.tsx, aby seděly se strukturovanými daty.
html = html.replace(/<title>[^<]*<\/title>/, `<title>${meta.title}</title>`);
html = html.replace(
  /<meta\s+name="description"[\s\S]*?\/>/,
  `<meta name="description" content="${meta.description}" />`,
);
html = html.replace(
  /<meta\s+property="og:title"[\s\S]*?\/>/,
  `<meta property="og:title" content="${meta.title}" />`,
);
html = html.replace(
  /<meta\s+property="og:description"[\s\S]*?\/>/,
  `<meta property="og:description" content="${meta.description}" />`,
);

html = html.replace('</head>', `  ${head()}\n  </head>`);

await writeFile(join(dist, 'index.html'), html);
await writeFile(join(dist, 'robots.txt'), robots());
await writeFile(join(dist, 'sitemap.xml'), sitemap());

// Serverový bundle je jen meziprodukt, do nasazení nepatří.
await rm(ssr, { recursive: true, force: true });

const kb = (n) => `${(n / 1024).toFixed(1)} kB`;
console.log(`prerender: ${kb(Buffer.byteLength(body))} obsahu v HTML (${summary})`);
console.log('prerender: robots.txt a sitemap.xml zapsány');
