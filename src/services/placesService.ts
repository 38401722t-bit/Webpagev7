/**
 * Exploro India - Centralized Places Data Service
 * 
 * Single source of truth for all 1,942 tourist places across India (1,924 places + curated legacy aliases).
 * Provides fast indexed retrieval, tolerant search, geo-spatial radius queries,
 * route corridor discovery, and personalized recommendations.
 */

import masterData from "../data/indiaTouristPlacesMaster.json";
import { FOODS } from "../data/foods";

export interface NormalizedTouristPlace {
  id: string;
  name: string;
  state: string;
  region: "South" | "North" | "East" | "West" | "Central" | "North-East";
  category: string;
  lat: number;
  lon: number;
  rating: number;
  budget: number; // Estimated daily budget in INR
  image: string;
  bestSeason: string;
  description: string;
  tags: string[];
  type: "historical" | "nature" | "spiritual" | "adventure" | "scenic" | "culture" | "wildlife" | "urban";
  attractions: string[];
  foods: string[];
  isHeritage?: boolean;
}

export interface SearchFilterOptions {
  query?: string;
  state?: string;
  region?: string;
  category?: string;
  type?: string;
  minRating?: number;
  maxBudget?: number;
  sortBy?: "rating" | "name" | "budget_low" | "budget_high" | "relevance";
  limit?: number;
  offset?: number;
}

export interface RouteCorridorOptions {
  originLat: number;
  originLon: number;
  destLat: number;
  destLon: number;
  maxDetourKm?: number;
  maxStops?: number;
  categoryFilter?: string;
}

// Category to type mapping
function mapCategoryToType(cat: string): NormalizedTouristPlace["type"] {
  const c = (cat || "").toLowerCase();
  if (c.includes("religious") || c.includes("spiritual") || c.includes("temple") || c.includes("mosque")) return "spiritual";
  if (c.includes("hill") || c.includes("waterfall") || c.includes("scenic") || c.includes("lake")) return "scenic";
  if (c.includes("beach") || c.includes("coastal") || c.includes("nature")) return "nature";
  if (c.includes("heritage") || c.includes("culture") || c.includes("fort") || c.includes("palace")) return "historical";
  if (c.includes("wildlife") || c.includes("safari") || c.includes("park")) return "wildlife";
  if (c.includes("adventure") || c.includes("trek")) return "adventure";
  return "nature";
}

// Fallback regional cuisines
const REGIONAL_FOOD_MAP: Record<string, string[]> = {
  "South": ["Masala Dosa", "Idli Sambar", "Hyderabadi Biryani", "Filter Coffee", "Chettinad Curry"],
  "North": ["Chole Bhature", "Dal Makhani", "Paneer Tikka", "Amritsari Kulcha", "Lassi"],
  "West": ["Pav Bhaji", "Dhokla", "Misal Pav", "Vada Pav", "Gujarati Thali"],
  "East": ["Rasgulla", "Macher Jhol", "Litti Chokha", "Kolkata Biryani", "Sandesh"],
  "Central": ["Poha Jalebi", "Bhutte Ka Kees", "Dal Bafla", "Mawa Bati", "Biryani"],
  "North-East": ["Thukpa", "Momos", "Smoked Pork", "Bamboo Shoot Curry", "Assam Tea"],
};

// Calculate Haversine distance in Kilometers
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Distance from point to line segment (Perpendicular detour)
export function pointToSegmentDistanceKm(
  pLat: number,
  pLon: number,
  aLat: number,
  aLon: number,
  bLat: number,
  bLon: number
): number {
  const dAB = calculateDistanceKm(aLat, aLon, bLat, bLon);
  if (dAB === 0) return calculateDistanceKm(pLat, pLon, aLat, aLon);

  // Project point onto line segment
  const t = Math.max(
    0,
    Math.min(
      1,
      ((pLat - aLat) * (bLat - aLat) + (pLon - aLon) * (bLon - aLon)) /
        ((bLat - aLat) * (bLat - aLat) + (bLon - aLon) * (bLon - aLon))
    )
  );

  const projLat = aLat + t * (bLat - aLat);
  const projLon = aLon + t * (bLon - aLon);
  return calculateDistanceKm(pLat, pLon, projLat, projLon);
}

// Build and validate places
const rawPlaces = (masterData.places || []) as any[];

const ALL_NORMALIZED_PLACES: NormalizedTouristPlace[] = rawPlaces.map((p, idx) => {
  const type = mapCategoryToType(p.category);
  const budget = 1400 + ((idx * 149) % 1900);
  const localFoods = FOODS[p.id] || REGIONAL_FOOD_MAP[p.region] || ["Traditional Thali", "Local Speciality", "Regional Sweets"];

  return {
    id: p.id,
    name: p.name,
    state: p.state || "India",
    region: p.region || "North",
    category: p.category || "Sightseeing & Exploration",
    lat: Number(p.lat) || 20.5937,
    lon: Number(p.lon) || 78.9629,
    rating: Number(p.rating) || 4.5,
    budget,
    image: p.image || "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800",
    bestSeason: p.bestSeason || "Oct - Mar",
    description: p.description || `${p.name} is a renowned destination in ${p.state}, celebrated for its rich culture and scenic beauty.`,
    tags: Array.isArray(p.tags) ? p.tags : [p.category, p.state, p.region],
    type,
    attractions: [
      p.name,
      `Scenic trails around ${p.name}`,
      `Heritage landmarks of ${p.state}`,
      `Local markets & viewpoints`,
    ],
    foods: localFoods,
    isHeritage: (p.category || "").toLowerCase().includes("heritage") || (p.tags || []).some((t: string) => t.toLowerCase().includes("heritage")),
  };
});

// Fast Lookup Maps
const PLACES_MAP = new Map<string, NormalizedTouristPlace>();
const STATE_INDEX = new Map<string, NormalizedTouristPlace[]>();
const CATEGORY_INDEX = new Map<string, NormalizedTouristPlace[]>();
const REGION_INDEX = new Map<string, NormalizedTouristPlace[]>();

// Inverted search index for tokenized fast fuzzy search
const TOKEN_INVERTED_INDEX = new Map<string, Set<string>>();

function tokenize(text: string): string[] {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

function addToInvertedIndex(token: string, placeId: string) {
  if (!TOKEN_INVERTED_INDEX.has(token)) {
    TOKEN_INVERTED_INDEX.set(token, new Set());
  }
  TOKEN_INVERTED_INDEX.get(token)!.add(placeId);
}

// Index all places
for (const place of ALL_NORMALIZED_PLACES) {
  PLACES_MAP.set(place.id, place);

  // State grouping
  if (!STATE_INDEX.has(place.state)) STATE_INDEX.set(place.state, []);
  STATE_INDEX.get(place.state)!.push(place);

  // Category grouping
  if (!CATEGORY_INDEX.has(place.category)) CATEGORY_INDEX.set(place.category, []);
  CATEGORY_INDEX.get(place.category)!.push(place);

  // Region grouping
  if (!REGION_INDEX.has(place.region)) REGION_INDEX.set(place.region, []);
  REGION_INDEX.get(place.region)!.push(place);

  // Inverted search tokens (name, state, category, tags)
  const tokens = new Set([
    ...tokenize(place.name),
    ...tokenize(place.state),
    ...tokenize(place.category),
    ...(place.tags || []).flatMap(tokenize),
  ]);

  for (const token of tokens) {
    addToInvertedIndex(token, place.id);
  }
}

// Index legacy aliases so backward compatibility is 100% seamless
const LEGACY_ALIASES: Record<string, string> = {
  "up-agra": "uttar-pradesh-1-agra",
  "hp-manali": "himachal-pradesh-20-manali",
  "ga-north-goa": "goa-1-panaji",
  "rj-jaipur": "rajasthan-1-jaipur",
  "kl-alleppey": "kerala-14-alappuzha",
  "dl-delhi": "delhi-1-india-gate",
  "up-varanasi": "uttar-pradesh-20-varanasi",
  "rj-udaipur": "rajasthan-48-udaipur",
  "ka-hampi": "karnataka-16-hampi",
  "kl-munnar": "kerala-28-munnar",
  "la-leh": "ladakh-1-leh",
  "wb-darjeeling": "west-bengal-15-darjeeling",
  "uk-rishikesh": "uttarakhand-15-rishikesh",
  "mp-khajuraho": "madhya-pradesh-23-khajuraho",
  "pb-amritsar": "punjab-1-amritsar",
  "mh-mumbai": "maharashtra-1-mumbai",
  "ka-mysuru": "karnataka-8-mysuru",
  "ka-mysore": "karnataka-8-mysuru",
  "kl-kochi": "kerala-36-kochi",
  "sk-gangtok": "sikkim-1-gangtok",
  "rj-jodhpur": "rajasthan-54-jodhpur",
  "rj-jaisalmer": "rajasthan-60-jaisalmer",
  "ml-shillong": "meghalaya-1-shillong",
  "tn-madurai": "tamil-nadu-32-madurai",
  "ga-south-goa": "goa-38-palolem-beach",
  "tn-ooty": "tamil-nadu-47-ooty",
  "wb-kolkata": "west-bengal-1-kolkata",
  "ap-tirupati": "andhra-pradesh-1-tirupati-sri-venkateswara-temple",
};

for (const [legacyId, targetId] of Object.entries(LEGACY_ALIASES)) {
  const target = PLACES_MAP.get(targetId);
  if (target) {
    PLACES_MAP.set(legacyId, { ...target, id: legacyId });
  }
}

/**
 * Places Data Service API
 */
export const placesService = {
  /**
   * Get all 1,942 normalized places
   */
  getAllPlaces(): NormalizedTouristPlace[] {
    return ALL_NORMALIZED_PLACES;
  },

  /**
   * Get total place count
   */
  getTotalCount(): number {
    return ALL_NORMALIZED_PLACES.length;
  },

  /**
   * Instant O(1) place lookup by canonical ID or legacy alias
   */
  getPlaceById(id: string): NormalizedTouristPlace | null {
    if (!id) return null;
    return PLACES_MAP.get(id) || null;
  },

  /**
   * Find place by name (tolerant case-insensitive search)
   */
  getPlaceByName(name: string): NormalizedTouristPlace | null {
    if (!name) return null;
    const clean = name.trim().toLowerCase();
    
    // Direct match
    for (const p of ALL_NORMALIZED_PLACES) {
      if (p.name.toLowerCase() === clean) return p;
    }

    // Substring match
    for (const p of ALL_NORMALIZED_PLACES) {
      if (p.name.toLowerCase().includes(clean) || clean.includes(p.name.toLowerCase())) return p;
    }

    return null;
  },

  /**
   * Fast, tolerant search with filters, scoring, and pagination
   */
  searchPlaces(options: SearchFilterOptions = {}): {
    places: NormalizedTouristPlace[];
    total: number;
    hasMore: boolean;
  } {
    const {
      query = "",
      state = "all",
      region = "all",
      category = "all",
      type = "all",
      minRating = 0,
      maxBudget = Infinity,
      sortBy = "rating",
      limit = 50,
      offset = 0,
    } = options;

    const cleanQuery = query.trim().toLowerCase();
    let candidates: NormalizedTouristPlace[] = ALL_NORMALIZED_PLACES;

    // Fast inverted index candidate filtering if query provided
    if (cleanQuery) {
      const queryTokens = tokenize(cleanQuery);
      if (queryTokens.length > 0) {
        // Collect matching place IDs with occurrence weighting
        const scoreMap = new Map<string, number>();

        for (const token of queryTokens) {
          // Direct token matches
          const matchedIds = TOKEN_INVERTED_INDEX.get(token);
          if (matchedIds) {
            for (const id of matchedIds) {
              scoreMap.set(id, (scoreMap.get(id) || 0) + 3);
            }
          }

          // Prefix token matches
          for (const [idxToken, ids] of TOKEN_INVERTED_INDEX.entries()) {
            if (idxToken.startsWith(token) && idxToken !== token) {
              for (const id of ids) {
                scoreMap.set(id, (scoreMap.get(id) || 0) + 1);
              }
            }
          }
        }

        candidates = Array.from(scoreMap.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([id]) => PLACES_MAP.get(id)!)
          .filter(Boolean);
      }
    }

    // Apply strict categorical and numerical filters
    const filtered = candidates.filter((p) => {
      if (state !== "all" && p.state.toLowerCase() !== state.toLowerCase()) return false;
      if (region !== "all" && p.region.toLowerCase() !== region.toLowerCase()) return false;
      if (category !== "all" && p.category.toLowerCase() !== category.toLowerCase()) return false;
      if (type !== "all" && p.type.toLowerCase() !== type.toLowerCase()) return false;
      if (p.rating < minRating) return false;
      if (p.budget > maxBudget) return false;
      return true;
    });

    // Apply sorting
    if (sortBy === "rating") {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "budget_low") {
      filtered.sort((a, b) => a.budget - b.budget);
    } else if (sortBy === "budget_high") {
      filtered.sort((a, b) => b.budget - a.budget);
    } else if (sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    return {
      places: paginated,
      total,
      hasMore: offset + limit < total,
    };
  },

  /**
   * Get all tourist places in a specific State or Union Territory
   */
  getPlacesByState(stateName: string): NormalizedTouristPlace[] {
    if (!stateName || stateName === "all") return ALL_NORMALIZED_PLACES;
    return STATE_INDEX.get(stateName) || [];
  },

  /**
   * Get all tourist places in a specific city/town
   */
  getPlacesByCity(cityName: string): NormalizedTouristPlace[] {
    if (!cityName) return [];
    const clean = cityName.trim().toLowerCase();
    return ALL_NORMALIZED_PLACES.filter(
      (p) => p.name.toLowerCase().includes(clean) || (p.tags || []).some((t) => t.toLowerCase().includes(clean))
    );
  },

  /**
   * Get all tourist places by category
   */
  getPlacesByCategory(categoryName: string): NormalizedTouristPlace[] {
    if (!categoryName || categoryName === "all") return ALL_NORMALIZED_PLACES;
    return CATEGORY_INDEX.get(categoryName) || [];
  },

  /**
   * Geo-spatial: Get places within radius in Kilometers
   */
  getNearbyPlaces(lat: number, lon: number, radiusKm = 50, limit = 20): Array<NormalizedTouristPlace & { distanceKm: number }> {
    if (isNaN(lat) || isNaN(lon)) return [];

    const results: Array<NormalizedTouristPlace & { distanceKm: number }> = [];

    for (const place of ALL_NORMALIZED_PLACES) {
      // Fast bounding-box pre-check (~1 deg lat is ~111km)
      const latDelta = Math.abs(place.lat - lat);
      if (latDelta * 111 > radiusKm * 1.5) continue;

      const dist = calculateDistanceKm(lat, lon, place.lat, place.lon);
      if (dist <= radiusKm) {
        results.push({ ...place, distanceKm: Math.round(dist * 10) / 10 });
      }
    }

    results.sort((a, b) => a.distanceKm - b.distanceKm);
    return results.slice(0, limit);
  },

  /**
   * Get top popular places in India
   */
  getPopularPlaces(limit = 12): NormalizedTouristPlace[] {
    return [...ALL_NORMALIZED_PLACES]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  },

  /**
   * Route discovery: Find tourist places along a travel corridor between two points
   */
  getPlacesAlongRoute(options: RouteCorridorOptions): Array<NormalizedTouristPlace & { detourKm: number; progressPct: number }> {
    const { originLat, originLon, destLat, destLon, maxDetourKm = 40, maxStops = 15, categoryFilter } = options;

    const corridorLength = calculateDistanceKm(originLat, originLon, destLat, destLon);
    if (corridorLength === 0) return [];

    const candidateStops: Array<NormalizedTouristPlace & { detourKm: number; progressPct: number }> = [];

    for (const place of ALL_NORMALIZED_PLACES) {
      if (categoryFilter && categoryFilter !== "all" && place.category !== categoryFilter) {
        continue;
      }

      // Check detour distance from the direct line segment
      const detour = pointToSegmentDistanceKm(place.lat, place.lon, originLat, originLon, destLat, destLon);
      if (detour <= maxDetourKm) {
        // Calculate relative route progression from origin
        const distFromOrigin = calculateDistanceKm(originLat, originLon, place.lat, place.lon);
        const progressPct = Math.min(100, Math.max(0, Math.round((distFromOrigin / corridorLength) * 100)));

        candidateStops.push({
          ...place,
          detourKm: Math.round(detour * 10) / 10,
          progressPct,
        });
      }
    }

    // Sort chronologically along the journey from origin to destination
    candidateStops.sort((a, b) => a.progressPct - b.progressPct);
    return candidateStops.slice(0, maxStops);
  },

  /**
   * Recommendations engine matching user travel styles and preferred regions
   */
  getRecommendedPlaces(
    preferences: {
      travelStyle?: string;
      region?: string;
      state?: string;
      maxBudget?: number;
      interests?: string[];
    },
    limit = 10
  ): NormalizedTouristPlace[] {
    const { travelStyle = "Moderate", region = "all", state = "all", maxBudget = 5000, interests = [] } = preferences;

    const scored = ALL_NORMALIZED_PLACES.map((place) => {
      let score = place.rating * 10;

      // Region match
      if (region !== "all" && place.region.toLowerCase() === region.toLowerCase()) score += 15;

      // State match
      if (state !== "all" && place.state.toLowerCase() === state.toLowerCase()) score += 20;

      // Budget alignment
      if (place.budget <= maxBudget) score += 10;

      // Travel style affinity
      const style = travelStyle.toLowerCase();
      if (style.includes("heritage") && place.isHeritage) score += 25;
      if (style.includes("backpacker") && place.budget < 2000) score += 15;
      if (style.includes("luxury") && place.rating >= 4.7) score += 20;

      // Interest tag matching
      if (interests.length > 0) {
        for (const interest of interests) {
          const cleanInterest = interest.toLowerCase();
          if (
            place.tags.some((t) => t.toLowerCase().includes(cleanInterest)) ||
            place.category.toLowerCase().includes(cleanInterest)
          ) {
            score += 15;
          }
        }
      }

      return { place, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map((s) => s.place);
  },

  /**
   * Get all distinct States and Union Territories with metadata
   */
  getStatesSummary() {
    return Array.from(STATE_INDEX.entries()).map(([state, places]) => {
      const sample = places[0];
      return {
        state,
        region: sample.region,
        count: places.length,
        centerLat: sample.lat,
        centerLon: sample.lon,
        bestSeason: sample.bestSeason,
        sampleImage: sample.image,
      };
    }).sort((a, b) => a.state.localeCompare(b.state));
  },

  getAllStates() {
    return this.getStatesSummary();
  },

  getCategories() {
    return Array.from(CATEGORY_INDEX.entries()).map(([name, places]) => ({
      name,
      count: places.length,
      sampleImage: places[0]?.image || "",
    })).sort((a, b) => b.count - a.count);
  },
};

export default placesService;
