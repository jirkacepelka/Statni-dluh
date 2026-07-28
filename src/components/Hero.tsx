import { czk, czDate, percent } from '../../shared/format';
import { dataset } from '../../shared/dataset';
import { config } from '../config';
import type { LiveDebt } from '../useLiveDebt';

export function Hero({ debt }: { debt: LiveDebt }) {
  return (
    <header>
      <h1 className="hero-label">Státní dluh České republiky:</h1>

      <p className="hero-amount">
        {czk(debt.value)} <span className="unit">Kč</span>
      </p>

      {/* Screen readerům se hodnota nečte každou vteřinu — jen jednou při načtení. */}
      <p className="sr-only">
        Odhad k tomuto okamžiku: {czk(debt.value)} korun.
      </p>

      <dl className="hero-since">
        <dt>Od otevření této stránky:</dt>
        <dd>+ {czk(debt.sinceOpen)} Kč</dd>
      </dl>

      <p className="hero-meta">
        Poslední publikovaný stav {czk(dataset.debtAnchor.value)} Kč k{' '}
        {czDate(dataset.debtAnchor.asOf)} ({percent(dataset.debtToGdp.value)} HDP).{' '}
        {debt.beyondProjection && 'Odhad přesáhl horizont projekce MF. '}
        <a href={config.repository} target="_blank" rel="noopener noreferrer">
          Jak se počítá
        </a>
      </p>
    </header>
  );
}
