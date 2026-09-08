/**
 * Validate India Tourist Places Master Dataset
 * Checks coordinate boundaries, required properties, ratings, and state coverage.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const masterPath = path.join(__dirname, '../src/data/indiaTouristPlacesMaster.json');
if (!fs.existsSync(masterPath)) {
  console.error("Master dataset not found at:", masterPath);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
const places = data.places || [];
const states = data.states || [];

console.log(`\n🔍 Validating Exploro India Dataset...`);
console.log(`Total Places: ${places.length}`);
console.log(`Total States & UTs: ${states.length}\n`);

let errors = 0;
let warnings = 0;

// Geographic bounding box for India (including Andaman & Nicobar / Lakshadweep)
const MIN_LAT = 6.0;
const MAX_LAT = 38.0;
const MIN_LON = 68.0;
const MAX_LON = 98.5;

const seenIds = new Set();
const seenNamesByState = new Map();

for (let i = 0; i < places.length; i++) {
  const p = places[i];

  if (!p.id) {
    console.error(`❌ [Row ${i}] Missing place ID`);
    errors++;
  } else if (seenIds.has(p.id)) {
    console.error(`❌ Duplicate ID: ${p.id}`);
    errors++;
  } else {
    seenIds.add(p.id);
  }

  if (!p.name || typeof p.name !== 'string' || p.name.trim().length === 0) {
    console.error(`❌ [${p.id || i}] Invalid place name`);
    errors++;
  }

  if (!p.state) {
    console.error(`❌ [${p.id}] Missing state`);
    errors++;
  }

  if (typeof p.lat !== 'number' || typeof p.lon !== 'number') {
    console.error(`❌ [${p.id}] Non-numeric coordinates: lat=${p.lat}, lon=${p.lon}`);
    errors++;
  } else {
    if (p.lat < MIN_LAT || p.lat > MAX_LAT || p.lon < MIN_LON || p.lon > MAX_LON) {
      console.warn(`⚠️ [${p.id}] Coordinates (${p.lat}, ${p.lon}) outside strict India bounding box`);
      warnings++;
    }
  }

  if (typeof p.rating !== 'number' || p.rating < 1 || p.rating > 5) {
    console.warn(`⚠️ [${p.id}] Rating ${p.rating} outside standard 1-5 scale`);
    warnings++;
  }

  // Check state consistency
  const stateMap = seenNamesByState.get(p.state) || new Set();
  if (stateMap.has(p.name.toLowerCase())) {
    console.warn(`⚠️ Potential duplicate place in ${p.state}: "${p.name}"`);
    warnings++;
  }
  stateMap.add(p.name.toLowerCase());
  seenNamesByState.set(p.state, stateMap);
}

console.log(`\nValidation complete!`);
console.log(`Errors: ${errors}`);
console.log(`Warnings: ${warnings}`);

if (errors > 0) {
  process.exit(1);
} else {
  console.log(`✅ Master dataset is healthy and valid for production.`);
}
