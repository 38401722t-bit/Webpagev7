import { Router, Request, Response } from "express";
import { DESTINATIONS, DEST_BY_ID } from "../../src/data/destinations";
import { placesService } from "../../src/services/placesService";
import { searchRateLimiter } from "../middleware/rateLimit";
import { validateQuery } from "../middleware/validate";
import { PlacesSearchSchema, NearbyPlacesSchema } from "../validators/schemas";
import { ImageService } from "../services/imageService";

const router = Router();

// Get curated destinations with filters
router.get("/", (req: Request, res: Response) => {
  const { region, category, state, max_budget, search } = req.query;
  let list = [...DESTINATIONS];

  if (region) {
    list = list.filter((d) => d.region.toLowerCase() === String(region).toLowerCase());
  }
  if (category) {
    list = list.filter((d) => d.category.toLowerCase().includes(String(category).toLowerCase()));
  }
  if (state) {
    list = list.filter((d) => d.state.toLowerCase() === String(state).toLowerCase());
  }
  if (max_budget) {
    const mb = Number(max_budget);
    if (!isNaN(mb) && mb > 0) {
      list = list.filter((d) => d.budget <= mb);
    }
  }
  if (search) {
    const s = String(search).toLowerCase();
    list = list.filter(
      (d) =>
        d.name.toLowerCase().includes(s) ||
        d.state.toLowerCase().includes(s) ||
        d.description.toLowerCase().includes(s) ||
        d.attractions.some((a) => a.toLowerCase().includes(s))
    );
  }

  res.json(list);
});

// Featured destinations
router.get("/featured", (req: Request, res: Response) => {
  res.json(DESTINATIONS.slice(0, 8));
});

// Categories summary
router.get("/categories", (req: Request, res: Response) => {
  const categories = placesService.getCategories();
  res.json(categories);
});

// States & Union Territories Master (36 States)
router.get("/states", (req: Request, res: Response) => {
  const states = placesService.getAllStates();
  res.json(states);
});

// Places by State
router.get("/state/:stateName", (req: Request, res: Response) => {
  const stateName = decodeURIComponent(req.params.stateName);
  const places = placesService.getPlacesByState(stateName);
  res.json({
    state: stateName,
    count: places.length,
    places,
  });
});

// Comprehensive Global Search (across 1,924 tourist places & curated destinations)
router.get("/search", searchRateLimiter, validateQuery(PlacesSearchSchema), (req: Request, res: Response) => {
  const { q, query, state, region, category, sortBy, limit, offset } = req.query as any;
  const searchInput = (q || query || "").trim();

  const results = placesService.searchPlaces({
    query: searchInput,
    state,
    region,
    category,
    sortBy: sortBy || "popularity",
    limit: limit ? Number(limit) : 30,
    offset: offset ? Number(offset) : 0,
  });

  res.json(results);
});

// Nearby Places Geo-Radius Search
router.get("/nearby", searchRateLimiter, validateQuery(NearbyPlacesSchema), (req: Request, res: Response) => {
  const { lat, lon, radius, limit } = req.query as any;
  const nearby = placesService.getNearbyPlaces({
    lat: Number(lat),
    lon: Number(lon),
    radiusKm: radius ? Number(radius) : 50,
    limit: limit ? Number(limit) : 20,
  });

  res.json(nearby);
});

// Single Destination / Tourist Place Details
router.get("/:id", async (req: Request, res: Response) => {
  const id = req.params.id;

  // 1. Check curated destinations
  if (DEST_BY_ID.has(id)) {
    const dest = DEST_BY_ID.get(id)!;
    const images = await ImageService.getImagesForPlace(dest.id, dest.name, dest.state);
    return res.json({
      ...dest,
      images: images.map((img) => img.imageUrl),
      gallery: images,
    });
  }

  // 2. Check 1,924 master places
  const place = placesService.getPlaceById(id) || placesService.getPlaceByName(id);
  if (place) {
    const images = await ImageService.getImagesForPlace(place.id, place.name, place.state);
    return res.json({
      ...place,
      images: images.map((img) => img.imageUrl),
      gallery: images,
    });
  }

  res.status(404).json({
    success: false,
    detail: "Destination or tourist place not found",
    error: { code: "PLACE_NOT_FOUND", message: "Tourist place not found" },
  });
});

// Destination attractions
router.get("/:id/attractions", (req: Request, res: Response) => {
  const dest = DEST_BY_ID.get(req.params.id);
  if (!dest) {
    const p = placesService.getPlaceById(req.params.id);
    if (!p) {
      return res.status(404).json({ detail: "Destination not found" });
    }
    return res.json(p.attractions || [p.name]);
  }
  res.json(dest.attractions);
});

export default router;
