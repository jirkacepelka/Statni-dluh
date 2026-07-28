/** Formátování čísel v české konvenci. */

const LOCALE = 'cs-CZ';

const integer = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });

/** `3 765 571 204 118` — plná koruna, bez haléřů. */
export function czk(value: number): string {
  return integer.format(Math.round(value));
}

/** `3 765 571 204 118 Kč` */
export function czkWithUnit(value: number): string {
  return `${czk(value)} Kč`;
}

/**
 * Velká čísla slovy: `3,77 bilionu Kč`, `310 miliard Kč`.
 * Používá se tam, kde na jednotkách nezáleží a jde o řád.
 */
export function czkRounded(value: number): string {
  const abs = Math.abs(value);

  const scale = (divisor: number, unit: string, digits: number) => {
    const scaled = value / divisor;
    // Desetina se ukazuje jen když nese informaci — „310,0 mld.“ je šum,
    // ale „11,9 mld.“ se na „12 mld.“ zaokrouhlit nesmí.
    // Práh je polovina posledního zobrazovaného řádu, jinak by se
    // „3,99 bilionu“ smrsklo na „4 bilionu“.
    const meaningful = digits > 0 && Math.abs(scaled - Math.round(scaled)) >= 0.5 * 10 ** -digits;
    const used = meaningful ? digits : 0;
    return `${new Intl.NumberFormat(LOCALE, {
      minimumFractionDigits: used,
      maximumFractionDigits: used,
    }).format(scaled)} ${unit} Kč`;
  };

  if (abs >= 1e12) return scale(1e12, 'bilionu', 2);
  if (abs >= 1e9) return scale(1e9, 'mld.', 1);
  if (abs >= 1e6) return scale(1e6, 'mil.', 0);
  return czkWithUnit(value);
}

/** `42,4 %` */
export function percent(fraction: number, digits = 1): string {
  return `${new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(fraction * 100)} %`;
}

/** ISO datum → `30. 6. 2026` */
export function czDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d}. ${m}. ${y}`;
}
