import { useState } from "react";
import { CalendarBlank, Clock, ForkKnife, Bed, TrainSimple, Camera, ShoppingBag, Coffee } from "@phosphor-icons/react";
import { AICard, Chip, inr } from "./Card";
import { ItineraryWeatherCard } from "../ItineraryWeatherCard";

const typeIcon = { food: ForkKnife, hotel: Bed, transit: TrainSimple, sightseeing: Camera, shopping: ShoppingBag, leisure: Coffee };

const ItineraryCard = ({ itinerary = [], title, highlights = [], changedDays = new Set() }) => {
  const [day, setDay] = useState(1);
  if (!itinerary.length) return null;
  const cur = itinerary.find((d) => d.day === day) || itinerary[0];
  const dayCost = cur.items.reduce((s, i) => s + (i.cost_inr || 0), 0);
  return (
    <AICard title={title ? `Itinerary · ${title}` : "Itinerary"} icon={CalendarBlank} testid="ai-itinerary-card"
      right={<Chip tone="primary">{itinerary.length} day{itinerary.length > 1 ? "s" : ""}</Chip>}>
      {highlights.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">{highlights.map((h, i) => <Chip key={i} tone="secondary">{h}</Chip>)}</div>
      )}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1" role="tablist" aria-label="Days">
        {itinerary.map((d) => (
          <button key={d.day} role="tab" aria-selected={cur.day === d.day} data-testid={`itin-day-${d.day}`} onClick={() => setDay(d.day)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors relative ${cur.day === d.day ? "bg-primary text-primary-foreground border-primary" : "bg-white/5 border-white/10 hover:bg-white/10"}`}>
            Day {d.day}{d.date ? ` · ${d.date.slice(5)}` : ""}
            {changedDays.has(d.day) && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-background" aria-label="changed" />}
          </button>
        ))}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3 flex-wrap">
        <div>
          <div className="font-serif text-2xl leading-tight">{cur.location}</div>
          {cur.theme && <div className="text-xs text-muted-foreground mt-0.5">{cur.theme}</div>}
        </div>
        <div className="text-xs text-muted-foreground">~{inr(dayCost)} / person</div>
      </div>

      {cur.location && (
        <div className="mt-3 mb-3">
          <ItineraryWeatherCard
            city={cur.location}
            date={cur.date}
            dayNumber={cur.day}
            showAdvice={true}
          />
        </div>
      )}

      <ol className="mt-3 relative border-l border-white/10 ml-2 space-y-2.5" data-testid="itin-items">
        {cur.items.map((it, i) => {
          const Icon = typeIcon[it.type] || Camera;
          return (
            <li key={i} className="pl-5 relative fade-up" style={{ animationDelay: `${i * 40}ms` }}>
              <span className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-background" />
              <div className="flex items-start gap-3">
                <div className="text-xs font-mono text-primary w-12 shrink-0 pt-0.5">{it.time}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium flex items-center gap-1.5"><Icon size={13} className="text-muted-foreground shrink-0" />{it.title}</div>
                  {it.note && <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{it.note}</div>}
                  <div className="mt-1 flex gap-1.5 flex-wrap">
                    <Chip><Clock size={10} />{it.duration_min} min</Chip>
                    {it.cost_inr > 0 && <Chip>{inr(it.cost_inr)}</Chip>}
                    <Chip className="capitalize">{it.type}</Chip>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </AICard>
  );
};

export default ItineraryCard;
