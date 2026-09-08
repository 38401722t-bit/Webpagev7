import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { http } from "../lib/api";
import { Sun, CloudSun, Cloud, CloudFog, CloudRain, CloudSnow, CloudLightning, Wind, Drop, WarningCircle, ArrowRight } from "@phosphor-icons/react";

const ICONS = { Sun, CloudSun, Cloud, CloudFog, CloudDrizzle: CloudRain, CloudRain, CloudSnow, CloudLightning };

const alertColors = {
  danger: "bg-red-50 border-red-200 text-red-700",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  info: "bg-sky-50 border-sky-200 text-sky-800",
};

const WeatherCard = ({ lat, lon, name, city }) => {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  const cityName = name || city;

  useEffect(() => {
    let alive = true;
    setData(null); setErr(null);
    let url = `/weather`;
    if (lat !== undefined && lon !== undefined) {
      url = `/weather?lat=${lat}&lon=${lon}${cityName ? `&city=${encodeURIComponent(cityName)}` : ""}`;
    } else if (cityName) {
      url = `/weather?city=${encodeURIComponent(cityName)}`;
    }
    http.get(url).then((r) => { if (alive) setData(r.data); }).catch(() => { if (alive) setErr("Weather unavailable"); });
    return () => { alive = false; };
  }, [lat, lon, cityName]);

  if (err) return <div className="p-6 bg-white rounded-3xl border border-slate-200 text-slate-500 shadow-sm" data-testid="weather-error">{err}</div>;
  if (!data) return <div className="p-6 bg-white rounded-3xl border border-slate-200 text-slate-400 animate-pulse h-48 flex items-center justify-center font-medium" data-testid="weather-loading">Loading live weather…</div>;

  const Cur = ICONS[data.current.icon] || Cloud;
  const targetCity = data.city || cityName;
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.06)]" data-testid="weather-card">
      <div className="p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/25 shrink-0">
          <Cur size={38} weight="duotone" />
        </div>
        <div className="flex-1">
          <div className="label-eyebrow text-sky-600 font-bold uppercase tracking-wider text-[11px] mb-1">Live weather · {targetCity}</div>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-5xl text-slate-900 font-bold tracking-tight">{Math.round(data.current.temperature)}°C</span>
            <span className="text-slate-600 font-semibold text-lg capitalize">{data.current.description}</span>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-slate-600 font-medium">
            <span className="flex items-center gap-1.5"><Drop size={15} className="text-sky-600" />{data.current.humidity}% Humidity</span>
            <span className="flex items-center gap-1.5"><Wind size={15} className="text-teal-600" />{Math.round(data.current.wind_speed)} km/h Wind</span>
            <span className="text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">Feels {Math.round(data.current.apparent_temperature)}°</span>
          </div>
        </div>
      </div>
      {data.alerts?.length > 0 && (
        <div className="border-t border-slate-100 p-4 space-y-2 bg-slate-50/50" data-testid="weather-alerts">
          {data.alerts.map((a, i) => (
            <div key={i} className={`flex gap-3 p-3 rounded-xl border text-xs sm:text-sm ${alertColors[a.level] || alertColors.info}`}>
              <WarningCircle size={20} weight="fill" className="shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">{a.title}</div>
                <div className="opacity-90">{a.message}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="border-t border-slate-100 p-4 grid grid-cols-5 gap-2 bg-slate-50">
        {data.forecast.slice(0, 5).map((f, i) => {
          const FI = ICONS[f.icon] || Cloud;
          return (
            <div key={i} className="text-center p-2 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-slate-200/80">
              <div className="text-xs text-slate-600 font-semibold">{new Date(f.date).toLocaleDateString("en-IN", { weekday: "short" })}</div>
              <FI size={22} className="mx-auto mt-1 text-sky-600" weight="duotone" />
              <div className="text-sm font-bold mt-1 text-slate-800">{Math.round(f.max)}°<span className="text-slate-400 font-normal">/{Math.round(f.min)}°</span></div>
            </div>
          );
        })}
      </div>
      <div className="border-t border-slate-100 px-5 py-3 bg-white flex items-center justify-between">
        <Link
          to={`/weather?city=${encodeURIComponent(targetCity)}`}
          className="text-xs text-sky-600 hover:text-sky-700 font-bold inline-flex items-center gap-1.5 transition-colors"
          data-testid="weather-card-full-link"
        >
          View 5-day forecast & search Indian cities <ArrowRight size={13} weight="bold" />
        </Link>
      </div>
    </div>
  );
};

export default WeatherCard;
