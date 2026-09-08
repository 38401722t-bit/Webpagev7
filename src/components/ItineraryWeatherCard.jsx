import React, { useState, useEffect } from "react";
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Drop,
  Sparkle,
  ArrowClockwise,
  Umbrella,
  ThermometerSimple,
  CheckCircle,
} from "@phosphor-icons/react";
import {
  fetchWeatherForCity,
  getForecastForItineraryDay,
} from "../services/weatherService";

const ICON_MAP = {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle: CloudRain,
  CloudRain,
  CloudSnow,
  CloudLightning,
};

/**
 * ItineraryWeatherCard
 * Small, compact card designed for itinerary day schedules and destination route stops.
 * 
 * Props:
 * - city: string (e.g. "Jaipur", "Agra", "Varanasi")
 * - date: string (e.g. "2026-09-08")
 * - dayNumber: number (e.g. 1, 2, 3)
 * - compact: boolean (inline pill vs compact card)
 * - showAdvice: boolean (whether to render the sightseeing comfort tip)
 */
export const ItineraryWeatherCard = ({
  city,
  date,
  dayNumber = 1,
  compact = false,
  showAdvice = true,
  className = "",
}) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadWeather = async (forceFresh = false) => {
    if (!city) return;
    if (forceFresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await fetchWeatherForCity(city, { forceFresh });
      setWeatherData(data);
    } catch (err) {
      console.warn("Weather fetch error in ItineraryWeatherCard:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWeather(false);
  }, [city]);

  if (!city) return null;

  if (loading && !weatherData) {
    return (
      <div
        className={`glass rounded-2xl p-3 border border-white/10 animate-pulse flex items-center justify-between ${className}`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10" />
          <div className="space-y-1">
            <div className="h-3 w-20 bg-white/10 rounded" />
            <div className="h-2.5 w-14 bg-white/5 rounded" />
          </div>
        </div>
        <div className="h-4 w-12 bg-white/10 rounded-full" />
      </div>
    );
  }

  const forecast = getForecastForItineraryDay(weatherData, date || dayNumber);
  const WeatherIcon = ICON_MAP[forecast.icon] || CloudSun;

  // Compact inline badge mode (great for headers and timeline stops)
  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-sky-400/30 transition-all text-xs ${className}`}
        title={`${forecast.description} · High ${forecast.max}°C / Low ${forecast.min}°C`}
      >
        <WeatherIcon size={16} weight="duotone" className="text-sky-400 shrink-0" />
        <span className="font-semibold text-white">{forecast.max}°C</span>
        <span className="text-muted-foreground hidden sm:inline capitalize">
          {forecast.description}
        </span>
        {forecast.precipitation_prob > 20 && (
          <span className="flex items-center gap-0.5 text-[11px] text-sky-300">
            <Drop size={11} /> {forecast.precipitation_prob}%
          </span>
        )}
      </div>
    );
  }

  // Small Itinerary Card mode
  return (
    <div
      className={`glass-strong rounded-2xl p-3.5 border border-white/15 hover:border-sky-400/40 transition-all shadow-md relative overflow-hidden group ${className}`}
    >
      {/* Background radial accent */}
      <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-sky-500/10 rounded-full blur-xl pointer-events-none" />

      {/* Header Row: City + Live Tag + Refresh */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-bold text-white tracking-wide truncate">
            {city}
          </span>
          <span className="text-[10px] text-muted-foreground">
            Day {dayNumber}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </span>
          <button
            onClick={() => loadWeather(true)}
            disabled={refreshing}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Refresh real-time weather"
          >
            <ArrowClockwise
              size={12}
              className={refreshing ? "animate-spin text-sky-400" : ""}
            />
          </button>
        </div>
      </div>

      {/* Temperature and Condition Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500/20 to-primary/20 text-sky-300 flex items-center justify-center border border-sky-500/30 shrink-0">
            <WeatherIcon size={20} weight="duotone" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-2xl font-normal text-white leading-none">
                {forecast.max}°
              </span>
              <span className="text-xs text-muted-foreground">
                / {forecast.min}°C
              </span>
            </div>
            <div className="text-[11px] text-slate-300 capitalize font-medium mt-0.5">
              {forecast.description}
            </div>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="text-right space-y-0.5 shrink-0">
          {forecast.precipitation_prob > 0 ? (
            <div className="flex items-center justify-end gap-1 text-[11px] text-sky-300 font-medium">
              <Drop size={12} className="text-sky-400" />
              <span>{forecast.precipitation_prob}% rain</span>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-1 text-[11px] text-emerald-300 font-medium">
              <Sun size={12} className="text-amber-400" />
              <span>Dry & Clear</span>
            </div>
          )}
          <div className="text-[10px] text-muted-foreground">
            Feels {forecast.apparent_max}°C
          </div>
        </div>
      </div>

      {/* Sightseeing Travel Advice Pill */}
      {showAdvice && forecast.advice && (
        <div className="mt-2.5 pt-2 border-t border-white/10 flex items-start gap-1.5 text-[11px] text-slate-300 leading-snug">
          <Sparkle
            size={13}
            weight="fill"
            className="text-amber-400 shrink-0 mt-0.5"
          />
          <span className="line-clamp-2">{forecast.advice}</span>
        </div>
      )}
    </div>
  );
};

/**
 * ItineraryWeatherStrip
 * Displays a clean horizontal carousel or grid of small forecast cards for all unique cities
 * in an itinerary.
 */
export const ItineraryWeatherStrip = ({
  cities = [],
  startDate,
  className = "",
}) => {
  if (!cities || cities.length === 0) return null;

  // Filter valid unique cities
  const uniqueCities = Array.from(
    new Set(cities.filter(Boolean).map((c) => c.trim()))
  );

  if (uniqueCities.length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sun size={14} weight="duotone" /> Itinerary Live Weather Forecast
        </div>
        <span className="text-[11px] text-muted-foreground">
          {uniqueCities.length} {uniqueCities.length > 1 ? "destinations" : "destination"} tracked
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {uniqueCities.map((city, idx) => (
          <ItineraryWeatherCard
            key={city}
            city={city}
            dayNumber={idx + 1}
            showAdvice={true}
          />
        ))}
      </div>
    </div>
  );
};

export default ItineraryWeatherCard;
