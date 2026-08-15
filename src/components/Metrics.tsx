import { Users, Percent, TrendingUp, Landmark, type LucideIcon } from 'lucide-react';
import {
  BASIS_LABELS,
  metrics,
  privateSectorEmployed,
  type Basis,
  type PublicSector,
} from '../../shared/model';
import { dataset } from '../../shared/dataset';
import { czk, czkRounded } from '../../shared/format';
import { Explain } from './Explain';

/**
 * Ikony podle významu metriky, ne podle placeholderů v návrhu:
 * lidé, kterým dluh patří → úrok → růst → stát, který ho platí.
 */
const ICONS: Record<string, LucideIcon> = {
  'dluh-na-osobu': Users,
  'obsluha-na-osobu': Percent,
  'prirustek-na-osobu': TrendingUp,
  'prirustek-celkem': Landmark,
};

const BASES: Basis[] = ['obyvatel', 'pracujici'];

interface MetricsProps {
  basis: Basis;
  onBasisChange: (basis: Basis) => void;
  publicSector: PublicSector;
  onPublicSectorChange: (publicSector: PublicSector) => void;
  /** Aktuální dluh — metriky se přepočítávají spolu s počítadlem. */
  now: number;
}

export function Metrics({
  basis,
  onBasisChange,
  publicSector,
  onPublicSectorChange,
  now,
}: MetricsProps) {
  const items = metrics(basis, publicSector, now);
  const excluded = publicSector === 'vynechat';

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

      {/* Přepínač patří jen k pracujícím — u obyvatel se nikdo neodečítá. */}
      {basis === 'pracujici' && (
        <div className="scope">
          <button
            type="button"
            role="switch"
            aria-checked={excluded}
            aria-controls="metriky"
            className="scope-switch"
            onClick={() => onPublicSectorChange(excluded ? 'zapocitat' : 'vynechat')}
          >
            <span className="scope-track" aria-hidden="true">
              <span className="scope-thumb" />
            </span>
            Bez zaměstnanců veřejného sektoru
          </button>

          <Explain label="Co přepínač dělá">
            {excluded ? (
              <>
                <span className="explain-formula">
                  Odečteni zaměstnanci veřejného sektoru — lidé placení z veřejných rozpočtů.
                </span>
                <span className="explain-substitution">
                  {czk(dataset.employed.value)} − {czk(dataset.publicSectorEmployed.value)} ={' '}
                  {czk(privateSectorEmployed)} pracujících
                </span>
              </>
            ) : (
              <>
                <span className="explain-formula">
                  Započítáni všichni pracující, tedy i zaměstnanci veřejného sektoru.
                </span>
                <span className="explain-substitution">
                  {czk(dataset.employed.value)} pracujících, z toho{' '}
                  {czk(dataset.publicSectorEmployed.value)} ve veřejném sektoru
                </span>
              </>
            )}
          </Explain>
        </div>
      )}

      <ul className="metrics" id="metriky" role="tabpanel" aria-labelledby={`tab-${basis}`}>
        {items.map((metric) => {
          const Icon = ICONS[metric.id] ?? Landmark;
          // Miliardové částky se v malém boxu nedají číst po jednotkách.
          const display =
            Math.abs(metric.value) >= 1e9 ? czkRounded(metric.value) : `${czk(metric.value)} kč`;

          return (
            <li className="metric" key={metric.id}>
              <span className="metric-icon" aria-hidden="true">
                <Icon size={48} strokeWidth={4} absoluteStrokeWidth />
              </span>
              <div className="metric-body">
                <div className="metric-value">
                  <span className="amount" suppressHydrationWarning>
                    {display}
                  </span>
                  {metric.unit === 'ročně' && <span className="per"> / rok</span>}
                  <Explain>
                    <span className="explain-formula">{metric.formula}</span>
                    <span className="explain-substitution" suppressHydrationWarning>
                      {metric.substitution}
                    </span>
                  </Explain>
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
