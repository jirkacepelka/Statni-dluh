import { ExternalLink } from 'lucide-react';
import { dataset } from '../../shared/dataset';
import {
  growthPerSecond,
  growthPerDay,
  annualInterestFromDeficit,
  debtServiceYoyChange,
} from '../../shared/model';
import { czk, czkRounded, czDate, percent } from '../../shared/format';

/** Lidské názvy pro klíče datasetu. */
const LABELS: Record<string, string> = {
  debtAnchor: 'Státní dluh — poslední publikovaný stav',
  debtPreviousYearEnd: 'Státní dluh na konci předchozího roku',
  debtProjection: 'Státní dluh — projekce MF ke konci roku',
  debtToGdp: 'Podíl státního dluhu na HDP',
  budgetDeficit: 'Schválený schodek státního rozpočtu',
  cashDeficitToDate: 'Skutečný schodek k poslednímu publikovanému měsíci',
  debtServiceCurrentYear: 'Výdaje na obsluhu státního dluhu — letos',
  debtServicePreviousYear: 'Výdaje na obsluhu státního dluhu — loni',
  marginalYield: 'Výnos 10letého státního dluhopisu',
  population: 'Počet obyvatel ČR',
  employed: 'Počet zaměstnaných osob',
};

interface SourcedEntry {
  value: number;
  asOf: string;
  source: string;
  url: string;
  note?: string;
}

function isSourced(value: unknown): value is SourcedEntry {
  return typeof value === 'object' && value !== null && 'url' in value && 'asOf' in value;
}

const entries = Object.entries(dataset).filter(
  (entry): entry is [string, SourcedEntry] => isSourced(entry[1]),
);

/** Podíly se zobrazují v procentech, koruny v korunách. */
function formatValue(key: string, value: number): string {
  if (key === 'debtToGdp') return percent(value);
  if (key === 'marginalYield') return percent(value, 2);
  if (key === 'population' || key === 'employed') return czk(value);
  return `${czk(value)} Kč`;
}

export function Methodology() {
  return (
    <section className="methodology" id="metodika" aria-labelledby="metodika-nadpis">
      <div className="container">
        <h2 id="metodika-nadpis">Metodika a zdroje</h2>
        <p className="lede">
          Státní dluh se neměří v reálném čase. Žádné počítadlo — ani toto — neví, kolik stát dluží
          právě v tuto sekundu. Následující text popisuje přesně, co se tady dopočítává a z čeho.
        </p>

        <div className="method-grid">
          <article className="method-card">
            <h3>Jak vzniká číslo v počítadle</h3>
            <p>
              Bere se poslední oficiálně publikovaný stav státního dluhu ({czkRounded(dataset.debtAnchor.value)}{' '}
              k {czDate(dataset.debtAnchor.asOf)}) a projekce Ministerstva financí ke konci roku (
              {czkRounded(dataset.debtProjection.value)}). Mezi těmito dvěma body se interpoluje
              lineárně.
            </p>
            <p>
              Vychází z toho <strong>{czk(growthPerSecond)} Kč za sekundu</strong>, tedy{' '}
              {czkRounded(growthPerDay)} za den. Skutečný přírůstek je nerovnoměrný — dluh roste
              skokově podle emisního kalendáře, ne plynule.
            </p>
          </article>

          <article className="method-card">
            <h3>Co se tu naopak nepočítá</h3>
            <p>
              Jde o <strong>státní dluh</strong>, ne o dluh sektoru vládních institucí
              (maastrichtský). Ten je vyšší, protože zahrnuje i kraje, obce, zdravotní pojišťovny a
              další veřejné instituce.
            </p>
            <p>
              V číslech nejsou implicitní závazky státu — například budoucí důchody, které nejsou
              formálním dluhem, ale zaplatit se budou muset.
            </p>
          </article>

          <article className="method-card">
            <h3>Odkud se bere „o tolik navíc každý rok“</h3>
            <p>
              Letošní schodek ({czkRounded(dataset.budgetDeficit.value)}) se vynásobí výnosem, za
              který si stát dnes půjčuje ({percent(dataset.marginalYield.value, 2)}). Výsledek{' '}
              {czkRounded(annualInterestFromDeficit)} ročně je úrok, který se bude platit tak
              dlouho, dokud se jistina nesplatí.
            </p>
            <p>
              Kontrolní bod: rozpočtované výdaje na úroky vzrostly meziročně o{' '}
              {czkRounded(debtServiceYoyChange)}. Odhad tedy sedí v řádu i ve skutečnosti.
            </p>
          </article>

          <article className="method-card">
            <h3>Proč dvě záložky</h3>
            <p>
              „Každý občan“ dělí dluh mezi{' '}
              {czk(dataset.population.value)} obyvatel včetně dětí a důchodců. To je běžně
              citované číslo, ale nikdo z těchto skupin dluh splácet nebude.
            </p>
            <p>
              „Pracující občan“ dělí dluh mezi {czk(dataset.employed.value)} zaměstnaných a
              podnikatelů. Blíž realitě, protože daně platí především oni — ale i to je zjednodušení,
              stát vybírá i DPH a spotřební daně od všech.
            </p>
          </article>
        </div>

        <div className="table-scroll">
          <table>
            <caption className="sr-only">Přehled všech vstupních hodnot a jejich zdrojů</caption>
            <thead>
              <tr>
                <th scope="col">Údaj</th>
                <th scope="col">Hodnota</th>
                <th scope="col">K datu</th>
                <th scope="col">Zdroj</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(([key, entry]) => (
                <tr key={key}>
                  <th scope="row" style={{ fontWeight: 500 }}>
                    {LABELS[key] ?? key}
                  </th>
                  <td className="num">{formatValue(key, entry.value)}</td>
                  <td className="num" style={{ fontWeight: 400 }}>
                    {czDate(entry.asOf)}
                  </td>
                  <td>
                    <a href={entry.url} target="_blank" rel="noopener noreferrer">
                      {entry.source} <ExternalLink size={12} style={{ verticalAlign: '-1px' }} />
                    </a>
                    {entry.note && <span className="note">{entry.note}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="hero-meta" style={{ marginTop: 16 }}>
          Všechny hodnoty naposledy zkontrolovány {czDate(dataset.checkedAt)}. Pokud některá
          neodpovídá aktuálnímu zdroji, jde o chybu — data se udržují v jediném souboru{' '}
          <code>shared/dataset.ts</code>.
        </p>
      </div>
    </section>
  );
}
