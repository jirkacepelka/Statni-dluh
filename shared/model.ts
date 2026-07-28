/**
 * Výpočetní model. Čistý TypeScript bez závislostí — sdílený mezi
 * frontendem a serverless API, aby web a `/api/dluh` nikdy neukázaly
 * jiné číslo.
 *
 * Základní pravidlo: nic se nevymýšlí. Počítadlo vychází z poslední
 * oficiálně publikované hodnoty dluhu a roste průměrným ročním tempem,
 * které plyne z plánu Ministerstva financí na celý letošní rok.
 */

import { dataset } from './dataset';

/** Na koho se dluh přepočítává. */
export type Basis = 'obyvatel' | 'pracujici';

export const BASIS_LABELS: Record<Basis, string> = {
  obyvatel: 'Každý občan',
  pracujici: 'Pracující občan',
};

const MS_PER_SECOND = 1000;

/** Půlnoc UTC daného dne — konec dne pro `asOf` hodnoty. */
function endOfDay(isoDate: string): number {
  return Date.parse(`${isoDate}T23:59:59.999Z`) + 1;
}

const ANCHOR_MS = endOfDay(dataset.debtAnchor.asOf);
const TARGET_MS = endOfDay(dataset.debtProjection.asOf);
const YEAR_START_MS = endOfDay(dataset.debtPreviousYearEnd.asOf);

/**
 * O kolik korun dluh roste za sekundu — průměr za celý letošní rok.
 *
 * (projekce MF ke konci roku − stav na konci loňského roku) / délka roku
 *
 * Záměrně se nepočítá jen ze zbytku roku. Plán MF je silně zadní —
 * v 1. pololetí dluh skutečně vzrostl o 49,2 mld. Kč, zatímco na
 * 2. pololetí zbývá 264,2 mld. Tempo dopočtené jen ze zbytku roku by
 * vyšlo přes 16 600 Kč/s, tedy pětinásobek toho, co se dělo doopravdy.
 * Roční průměr je klidnější a bližší realitě.
 *
 * Cenou je, že počítadlo na projekci MF ke konci roku nedosedne —
 * skončí pod ní. Viz `shortfallAgainstProjection`.
 */
export const growthPerSecond =
  (dataset.debtProjection.value - dataset.debtPreviousYearEnd.value) /
  ((TARGET_MS - YEAR_START_MS) / MS_PER_SECOND);

/** Denní přírůstek — čitelnější než sekundový. */
export const growthPerDay = growthPerSecond * 86_400;

/**
 * O kolik bude odhad ke konci roku nižší než projekce MF.
 *
 * Přímý důsledek volby ročního průměru místo tempa zbytku roku.
 * Vystavuje se v API, aby to nebylo nutné dopočítávat zvenčí.
 */
export const shortfallAgainstProjection =
  dataset.debtProjection.value -
  (dataset.debtAnchor.value + ((TARGET_MS - ANCHOR_MS) / MS_PER_SECOND) * growthPerSecond);

/**
 * Odhad státního dluhu v daném okamžiku.
 *
 * Před kotvou vrací kotvu — minulost se nepřepisuje. Za koncem roku
 * pokračuje stejným tempem, což příznak `beyondProjection` přizná.
 */
export function debtAt(now: number = Date.now()): {
  value: number;
  beyondProjection: boolean;
} {
  if (now <= ANCHOR_MS) {
    return { value: dataset.debtAnchor.value, beyondProjection: false };
  }
  const elapsedSeconds = (now - ANCHOR_MS) / MS_PER_SECOND;
  return {
    value: dataset.debtAnchor.value + elapsedSeconds * growthPerSecond,
    beyondProjection: now > TARGET_MS,
  };
}

/** Kolik lidí nese dluh podle zvoleného základu. */
export function basisCount(basis: Basis): number {
  return basis === 'obyvatel' ? dataset.population.value : dataset.employed.value;
}

/**
 * Trvalý roční úrokový náklad, který vzniká letošním schodkem.
 *
 * schodek × výnos, za který si stát dnes půjčuje. Kontrolní bod: skutečný
 * meziroční nárůst rozpočtovaných výdajů na obsluhu dluhu je
 * 110,0 − 98,1 = 11,9 mld. Kč, tedy stejný řád.
 */
export const annualInterestFromDeficit =
  dataset.budgetDeficit.value * dataset.marginalYield.value;

/** Skutečný meziroční nárůst výdajů na obsluhu dluhu — kontrola výše uvedeného. */
export const debtServiceYoyChange =
  dataset.debtServiceCurrentYear.value - dataset.debtServicePreviousYear.value;

export interface Metric {
  id: string;
  /** Číselná hodnota v korunách. */
  value: number;
  /** Jak často se hodnota platí. */
  unit: 'celkem' | 'ročně';
  /** Popisek pod číslem. */
  label: string;
  /** Rozepsaný výpočet — zobrazuje se v metodice. */
  formula: string;
  /** Klíče z datasetu, ze kterých metrika vychází. */
  inputs: string[];
}

/** Čtyři metriky pod počítadlem, přepočtené na zvolený základ. */
export function metrics(basis: Basis, now: number = Date.now()): Metric[] {
  const people = basisCount(basis);
  const debt = debtAt(now).value;
  const perCapita = basis === 'obyvatel' ? 'obyvatel' : 'zaměstnaných';

  return [
    {
      id: 'dluh-na-osobu',
      value: debt / people,
      unit: 'celkem',
      label:
        basis === 'obyvatel'
          ? 'Na obyvatele, včetně důchodců a nemluvňat'
          : 'Na jednoho zaměstnaného nebo podnikatele',
      formula: `státní dluh ÷ počet ${perCapita}`,
      inputs: ['debtAnchor', 'debtProjection', basis === 'obyvatel' ? 'population' : 'employed'],
    },
    {
      id: 'obsluha-na-osobu',
      value: dataset.debtServiceCurrentYear.value / people,
      unit: 'ročně',
      label:
        basis === 'obyvatel'
          ? 'Tolik stojí každého občana obsluha státního dluhu'
          : 'Tolik stojí každého pracujícího obsluha státního dluhu',
      formula: `výdaje na obsluhu dluhu ÷ počet ${perCapita}`,
      inputs: ['debtServiceCurrentYear', basis === 'obyvatel' ? 'population' : 'employed'],
    },
    {
      id: 'prirustek-na-osobu',
      value: annualInterestFromDeficit / people,
      unit: 'ročně',
      label: 'O tolik budete platit víc každý rok kvůli aktuálnímu schodku',
      formula: `(schodek rozpočtu × výnos 10letého dluhopisu) ÷ počet ${perCapita}`,
      inputs: ['budgetDeficit', 'marginalYield', basis === 'obyvatel' ? 'population' : 'employed'],
    },
    {
      id: 'prirustek-celkem',
      value: annualInterestFromDeficit,
      unit: 'ročně',
      label:
        'O tolik se zvýší náklady na obsluhu dluhu ročně, při zachování aktuálního schodku',
      formula: 'schodek rozpočtu × výnos 10letého dluhopisu',
      inputs: ['budgetDeficit', 'marginalYield'],
    },
  ];
}

/** Kompletní snapshot pro API i pro server-side render. */
export function snapshot(basis: Basis, now: number = Date.now()) {
  const debt = debtAt(now);
  return {
    generovano: new Date(now).toISOString(),
    zaklad: basis,
    dluh: {
      odhad: debt.value,
      rustZaSekundu: growthPerSecond,
      rustZaDen: growthPerDay,
      posledniZnamaHodnota: dataset.debtAnchor.value,
      posledniZnamaKDatu: dataset.debtAnchor.asOf,
      projekceKonecRoku: dataset.debtProjection.value,
      rozdilProtiProjekci: shortfallAgainstProjection,
      podilNaHdp: dataset.debtToGdp.value,
      zaProjekci: debt.beyondProjection,
    },
    metriky: metrics(basis, now),
    kontext: {
      schodekRozpoctu: dataset.budgetDeficit.value,
      schodekSkutecnyKDatu: dataset.cashDeficitToDate.value,
      obsluhaDluhu: dataset.debtServiceCurrentYear.value,
      obsluhaDluhuMezirocne: debtServiceYoyChange,
      pocetObyvatel: dataset.population.value,
      pocetPracujicich: dataset.employed.value,
    },
    metodika:
      'Dluh se neměří v reálném čase. Zobrazená hodnota vychází z posledního publikovaného stavu státního dluhu a roste průměrným ročním tempem podle plánu MF na celý rok. Skutečný přírůstek je nerovnoměrný — závisí na emisním kalendáři. Protože je plán MF zadní, odhad ke konci roku zůstane pod projekcí; rozdíl je v poli "dluh.rozdilProtiProjekci".',
    zdroje: Object.entries(dataset)
      .filter(([, v]) => typeof v === 'object' && v !== null && 'url' in v)
      .map(([key, v]) => {
        const s = v as { value: number; asOf: string; source: string; url: string; note?: string };
        return { klic: key, hodnota: s.value, kDatu: s.asOf, zdroj: s.source, odkaz: s.url, poznamka: s.note };
      }),
  };
}
