import { Router, Request, Response } from "express";
import { HospitalityService } from "../services/hospitalityService";
import { DEST_BY_ID, DESTINATIONS } from "../../src/data/destinations";
import { placesService } from "../../src/services/placesService";

const router = Router();

// Hotels (compatible with both array and { context, hotels } schema for HotelsCard)
router.get("/hotels", (req: Request, res: Response) => {
  const destId = req.query.destination_id || req.query.dest_id;
  const lat = req.query.lat ? parseFloat(String(req.query.lat)) : undefined;
  const lon = req.query.lon ? parseFloat(String(req.query.lon)) : undefined;

  let contextName = "India";
  let targetPlace: any = null;

  if (destId) {
    targetPlace = DEST_BY_ID.get(String(destId)) || placesService.getPlaceById(String(destId)) || placesService.getPlaceByName(String(destId));
    if (targetPlace) contextName = targetPlace.name;
  } else if (lat !== undefined && lon !== undefined) {
    const nearby = placesService.getNearbyPlaces(lat, lon, 300, 1);
    if (nearby.length > 0) {
      targetPlace = nearby[0];
      contextName = nearby[0].name;
    }
  }

  const rawList = HospitalityService.getHotels(targetPlace?.id);

  // Normalize objects to match both HotelsCard and generic expectations
  const normalizedHotels = rawList.map((h, i) => ({
    id: h.id || `ht-${targetPlace?.id || "ind"}-${i + 1}`,
    name: h.name,
    area: h.area || `${contextName} Central`,
    type: h.tier?.includes("Hostel") ? "hostel" : h.tier?.includes("Luxury") ? "resort" : "hotel",
    stars: h.tier?.includes("Luxury") ? 5 : h.tier?.includes("Standard") ? 4 : 3,
    rating: h.rating || 4.7,
    price_inr: h.price_per_night_inr || 3500,
    price_per_night_inr: h.price_per_night_inr || 3500,
    distance_km: (1.2 + (i * 0.8)).toFixed(1),
    highlight: h.amenities ? h.amenities.slice(0, 3).join(" · ") : "Prime location with heritage hospitality",
    amenities: h.amenities,
    image: h.image,
  }));

  // Return object with hotels array (so data.hotels works in HotelsCard)
  // Also provide total and context
  res.json({
    context: contextName,
    hotels: normalizedHotels,
    total: normalizedHotels.length,
  });
});

router.get("/hotels/:destId", (req: Request, res: Response) => {
  const place = DEST_BY_ID.get(req.params.destId) || placesService.getPlaceById(req.params.destId);
  const rawList = HospitalityService.getHotels(req.params.destId);
  res.json(rawList);
});

// Crowd tracking (CrowdCard.jsx)
router.get("/crowd/:dest_id", (req: Request, res: Response) => {
  const destId = req.params.dest_id;
  const place = placesService.getPlaceById(destId) || placesService.getPlaceByName(destId) || DEST_BY_ID.get(destId);
  const name = place?.name || destId;

  const currentHour = (new Date().getUTCHours() + 5.5) % 24;
  let level: "low" | "moderate" | "high" | "very_high" = "moderate";
  let waitMinutes = 20;

  if (currentHour >= 11 && currentHour <= 16) {
    level = "high";
    waitMinutes = 35;
  } else if (currentHour >= 7 && currentHour <= 10) {
    level = "low";
    waitMinutes = 10;
  } else if (currentHour > 16 && currentHour <= 19) {
    level = "moderate";
    waitMinutes = 20;
  } else {
    level = "low";
    waitMinutes = 5;
  }

  res.json({
    destination: name,
    level,
    wait_minutes: waitMinutes,
    summary: `Current tourist density at ${name} is ${level} with average monument queue times of ~${waitMinutes} min.`,
    tip: "Early visits before 08:30 AM or late twilight entries experience the shortest security clearance queues.",
    factors: [
      "Regular weekend domestic traveler influx",
      "ASI digital QR ticketing active at primary gates",
      "Favorable walking weather conditions",
    ],
  });
});

// Foodie recommendations (FoodieDialog.jsx)
router.get("/foodie/:dest_id", (req: Request, res: Response) => {
  const destId = req.params.dest_id;
  const place = placesService.getPlaceById(destId) || placesService.getPlaceByName(destId) || DEST_BY_ID.get(destId);
  const name = place?.name || destId;
  const dish = String(req.query.dish || (place?.foods && place.foods[0]) || "Street Food").trim();

  const restaurants = [
    {
      id: `rest-${destId}-1`,
      name: `${name} Iconic Heritage Bhojanalaya`,
      area: "Historic Clock Tower / Old Town",
      rating: 4.8,
      price_range: "₹₹",
      signature: `Authentic traditional ${dish} served with regional chutneys`,
      tip: "Arrive before 1:30 PM to avoid queue times during peak lunch hours.",
      maps_url: `https://www.google.com/maps/search/${encodeURIComponent(name + " " + dish)}`,
    },
    {
      id: `rest-${destId}-2`,
      name: `Grand Palace Courtyard Dining`,
      area: "Near Fort Entrance",
      rating: 4.7,
      price_range: "₹₹₹",
      signature: `Royal thali featuring chef-curated ${dish}`,
      tip: "Pre-book a sunset table for illuminated monument vistas.",
      maps_url: `https://www.google.com/maps/search/${encodeURIComponent(name + " " + dish)}`,
    },
    {
      id: `rest-${destId}-3`,
      name: `Famous Street Corner Sweets & Savories`,
      area: "Main Bazaar Chowk",
      rating: 4.9,
      price_range: "₹",
      signature: `Piping hot fresh ${dish} cooked in pure desi ghee`,
      tip: "Pair with traditional thick kulhad lassi or masala chai.",
      maps_url: `https://www.google.com/maps/search/${encodeURIComponent(name + " " + dish)}`,
    },
  ];

  res.json({
    destination: name,
    dish,
    restaurants,
  });
});

router.get("/food-trail/:dest_id", (req: Request, res: Response) => {
  const destId = req.params.dest_id;
  const place = placesService.getPlaceById(destId) || placesService.getPlaceByName(destId) || DEST_BY_ID.get(destId);
  const name = place?.name || destId;

  res.json({
    destination: name,
    trail_name: `${name} Gastronomy Walk`,
    stops: [
      { name: "Morning Bazaar Breakfast", dish: "Kachori, Jalebi & Masala Chai", time: "08:30 AM" },
      { name: "Royal Thali Hall", dish: "Multi-Course Regional Feasting Thali", time: "01:00 PM" },
      { name: "Sunset Chaat & Desserts", dish: "Pani Puri, Rabdi & Kulfi", time: "06:30 PM" },
    ],
  });
});

// Restaurants
router.get("/restaurants", (req: Request, res: Response) => {
  const destId = req.query.destination_id ? String(req.query.destination_id) : undefined;
  const list = HospitalityService.getRestaurants(destId);
  res.json(list);
});

router.get("/restaurants/:destId", (req: Request, res: Response) => {
  const list = HospitalityService.getRestaurants(req.params.destId);
  res.json(list);
});

// Foods
router.get("/foods", (req: Request, res: Response) => {
  const destId = req.query.destination_id ? String(req.query.destination_id) : undefined;
  const list = HospitalityService.getFoods(destId);
  res.json(list);
});

router.get("/foods/:destId", (req: Request, res: Response) => {
  const list = HospitalityService.getFoods(req.params.destId);
  res.json(list);
});

export default router;
