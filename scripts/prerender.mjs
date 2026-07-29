/**
 * Poslední krok buildu: vykreslí obě stránky do statického HTML, doplní
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

const mod = await import(join(ssr, 'entry-server.js'));

/** Vloží vykreslený obsah a hlavičkové značky do jedné stránky. */
async function build({ file, render, head, meta, expect }) {
  const path = join(dist, file);
  let html = await readFile(path, 'utf8');

  const body = render();
  if (!body.includes(expect)) {
    throw new Error(`Prerender ${file}: v obsahu chybí „${expect}“.`);
  }

  html = html.replace('<div id="root"></div>', `<div id="root">${body}</div>`);

  if (meta) {
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${meta.title}</title>`);
    for (const [pattern, replacement] of [
      [/<meta\s+name="description"[\s\S]*?\/>/, `<meta name="description" content="${meta.description}" />`],
      [/<meta\s+property="og:title"[\s\S]*?\/>/, `<meta property="og:title" content="${meta.title}" />`],
      [/<meta\s+property="og:description"[\s\S]*?\/>/, `<meta property="og:description" content="${meta.description}" />`],
    ]) {
      html = html.replace(pattern, replacement);
    }
  }

  html = html.replace('</head>', `  ${head()}\n  </head>`);
  await writeFile(path, html);

  return Buffer.byteLength(body);
}

const pages = [
  {
    file: 'index.html',
    render: mod.render,
    head: mod.head,
    meta: mod.meta,
    expect: 'Státní dluh',
  },
  {
    // Titulek a popisek má informační stránka přímo v šabloně.
    file: 'informace.html',
    render: mod.renderInfo,
    head: mod.headInfo,
    meta: null,
    expect: 'Ochrana soukromí',
  },
];

for (const page of pages) {
  const bytes = await build(page);
  console.log(`prerender: ${page.file} — ${(bytes / 1024).toFixed(1)} kB obsahu`);
}

await writeFile(join(dist, 'robots.txt'), mod.robots());
await writeFile(join(dist, 'sitemap.xml'), mod.sitemap());
console.log(`prerender: robots.txt a sitemap.xml zapsány (${mod.summary})`);

// Serverový bundle je jen meziprodukt, do nasazení nepatří.
await rm(ssr, { recursive: true, force: true });
