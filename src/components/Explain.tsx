import { useId, useState } from 'react';

interface ExplainProps {
  /** Slovní zápis výpočtu. */
  formula: string;
  /** Tentýž výpočet s dosazenými čísly. */
  substitution: string;
}

/**
 * Otazník u metriky, který po najetí ukáže, jak se k číslu došlo.
 *
 * Otevírá se najetím myší i fokusem z klávesnice. Na dotykových
 * displejích hover neexistuje — tam ho otevře klepnutí, protože tlačítko
 * fokus dostane, a klepnutí jinam ho zase zavře.
 */
export function Explain({ formula, substitution }: ExplainProps) {
  const id = useId();
  const [open, setOpen] = useState(false);

  return (
    <span className="explain">
      <button
        type="button"
        className="explain-trigger"
        aria-label="Jak se k číslu došlo"
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={() => setOpen(true)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => event.key === 'Escape' && setOpen(false)}
      >
        ?
      </button>

      <span role="tooltip" id={id} className="explain-bubble" hidden={!open}>
        <span className="explain-formula">{formula}</span>
        <span className="explain-substitution">{substitution}</span>
      </span>
    </span>
  );
}
