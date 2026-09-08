import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

// Ensure JWT secret is secure. In development, generate a cryptographically strong fallback if omitted.
const DEFAULT_DEV_JWT_SECRET = process.env.NODE_ENV === "production"
  ? "" 
  : (process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex"));

function parseMongoUri(rawUri?: string): string {
  if (!rawUri) return "";
  const trimmed = rawUri.trim();
  if (trimmed.startsWith("mongodb://") || trimmed.startsWith("mongodb+srv://")) {
    return trimmed;
  }
  return "";
}

export const CONFIG = {
  PORT: parseInt(process.env.PORT || "3000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  JWT_SECRET: process.env.JWT_SECRET || DEFAULT_DEV_JWT_SECRET,
  MONGODB_URI: parseMongoUri(process.env.MONGODB_URI),
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  PEXELS_API_KEY: process.env.PEXELS_API_KEY || "",
  UNSPLASH_ACCESS_KEY: process.env.UNSPLASH_ACCESS_KEY || "",
  WEATHER_API_KEY: process.env.WEATHER_API_KEY || "",
  PLACES_API_KEY: process.env.PLACES_API_KEY || "",
  ROUTING_API_KEY: process.env.ROUTING_API_KEY || "",
  APP_URL: process.env.APP_URL || "",
};

if (!CONFIG.JWT_SECRET && process.env.NODE_ENV === "production") {
  console.warn("⚠️ WARNING: JWT_SECRET is not set in production environment!");
}
