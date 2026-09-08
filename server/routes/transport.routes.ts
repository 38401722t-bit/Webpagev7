import { Router, Request, Response } from "express";
import { POPULAR_INDIAN_CITIES } from "../../src/data/indianCities";
import { placesService } from "../../src/services/placesService";

const router = Router();

function findCoordinates(query: string): { lat: number; lon: number; name: string } | null {
  const q = query.trim().toLowerCase();
  const city = POPULAR_INDIAN_CITIES.find(
    (c) =>
      c.name.toLowerCase() === q ||
      c.id.toLowerCase() === q ||
      c.aliases?.some((a) => a.toLowerCase() === q)
  );
  if (city) return { lat: city.lat, lon: city.lon, name: city.name };

  const place = placesService.getPlaceByName(query) || placesService.getPlaceById(query);
  if (place) return { lat: place.lat, lon: place.lon, name: place.name };

  const found = POPULAR_INDIAN_CITIES.find((c) => c.name.toLowerCase().includes(q) || q.includes(c.name.toLowerCase()));
  if (found) return { lat: found.lat, lon: found.lon, name: found.name };

  return null;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

router.all("/", (req: Request, res: Response) => {
  const from = String(req.body?.from || req.query?.from || "").trim();
  const to = String(req.body?.to || req.query?.to || "").trim();

  if (!from || !to) {
    return res.status(400).json({ error: "Origin (from) and Destination (to) are required" });
  }

  const coordFrom = findCoordinates(from);
  const coordTo = findCoordinates(to);

  let distKm = 450;
  if (coordFrom && coordTo) {
    distKm = Math.max(50, calculateDistance(coordFrom.lat, coordFrom.lon, coordTo.lat, coordTo.lon));
  }

  // Flight calculations
  const flightDurMins = Math.round(45 + distKm * 0.08);
  const flightDurStr = flightDurMins >= 60 ? `${Math.floor(flightDurMins / 60)}h ${flightDurMins % 60}m` : `${flightDurMins} min`;
  const flightFare = Math.round(2200 + distKm * 3.2);

  // Train calculations (IRCTC Vande Bharat / Express)
  const trainSpeed = distKm > 600 ? 75 : 65;
  const trainHours = (distKm / trainSpeed).toFixed(1);
  const trainFare = Math.round(450 + distKm * 1.8);

  // Bus calculations (Volvo Multi-Axle AC)
  const busSpeed = 48;
  const busHours = (distKm / busSpeed).toFixed(1);
  const busFare = Math.round(350 + distKm * 1.5);

  // Cab calculations
  const cabSpeed = 58;
  const cabHours = (distKm / cabSpeed).toFixed(1);
  const cabFare = Math.round(1200 + distKm * 12);

  const isLongDistance = distKm > 700;

  const modes = [
    {
      type: "flight",
      name: `Domestic Flight (${from} to ${to})`,
      operator: "IndiGo / Air India Express / Akasa Air",
      duration: flightDurStr,
      price_range: `${(flightFare * 0.85).toFixed(0)} - ${(flightFare * 1.4).toFixed(0)}`,
      price_inr: `${flightFare.toLocaleString("en-IN")}`,
      carbon_kg: Math.round(distKm * 0.15),
      recommended: isLongDistance,
      description: `Fastest non-stop or 1-stop air corridor. Ideal for long distances (>600 km) and time-sensitive itineraries.`,
      tips: `Pre-book airport cabs 1 day in advance. Allow 90 minutes before scheduled departure for domestic security check.`,
      booking_url: `https://www.makemytrip.com/flights`,
    },
    {
      type: "train",
      name: `Vande Bharat / Rajdhani Express`,
      operator: "Indian Railways (IRCTC)",
      duration: `${trainHours} hrs`,
      price_range: `${(trainFare * 0.7).toFixed(0)} - ${(trainFare * 1.3).toFixed(0)}`,
      price_inr: `${trainFare.toLocaleString("en-IN")}`,
      carbon_kg: Math.round(distKm * 0.035),
      recommended: !isLongDistance && distKm >= 180,
      description: `Scenic rail route with panoramic windows, ergonomic executive seating, on-board regional catering, and city center terminal drop-off.`,
      tips: `IRCTC Tatkal booking quota opens at 10:00 AM (AC) and 11:00 AM (Sleeper) 1 day before journey.`,
      booking_url: `https://www.irctc.co.in`,
    },
    {
      type: "bus",
      name: `Volvo AC Multi-Axle Sleeper`,
      operator: "State RTC & Intrcity SmartBus",
      duration: `${busHours} hrs`,
      price_range: `${(busFare * 0.8).toFixed(0)} - ${(busFare * 1.25).toFixed(0)}`,
      price_inr: `${busFare.toLocaleString("en-IN")}`,
      carbon_kg: Math.round(distKm * 0.05),
      recommended: distKm < 500 && distKm > 100,
      description: `Comfortable overnight service with reclining memory-foam berths, individual AC vents, and luggage storage.`,
      tips: `Choose upper single berths for solo privacy or lower double berths for couples.`,
      booking_url: `https://www.redbus.in`,
    },
    {
      type: "cab",
      name: `Intercity Highway Taxi (Sedan / SUV)`,
      operator: "MakeMyTrip / Savaari Outstation Cabs",
      duration: `${cabHours} hrs`,
      price_range: `${(cabFare * 0.9).toFixed(0)} - ${(cabFare * 1.3).toFixed(0)}`,
      price_inr: `${cabFare.toLocaleString("en-IN")}`,
      carbon_kg: Math.round(distKm * 0.12),
      recommended: distKm <= 200,
      description: `Private door-to-door transit offering total schedule flexibility, roadside dhaba stops, and scenic detour options.`,
      tips: `Confirm FASTag toll charges and driver night allowances are included in the quoted package before departure.`,
      booking_url: `https://www.makemytrip.com/cabs`,
    },
  ];

  res.json({
    from,
    to,
    distance_km: distKm,
    modes,
    options: modes,
  });
});

export default router;
