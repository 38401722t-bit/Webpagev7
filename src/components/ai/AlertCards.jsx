import { Warning, ArrowsClockwise, CheckCircle } from "@phosphor-icons/react";
import { AICard, Chip } from "./Card";

const tone = { danger: "danger", warning: "warning", info: "info" };

export const WarningsCard = ({ warnings = [] }) => warnings.length ? (
  <AICard title="Heads-up" icon={Warning} testid="ai-warnings-card">
    <ul className="space-y-1.5">
      {warnings.map((w, i) => (
        <li key={i} className="flex items-start gap-2 text-sm" data-testid={`ai-warning-${i}`}>
          <Chip tone={tone[w.level] || "info"} className="shrink-0 mt-0.5 capitalize">{w.source || w.level}</Chip>
          <div><span className="font-medium">{w.title}</span>{w.message && <span className="text-foreground/75"> — {w.message}</span>}</div>
        </li>
      ))}
    </ul>
  </AICard>
) : null;

const changeTone = { removed: "danger", added: "success", replaced: "warning", moved: "info", retimed: "info", budget: "warning" };

export const ChangesCard = ({ changes = [] }) => changes.length ? (
  <AICard title="What changed" icon={ArrowsClockwise} testid="ai-changes-card" right={<Chip tone="warning">{changes.length} change{changes.length > 1 ? "s" : ""}</Chip>}>
    <ul className="space-y-2">
      {changes.map((c, i) => (
        <li key={i} className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm" data-testid={`ai-change-${i}`}>
          <div className="flex items-center gap-2 flex-wrap"><Chip tone={changeTone[c.type] || "info"} className="capitalize">{c.type}</Chip>{c.day && <span className="text-xs text-muted-foreground">Day {c.day}</span>}<span className="text-xs text-muted-foreground">{c.reason}</span></div>
          <div className="mt-1.5 grid sm:grid-cols-2 gap-2 text-xs">
            {c.before && <div className="line-through text-foreground/50">{c.before}</div>}
            {c.after && <div className="text-foreground/90 flex items-start gap-1"><CheckCircle size={13} weight="fill" className="text-emerald-400 shrink-0 mt-0.5" />{c.after}</div>}
          </div>
        </li>
      ))}
    </ul>
  </AICard>
) : null;

export const ValidationCard = ({ validation }) => validation ? (
  <AICard title="Validation report" icon={CheckCircle} testid="ai-validation-card" right={<Chip tone={validation.ok ? "success" : "danger"}>{validation.ok ? "passed" : "errors"}</Chip>}>
    {validation.issues?.length ? (
      <ul className="text-xs space-y-1">{validation.issues.map((i, k) => <li key={k} className="flex gap-2"><Chip tone={i.severity === "error" ? "danger" : "warning"}>{i.code}</Chip><span>{i.message}</span></li>)}</ul>
    ) : <p className="text-xs text-muted-foreground">Dates, times, route consistency, duplicates, budget and feasibility all checked — no issues.</p>}
  </AICard>
) : null;
