/**
 * Veřejné API. Čistá funkce bez vazby na runtime — používá ji jak
 * serverless funkce na Vercelu (`api/dluh.ts`), tak dev server ve Vite.
 */

import { dataset } from './dataset';
import { snapshot, growthPerSecond, type Basis } from './model';

export interface ApiResponse {
  status: number;
  headers: Record<string, string>;
  body: string;
}

const BASES: Basis[] = ['obyvatel', 'pracujici'];

function json(status: number, payload: unknown): ApiResponse {
  return {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      // Veřejná data, čtení odkudkoli.
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, OPTIONS',
      // Odpověď se mění každou sekundu, ale vstupy jednou za čtvrtletí.
      // Krátká cache na edge, klient si dopočítá zbytek sám z rustZaSekundu.
      'cache-control': 'public, s-maxage=60, stale-while-revalidate=600',
    },
    body: JSON.stringify(payload, null, 2),
  };
}

/**
 * `GET /api/dluh?zaklad=obyvatel|pracujici`
 *
 * Vrací aktuální odhad dluhu, všechny čtyři metriky, kontext a kompletní
 * seznam zdrojů. Volitelně `?t=<ISO datum>` pro hodnotu k jinému okamžiku.
 */
export function handleApiRequest(url: URL): ApiResponse {
  const rawBasis = url.searchParams.get('zaklad') ?? 'obyvatel';
  if (!BASES.includes(rawBasis as Basis)) {
    return json(400, {
      chyba: `Neznámý základ "${rawBasis}". Povolené hodnoty: ${BASES.join(', ')}.`,
    });
  }

  const rawTime = url.searchParams.get('t');
  let now = Date.now();
  if (rawTime !== null) {
    const parsed = Date.parse(rawTime);
    if (Number.isNaN(parsed)) {
      return json(400, { chyba: `Parametr "t" není platné datum podle ISO 8601: "${rawTime}".` });
    }
    now = parsed;
  }

  return json(200, {
    ...snapshot(rawBasis as Basis, now),
    upozorneni:
      'Hodnota dluhu je odhad, ne měření. Přesná čísla publikuje MF ČR čtvrtletně — viz pole "zdroje".',
    dokumentace: {
      parametry: {
        zaklad: 'obyvatel (výchozí) | pracujici — na koho se dluh přepočítává',
        t: 'volitelné, ISO 8601 — hodnota k jinému okamžiku',
      },
      rustZaSekundu: growthPerSecond,
      datovaSadaZkontrolovana: dataset.checkedAt,
    },
  });
}
