import { czk, czDate, percent } from '../../shared/format';
import { dataset } from '../../shared/dataset';
import type { LiveDebt } from '../useLiveDebt';

export function Hero({ debt }: { debt: LiveDebt }) {
  return (
    <header>
      <h1 className="hero-label">Státní dluh České republiky:</h1>

      <p className="hero-amount" aria-live="off">
        {czk(debt.value)} <span className="unit">Kč</span>
      </p>

      {/* Screen readerům se hodnota nečte každý snímek — jen jednou při načtení. */}
      <p className="sr-only">
        Odhad k tomuto okamžiku: {czk(debt.value)} korun. Roste přibližně o{' '}
        {czk(dataset.debtProjection.value - dataset.debtAnchor.value)} korun do konce roku.
      </p>

      <dl className="hero-since">
        <dt>Od otevření této stránky:</dt>
        <dd>+ {czk(debt.sinceOpen)} Kč</dd>
      </dl>

      <p className="hero-meta">
        Poslední oficiálně publikovaný stav: <strong>{czk(dataset.debtAnchor.value)} Kč</strong> k{' '}
        {czDate(dataset.debtAnchor.asOf)} ({percent(dataset.debtToGdp.value)} HDP).{' '}
        {debt.beyondProjection
          ? 'Odhad již přesáhl horizont projekce MF — data je potřeba aktualizovat.'
          : 'Hodnota výše je dopočet, ne měření.'}{' '}
        <a href="#metodika">Jak se počítá</a>
      </p>
    </header>
  );
}
