import { Users, Receipt, TrendingUp, Landmark, type LucideIcon } from 'lucide-react';
import { BASIS_LABELS, metrics, type Basis } from '../../shared/model';
import { czk, czkRounded } from '../../shared/format';

const ICONS: Record<string, LucideIcon> = {
  'dluh-na-osobu': Users,
  'obsluha-na-osobu': Receipt,
  'prirustek-na-osobu': TrendingUp,
  'prirustek-celkem': Landmark,
};

const BASES: Basis[] = ['obyvatel', 'pracujici'];

interface MetricsProps {
  basis: Basis;
  onBasisChange: (basis: Basis) => void;
  /** Aktuální dluh — metriky se přepočítávají spolu s počítadlem. */
  now: number;
}

export function Metrics({ basis, onBasisChange, now }: MetricsProps) {
  const items = metrics(basis, now);

  return (
    <section className="panel" aria-labelledby="prepocet">
      <h2 id="prepocet" className="sr-only">
        Přepočet na jednoho člověka
      </h2>

      <div className="tabs" role="tablist" aria-label="Na koho dluh přepočítat">
        {BASES.map((option) => (
          <button
            key={option}
            type="button"
            role="tab"
            id={`tab-${option}`}
            aria-selected={basis === option}
            aria-controls="metriky"
            className="tab"
            onClick={() => onBasisChange(option)}
          >
            {BASIS_LABELS[option]}
          </button>
        ))}
      </div>

      <ul className="metrics" id="metriky" role="tabpanel" aria-labelledby={`tab-${basis}`}>
        {items.map((metric) => {
          const Icon = ICONS[metric.id] ?? Landmark;
          // Miliardové částky se v malém boxu nedají číst po jednotkách.
          const display =
            Math.abs(metric.value) >= 1e9 ? czkRounded(metric.value) : `${czk(metric.value)} Kč`;

          return (
            <li className="metric" key={metric.id}>
              <span className="metric-icon" aria-hidden="true">
                <Icon size={26} strokeWidth={1.75} />
              </span>
              <div className="metric-body">
                <div className="metric-value">
                  <span className="amount">{display}</span>
                  {metric.unit === 'ročně' && <span className="per"> / rok</span>}
                </div>
                <p className="metric-label">{metric.label}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
