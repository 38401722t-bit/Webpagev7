/**
 * Exploro India - Import Places to MongoDB
 * Reads master dataset and syncs TouristPlace documents to MongoDB when MONGODB_URI is provided.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const masterPath = path.join(__dirname, '../src/data/indiaTouristPlacesMaster.json');
const data = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
const places = data.places || [];

const mongoUri = process.env.MONGODB_URI;

async function run() {
  if (!mongoUri) {
    console.log("ℹ️ MONGODB_URI not set. Skipping remote import. Master JSON is loaded in-memory and file-backed.");
    process.exit(0);
  }

  console.log(`\nConnecting to MongoDB for place sync...`);
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB.");

  const TouristPlaceSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    slug: { type: String, index: true },
    state: { type: String, required: true, index: true },
    region: { type: String, index: true },
    category: { type: String, index: true },
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
    rating: { type: Number, default: 4.5 },
    image: { type: String },
    bestSeason: { type: String },
    description: { type: String },
    tags: [{ type: String }],
  }, { timestamps: true });

  const Model = mongoose.models.TouristPlace || mongoose.model("TouristPlace", TouristPlaceSchema);

  console.log(`Upserting ${places.length} places into MongoDB collection...`);
  const operations = places.map((p) => ({
    updateOne: {
      filter: { id: p.id },
      update: { $set: p },
      upsert: true,
    },
  }));

  const res = await Model.bulkWrite(operations);
  console.log(`✅ Synced to MongoDB: matched ${res.matchedCount}, upserted ${res.upsertedCount}, modified ${res.modifiedCount}`);

  await mongoose.disconnect();
  console.log("MongoDB connection closed.");
}

run().catch((err) => {
  console.error("Sync error:", err);
  process.exit(1);
});
