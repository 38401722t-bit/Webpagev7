import { placesService } from "../../src/services/placesService";
import { findLocalIndianCity } from "../../src/data/indianCities";
import { DEST_BY_ID } from "../../src/data/destinations";

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

export class RoutingService {
  /**
   * Calculates actual road distance and duration between coordinates using OSRM with Haversine fallback.
   */
  static async calculateRoadRoute(fromLat: number, fromLon: number, toLat: number, toLon: number) {
    try {
      // OSRM Public Driving Routing API (Free, open-source routing)
      const url = `https://router.project-osrm.org/route/v1/driving/${fromLon},${fromLat};${toLon},${toLat}?overview=false`;
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const data = await res.json();
        if (data.routes && data.routes[0]) {
          const distanceKm = Math.round(data.routes[0].distance / 1000);
          const durationHours = Math.round((data.routes[0].duration / 3600) * 10) / 10;
          return { distanceKm, durationHours, provider: "osrm" };
        }
      }
    } catch {
      // Fallback to calibrated highway road curvature (1.28x Haversine factor for Indian NH network)
    }

    const aerialKm = haversine(fromLat, fromLon, toLat, toLon);
    const roadKm = Math.round(aerialKm * 1.28);
    const roadDuration = Math.round((roadKm / 52) * 10) / 10; // average 52 km/h highway speed
    return { distanceKm: roadKm, durationHours: roadDuration, provider: "calibrated-network" };
  }

  /**
   * Optimized multi-destination TSP traversal
   */
  static async getShortestRoute(destinationIds: string[], startId?: string) {
    const ids = destinationIds.filter((id) => DEST_BY_ID.has(id));
    if (ids.length < 2) {
      throw new Error("Provide at least 2 valid destinations");
    }

    const start = startId && ids.includes(startId) ? startId : ids[0];
    const remaining = ids.filter((id) => id !== start);
    const ordered = [start];
    let totalKm = 0;
    let current = DEST_BY_ID.get(start)!;

    while (remaining.length > 0) {
      let nearestId = remaining[0];
      let minDist = Infinity;

      for (const rid of remaining) {
        const target = DEST_BY_ID.get(rid)!;
        const dist = haversine(current.lat, current.lon, target.lat, target.lon);
        if (dist < minDist) {
          minDist = dist;
          nearestId = rid;
        }
      }

      totalKm += minDist;
      ordered.push(nearestId);
      current = DEST_BY_ID.get(nearestId)!;
      remaining.splice(remaining.indexOf(nearestId), 1);
    }

    const stops = ordered.map((id, index) => {
      const d = DEST_BY_ID.get(id)!;
      return {
        id: d.id,
        name: d.name,
        state: d.state,
        lat: d.lat,
        lon: d.lon,
        index: index + 1,
      };
    });

    const legs = [];
    for (let i = 0; i < stops.length - 1; i++) {
      const dist = Math.round(haversine(stops[i].lat, stops[i].lon, stops[i + 1].lat, stops[i + 1].lon));
      legs.push({
        from: stops[i].name,
        to: stops[i + 1].name,
        distance_km: dist,
      });
    }

    return {
      stops,
      legs,
      total_distance_km: Math.round(totalKm),
    };
  }

  /**
   * Explores and discovers tourist places along travel corridor with detour ranking
   */
  static async exploreRouteCorridor(fromQuery: string, toQuery: string, maxDetourKm = 35) {
    let origin = placesService.getPlaceById(fromQuery) || placesService.getPlaceByName(fromQuery);
    let dest = placesService.getPlaceById(toQuery) || placesService.getPlaceByName(toQuery);

    if (!origin) {
      const c = findLocalIndianCity(fromQuery);
      if (c) {
        origin = {
          id: `city-${c.name.toLowerCase()}`,
          name: c.name,
          state: c.state,
          lat: c.lat,
          lon: c.lon,
          category: "Major Transit Hub",
          region: "North",
          rating: 4.6,
          budget: 2000,
          image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800",
          bestSeason: "Oct - Mar",
          description: `${c.name} is an important transit and cultural center in ${c.state}.`,
          tags: [c.state, "City"],
          type: "urban",
          attractions: [c.name],
          foods: ["Local Cuisine"],
        } as any;
      }
    }

    if (!dest) {
      const c = findLocalIndianCity(toQuery);
      if (c) {
        dest = {
          id: `city-${c.name.toLowerCase()}`,
          name: c.name,
          state: c.state,
          lat: c.lat,
          lon: c.lon,
          category: "Major Transit Hub",
          region: "North",
          rating: 4.6,
          budget: 2000,
          image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=800",
          bestSeason: "Oct - Mar",
          description: `${c.name} is an important transit and cultural center in ${c.state}.`,
          tags: [c.state, "City"],
          type: "urban",
          attractions: [c.name],
          foods: ["Local Cuisine"],
        } as any;
      }
    }

    if (!origin || !dest) {
      throw new Error("Origin or destination could not be resolved in tourist places or cities");
    }

    const routeEstimate = await this.calculateRoadRoute(origin.lat, origin.lon, dest.lat, dest.lon);

    const realCorridorStops = placesService.getPlacesAlongRoute({
      originLat: origin.lat,
      originLon: origin.lon,
      destLat: dest.lat,
      destLon: dest.lon,
      maxDetourKm,
      maxStops: 16,
    });

    const stops = realCorridorStops
      .filter((s) => s.id !== origin!.id && s.id !== dest!.id)
      .map((s, idx) => ({
        id: s.id,
        name: s.name,
        state: s.state,
        category: s.category,
        lat: s.lat,
        lon: s.lon,
        detour_km: s.detourKm,
        progress_pct: s.progressPct,
        image: s.image,
        rating: s.rating,
        highlight: s.tags?.slice(0, 2).join(" · ") || s.category,
        description: s.description,
        recommended_hours: 1.5,
        index: idx + 1,
      }));

    return {
      from: origin,
      to: dest,
      distance_km: routeEstimate.distanceKm,
      estimated_drive_hours: routeEstimate.durationHours,
      stops_count: stops.length,
      stops,
      places: stops.map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        distance_from_route_km: s.detour_km,
        lat: s.lat,
        lon: s.lon,
        entry_fee_inr: 50,
        recommended_hours: s.recommended_hours,
        description: s.description,
        best_for: s.category,
      })),
    };
  }
}
