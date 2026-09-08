import { Path, TrainSimple, Bus, Airplane, Car, ArrowSquareOut } from "@phosphor-icons/react";
import MapView from "../MapView";
import { AICard, Chip, inr } from "./Card";

const modeIcon = { train: TrainSimple, bus: Bus, flight: Airplane, drive: Car };

const RouteCard = ({ route, transport = [], showMap = true }) => {
  if (!route?.stops?.length && !transport.length) return null;
  const stops = route?.stops || [];
  const center = stops.length ? [stops.reduce((s, x) => s + x.lat, 0) / stops.length, stops.reduce((s, x) => s + x.lon, 0) / stops.length] : null;
  return (
    <AICard title="Route & transport" icon={Path} testid="ai-route-card" right={route?.total_distance_km > 0 && <Chip tone="primary">{route.total_distance_km} km total</Chip>}>
      {stops.length > 1 && (
        <div className="flex items-center gap-1.5 flex-wrap text-sm" data-testid="ai-route-stops">
          {stops.map((s, i) => (
            <span key={s.id} className="inline-flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground text-[11px] font-bold flex items-center justify-center">{i + 1}</span>
              <span className="font-medium">{s.name}</span>
              {i < stops.length - 1 && <span className="text-muted-foreground text-xs mx-1">{route.legs?.[i]?.distance_km} km →</span>}
            </span>
          ))}
        </div>
      )}
      {showMap && stops.length > 1 && (
        <div className="mt-3"><MapView center={center} zoom={6} markers={stops.map((s, i) => ({ ...s, index: i + 1 }))} route={{ stops }} height="240px" /></div>
      )}
      {transport.map((leg, li) => (
        <div key={li} className="mt-3" data-testid={`ai-transport-leg-${li}`}>
          <div className="text-xs text-muted-foreground mb-1.5">{leg.from} → {leg.to}{leg.distance_km ? ` · ${leg.distance_km} km` : ""}</div>
          <div className="grid sm:grid-cols-2 gap-2">
            {leg.options.map((o, i) => {
              const Icon = modeIcon[o.mode] || Path;
              return (
                <a key={i} href={o.link || "#"} target="_blank" rel="noreferrer" data-testid={`ai-transport-${o.mode}-${li}`}
                  className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-white/10 transition-colors group">
                  <Icon size={18} weight="duotone" className="text-primary shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{o.name}</div>
                    <div className="text-[11px] text-muted-foreground">{o.departs ? `${o.departs} · ` : ""}{o.duration}</div>
                  </div>
                  <div className="text-right"><div className="text-sm font-semibold">{inr(o.fare_inr)}</div><ArrowSquareOut size={11} className="ml-auto text-muted-foreground group-hover:text-primary" /></div>
                </a>
              );
            })}
          </div>
        </div>
      ))}
      {transport.length > 0 && <p className="mt-2 text-[11px] text-muted-foreground">Fares are AI estimates — confirm on the booking site.</p>}
    </AICard>
  );
};

export default RouteCard;
