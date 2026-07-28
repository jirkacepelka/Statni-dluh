/**
 * Jediný zdroj pravdy pro celou aplikaci.
 *
 * Každá hodnota má datum platnosti a odkaz na primární zdroj. Nikde jinde
 * v kódu nesmí být natvrdo zapsané číslo o veřejných financích — web i API
 * počítají výhradně z tohoto souboru.
 *
 * Aktualizace: přepiš hodnoty, `validFrom` a `checkedAt`. Nic dalšího.
 */

export interface Sourced<T> {
  /** Hodnota. */
  value: T;
  /** Datum, ke kterému hodnota platí (ISO 8601, YYYY-MM-DD). */
  asOf: string;
  /** Lidský popis zdroje. */
  source: string;
  /** Odkaz na primární zdroj. */
  url: string;
  /** Doplňující poznámka k metodice. */
  note?: string;
}

export const dataset = {
  /** Datum poslední kontroly všech hodnot proti zdrojům. */
  checkedAt: '2026-07-28',

  /**
   * Poslední publikovaná hodnota státního dluhu. Kotva pro počítadlo —
   * od tohoto bodu se dopočítává, nic před ním se neodhaduje.
   */
  debtAnchor: {
    value: 3_726_800_000_000,
    asOf: '2026-06-30',
    source: 'MF ČR – Čtvrtletní zpráva o řízení státního dluhu ČR, 1. pololetí 2026',
    url: 'https://mf.gov.cz/cs/rozpoctova-politika/rizeni-statniho-dluhu/publikace/dluhove-portfolio-ctvrtletni-informace/2026/ctvrtletni-zprava-o-rizeni-statniho-dluhu-ceske-re-64593',
    note: 'Státní dluh, nikoli dluh sektoru vládních institucí (maastrichtský). Ten je vyšší — zahrnuje i kraje, obce a zdravotní pojišťovny.',
  } satisfies Sourced<number>,

  /** Stav na konci předchozího roku — pro meziroční srovnání. */
  debtPreviousYearEnd: {
    value: 3_677_600_000_000,
    asOf: '2025-12-31',
    source: 'MF ČR – Čtvrtletní zpráva o řízení státního dluhu ČR, 1. pololetí 2026',
    url: 'https://mf.gov.cz/cs/rozpoctova-politika/rizeni-statniho-dluhu/publikace/dluhove-portfolio-ctvrtletni-informace/2026/ctvrtletni-zprava-o-rizeni-statniho-dluhu-ceske-re-64593',
  } satisfies Sourced<number>,

  /**
   * Oficiální projekce MF ke konci roku. Druhý bod počítadla —
   * mezi kotvou a projekcí se interpoluje lineárně.
   */
  debtProjection: {
    value: 3_991_000_000_000,
    asOf: '2026-12-31',
    source: 'MF ČR – Strategie financování a řízení státního dluhu ČR na rok 2026, aktualizace na 2. pololetí',
    url: 'https://mf.gov.cz/cs/rozpoctova-politika/rizeni-statniho-dluhu/publikace/strategie-financovani-a-rizeni-statniho-/2026/strategie-financovani-a-rizeni-statniho-dluhu-cesk-64596',
    note: 'Odpovídá 44,4 % HDP. Jde o plán MF, ne o zaručenou hodnotu.',
  } satisfies Sourced<number>,

  /** Podíl státního dluhu na HDP ke dni kotvy. */
  debtToGdp: {
    value: 0.424,
    asOf: '2026-06-30',
    source: 'MF ČR – Čtvrtletní zpráva o řízení státního dluhu ČR, 1. pololetí 2026',
    url: 'https://mf.gov.cz/cs/rozpoctova-politika/rizeni-statniho-dluhu/publikace/dluhove-portfolio-ctvrtletni-informace/2026/ctvrtletni-zprava-o-rizeni-statniho-dluhu-ceske-re-64593',
    note: 'Od začátku roku klesl ze 42,9 % — dluh rostl pomaleji než nominální HDP.',
  } satisfies Sourced<number>,

  /** Schválený schodek státního rozpočtu na letošní rok. */
  budgetDeficit: {
    value: 310_000_000_000,
    asOf: '2026-03-11',
    source: 'Zákon o státním rozpočtu na rok 2026, schválen Poslaneckou sněmovnou ve 3. čtení',
    url: 'https://www.psp.cz/zprava/21860',
    note: 'Příjmy 2 117,8 mld. Kč, výdaje 2 427,8 mld. Kč. Vláda původně navrhovala 286 mld. Kč.',
  } satisfies Sourced<number>,

  /** Skutečný schodek k poslednímu publikovanému měsíci. */
  cashDeficitToDate: {
    value: 183_600_000_000,
    asOf: '2026-06-30',
    source: 'MF ČR – Plnění státního rozpočtu ČR za leden až červen 2026',
    url: 'https://mf.gov.cz/cs/ministerstvo/media/tiskove-zpravy/2026/pokladni-plneni-sr-64480',
    note: 'Meziročně o 31,2 mld. Kč horší. Po očištění o saldo prostředků EU 203,6 mld. Kč.',
  } satisfies Sourced<number>,

  /** Rozpočtované výdaje na obsluhu státního dluhu v letošním roce. */
  debtServiceCurrentYear: {
    value: 110_000_000_000,
    asOf: '2026-01-01',
    source: 'MF ČR – kapitola 396 Státní dluh, rozpočet 2026',
    url: 'https://mf.gov.cz/cs/rozpoctova-politika/rizeni-statniho-dluhu/statistiky/ciste-vydaje-na-obsluhu-statniho-dluhu',
    note: 'Úroky a související náklady. Nejde o splátky jistiny — ty se refinancují novým dluhem.',
  } satisfies Sourced<number>,

  /** Totéž za předchozí rok — základ pro meziroční nárůst. */
  debtServicePreviousYear: {
    value: 98_100_000_000,
    asOf: '2025-01-01',
    source: 'MF ČR – kapitola 396 Státní dluh, rozpočet 2025',
    url: 'https://mf.gov.cz/cs/rozpoctova-politika/rizeni-statniho-dluhu/statistiky/ciste-vydaje-na-obsluhu-statniho-dluhu',
  } satisfies Sourced<number>,

  /**
   * Výnos 10letého státního dluhopisu — cena, za kterou si stát dnes
   * půjčuje. Používá se k přepočtu letošního schodku na trvalý úrokový náklad.
   */
  marginalYield: {
    value: 0.046,
    asOf: '2026-06-30',
    source: 'ČNB – výnos státního dluhopisu 10R',
    url: 'https://www.kurzy.cz/cnb/ekonomika/vynos-dluhopisu-10r-cr/',
    note: 'Konzervativní odhad marginálních nákladů. MF emituje napříč křivkou, průměrný výnos nových emisí bývá o něco nižší.',
  } satisfies Sourced<number>,

  /** Počet obyvatel ČR. */
  population: {
    value: 10_896_000,
    asOf: '2026-03-31',
    source: 'ČSÚ – Pohyb obyvatelstva, 1. čtvrtletí 2026',
    url: 'https://csu.gov.cz/rychle-informace/pohyb-obyvatelstva-1-ctvrtleti-2026',
    note: 'Včetně dětí a důchodců, tedy včetně lidí, kteří dluh splácet nebudou.',
  } satisfies Sourced<number>,

  /** Počet zaměstnaných osob podle VŠPS. */
  employed: {
    value: 5_283_900,
    asOf: '2026-03-31',
    source: 'ČSÚ – Zaměstnanost a nezaměstnanost podle výsledků VŠPS, 1. čtvrtletí 2026',
    url: 'https://csu.gov.cz/zamestnanost-a-nezamestnanost-vsps',
    note: 'Zaměstnanci i podnikatelé, 15+ let. Meziročně o 58,6 tis. více.',
  } satisfies Sourced<number>,
} as const;

export type Dataset = typeof dataset;
