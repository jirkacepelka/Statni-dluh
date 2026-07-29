import { dataset } from '../../shared/dataset';
import {
  growthPerSecond,
  growthPerSecondRestOfYear,
  growthPerDay,
  plannedYearIncrease,
  annualInterestFromDeficit,
  debtServiceYoyChange,
  shortfallAgainstProjection,
} from '../../shared/model';
import { czk, czkRounded, czDate, percent } from '../../shared/format';
import { config } from '../config';

/** Lidské názvy klíčů datasetu pro tabulku zdrojů. */
const LABELS: Record<string, string> = {
  debtAnchor: 'Státní dluh — poslední publikovaný stav',
  debtPreviousYearEnd: 'Státní dluh na konci předchozího roku',
  debtProjection: 'Státní dluh — projekce MF ke konci roku',
  debtToGdp: 'Podíl státního dluhu na HDP',
  budgetDeficit: 'Schválený schodek státního rozpočtu',
  cashDeficitToDate: 'Skutečný schodek k poslednímu publikovanému měsíci',
  debtServiceCurrentYear: 'Výdaje na obsluhu státního dluhu — letos',
  debtServicePreviousYear: 'Výdaje na obsluhu státního dluhu — loni',
  marginalYield: 'Průměrný výnos nově emitovaných státních dluhopisů',
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

const entries = Object.entries(dataset).filter(
  (entry): entry is [string, SourcedEntry] =>
    typeof entry[1] === 'object' && entry[1] !== null && 'url' in entry[1],
);

function formatValue(key: string, value: number): string {
  if (key === 'debtToGdp') return percent(value);
  if (key === 'marginalYield') return percent(value, 2);
  if (key === 'population' || key === 'employed') return czk(value);
  return `${czk(value)} kč`;
}

export function Informace() {
  return (
    <div className="page">
      <main className="doc">
        <div className="container">
          <nav className="doc-back">
            <a href="/">← Zpět na počítadlo</a>
          </nav>

          <h1>Informace o projektu</h1>
          <p className="doc-lede">
            Co tenhle web je, odkud bere čísla, jak je počítá a jak nakládá s vaším soukromím.
          </p>

          {/* ------------------------------------------------ upozornění */}

          <section aria-labelledby="upozorneni">
            <h2 id="upozorneni">Právní upozornění</h2>

            <div className="doc-callout">
              <strong>Tento web není oficiálním zdrojem informací o státním dluhu.</strong> Neprovozuje
              ho Ministerstvo financí, Český statistický úřad ani žádný jiný orgán veřejné moci a
              není s nimi nijak spojen. Provozovatelem je {config.organisation}
              {config.tagline ? `, ${config.tagline.toLowerCase()}` : ''}.
            </div>

            <p>
              Číslo na úvodní stránce je <strong>dopočet, nikoli měření</strong>. Státní dluh se v
              reálném čase neměří — Ministerstvo financí ho publikuje čtvrtletně. Zobrazená hodnota
              vychází z poslední publikované částky a roste plynulým průměrným tempem, kdežto
              skutečný dluh se mění skokově podle emisního kalendáře. Rozdíl mezi zobrazeným
              odhadem a skutečností může být v řádu miliard korun. Přesný postup popisuje sekce{' '}
              <a href="#metodika">Jak se čísla počítají</a>.
            </p>

            <p>
              Vstupní data přebíráme z veřejných zdrojů státních institucí a u každé hodnoty
              uvádíme, odkud pochází a ke kterému datu platí. Za správnost převzatých údajů ani za
              jejich pozdější změny neodpovídáme. Pokud objevíte nesrovnalost, budeme rádi, když
              nám dáte vědět.
            </p>

            <p>
              Obsah slouží k informování veřejnosti a je součástí politické komunikace
              provozovatele. <strong>Nejde o ekonomické, právní, daňové ani investiční
              poradenství</strong> a nelze ho jako podklad pro jakékoli rozhodování použít. Výběr
              zobrazovaných ukazatelů odráží názorové zaměření provozovatele; čísla samotná jsou
              převzatá z oficiálních zdrojů a jejich výpočty jsou zveřejněné.
            </p>

            <p>
              Web je poskytován „jak stojí a leží“, bez záruky dostupnosti či bezchybnosti. V
              rozsahu, který připouští právní řád, neodpovídáme za škodu vzniklou jeho použitím.
            </p>
          </section>

          {/* -------------------------------------------------- metodika */}

          <section aria-labelledby="metodika">
            <h2 id="metodika">Jak se čísla počítají</h2>

            <h3>Počítadlo na úvodní stránce</h3>
            <p>
              Vychází z poslední oficiálně publikované hodnoty státního dluhu —{' '}
              <strong>{czk(dataset.debtAnchor.value)} kč</strong> k {czDate(dataset.debtAnchor.asOf)}{' '}
              — a přičítá k ní průměrné tempo za celý letošní rok. To plyne z plánu ministerstva:
              dluh má za rok vzrůst z {czk(dataset.debtPreviousYearEnd.value)} kč na{' '}
              {czk(dataset.debtProjection.value)} kč, tedy o {czk(plannedYearIncrease)} kč.
            </p>
            <p className="doc-formula">
              {czk(plannedYearIncrease)} kč ÷ 365 dní ={' '}
              <strong>{czk(growthPerSecond)} kč za sekundu</strong> = {czkRounded(growthPerDay)}{' '}
              denně
            </p>

            <h3>Proč roční průměr a ne tempo zbytku roku</h3>
            <p>
              Plán Ministerstva financí je silně zadní. V prvním pololetí dluh vzrostl o{' '}
              {czkRounded(dataset.debtAnchor.value - dataset.debtPreviousYearEnd.value)}, zatímco na
              druhé pololetí zbývá{' '}
              {czkRounded(dataset.debtProjection.value - dataset.debtAnchor.value)}. Tempo dopočtené
              jen ze zbytku roku by vyšlo {czk(growthPerSecondRestOfYear)} kč za sekundu — víc než
              pětinásobek toho, co se skutečně dělo. Roční průměr je klidnější a blíž realitě.
            </p>
            <p>
              Cenou za to je, že počítadlo na projekci ministerstva ke konci roku nedosedne. Skončí
              zhruba <strong>{czkRounded(shortfallAgainstProjection)}</strong> pod ní. Je to vědomá
              volba, ne chyba; rozdíl je vidět i v API v poli{' '}
              <code>dluh.rozdilProtiProjekci</code>.
            </p>

            <h3>Co se záměrně nepočítá</h3>
            <ul>
              <li>
                Jde o <strong>státní dluh</strong>, ne o dluh sektoru vládních institucí
                (maastrichtský). Ten je vyšší, protože zahrnuje i kraje, obce a zdravotní
                pojišťovny.
              </li>
              <li>
                Nejsou zahrnuty implicitní závazky státu — například budoucí důchody. Nejsou
                formálním dluhem, ale zaplatit se budou muset.
              </li>
            </ul>

            <h3>Přepočet na jednoho člověka</h3>
            <p>
              Záložka <strong>Každý občan</strong> dělí dluh mezi {czk(dataset.population.value)}{' '}
              obyvatel včetně dětí a důchodců. To je běžně citované číslo, ale nikdo z těchto skupin
              dluh splácet nebude. Záložka <strong>Pracující občan</strong> dělí dluh mezi{' '}
              {czk(dataset.employed.value)} zaměstnaných a podnikatelů. Blíž realitě, protože daně
              platí především oni — ale i to je zjednodušení, stát vybírá DPH a spotřební daně od
              všech.
            </p>

            <h3>Náklad, který vzniká letošním schodkem</h3>
            <p>
              Schodek rozpočtu ({czkRounded(dataset.budgetDeficit.value)}) se násobí průměrným
              výnosem nově emitovaných státních dluhopisů (
              {percent(dataset.marginalYield.value, 2)}), tedy cenou, za kterou si stát půjčuje
              dnes. Výsledek <strong>{czkRounded(annualInterestFromDeficit)} ročně</strong> je úrok,
              který se bude platit tak dlouho, dokud se jistina nesplatí.
            </p>
            <p>
              Záměrně se nepoužívá průměrná cena existujícího dluhu ({percent(
                dataset.debtServiceCurrentYear.value / dataset.debtAnchor.value,
                2,
              )}
              ). Ta je nižší, protože obsahuje emise z let nulových sazeb — jenže nový dluh se
              prodává za dnešní ceny. Státní dluh totiž není jedna půjčka s jednou sazbou, ale
              několik set emisí a každá má kupon zafixovaný v okamžiku prodeje.
            </p>
            <p>
              Kontrola řádu: rozpočtované výdaje na úroky vzrostly meziročně o{' '}
              {czkRounded(debtServiceYoyChange)}. Není to totéž číslo — meziroční nárůst odráží
              loňský schodek a refinancování starého levnějšího dluhu, zatímco částka výše je
              ustálený náklad letošního schodku, až bude celý vydaný.
            </p>

            <h3>Zdroje všech vstupních hodnot</h3>
            <p>
              Web nepočítá z ničeho jiného než z těchto jedenácti čísel. Každé má uvedený zdroj i
              datum platnosti.
            </p>

            <div className="doc-table">
              <table>
                <caption className="sr-only">Vstupní hodnoty a jejich zdroje</caption>
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
                      <th scope="row">{LABELS[key] ?? key}</th>
                      <td className="num">{formatValue(key, entry.value)}</td>
                      <td className="num">{czDate(entry.asOf)}</td>
                      <td>
                        <a href={entry.url} target="_blank" rel="noopener noreferrer">
                          {entry.source}
                        </a>
                        {entry.note && <span className="note">{entry.note}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p>
              Všechny hodnoty naposledy zkontrolovány {czDate(dataset.checkedAt)}. Data i výpočty
              jsou dostupné jako JSON na <a href="/api/dluh">/api/dluh</a>, bez klíče a bez limitu.
            </p>
          </section>

          {/* -------------------------------------------------- soukromí */}

          <section aria-labelledby="soukromi">
            <h2 id="soukromi">Ochrana soukromí</h2>

            <div className="doc-callout">
              <strong>Tento web o vás nesbírá žádné údaje.</strong> Nepoužívá cookies, neměří
              návštěvnost, nemá účty ani formuláře a nepředává nic třetím stranám.
            </div>

            <h3>Co tu není</h3>
            <ul>
              <li>
                <strong>Žádné cookies.</strong> Web si do vašeho prohlížeče nic neukládá — ani
                cookies, ani local storage. Proto tu není lišta se souhlasem; není k čemu ho dávat.
              </li>
              <li>
                <strong>Žádná analytika.</strong> Není tu Google Analytics ani jiný měřicí nástroj.
                Nevíme, kolik lidí sem chodí ani odkud.
              </li>
              <li>
                <strong>Žádné externí služby.</strong> Písmo i všechny obrázky se načítají z tohoto
                webu. Nenačítá se nic z Google Fonts ani z jiného cizího serveru, takže se o vaší
                návštěvě nikdo další nedozví.
              </li>
              <li>
                <strong>Žádné sledovací skripty.</strong> Nejsou tu pixely sociálních sítí ani
                reklamní kódy.
              </li>
            </ul>

            <h3>Co se přesto děje</h3>
            <p>
              Web běží na infrastruktuře společnosti Vercel. Ta jako každý webový server zpracovává
              při doručení stránky vaši <strong>IP adresu</strong> a údaje o prohlížeči v
              provozních záznamech. Slouží to k provozu, zabezpečení a ochraně před útoky. Právním
              základem je oprávněný zájem na bezpečném provozu webu podle čl. 6 odst. 1 písm. f)
              GDPR. K těmto záznamům nemáme přístup a nespojujeme je s žádnou vaší identitou.
            </p>
            <p>
              Odkazy v patičce a v tabulce zdrojů vedou na weby třetích stran. Jakmile na ně
              kliknete, platí zásady soukromí těch webů — u sociálních sítí to zpravidla znamená
              rozsáhlé sledování. Dokud na odkaz nekliknete, žádné spojení s nimi nevzniká a tyto
              weby se o vaší návštěvě nedozvědí.
            </p>
            <p>
              Rozhraní <a href="/api/dluh">/api/dluh</a> je veřejné, nevyžaduje přihlášení a
              neukládá si, kdo se na něj ptá.
            </p>

            <h3>Vaše práva</h3>
            <p>
              Protože o vás neuchováváme žádné osobní údaje, není z naší strany co zpřístupnit,
              opravit ani smazat. Pokud si přesto chcete cokoli ověřit nebo uplatnit svá práva podle
              GDPR, ozvěte se provozovateli
              {config.contact ? (
                <>
                  {' '}na <a href={`mailto:${config.contact}`}>{config.contact}</a>.
                </>
              ) : (
                <> přes kontakt uvedený na jeho oficiálním webu.</>
              )}
            </p>
          </section>

          {/* --------------------------------------------------- licence */}

          <section aria-labelledby="licence">
            <h2 id="licence">Data, kód a licence</h2>
            <p>
              Vstupní data pocházejí z veřejných zdrojů Ministerstva financí ČR, Českého
              statistického úřadu a České národní banky. Zdrojový kód webu i všechny výpočty jsou
              veřejné — najdete je{' '}
              <a href={config.repository} target="_blank" rel="noopener noreferrer">
                na GitHubu
              </a>
              . Můžete si tedy sami ověřit, že se čísla nikde neohýbají.
            </p>
            <p>
              Grafiku a text webu můžete šířit s uvedením zdroje. Logo a název provozovatele jsou
              chráněné a nelze je používat způsobem, který by naznačoval spojení nebo souhlas, aniž
              by byl udělen.
            </p>
          </section>

          <nav className="doc-back doc-back-bottom">
            <a href="/">← Zpět na počítadlo</a>
          </nav>
        </div>
      </main>
    </div>
  );
}
