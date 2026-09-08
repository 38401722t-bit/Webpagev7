import { Router, Request, Response } from "express";
import { WeatherService } from "../services/weatherService";
import { searchRateLimiter } from "../middleware/rateLimit";
import { DEST_BY_ID } from "../../src/data/destinations";

const router = Router();

// Get weather for coordinates or city query
router.get("/", async (req: Request, res: Response) => {
  try {
    const lat = req.query.lat ? parseFloat(String(req.query.lat)) : undefined;
    const lon = req.query.lon ? parseFloat(String(req.query.lon)) : undefined;
    const city = req.query.city ? String(req.query.city).trim() : undefined;

    const data = await WeatherService.getWeather(lat, lon, city);
    res.json(data);
  } catch (err: any) {
    res.status(400).json({
      success: false,
      detail: err.message || "Failed to fetch weather data",
      error: { code: "WEATHER_ERROR", message: err.message },
    });
  }
});

// Indian cities list
router.get("/cities", (req: Request, res: Response) => {
  const cities = WeatherService.getCities();
  res.json(cities);
});

// Search Indian cities
router.get("/cities/search", searchRateLimiter, async (req: Request, res: Response) => {
  const q = String(req.query.q || "").trim();
  const results = await WeatherService.searchCities(q);
  res.json(results);
});

// Weather by Destination ID
router.get("/destination/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  const dest = DEST_BY_ID.get(id);
  if (dest) {
    const data = await WeatherService.getWeather(dest.lat, dest.lon, dest.name);
    return res.json(data);
  }

  // Fallback to searching by ID name
  try {
    const data = await WeatherService.getWeather(undefined, undefined, id);
    res.json(data);
  } catch {
    res.status(404).json({
      success: false,
      detail: "Destination not found for weather",
      error: { code: "DESTINATION_NOT_FOUND", message: "Destination not found" },
    });
  }
});

export default router;
