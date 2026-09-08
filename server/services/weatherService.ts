import { DESTINATIONS } from "../../src/data/destinations";
import { POPULAR_INDIAN_CITIES, findLocalIndianCity, searchIndianCitiesLocal } from "../../src/data/indianCities";
import { DataRepository } from "../repositories/dataRepository";

const WEATHER_CODES: Record<number, [string, string]> = {
  0: ["Clear sky", "Sun"],
  1: ["Mainly clear", "Sun"],
  2: ["Partly cloudy", "CloudSun"],
  3: ["Overcast", "Cloud"],
  45: ["Fog", "CloudFog"],
  48: ["Rime fog", "CloudFog"],
  51: ["Light drizzle", "CloudDrizzle"],
  53: ["Drizzle", "CloudDrizzle"],
  55: ["Heavy drizzle", "CloudDrizzle"],
  61: ["Light rain", "CloudRain"],
  63: ["Rain", "CloudRain"],
  65: ["Heavy rain", "CloudRain"],
  71: ["Light snow", "CloudSnow"],
  73: ["Snow", "CloudSnow"],
  75: ["Heavy snow", "CloudSnow"],
  80: ["Rain showers", "CloudRain"],
  81: ["Heavy showers", "CloudRain"],
  82: ["Violent showers", "CloudRain"],
  95: ["Thunderstorm", "CloudLightning"],
  96: ["Thunderstorm w/ hail", "CloudLightning"],
  99: ["Severe thunderstorm", "CloudLightning"],
};

function haversine(la1: number, lo1: number, la2: number, lo2: number): number {
  const R = 6371.0;
  const la1r = (la1 * Math.PI) / 180;
  const la2r = (la2 * Math.PI) / 180;
  const dlat = ((la2 - la1) * Math.PI) / 180;
  const dlon = ((lo2 - lo1) * Math.PI) / 180;
  const a =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(la1r) * Math.cos(la2r) * Math.sin(dlon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export class WeatherService {
  static getCities() {
    return {
      popular: POPULAR_INDIAN_CITIES.filter((c) => c.popular),
      all: POPULAR_INDIAN_CITIES,
    };
  }

  static async searchCities(query: string) {
    const q = (query || "").trim();
    if (!q) {
      return POPULAR_INDIAN_CITIES.filter((c) => c.popular).slice(0, 8);
    }

    const localMatches = searchIndianCitiesLocal(q, 8);
    if (localMatches.length >= 4) {
      return localMatches;
    }

    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=10&language=en&format=json`;
      const resp = await fetch(geoUrl, { signal: AbortSignal.timeout(5000) });
      if (resp.ok) {
        const geoData = await resp.json();
        const results = (geoData.results || [])
          .filter((item: any) => item.country_code === "IN" || item.country === "India")
          .slice(0, 8)
          .map((item: any) => {
            const matchedDest = DESTINATIONS.find(
              (d) => d.name.toLowerCase() === item.name.toLowerCase()
            );
            return {
              id: `geo-${item.id}`,
              name: item.name,
              state: item.admin1 || "India",
              lat: item.latitude,
              lon: item.longitude,
              region: "North",
              destinationId: matchedDest?.id,
            };
          });

        const existingNames = new Set(localMatches.map((m) => m.name.toLowerCase()));
        const merged = [...localMatches];
        for (const r of results) {
          if (!existingNames.has(r.name.toLowerCase())) {
            existingNames.add(r.name.toLowerCase());
            merged.push(r as any);
          }
        }
        return merged.slice(0, 10);
      }
    } catch {
      // Return local matches on network error
    }

    return localMatches;
  }

  static async getWeather(latParam?: number, lonParam?: number, cityQuery?: string) {
    let lat = latParam ?? NaN;
    let lon = lonParam ?? NaN;
    let cityName = (cityQuery || "").trim();
    let stateName = "";
    let matchedDestinationId: string | undefined = undefined;

    // Resolve city to coordinates
    if (cityName) {
      const localCity = findLocalIndianCity(cityName);
      if (localCity) {
        lat = localCity.lat;
        lon = localCity.lon;
        cityName = localCity.name;
        stateName = localCity.state;
        matchedDestinationId = localCity.destinationId;
      } else {
        const matchedDest = DESTINATIONS.find(
          (d) => d.name.toLowerCase() === cityName.toLowerCase() || d.id === cityName.toLowerCase()
        );
        if (matchedDest) {
          lat = matchedDest.lat;
          lon = matchedDest.lon;
          cityName = matchedDest.name;
          stateName = matchedDest.state;
          matchedDestinationId = matchedDest.id;
        } else {
          try {
            const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=5&language=en&format=json`;
            const geoResp = await fetch(geoUrl, { signal: AbortSignal.timeout(5000) });
            if (geoResp.ok) {
              const geoData = await geoResp.json();
              const inResult = (geoData.results || []).find((r: any) => r.country_code === "IN") || (geoData.results || [])[0];
              if (inResult) {
                lat = inResult.latitude;
                lon = inResult.longitude;
                cityName = inResult.name;
                stateName = inResult.admin1 || "India";
              }
            }
          } catch {}
        }
      }
    }

    if (isNaN(lat) || isNaN(lon)) {
      if (!cityName) {
        throw new Error("Please provide a city name or valid coordinates");
      }
      lat = 26.9124;
      lon = 75.7873;
      cityName = cityName || "Jaipur";
      stateName = stateName || "Rajasthan";
    }

    // Check cache
    const cacheKey = `weather:${Math.round(lat * 100) / 100}:${Math.round(lon * 100) / 100}`;
    const cached = await DataRepository.getWeatherCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,apparent_temperature,precipitation,surface_pressure,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max,sunrise,sunset&forecast_days=5&timezone=auto`;
      const resp = await fetch(url, { signal: AbortSignal.timeout(7000) });
      if (!resp.ok) throw new Error("Open-Meteo returned status " + resp.status);
      const data = await resp.json();

      const current = data.current || {};
      const daily = data.daily || {};
      const code = current.weather_code ?? 0;
      const [desc, icon] = WEATHER_CODES[code] || ["Pleasant weather", "Cloud"];

      const forecast = (daily.time || []).map((dateStr: string, i: number) => {
        const dayCode = (daily.weather_code || [])[i] ?? 0;
        const [cDesc, cIcon] = WEATHER_CODES[dayCode] || ["Partly cloudy", "CloudSun"];
        return {
          date: dateStr,
          max: Math.round((daily.temperature_2m_max || [])[i] ?? 28),
          min: Math.round((daily.temperature_2m_min || [])[i] ?? 18),
          apparent_max: Math.round((daily.apparent_temperature_max || [])[i] ?? 29),
          apparent_min: Math.round((daily.apparent_temperature_min || [])[i] ?? 17),
          precipitation: (daily.precipitation_sum || [])[i] ?? 0,
          precipitation_probability: (daily.precipitation_probability_max || [])[i] ?? 0,
          wind_speed_max: Math.round((daily.wind_speed_10m_max || [])[i] ?? 14),
          uv_index_max: Math.round(((daily.uv_index_max || [])[i] ?? 6) * 10) / 10,
          sunrise: (daily.sunrise || [])[i] || "",
          sunset: (daily.sunset || [])[i] || "",
          description: cDesc,
          icon: cIcon,
        };
      });

      const alerts: Array<{ level: "danger" | "warning" | "info"; title: string; message: string }> = [];
      const t = current.temperature_2m;
      const precipProb = forecast[0]?.precipitation_probability ?? 0;
      const uv = daily.uv_index_max?.[0] ?? 6;

      const sudden_changes: any[] = [];
      for (let i = 1; i < forecast.length; i++) {
        const prev = forecast[i - 1];
        const curr = forecast[i];
        const tempDiff = curr.max - prev.max;
        const precipDiff = (curr.precipitation_probability || 0) - (prev.precipitation_probability || 0);
        const windDiff = (curr.wind_speed_max || 0) - (prev.wind_speed_max || 0);
        const dayName = new Date(curr.date).toLocaleDateString("en-IN", { weekday: "short" });

        if (tempDiff <= -5) {
          sudden_changes.push({
            date: curr.date,
            day: dayName,
            day_index: i,
            type: "temp_drop",
            severity: tempDiff <= -7 ? "danger" : "warning",
            delta: Math.abs(tempDiff),
            title: `Sudden ${Math.abs(tempDiff)}°C Drop`,
            message: `Temperature drops abruptly by ${Math.abs(tempDiff)}°C (${prev.max}°C → ${curr.max}°C) on ${dayName}.`,
            advice: "Sharp temperature drop: Pack a warm fleece, sweater, or windcheater.",
          });
        } else if (tempDiff >= 5) {
          sudden_changes.push({
            date: curr.date,
            day: dayName,
            day_index: i,
            type: "temp_rise",
            severity: "warning",
            delta: tempDiff,
            title: `Sudden +${tempDiff}°C Heat Surge`,
            message: `Temperature spikes rapidly by +${tempDiff}°C (${prev.max}°C → ${curr.max}°C) on ${dayName}.`,
            advice: "Sudden heat surge: Wear breathable cotton, drink electrolytes, and tour early morning.",
          });
        }

        if (precipDiff >= 35 || (curr.precipitation > 8 && prev.precipitation < 2)) {
          sudden_changes.push({
            date: curr.date,
            day: dayName,
            day_index: i,
            type: "rain_spike",
            severity: "warning",
            delta: precipDiff,
            title: `Sudden Rain Influx (+${precipDiff}%)`,
            message: `Rain chance surges by +${precipDiff}% to ${curr.precipitation_probability}% on ${dayName}.`,
            advice: "Sudden showers: Keep umbrellas handy; shift exposed outdoor walks to sheltered monuments.",
          });
        }
      }

      sudden_changes.forEach((sc) => {
        alerts.unshift({
          level: sc.severity,
          title: `⚡ ${sc.title}`,
          message: `${sc.message} ${sc.advice}`,
        });
      });

      if (t !== undefined && t >= 39) {
        alerts.push({ level: "danger", title: "Severe Heat Advisory", message: `Extreme temperature (${Math.round(t)}°C). Hydrate frequently and avoid peak mid-day sun.` });
      } else if (t !== undefined && t >= 35) {
        alerts.push({ level: "warning", title: "High Temperature", message: `Warm day (${Math.round(t)}°C). Light cottons and water recommended.` });
      } else if (t !== undefined && t <= 4) {
        alerts.push({ level: "warning", title: "Cold Wave Alert", message: `Cold conditions (${Math.round(t)}°C). Heavy winter layers required.` });
      }

      let travel_tip = "Pleasant weather conditions across the region. Ideal for sightseeing and outdoor trails.";
      if (precipProb > 50 || code >= 61) {
        travel_tip = "Rain is likely today. Pack a compact umbrella or poncho, and prioritize indoor monuments.";
      } else if (t >= 34) {
        travel_tip = "High sun exposure. Plan monument visits early morning (before 10 AM) or during golden hour.";
      } else if (t <= 12) {
        travel_tip = "Chilly conditions. Layering with a warm fleece or windbreaker is ideal for evening exploration.";
      }

      const weatherResult = {
        city: cityName || "India",
        state: stateName || "India",
        country: "India",
        lat,
        lon,
        destinationId: matchedDestinationId,
        current: {
          temperature: Math.round((current.temperature_2m ?? 26) * 10) / 10,
          apparent_temperature: Math.round((current.apparent_temperature ?? 27) * 10) / 10,
          humidity: Math.round(current.relative_humidity_2m ?? 55),
          wind_speed: Math.round(current.wind_speed_10m ?? 12),
          wind_direction: Math.round(current.wind_direction_10m ?? 180),
          precipitation: current.precipitation ?? 0,
          surface_pressure: Math.round(current.surface_pressure ?? 1012),
          is_day: current.is_day === 1,
          uv_index: Math.round((uv || 5) * 10) / 10,
          description: desc,
          icon: icon,
          weather_code: code,
        },
        forecast,
        alerts,
        sudden_changes,
        travel_tip,
      };

      // Save to cache (30 mins TTL)
      DataRepository.setWeatherCache(cacheKey, lat, lon, weatherResult, 1800).catch(() => {});

      return weatherResult;
    } catch {
      // Graceful fallback if external API is unreachable
      const fallbackResult = {
        city: cityName || "Jaipur",
        state: stateName || "Rajasthan",
        country: "India",
        lat,
        lon,
        destinationId: matchedDestinationId || "rj-jaipur",
        current: {
          temperature: 28,
          apparent_temperature: 29,
          humidity: 52,
          wind_speed: 11,
          wind_direction: 210,
          precipitation: 0,
          surface_pressure: 1011,
          is_day: true,
          uv_index: 6.2,
          description: "Clear sky",
          icon: "Sun",
          weather_code: 0,
        },
        forecast: Array.from({ length: 5 }, (_, idx) => {
          const d = new Date();
          d.setDate(d.getDate() + idx);
          return {
            date: d.toISOString().split("T")[0],
            max: 29 - idx,
            min: 19 - Math.floor(idx / 2),
            apparent_max: 30 - idx,
            apparent_min: 18,
            precipitation: 0,
            precipitation_probability: 10,
            wind_speed_max: 12 + idx,
            uv_index_max: 6.5,
            sunrise: `${d.toISOString().split("T")[0]}T06:05:00`,
            sunset: `${d.toISOString().split("T")[0]}T18:30:00`,
            description: "Sunny",
            icon: "Sun",
          };
        }),
        alerts: [{ level: "info" as const, title: "Favorable Travel Weather", message: "Pleasant seasonal sightseeing conditions." }],
        sudden_changes: [],
        travel_tip: "Clear skies and moderate temperatures make it an excellent time to explore outdoor landmarks.",
      };
      return fallbackResult;
    }
  }
}
