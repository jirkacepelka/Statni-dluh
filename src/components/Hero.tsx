import { czk } from '../../shared/format';
import type { LiveDebt } from '../useLiveDebt';

export function Hero({ debt }: { debt: LiveDebt }) {
  return (
    <header>
      <h1 className="hero-label">Státní dluh:</h1>

      {/* Předvykreslená hodnota je z okamžiku buildu, klient ji hned přepíše —
          proto se u ní nehlásí nesoulad hydratace. */}
      <p className="hero-amount">
        <span suppressHydrationWarning>{czk(debt.value)}</span>
        <span className="unit">kč</span>
      </p>

      {/* Screen readerům se hodnota nečte každou vteřinu — jen jednou při načtení. */}
      <p className="sr-only" suppressHydrationWarning>
        Odhad k tomuto okamžiku: {czk(debt.value)} korun.
      </p>

      <dl className="hero-since">
        <dt>Od otevření stránky:</dt>
        <dd>+ {czk(debt.sinceOpen)} kč</dd>
      </dl>
    </header>
  );
}
