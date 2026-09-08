import { Router, Request, Response } from "express";
import { RoutingService } from "../services/routingService";
import { routeRateLimiter } from "../middleware/rateLimit";
import { validateBody, validateQuery } from "../middleware/validate";
import { ShortestRouteSchema, RouteExploreSchema } from "../validators/schemas";
import { PRESET_ROUTES } from "../../src/data/destinations";

const router = Router();

// Calculate shortest multi-destination route
router.post("/shortest", routeRateLimiter, validateBody(ShortestRouteSchema), async (req: Request, res: Response) => {
  try {
    const { destination_ids, start_id } = req.body;
    const result = await RoutingService.getShortestRoute(destination_ids, start_id);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({
      success: false,
      detail: err.message,
      error: { code: "ROUTE_CALCULATION_ERROR", message: err.message },
    });
  }
});

// Explore tourist places along route corridor (POST)
router.post("/explore", routeRateLimiter, async (req: Request, res: Response) => {
  try {
    const from = req.body.from_id || req.body.from;
    const to = req.body.to_id || req.body.to;
    const maxDetour = req.body.maxDetourKm || req.body.max_detour_km || 35;

    if (!from || !to) {
      return res.status(422).json({ detail: "Both origin (from) and destination (to) are required" });
    }

    const result = await RoutingService.exploreRouteCorridor(from, to, Number(maxDetour));
    res.json(result);
  } catch (err: any) {
    res.status(400).json({
      success: false,
      detail: err.message,
      error: { code: "CORRIDOR_EXPLORATION_ERROR", message: err.message },
    });
  }
});

// Explore route corridor (GET)
router.get("/explore", routeRateLimiter, async (req: Request, res: Response) => {
  try {
    const from = String(req.query.from_id || req.query.from || "");
    const to = String(req.query.to_id || req.query.to || "");
    const maxDetour = req.query.maxDetourKm ? Number(req.query.maxDetourKm) : 35;

    if (!from || !to) {
      return res.status(400).json({ detail: "from and to parameters are required" });
    }

    const result = await RoutingService.exploreRouteCorridor(from, to, maxDetour);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({
      success: false,
      detail: err.message,
      error: { code: "CORRIDOR_EXPLORATION_ERROR", message: err.message },
    });
  }
});

// Directions endpoint for road routes
router.post("/directions", routeRateLimiter, async (req: Request, res: Response) => {
  try {
    const { from_lat, from_lon, to_lat, to_lon } = req.body;
    if (from_lat === undefined || from_lon === undefined || to_lat === undefined || to_lon === undefined) {
      return res.status(422).json({ detail: "Coordinates from_lat, from_lon, to_lat, to_lon required" });
    }

    const result = await RoutingService.calculateRoadRoute(
      Number(from_lat),
      Number(from_lon),
      Number(to_lat),
      Number(to_lon)
    );
    res.json(result);
  } catch (err: any) {
    res.status(400).json({
      success: false,
      detail: err.message,
      error: { code: "DIRECTIONS_ERROR", message: err.message },
    });
  }
});

// Preset iconic Indian routes (Golden Triangle, Kerala Backwaters, etc.)
router.get("/preset", (req: Request, res: Response) => {
  res.json(PRESET_ROUTES);
});

export default router;
