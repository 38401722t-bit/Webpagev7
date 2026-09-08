import { Link } from "react-router-dom";
import { CloudSun, Bed, ForkKnife, ShieldCheck, Suitcase, Translate, Compass, Lightbulb, Phone, Star, ArrowRight } from "@phosphor-icons/react";
import { AICard, Chip, inr } from "./Card";

export const WeatherList = ({ weather = [] }) => weather.length ? (
  <AICard title="Live weather" icon={CloudSun} testid="ai-weather-card">
    <div className="grid sm:grid-cols-2 gap-2">
      {weather.map((w) => (
        <div key={w.destination_id} className="p-3 rounded-2xl bg-white/5 border border-white/10" data-testid={`ai-weather-${w.destination_id}`}>
          <div className="flex items-baseline justify-between"><div className="font-medium">{w.destination}</div><div className="font-serif text-2xl">{w.current?.temperature != null ? `${Math.round(w.current.temperature)}°` : "—"}</div></div>
          <div className="text-xs text-muted-foreground">{w.current?.description} · {w.current?.humidity}% humidity · wind {w.current?.wind_speed} km/h</div>
          <div className="mt-2 flex gap-1 overflow-x-auto no-scrollbar">
            {(w.forecast || []).slice(0, 5).map((f) => <div key={f.date} className="shrink-0 text-center px-2 py-1 rounded-xl bg-white/5 text-[10px]"><div className="text-muted-foreground">{f.date.slice(5)}</div><div className="font-semibold">{Math.round(f.max)}° / {Math.round(f.min)}°</div></div>)}
          </div>
          {w.alerts?.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{w.alerts.map((a, i) => <Chip key={i} tone={a.level === "danger" ? "danger" : "warning"}>{a.title}</Chip>)}</div>}
        </div>
      ))}
    </div>
  </AICard>
) : null;

export const HotelsList = ({ hotels = [] }) => hotels.length ? (
  <AICard title="Where to stay" icon={Bed} testid="ai-hotels-card" right={<Chip className="capitalize">{hotels[0]?.tier} picks</Chip>}>
    <div className="space-y-3">
      {hotels.map((h) => (
        <div key={h.destination_id}>
          <div className="text-xs text-muted-foreground mb-1.5 flex items-center justify-between"><span>{h.destination}</span><Link to={`/destinations/${h.destination_id}`} className="text-primary hover:underline">all stays →</Link></div>
          <div className="grid sm:grid-cols-3 gap-2">
            {h.options.map((o) => (
              <div key={o.id} className="p-3 rounded-2xl bg-white/5 border border-white/10" data-testid={`ai-hotel-${o.id}`}>
                <div className="text-sm font-medium leading-tight">{o.name}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{o.area}{o.stars ? ` · ${"★".repeat(o.stars)}` : ""}</div>
                <div className="mt-1.5 flex items-center justify-between"><span className="text-sm font-semibold">{inr(o.price_inr)}<span className="text-[10px] text-muted-foreground font-normal">/night</span></span><Chip className="capitalize">{o.type}</Chip></div>
                {o.highlight && <div className="text-[11px] text-muted-foreground mt-1">{o.highlight}</div>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
    <p className="mt-2 text-[11px] text-muted-foreground">Availability isn't live — check with the property before booking.</p>
  </AICard>
) : null;

export const FoodList = ({ food = [] }) => food.length ? (
  <AICard title="Eat like a local" icon={ForkKnife} testid="ai-food-card">
    <div className="space-y-3">
      {food.map((f) => (
        <div key={f.destination_id}>
          <div className="text-xs text-muted-foreground mb-1.5 flex items-center justify-between"><span>{f.destination}</span><Link to={`/food-trail/${f.destination_id}`} className="text-secondary hover:underline">food trail →</Link></div>
          <div className="flex flex-wrap gap-1.5">{f.dishes.map((d) => <Chip key={d} tone="secondary">{d}</Chip>)}</div>
          {f.restaurants?.length > 0 && (
            <div className="mt-2 grid sm:grid-cols-3 gap-2">
              {f.restaurants.map((r) => (
                <a key={r.id} href={r.maps_url} target="_blank" rel="noreferrer" className="p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:border-secondary/40 transition-colors" data-testid={`ai-restaurant-${r.id}`}>
                  <div className="text-sm font-medium leading-tight">{r.name}</div>
                  <div className="text-[11px] text-muted-foreground">{r.area} · <Star size={10} weight="fill" className="inline text-amber-400" /> {r.rating} · {r.price_range}</div>
                  <div className="text-[11px] mt-1">{r.signature}</div>
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  </AICard>
) : null;

export const SafetyCard = ({ safety }) => safety ? (
  <AICard title="Safety briefing" icon={ShieldCheck} testid="ai-safety-card">
    <ul className="text-sm space-y-1 text-foreground/85">{safety.general?.map((g) => <li key={g}>· {g}</li>)}</ul>
    {safety.tips?.length > 0 && <ul className="mt-2 text-sm space-y-1">{safety.tips.map((t, i) => <li key={i} className="flex gap-2"><Chip tone="warning">{t.destination}</Chip><span className="text-foreground/85">{t.tip}</span></li>)}</ul>}
    {safety.crowd?.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{safety.crowd.map((c) => <Chip key={c.destination} tone={c.level === "high" || c.level === "very_high" ? "danger" : "info"}>{c.destination}: {c.level?.replace("_", " ")} crowd · ~{c.wait_minutes} min</Chip>)}</div>}
    <div className="mt-3 flex flex-wrap gap-1.5">{safety.emergency?.map((e) => <a key={e.num} href={`tel:${e.num}`} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/25 text-xs text-red-200"><Phone size={11} />{e.num} {e.label}</a>)}</div>
  </AICard>
) : null;

export const PackingCard = ({ packing }) => packing ? (
  <AICard title="Packing list" icon={Suitcase} testid="ai-packing-card">
    <div className="grid sm:grid-cols-2 gap-3">
      {["essentials", "clothing", "gear", "documents", "health"].filter((k) => packing[k]?.length).map((k) => (
        <div key={k}><div className="text-xs font-semibold capitalize mb-1 text-primary">{k}</div><ul className="text-sm space-y-0.5 text-foreground/85">{packing[k].map((it) => <li key={it}>· {it}</li>)}</ul></div>
      ))}
    </div>
    {packing.tip && <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1"><Lightbulb size={12} />{packing.tip}</p>}
  </AICard>
) : null;

export const TranslationCard = ({ translation }) => translation ? (
  <AICard title={`Translation · ${translation.target_lang}`} icon={Translate} testid="ai-translation-card">
    <div className="text-xs text-muted-foreground">{translation.source_text}</div>
    <div className="font-serif text-2xl mt-1 leading-snug" data-testid="ai-translated-text">{translation.translated}</div>
    {translation.romanized && <div className="text-sm text-primary mt-1 italic">{translation.romanized}</div>}
  </AICard>
) : null;

export const LocalGuideCard = ({ guides = [] }) => guides.length ? (
  <AICard title="Local guide" icon={Compass} testid="ai-local-guide-card">
    <div className="space-y-4">
      {guides.map((g) => (
        <div key={g.destination}>
          <div className="font-serif text-xl">{g.destination}</div>
          {g.best_time_of_day && <div className="text-xs text-muted-foreground">{g.best_time_of_day}</div>}
          <div className="grid sm:grid-cols-2 gap-3 mt-2 text-sm">
            <div><div className="text-xs font-semibold text-primary mb-1">Etiquette</div><ul className="space-y-0.5 text-foreground/85">{g.etiquette?.map((e) => <li key={e}>· {e}</li>)}</ul></div>
            <div><div className="text-xs font-semibold text-amber-300 mb-1">Avoid</div><ul className="space-y-0.5 text-foreground/85">{g.avoid?.map((e) => <li key={e}>· {e}</li>)}</ul></div>
          </div>
          {g.phrases?.length > 0 && <div className="mt-2 grid sm:grid-cols-2 gap-1.5">{g.phrases.map((p, i) => <div key={i} className="p-2 rounded-xl bg-white/5 border border-white/10 text-xs"><div className="text-muted-foreground">{p.english}</div><div className="text-base">{p.local}</div><div className="text-primary italic">{p.romanized}</div></div>)}</div>}
        </div>
      ))}
    </div>
  </AICard>
) : null;

export const RecommendationsCard = ({ recommendations = [], onPrompt }) => recommendations.length ? (
  <AICard title="Recommended for you" icon={Star} testid="ai-recommendations-card">
    <div className="grid sm:grid-cols-2 gap-2">
      {recommendations.map((r) => (
        <div key={r.id} className="flex gap-3 p-2 rounded-2xl bg-white/5 border border-white/10" data-testid={`ai-rec-${r.id}`}>
          <img src={r.image} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2"><Link to={`/destinations/${r.id}`} className="font-medium hover:text-primary">{r.name}</Link><span className="text-[11px] text-muted-foreground">★ {r.rating}</span></div>
            <div className="text-[11px] text-muted-foreground">{r.state} · {r.suggested_days ? `${r.suggested_days} days · ` : ""}{inr(r.budget)}/day</div>
            <p className="text-xs mt-1 leading-relaxed">{r.reason}</p>
            <button onClick={() => onPrompt?.(`Plan a ${r.suggested_days || 3}-day trip to ${r.name}`)} data-testid={`ai-rec-plan-${r.id}`} className="mt-1 text-xs text-primary inline-flex items-center gap-1 hover:underline">Plan this <ArrowRight size={11} /></button>
          </div>
        </div>
      ))}
    </div>
  </AICard>
) : null;
