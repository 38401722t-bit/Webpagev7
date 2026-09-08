import { Link } from "react-router-dom";
import { Suitcase, Brain, Trash, Cpu, ArrowsClockwise, Plus } from "@phosphor-icons/react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Button } from "../ui/button";
import { Chip } from "./Card";
import ModeToggle from "../ModeToggle";
import { useMode } from "../../context/ModeContext";

const TripContextPanel = ({ user, trips, tripId, onTrip, prefs, onClearMemory, agentsInfo, onReplan, onNewChat, lastContext }) => {
  const { advanced } = useMode();
  const trip = trips.find((t) => t.id === tripId);
  return (
    <aside className="space-y-4" data-testid="ai-sidebar">
      <div className="glass-strong rounded-3xl p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="label-eyebrow flex items-center gap-1"><Suitcase size={12} /> Trip context</div>
          <ModeToggle compact />
        </div>
        {user ? (
          <>
            <Select value={tripId || "none"} onValueChange={(v) => onTrip(v === "none" ? null : v)}>
              <SelectTrigger data-testid="ai-trip-select" className="h-10 mt-3 bg-white/5 border-white/10 text-sm"><SelectValue placeholder="No trip selected" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No trip — start fresh</SelectItem>
                {trips.map((t) => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
              </SelectContent>
            </Select>
            {trip && (
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex flex-wrap gap-1">{trip.destinations?.map((d) => <Chip key={d.id} tone="primary">{d.name}</Chip>)}</div>
                <div className="text-muted-foreground">{trip.start_date || "No dates"}{trip.end_date ? ` → ${trip.end_date}` : ""} · {trip.people} people{trip.budget ? ` · ₹${trip.budget.toLocaleString("en-IN")}` : ""}</div>
                <div className="text-muted-foreground">{trip.itinerary?.length ? `${trip.itinerary.length}-day AI itinerary saved` : "No itinerary yet — ask TripPilot to plan it"}</div>
                <Button size="sm" onClick={onReplan} data-testid="ai-replan-btn" className="rounded-full btn-3d bg-secondary text-secondary-foreground w-full mt-1"><ArrowsClockwise size={14} className="mr-1" />Replan this trip</Button>
              </div>
            )}
          </>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground"><Link to="/login" className="text-primary underline underline-offset-4">Log in</Link> to plan against your saved trips, keep memory, and save itineraries.</p>
        )}
        <Button size="sm" variant="outline" onClick={onNewChat} data-testid="ai-new-chat" className="rounded-full bg-white/5 border-white/10 w-full mt-3"><Plus size={14} className="mr-1" />New conversation</Button>
      </div>

      {lastContext?.destinations?.length > 0 && (
        <div className="glass rounded-3xl p-4" data-testid="ai-shared-context">
          <div className="label-eyebrow">Shared context</div>
          <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
            {[["Destinations", lastContext.destinations.map((d) => d.name).join(", ")], ["Dates", lastContext.start_date ? `${lastContext.start_date} → ${lastContext.end_date}` : "—"], ["Days", lastContext.days], ["Travellers", lastContext.traveler_count], ["Budget", lastContext.budget ? `₹${Number(lastContext.budget).toLocaleString("en-IN")}` : "—"], ["Style", lastContext.travel_style || "—"], ["Transport", lastContext.transport_preference || "—"], ["Stay", lastContext.hotel_preference || "—"]].map(([k, v]) => (
              <div key={k} className="contents"><dt className="text-muted-foreground">{k}</dt><dd className="truncate">{v}</dd></div>
            ))}
          </dl>
        </div>
      )}

      {user && (
        <div className="glass rounded-3xl p-4" data-testid="ai-memory-panel">
          <div className="flex items-center justify-between"><div className="label-eyebrow flex items-center gap-1"><Brain size={12} /> What I remember</div>
            {Object.keys(prefs || {}).length > 0 && <button onClick={onClearMemory} data-testid="ai-clear-memory" className="text-[11px] text-destructive inline-flex items-center gap-1"><Trash size={11} />Clear</button>}</div>
          {Object.keys(prefs || {}).length ? (
            <div className="mt-2 flex flex-wrap gap-1">{Object.entries(prefs).map(([k, v]) => <Chip key={k}>{k.replace(/_/g, " ")}: {String(v)}</Chip>)}</div>
          ) : <p className="mt-2 text-xs text-muted-foreground">Preferences you mention (style, budget, stays, food) are remembered for next time. No personal data is stored.</p>}
        </div>
      )}

      {advanced && agentsInfo && (
        <div className="glass rounded-3xl p-4" data-testid="ai-agents-panel">
          <div className="label-eyebrow flex items-center gap-1"><Cpu size={12} /> Agent team</div>
          <div className="mt-1 text-[11px] text-muted-foreground">Master: {agentsInfo.master.model} · Router: {agentsInfo.master.router_model} · {agentsInfo.tools.length} tools</div>
          <ul className="mt-2 space-y-1">
            {agentsInfo.agents.map((a) => <li key={a.name} className="text-xs flex items-center justify-between gap-2"><span>{a.title}</span><span className="text-muted-foreground text-[10px] shrink-0">{a.model === "tools-only" ? "tools" : a.model.includes("sonnet") ? "sonnet 4.6" : "haiku 4.5"}</span></li>)}
          </ul>
        </div>
      )}
    </aside>
  );
};

export default TripContextPanel;
