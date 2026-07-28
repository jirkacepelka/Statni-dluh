import { useEffect, useRef, useState } from 'react';
import { debtAt } from '../shared/model';

export interface LiveDebt {
  /** Aktuální odhad státního dluhu v Kč. */
  value: number;
  /** O kolik dluh narostl od načtení stránky. */
  sinceOpen: number;
  /** Odhad už přesáhl horizont projekce MF — extrapoluje se dál. */
  beyondProjection: boolean;
}

/**
 * Jak často se hodnota obnovuje. Vteřinový krok je záměrný — dluh roste
 * o 16 619 Kč/s, takže při 60 FPS by se poslední číslice slily v šum.
 */
const TICK_MS = 1000;

/**
 * Přepočítává dluh jednou za vteřinu. Nic se nikam nedotazuje — model je
 * deterministický, takže stačí znát čas.
 */
export function useLiveDebt(): LiveDebt {
  const openedAtRef = useRef(Date.now());
  const [state, setState] = useState<LiveDebt>(() => {
    const { value, beyondProjection } = debtAt(openedAtRef.current);
    return { value, sinceOpen: 0, beyondProjection };
  });

  useEffect(() => {
    const baseline = debtAt(openedAtRef.current).value;

    const tick = () => {
      const { value, beyondProjection } = debtAt();
      setState({ value, sinceOpen: value - baseline, beyondProjection });
    };

    // První krok se srovná na celou vteřinu, aby počítadlo tikalo
    // pravidelně i po zpožděném načtení stránky.
    let interval: number | undefined;
    const align = window.setTimeout(() => {
      tick();
      interval = window.setInterval(tick, TICK_MS);
    }, TICK_MS - (Date.now() % TICK_MS));

    return () => {
      window.clearTimeout(align);
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, []);

  return state;
}
