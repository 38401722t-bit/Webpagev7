import { useEffect, useState } from "react";
import { http } from "../lib/api";
import { Buildings, MapPin, ArrowUpRight, Star } from "@phosphor-icons/react";

const HotelsCard = ({ lat, lon }) => {
  const [data, setData] = useState(null);
  useEffect(() => {
    let alive = true; setData(null);
    http.get(`/hotels?lat=${lat}&lon=${lon}`).then((r) => { if (alive) setData(r.data); }).catch(() => { if (alive) setData({ hotels: [] }); });
    return () => { alive = false; };
  }, [lat, lon]);

  if (data === null) return <div className="bg-white rounded-3xl p-6 border border-slate-100 text-slate-400 shadow-xs animate-pulse h-48 flex items-center justify-center font-medium" data-testid="hotels-loading">AI is finding nearby stays…</div>;
  const hotels = data.hotels || [];

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06)]" data-testid="hotels-card">
      <div className="flex items-center gap-3 mb-4">
        <Buildings size={28} weight="duotone" className="text-sky-600 shrink-0" />
        <div>
          <div className="label-eyebrow text-sky-600 font-bold uppercase tracking-wider text-[11px]">Nearby stays · AI Picked</div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">Hotels around {data.context || "you"}</div>
        </div>
      </div>
      {hotels.length === 0 && <p className="text-slate-500 text-sm">No hotels found.</p>}
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1 no-scrollbar">
        {hotels.map((h) => (
          <a key={h.id} href={`https://www.google.com/search?q=${encodeURIComponent(h.name + " " + (h.area || ""))}`} target="_blank" rel="noreferrer"
            data-testid={`hotel-${h.id}`}
            className="block p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-sky-300 hover:bg-sky-50/50 transition-all group">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="font-bold text-sm text-slate-900 flex items-center gap-1 truncate group-hover:text-sky-700 transition-colors">
                  {h.name}<ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
                <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-slate-500 font-medium">
                  <span className="capitalize">{h.type}</span>
                  {h.stars && <span className="flex items-center gap-0.5"><Star size={11} weight="fill" className="text-amber-500" />{h.stars}</span>}
                  {h.area && <span className="flex items-center gap-1"><MapPin size={11} />{h.area}</span>}
                  {h.distance_km !== undefined && <span>· {h.distance_km} km</span>}
                </div>
                {h.highlight && <div className="mt-1 text-xs text-sky-700 italic font-medium">{h.highlight}</div>}
              </div>
              {h.price_inr && (
                <div className="text-right shrink-0">
                  <div className="text-lg font-extrabold text-slate-900">₹{h.price_inr}</div>
                  <div className="text-[10px] text-slate-400 font-medium">/night</div>
                </div>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default HotelsCard;
