/**
 * Vstupní bod pro prerender. Stránka se vykreslí do statického HTML při
 * buildu, takže crawler dostane hotový obsah místo prázdného <div id="root">.
 *
 * Nejde o SSR za běhu — na Vercelu zůstává čistě statický web. Model je
 * deterministický, takže se dá celý strom vyrenderovat dopředu.
 */

import { renderToString } from 'react-dom/server';
import { App } from './App';
import { Informace } from './pages/Informace';
import { config } from './config';
import { dataset } from '../shared/dataset';
import { growthPerDay } from '../shared/model';
import { czk } from '../shared/format';

export function render(): string {
  return renderToString(<App />);
}

/** Informační stránka. Vykresluje se jen při buildu, klient ji nehydratuje. */
export function renderInfo(): string {
  return renderToString(<Informace />);
}

export { config };

const TITLE = 'Státní dluh ČR – kolik dluží Česko právě teď';
const DESCRIPTION =
  `Živé počítadlo státního dluhu České republiky. Kolik dluh dělá na jednoho ` +
  `obyvatele i na jednoho pracujícího, kolik stojí jeho obsluha a o kolik ` +
  `roste. Čísla z Ministerstva financí a ČSÚ, s uvedenými zdroji.`;

/**
 * Strukturovaná data. Kromě webu a provozovatele popisují i samotný
 * datový soubor, což ho zpřístupňuje vyhledávání datasetů. Odkaz na
 * `/api/dluh` tu záměrně není — endpoint sice běží, ale web ho neinzeruje.
 */
function structuredData(): string {
  const graph = [
    {
      '@type': 'WebSite',
      '@id': `${config.siteUrl}/#website`,
      url: `${config.siteUrl}/`,
      name: TITLE,
      description: DESCRIPTION,
      inLanguage: 'cs-CZ',
      publisher: { '@id': `${config.siteUrl}/#organizace` },
    },
    {
      '@type': 'Organization',
      '@id': `${config.siteUrl}/#organizace`,
      name: `${config.organisation}${config.tagline ? ` – ${config.tagline}` : ''}`,
      url: config.links.web ?? config.siteUrl,
      logo: `${config.siteUrl}/logo-voluntia.svg`,
      sameAs: [config.links.x, config.links.instagram].filter(Boolean),
    },
    {
      '@type': 'Dataset',
      '@id': `${config.siteUrl}/#dataset`,
      name: 'Státní dluh České republiky',
      description:
        `Odhad státního dluhu ČR v reálném čase, přepočet na obyvatele a na ` +
        `pracující, náklady na obsluhu dluhu. Vychází z publikovaných hodnot ` +
        `Ministerstva financí ČR a Českého statistického úřadu.`,
      inLanguage: 'cs-CZ',
      isAccessibleForFree: true,
      dateModified: dataset.checkedAt,
      creator: { '@id': `${config.siteUrl}/#organizace` },
      spatialCoverage: { '@type': 'Place', name: 'Česká republika' },
      variableMeasured: [
        'státní dluh',
        'státní dluh na obyvatele',
        'výdaje na obsluhu státního dluhu',
        'schodek státního rozpočtu',
      ],
      isBasedOn: [dataset.debtAnchor.url, dataset.population.url],
    },
  ];

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}

/** Značky, které se vkládají do <head> až při buildu. */
export function head(): string {
  const url = `${config.siteUrl}/`;
  // Statický obrázek ze šablony. Ukazuje poslední *publikovanou* hodnotu
  // s datem, takže nezestárne do nepravdy, i když ho síť zacachuje natrvalo.
  const image = `${config.siteUrl}/og.png`;

  return [
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:site_name" content="${config.organisation}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="Státní dluh České republiky – živé počítadlo" />`,
    `<meta name="twitter:image" content="${image}" />`,
    `<script type="application/ld+json">${structuredData()}</script>`,
  ].join('\n    ');
}

export const meta = { title: TITLE, description: DESCRIPTION };

/** Značky pro informační stránku. Bez og:image — sdílí se počítadlo, ne text. */
export function headInfo(): string {
  const url = `${config.siteUrl}/informace`;
  return [
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:site_name" content="${config.organisation}" />`,
    `<meta property="og:image" content="${config.siteUrl}/og.png" />`,
    `<meta name="twitter:image" content="${config.siteUrl}/og.png" />`,
  ].join('\n    ');
}

/** robots.txt — generuje se, aby adresa nebyla zapsaná na dvou místech. */
export function robots(): string {
  return ['User-agent: *', 'Allow: /', '', `Sitemap: ${config.siteUrl}/sitemap.xml`, ''].join('\n');
}

export function sitemap(): string {
  const page = (path: string, priority: string, changefreq: string) =>
    `  <url>
    <loc>${config.siteUrl}${path}</loc>
    <lastmod>${dataset.checkedAt}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${page('/', '1.0', 'daily')}
${page('/informace', '0.5', 'monthly')}
</urlset>
`;
}

/** Popisek pro build log — kontrola, že se prerenderovalo, co má. */
export const summary = `dluh roste o ${czk(growthPerDay)} kč denně`;
