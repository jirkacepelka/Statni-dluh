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

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Přepočítává dluh v každém snímku. Nic se nikam nedotazuje — model je
 * deterministický, takže stačí znát čas.
 *
 * Při `prefers-reduced-motion` se hodnota obnovuje jednou za sekundu.
 */
export function useLiveDebt(): LiveDebt {
  const openedAtRef = useRef(Date.now());
  const [state, setState] = useState<LiveDebt>(() => {
    const { value, beyondProjection } = debtAt(openedAtRef.current);
    return { value, sinceOpen: 0, beyondProjection };
  });

  useEffect(() => {
    const openedAt = openedAtRef.current;
    const baseline = debtAt(openedAt).value;

    const tick = () => {
      const { value, beyondProjection } = debtAt();
      setState({ value, sinceOpen: value - baseline, beyondProjection });
    };

    if (prefersReducedMotion()) {
      const id = window.setInterval(tick, 1000);
      return () => window.clearInterval(id);
    }

    let frame = 0;
    const loop = () => {
      tick();
      frame = window.requestAnimationFrame(loop);
    };
    frame = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return state;
}
