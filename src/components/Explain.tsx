import { useId, useState, type ReactNode } from 'react';

interface ExplainProps {
  /** Popisek tlačítka pro odečítače obrazovky. */
  label?: string;
  /** Obsah bubliny. Řádky se sázejí přes `.explain-formula` a `-substitution`. */
  children: ReactNode;
}

/**
 * Otazník, který po najetí ukáže vysvětlení k tomu, co stojí vedle něj —
 * u metriky výpočet, u přepínače jeho dopad.
 *
 * Otevírá se najetím myší i fokusem z klávesnice. Na dotykových
 * displejích hover neexistuje — tam ho otevře klepnutí, protože tlačítko
 * fokus dostane, a klepnutí jinam ho zase zavře.
 */
export function Explain({ label = 'Jak se k číslu došlo', children }: ExplainProps) {
  const id = useId();
  const [open, setOpen] = useState(false);

  return (
    <span className="explain">
      <button
        type="button"
        className="explain-trigger"
        aria-label={label}
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
        {children}
      </span>
    </span>
  );
}
