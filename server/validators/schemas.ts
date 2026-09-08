import { z } from "zod";

// Auth
export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long").trim(),
  email: z.string().email("Invalid email address").max(120).trim(),
  password: z.string().min(6, "Password must be at least 6 characters").max(120),
  phone: z.string().max(30).nullable().optional(),
}).passthrough();

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address").max(120).trim(),
  password: z.string().min(1, "Password required").max(120),
}).passthrough();

export const ProfileUpdateSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  phone: z.string().max(30).nullable().optional(),
}).passthrough();

// Search & Destinations
export const PlacesSearchSchema = z.object({
  q: z.string().max(200).optional(),
  query: z.string().max(200).optional(),
  state: z.string().max(100).optional(),
  region: z.string().max(50).optional(),
  category: z.string().max(100).optional(),
  type: z.string().max(100).optional(),
  sortBy: z.string().max(50).optional(),
  limit: z.coerce.number().min(1).max(2500).optional(),
  offset: z.coerce.number().min(0).optional(),
}).passthrough();

export const NearbyPlacesSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(1).max(5000).optional(),
  limit: z.coerce.number().min(1).max(500).optional(),
}).passthrough();

// Route
export const ShortestRouteSchema = z.object({
  destination_ids: z.array(z.string().min(1).max(150)).min(2, "At least 2 destination IDs required").max(50),
  start_id: z.string().max(150).nullable().optional(),
}).passthrough();

export const RouteExploreSchema = z.object({
  from_id: z.string().max(150).optional(),
  to_id: z.string().max(150).optional(),
  from: z.string().max(150).optional(),
  to: z.string().max(150).optional(),
  maxDetourKm: z.coerce.number().min(1).max(500).optional(),
  max_detour_km: z.coerce.number().min(1).max(500).optional(),
}).passthrough()
  .refine(data => data.from_id || data.from, { message: "Origin is required" })
  .refine(data => data.to_id || data.to, { message: "Destination is required" });

// Budget
export const BudgetEstimateSchema = z.object({
  destination_ids: z.array(z.string().max(150)).max(50).optional(),
  days: z.coerce.number().min(1).max(100).default(5),
  people: z.coerce.number().min(1).max(100).default(2),
  adults: z.coerce.number().min(1).max(100).optional(),
  children: z.coerce.number().min(0).max(50).optional(),
  seniors: z.coerce.number().min(0).max(50).optional(),
  party_type: z.string().max(50).optional(),
  transport: z.string().max(50).default("Train"),
  hotel_level: z.string().max(50).optional(),
  food_preference: z.string().max(50).optional(),
}).passthrough();

// Wishlist
export const WishlistAddSchema = z.object({
  destination_id: z.string().min(1).max(150),
  notes: z.string().max(1000).nullable().optional(),
  status: z.string().max(50).default("planned"),
}).passthrough();

// Trip
export const TripCreateSchema = z.object({
  title: z.string().min(1, "Title must be at least 1 character").max(150).trim(),
  destination_ids: z.array(z.string().max(150)).max(50).default([]),
  destination_name: z.string().max(150).optional(),
  start_date: z.string().max(40).optional(),
  end_date: z.string().max(40).optional(),
  days: z.coerce.number().min(1).max(100).optional(),
  traveler_count: z.coerce.number().min(1).max(100).optional(),
  budget: z.coerce.number().min(0).max(50000000).default(25000),
  travel_style: z.string().max(80).optional(),
  notes: z.string().max(2000).optional(),
  members: z.array(z.string()).max(50).optional(),
}).passthrough();

// Alerts
export const AlertCreateSchema = z.object({
  title: z.string().max(150).optional(),
  message: z.string().max(2000).optional(),
  level: z.string().max(50).default("info"),
  destination_id: z.string().max(150).optional(),
  from: z.string().max(100).optional(),
  to: z.string().max(100).optional(),
  mode: z.string().max(50).optional(),
  target_price_inr: z.coerce.number().optional(),
}).passthrough();

// Feedback
export const FeedbackCreateSchema = z.object({
  destination_id: z.string().min(1).max(150),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().max(2000).optional(),
  photo_path: z.string().max(500).nullable().optional(),
}).passthrough();

// AI Chat
export const AIChatSchema = z
  .object({
    message: z.string().max(5000).optional(),
    prompt: z.string().max(5000).optional(),
    trip_id: z.string().max(100).nullable().optional(),
    session_id: z.string().max(100).nullable().optional(),
  })
  .passthrough()
  .refine(
    (data) => Boolean((data.message && data.message.trim()) || (data.prompt && data.prompt.trim())),
    {
      message: "Message or prompt is required",
      path: ["message"],
    }
  )
  .transform((data) => ({
    message: (data.message || data.prompt || "").trim(),
    prompt: data.prompt,
    trip_id: data.trip_id || undefined,
    session_id: data.session_id || undefined,
  }));

// Image Search
export const ImageSearchSchema = z.object({
  place: z.string().min(1).max(150).trim(),
  state: z.string().max(100).optional(),
  limit: z.coerce.number().min(1).max(50).default(3),
}).passthrough();
