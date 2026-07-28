import { growthPerSecond } from '../../shared/model';
import { czk } from '../../shared/format';

/** Ukázka odpovědi — zkrácená, plnou vrací endpoint. */
const SAMPLE = `{
  "generovano": "2026-07-28T17:40:12.004Z",
  "zaklad": "obyvatel",
  "dluh": {
    "odhad": 3765570912433.7,
    "rustZaSekundu": ${growthPerSecond.toFixed(4)},
    "rustZaDen": 1435851449.3,
    "posledniZnamaHodnota": 3726800000000,
    "posledniZnamaKDatu": "2026-06-30",
    "projekceKonecRoku": 3991000000000,
    "podilNaHdp": 0.424,
    "zaProjekci": false
  },
  "metriky": [ { "id": "dluh-na-osobu", "value": 345592.04, ... } ],
  "kontext": { ... },
  "zdroje": [ { "klic": "debtAnchor", "odkaz": "https://mf.gov.cz/...", ... } ]
}`;

export function ApiDocs() {
  return (
    <section className="api" id="api" aria-labelledby="api-nadpis">
      <div className="container">
        <h2 id="api-nadpis">Otevřené API</h2>
        <p>
          Stejná data, ze kterých počítá tato stránka, jsou dostupná jako JSON. Bez klíče, bez
          limitu, CORS otevřený pro všechny domény. Odpověď obsahuje i pole{' '}
          <code>zdroje</code> s odkazem na primární zdroj každé hodnoty — kdokoli si může
          zkontrolovat, že se tu nic nevymýšlí.
        </p>

        <pre>
          <code>
            <span className="c"># aktuální stav</span>
            {'\n'}curl https://<i>vase-domena</i>/api/dluh{'\n\n'}
            <span className="c"># přepočet na pracující místo na všechny obyvatele</span>
            {'\n'}curl https://<i>vase-domena</i>/api/dluh?zaklad=pracujici{'\n\n'}
            <span className="c"># hodnota k jinému okamžiku (ISO 8601)</span>
            {'\n'}curl https://<i>vase-domena</i>/api/dluh?t=2026-12-31T23:59:59Z
          </code>
        </pre>

        <p style={{ marginTop: 20, marginBottom: 8 }}>Ukázka odpovědi:</p>
        <pre>
          <code>{SAMPLE}</code>
        </pre>

        <p style={{ marginTop: 20 }}>
          Pokud chcete vlastní počítadlo, nemusíte se dotazovat opakovaně. Stáhněte si odpověď
          jednou, vezměte <code>dluh.odhad</code> a <code>dluh.rustZaSekundu</code> (
          {czk(growthPerSecond)} Kč/s) a zbytek si dopočítejte lokálně.
        </p>
      </div>
    </section>
  );
}
