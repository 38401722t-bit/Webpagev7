import { useState } from "react";
import { Cpu, CaretDown, CaretUp, Wrench, CheckCircle, XCircle } from "@phosphor-icons/react";
import { AICard, Chip } from "./Card";
import { ValidationCard } from "./AlertCards";

const AgentTrace = ({ result }) => {
  const [open, setOpen] = useState(false);
  const agents = result.agents || [];
  const tools = result.tools || [];
  return (
    <div className="space-y-3">
      <AICard title="Agent trace" icon={Cpu} testid="ai-agent-trace"
        right={<button onClick={() => setOpen((o) => !o)} data-testid="ai-trace-toggle" className="text-xs text-primary inline-flex items-center gap-1">{open ? <>Hide tools <CaretUp size={12} /></> : <>Show {tools.length} tool calls <CaretDown size={12} /></>}</button>}>
        <div className="flex flex-wrap gap-1.5 text-xs">
          <Chip tone="secondary">intent: {result.intent}</Chip>
          {result.confidence != null && <Chip>confidence {Math.round(result.confidence * 100)}%</Chip>}
          <Chip>router {result.classifier?.model || "rules"} · {result.classifier?.duration_ms ?? 0} ms</Chip>
          <Chip>total {result.duration_ms} ms</Chip>
        </div>
        <ul className="mt-3 grid sm:grid-cols-2 gap-1.5">
          {agents.map((a) => (
            <li key={a.agent} className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10 text-xs" data-testid={`ai-trace-agent-${a.agent}`}>
              {a.status === "completed" ? <CheckCircle size={14} weight="fill" className="text-emerald-400 shrink-0" /> : <XCircle size={14} weight="fill" className="text-red-400 shrink-0" />}
              <div className="min-w-0 flex-1"><div className="font-medium">{a.title}</div><div className="text-muted-foreground truncate">{a.model} · {a.duration_ms} ms{a.error ? ` · ${a.error}` : ""}</div></div>
            </li>
          ))}
        </ul>
        {open && (
          <ul className="mt-3 space-y-1 font-mono text-[11px]" data-testid="ai-trace-tools">
            {tools.map((t, i) => (
              <li key={i} className="flex items-start gap-2 p-1.5 rounded-lg bg-black/20">
                <Wrench size={12} className={`mt-0.5 shrink-0 ${t.ok ? "text-primary" : "text-red-400"}`} />
                <span className="text-muted-foreground">{t.agent}</span>
                <span className="text-foreground">{t.tool}(<span className="text-secondary">{Object.entries(t.args || {}).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(", ")}</span>)</span>
                <span className="ml-auto text-muted-foreground shrink-0">{t.duration_ms} ms</span>
              </li>
            ))}
          </ul>
        )}
      </AICard>
      <ValidationCard validation={result.validation} />
    </div>
  );
};

export default AgentTrace;
