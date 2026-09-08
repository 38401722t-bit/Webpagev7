import { Sparkle, User } from "@phosphor-icons/react";
import { useMode } from "../../context/ModeContext";
import { Chip } from "./Card";
import ItineraryCard from "./ItineraryCard";
import BudgetCard from "./BudgetCard";
import RouteCard from "./RouteCard";
import { WeatherList, HotelsList, FoodList, SafetyCard, PackingCard, TranslationCard, LocalGuideCard, RecommendationsCard } from "./InfoCards";
import { WarningsCard, ChangesCard } from "./AlertCards";
import ActionsBar from "./ActionsBar";
import AgentTrace from "./AgentTrace";

export const UserBubble = ({ text }) => (
  <div className="flex justify-end fade-up" data-testid="ai-user-message">
    <div className="max-w-[85%] md:max-w-[70%] rounded-3xl rounded-br-lg px-4 py-3 bg-sky-600 text-white text-sm shadow-md shadow-sky-600/15 flex gap-2 font-medium">
      <User size={16} className="mt-0.5 shrink-0 opacity-80" />
      <span>{text}</span>
    </div>
  </div>
);

const primaryFor = { weather: "weather", hotels: "hotels", food: "food", safety: "safety", packing: "packing", translate: "translation", local_guide: "local_guide", recommend: "recommendations", route: "route", transport: "route", budget: "budget" };

const TripStrip = ({ s }) => s?.destinations?.length ? (
  <div className="flex flex-wrap gap-1.5 items-center" data-testid="ai-trip-summary">
    {s.title && <span className="font-extrabold text-slate-900 text-xl mr-1">{s.title}</span>}
    {s.destinations.map((d) => <Chip key={d.id} tone="primary">{d.name}</Chip>)}
    {s.start_date && <Chip>{s.start_date}{s.end_date ? ` → ${s.end_date}` : ""}</Chip>}
    {s.days && <Chip>{s.days} days</Chip>}
    <Chip>{s.traveler_count} traveller{s.traveler_count > 1 ? "s" : ""}</Chip>
    {s.budget && <Chip>₹{Number(s.budget).toLocaleString("en-IN")} budget</Chip>}
    {s.travel_style && <Chip className="capitalize">{s.travel_style}</Chip>}
  </div>
) : null;

const AIMessage = ({ result, onPrompt, onApplied }) => {
  const { advanced } = useMode();
  const r = result;
  const primary = primaryFor[r.intent];
  const show = (key) => advanced || primary === key || r.intent === "plan_trip" || r.intent === "replan";
  const changedDays = new Set((r.changes || []).map((c) => c.day).filter(Boolean));
  const warnings = advanced ? r.warnings : (r.warnings || []).filter((w) => w.level !== "info" && w.source !== "validator");
  const actions = advanced ? r.actions : (r.actions || []).filter((a) => a.type === "apply" || a.type === "prompt" || a.type === "external");

  return (
    <div className="space-y-3 fade-up" data-testid="ai-assistant-message">
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shrink-0 shadow-md shadow-sky-500/20">
          <Sparkle size={16} weight="fill" className="text-white" />
        </div>
        <div className="bg-white rounded-3xl rounded-tl-lg px-4 py-3 text-sm leading-relaxed text-slate-800 border border-slate-200/80 shadow-xs max-w-[92%]" data-testid="ai-reply">
          {r.reply}
        </div>
      </div>
      <div className="md:pl-12 space-y-3">
        {(r.intent === "plan_trip" || r.intent === "replan") && <TripStrip s={r.trip_summary} />}
        {r.trip_summary?.summary && (r.intent === "plan_trip") && <p className="text-sm text-slate-600 font-medium">{r.trip_summary.summary}</p>}
        <ChangesCard changes={r.changes} />
        <ItineraryCard itinerary={r.itinerary} highlights={advanced ? r.trip_summary?.highlights : []} changedDays={changedDays} />
        <BudgetCard budget={show("budget") ? r.budget : null} />
        <WarningsCard warnings={warnings} />
        {show("route") && <RouteCard route={r.route} transport={r.transport} showMap={advanced || primary === "route"} />}
        {show("weather") && <WeatherList weather={r.weather} />}
        {show("hotels") && <HotelsList hotels={r.hotels} />}
        {show("food") && <FoodList food={r.food} />}
        {show("safety") && <SafetyCard safety={r.safety} />}
        <PackingCard packing={r.packing} />
        <TranslationCard translation={r.translation} />
        <LocalGuideCard guides={r.local_guide} />
        <RecommendationsCard recommendations={r.recommendations} onPrompt={onPrompt} />
        <ActionsBar actions={actions} runId={r.run_id} onPrompt={onPrompt} onApplied={onApplied} />
        {advanced && <AgentTrace result={r} />}
      </div>
    </div>
  );
};

export default AIMessage;
