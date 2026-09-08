import mongoose from "mongoose";
import { CONFIG } from "./env";

let isConnected = false;

export function isValidMongoUri(uri?: string): boolean {
  if (!uri) return false;
  const trimmed = uri.trim();
  return trimmed.startsWith("mongodb://") || trimmed.startsWith("mongodb+srv://");
}

export async function connectDatabase(): Promise<boolean> {
  const uri = CONFIG.MONGODB_URI?.trim();

  if (!uri || !isValidMongoUri(uri)) {
    console.log("ℹ️ MongoDB: MONGODB_URI not configured or invalid scheme. Operating in high-performance memory/local persistence mode.");
    return false;
  }

  if (isConnected) return true;

  try {
    console.log("Connecting to MongoDB instance...");
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    isConnected = true;
    console.log("✅ MongoDB successfully connected.");

    mongoose.connection.on("error", (err) => {
      console.warn("MongoDB connection notice:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("ℹ️ MongoDB disconnected. Operating in memory fallback mode.");
      isConnected = false;
    });

    return true;
  } catch (error: any) {
    console.log("ℹ️ MongoDB unavailable:", error.message);
    console.log("ℹ️ Operating in high-performance memory/local storage mode to ensure continuous availability.");
    return false;
  }
}

export function isDbConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

export async function closeDatabase(): Promise<void> {
  if (isConnected) {
    try {
      await mongoose.disconnect();
      isConnected = false;
      console.log("MongoDB connection closed gracefully.");
    } catch (e) {
      console.error("Error during MongoDB disconnection:", e);
    }
  }
}
