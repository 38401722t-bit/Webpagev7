import { Wallet } from "@phosphor-icons/react";
import { AICard, Chip, inr } from "./Card";

const colors = ["from-primary to-sky-300", "from-secondary to-fuchsia-300", "from-emerald-400 to-teal-300", "from-amber-400 to-orange-300"];

const BudgetCard = ({ budget }) => {
  if (!budget) return null;
  const total = budget.total || 1;
  return (
    <AICard title="Budget" icon={Wallet} testid="ai-budget-card" right={<Chip tone="primary" className="capitalize">{budget.tier} tier</Chip>}>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="font-serif text-4xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary" data-testid="ai-budget-total">{inr(budget.total)}</div>
          <div className="text-xs text-muted-foreground mt-1">{inr(budget.per_person)} per person · {inr(budget.per_day)} per day</div>
        </div>
        {budget.tiers && (
          <div className="flex gap-1.5 text-[11px]">
            {Object.entries(budget.tiers).map(([k, v]) => <Chip key={k} tone={k === budget.tier ? "primary" : "default"} className="capitalize">{k} {inr(v)}</Chip>)}
          </div>
        )}
      </div>
      <div className="mt-4 h-2.5 rounded-full overflow-hidden flex bg-white/5">
        {budget.breakdown?.map((b, i) => <div key={b.category} className={`h-full bg-gradient-to-r ${colors[i % colors.length]}`} style={{ width: `${(b.amount / total) * 100}%` }} title={b.category} />)}
      </div>
      <ul className="mt-3 grid sm:grid-cols-2 gap-2 text-sm" data-testid="ai-budget-breakdown">
        {budget.breakdown?.map((b, i) => (
          <li key={b.category} className="flex items-start gap-2">
            <span className={`mt-1.5 w-2.5 h-2.5 rounded-full bg-gradient-to-r ${colors[i % colors.length]} shrink-0`} />
            <div className="min-w-0"><div className="font-medium">{b.category} · {inr(b.amount)}</div><div className="text-xs text-muted-foreground truncate">{b.note}</div></div>
          </li>
        ))}
      </ul>
      {budget.note && <p className="mt-3 text-[11px] text-muted-foreground">{budget.note}</p>}
    </AICard>
  );
};

export default BudgetCard;
