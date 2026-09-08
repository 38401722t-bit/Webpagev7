import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FloppyDisk, ArrowSquareOut, ArrowRight, ChatCircle, Check } from "@phosphor-icons/react";
import { Button } from "../ui/button";
import { http } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

const ActionsBar = ({ actions = [], runId, onPrompt, onApplied }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [busy, setBusy] = useState(null);
  const [done, setDone] = useState(null);
  if (!actions.length) return null;

  const apply = async (a, actionKey) => {
    if (!user) { toast.error("Log in to save trips"); navigate("/login"); return; }
    setBusy(actionKey);
    try {
      const { data } = await http.post("/ai/apply", { run_id: runId, trip_id: a.payload?.trip_id || null });
      setDone(actionKey);
      toast.success(data.kind === "created" ? `Trip "${data.trip.title}" saved` : `Trip "${data.trip.title}" updated`);
      onApplied?.(data);
    } catch (e) { toast.error(e?.response?.data?.detail || "Could not apply"); }
    setBusy(null);
  };

  const run = (a, actionKey) => {
    if (a.type === "apply") return apply(a, actionKey);
    if (a.type === "navigate") return navigate(a.payload?.to || a.to);
    if (a.type === "external") return window.open(a.payload?.url || a.url, "_blank", "noopener");
    if (a.type === "prompt") return onPrompt?.(a.payload?.message || a.prompt || a.label);
  };
  const icon = { apply: FloppyDisk, navigate: ArrowRight, external: ArrowSquareOut, prompt: ChatCircle };

  return (
    <div className="flex flex-wrap gap-2" data-testid="ai-actions">
      {actions.map((a, i) => {
        const actionKey = a.id || `ai-action-${i}-${a.type || "btn"}-${(a.label || "").replace(/\s+/g, "-").toLowerCase()}`;
        const isBusy = busy === actionKey || (a.id && busy === a.id);
        const isDone = done === actionKey || (a.id && done === a.id);
        const Icon = isDone ? Check : icon[a.type] || ArrowRight;
        const primary = a.type === "apply";
        return (
          <Button
            key={actionKey}
            size="sm"
            onClick={() => run(a, actionKey)}
            disabled={isBusy || isDone}
            data-testid={`ai-action-${a.id || i}`}
            variant={primary ? "default" : "outline"}
            className={`rounded-full ${primary ? "btn-3d bg-primary text-primary-foreground" : "bg-white/5 border-white/10 hover:bg-white/10"} fade-up`}
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <Icon size={14} className="mr-1" />{isBusy ? "Saving…" : isDone ? "Done" : a.label}
          </Button>
        );
      })}
    </div>
  );
};

export default ActionsBar;
