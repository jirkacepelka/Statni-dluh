# Státní dluh

Živé počítadlo státního dluhu České republiky s přepočtem na jednoho člověka.
Postaveno podle návrhu ve Figmě, ale s jednou tvrdou podmínkou navíc: **každé
číslo na stránce má dohledatelný primární zdroj a stránka sama přiznává, co je
měření a co dopočet.**

Vite + React + TypeScript, ikony [Lucide](https://lucide.dev/), nasazení na
Vercel. Bez databáze, bez backendu kromě jedné serverless funkce.

---

## Co stránka tvrdí a proč

Státní dluh se neměří v reálném čase. Ministerstvo financí ho publikuje
čtvrtletně. Žádné počítadlo — ani toto — proto neví, kolik stát dluží právě
teď.

Číslo v hlavičce je **lineární interpolace mezi dvěma oficiálně publikovanými
body**:

| | hodnota | zdroj |
| --- | --- | --- |
| kotva | 3 726,8 mld. Kč k 30. 6. 2026 | MF ČR, Čtvrtletní zpráva o řízení státního dluhu, 1. pololetí 2026 |
| cíl | 3 991,0 mld. Kč k 31. 12. 2026 | MF ČR, Strategie financování a řízení státního dluhu na rok 2026 |

Z toho vychází **16 619 Kč/s**, tedy 1,44 mld. Kč denně. Skutečný přírůstek je
nerovnoměrný — dluh roste skokově podle emisního kalendáře. Stránka to
neschovává, je to napsané pod počítadlem i v sekci Metodika.

Interpolace na konci roku dosedne přesně na projekci MF; ověřeno v testu níže.

### Co se záměrně nepočítá

- Jde o **státní dluh**, ne o dluh sektoru vládních institucí (maastrichtský).
  Ten je vyšší — zahrnuje kraje, obce a zdravotní pojišťovny.
- Nejsou zahrnuty implicitní závazky státu, například budoucí důchody.

### Odkud se bere „o tolik navíc každý rok“

Letošní schodek (310 mld. Kč) × výnos 10letého státního dluhopisu (4,60 %)
= **14,3 mld. Kč ročně**. To je trvalý úrokový náklad, který letošní schodek
přidává.

Kontrolní bod: rozpočtované výdaje na obsluhu dluhu vzrostly meziročně
z 98,1 na 110,0 mld. Kč, tedy o 11,9 mld. Odhad sedí v řádu i proti
skutečnosti.

---

## Aktualizace dat

Všechna čísla žijí v jediném souboru [`shared/dataset.ts`](shared/dataset.ts).
Nikde jinde v kódu není natvrdo zapsaná žádná hodnota o veřejných financích —
web i API počítají výhradně odtud, takže se nemohou rozejít.

Každá položka nese `value`, `asOf`, `source`, `url` a volitelnou `note`.
Tabulka zdrojů na stránce i pole `zdroje` v API se z těchto metadat generují
samy, takže na aktualizaci stačí přepsat hodnoty a `checkedAt`.

**Kdy aktualizovat:**

| údaj | frekvence | kde |
| --- | --- | --- |
| státní dluh, projekce | čtvrtletně | [MF – řízení státního dluhu](https://mf.gov.cz/cs/rozpoctova-politika/rizeni-statniho-dluhu) |
| skutečný schodek | měsíčně | [MF – plnění státního rozpočtu](https://mf.gov.cz/cs/rozpoctova-politika/statni-rozpocet/plneni-statniho-rozpoctu) |
| počet obyvatel, zaměstnanost | čtvrtletně | [ČSÚ](https://csu.gov.cz/) |
| výnos dluhopisu | průběžně | ČNB |

Pokud odhad přeroste horizont projekce, stránka i API to samy přiznají
příznakem `zaProjekci` a hláškou v hlavičce.

---

## API

```
GET /api/dluh
GET /api/dluh?zaklad=pracujici
GET /api/dluh?t=2026-12-31T23:59:59Z
```

Bez klíče, bez limitu, CORS otevřený. Odpověď obsahuje aktuální odhad, všechny
čtyři metriky včetně rozepsaného vzorce, kontextová čísla a kompletní seznam
zdrojů s odkazy.

Pro vlastní počítadlo se nedotazujte opakovaně — vezměte `dluh.odhad`
a `dluh.rustZaSekundu` a dopočítejte si zbytek lokálně.

Logika je v [`shared/api.ts`](shared/api.ts) jako čistá funkce. Na Vercelu ji
volá [`api/dluh.ts`](api/dluh.ts), ve vývoji middleware ve `vite.config.ts` —
obojí tedy vrací totéž.

---

## Vývoj

```bash
npm install
npm run dev        # web i /api/dluh na http://localhost:5173
npm run build      # tsc --noEmit && vite build
npm run typecheck
```

## Nasazení na Vercel

Repozitář stačí naimportovat — `vercel.json` nastavuje framework, build i
složku `api/`. Žádné proměnné prostředí nejsou potřeba.

---

## Před spuštěním doplnit

[`src/config.ts`](src/config.ts) obsahuje zástupné hodnoty pro patičku:
název provozovatele, logo, odkazy na web a sociální sítě, kontakt a odkaz na
repozitář. Dokud jsou odkazy `null`, patička je nezobrazí — stránka radši
neuvede nic než něco nepravdivého.

## Struktura

```
shared/     dataset.ts (jediný zdroj pravdy), model.ts (výpočty),
            format.ts (české formátování), api.ts (obsluha endpointu)
api/        dluh.ts — serverless adaptér pro Vercel
src/        React aplikace; components/ podle sekcí stránky
```

Hranice je záměrná: `shared/` neobsahuje nic z Reactu ani z Node, takže stejný
kód pohání frontend i serverless funkci.

## Přístupnost

Počítadlo se překresluje v každém snímku, ale screen readerům se nečte —
hodnota je pro ně vyrenderovaná jednou v `.sr-only`. Při
`prefers-reduced-motion` se obnovuje jednou za sekundu místo 60×.
Záložky jsou `role="tablist"`, tabulka zdrojů má `caption` a `scope`.

## Licence

Data pocházejí z veřejných zdrojů MF ČR, ČSÚ a ČNB.
