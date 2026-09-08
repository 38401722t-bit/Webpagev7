import { Sparkle, CircleNotch, CheckCircle } from "@phosphor-icons/react";

const AgentProgress = ({ progress }) => {
  const { label, agents = [], done = [] } = progress;
  return (
    <div className="glass rounded-3xl p-4 md:p-5 fade-up" data-testid="ai-progress" aria-live="polite">
      <div className="flex items-center gap-2 text-sm"><Sparkle size={16} weight="fill" className="text-secondary animate-pulse" /><span className="font-medium">TripPilot</span><span className="text-muted-foreground">· {label || "Thinking"}</span></div>
      {agents.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {agents.map((a) => {
            const ok = done.includes(a.name);
            return (
              <li key={a.name} data-testid={`ai-progress-${a.name}`} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] border transition-colors ${ok ? "bg-emerald-400/10 border-emerald-400/30 text-emerald-200" : "bg-white/5 border-white/10 text-foreground/70"}`}>
                {ok ? <CheckCircle size={12} weight="fill" /> : <CircleNotch size={12} className="animate-spin" />}{a.title}
              </li>
            );
          })}
        </ul>
      )}
      <div className="mt-3 h-1 rounded-full bg-white/5 overflow-hidden"><div className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500" style={{ width: `${agents.length ? Math.max(8, (done.length / agents.length) * 100) : 12}%` }} /></div>
    </div>
  );
};

export default AgentProgress;
