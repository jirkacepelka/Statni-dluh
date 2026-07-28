import { CalendarClock, PiggyBank, Percent, Gauge } from 'lucide-react';
import { dataset } from '../../shared/dataset';
import { growthPerDay, debtServiceYoyChange } from '../../shared/model';
import { czkRounded, czDate, percent } from '../../shared/format';

/** Řádek kontextových údajů — čísla, která velké počítadlo samo o sobě neřekne. */
export function Context() {
  const chips = [
    {
      icon: Gauge,
      label: 'Denní přírůstek dluhu',
      value: czkRounded(growthPerDay),
    },
    {
      icon: PiggyBank,
      label: `Schodek rozpočtu ${new Date(dataset.budgetDeficit.asOf).getFullYear()}`,
      value: czkRounded(dataset.budgetDeficit.value),
    },
    {
      icon: CalendarClock,
      label: `Skutečný schodek k ${czDate(dataset.cashDeficitToDate.asOf)}`,
      value: czkRounded(dataset.cashDeficitToDate.value),
    },
    {
      icon: Percent,
      label: 'Úroky meziročně',
      value: `+ ${czkRounded(debtServiceYoyChange)}`,
    },
  ];

  return (
    <div className="context">
      {chips.map(({ icon: Icon, label, value }) => (
        <span className="chip" key={label}>
          <Icon size={15} strokeWidth={1.9} aria-hidden="true" />
          {label}: <strong>{value}</strong>
        </span>
      ))}
      <span className="chip">
        Podíl dluhu na HDP: <strong>{percent(dataset.debtToGdp.value)}</strong>
      </span>
    </div>
  );
}
