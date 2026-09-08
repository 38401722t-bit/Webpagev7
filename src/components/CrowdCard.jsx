import { useEffect, useState } from "react";
import { http } from "../lib/api";
import { UsersFour, Clock, Lightbulb } from "@phosphor-icons/react";

const levelStyle = {
  low: { bar: "from-emerald-500 to-emerald-400", text: "text-emerald-700", chip: "bg-emerald-50 border-emerald-200", label: "Low crowd", width: "22%" },
  moderate: { bar: "from-amber-500 to-amber-400", text: "text-amber-800", chip: "bg-amber-50 border-amber-200", label: "Moderate", width: "55%" },
  high: { bar: "from-orange-500 to-orange-400", text: "text-orange-800", chip: "bg-orange-50 border-orange-200", label: "High crowd", width: "82%" },
  very_high: { bar: "from-red-500 to-rose-500", text: "text-red-700", chip: "bg-red-50 border-red-200", label: "Very high", width: "97%" },
};

const CrowdCard = ({ destId }) => {
  const [data, setData] = useState(null);
  useEffect(() => {
    let alive = true; setData(null);
    http.get(`/crowd/${destId}`).then((r) => { if (alive) setData(r.data); }).catch(() => { if (alive) setData({ error: true }); });
    return () => { alive = false; };
  }, [destId]);

  if (!data) return <div className="bg-white rounded-3xl p-6 border border-slate-100 text-slate-400 shadow-xs animate-pulse h-48 flex items-center justify-center font-medium" data-testid="crowd-loading">AI is checking live crowd…</div>;
  if (data.error) return <div className="bg-white rounded-3xl p-6 border border-slate-100 text-slate-500" data-testid="crowd-error">Crowd data unavailable</div>;
  const s = levelStyle[data.level] || levelStyle.moderate;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06)]" data-testid="crowd-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="label-eyebrow text-sky-600 font-bold uppercase tracking-wider text-[11px]">Live crowd · AI Intel</div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${s.chip} ${s.text}`}>{s.label}</div>
            <div className="flex items-center gap-1 text-sm text-slate-500 font-medium"><Clock size={14} /> ~{data.wait_minutes} min wait</div>
          </div>
        </div>
        <UsersFour size={36} weight="duotone" className="text-sky-600 shrink-0" />
      </div>
      <div className="mt-4 h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${s.bar} rounded-full transition-all duration-700`} style={{ width: s.width }} />
      </div>
      <p className="mt-4 text-sm text-slate-700 font-medium leading-relaxed">{data.summary}</p>
      <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900">
        <Lightbulb size={18} weight="duotone" className="text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm font-medium">{data.tip}</div>
      </div>
      {data.factors && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {data.factors.map((f, i) => <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200">{f}</span>)}
        </div>
      )}
    </div>
  );
};

export default CrowdCard;
