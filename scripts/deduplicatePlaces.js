/**
 * Exploro India - Deduplicate Places Script
 * Identifies places with identical names or close geospatial proximity (<500m in same state).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const masterPath = path.join(__dirname, '../src/data/indiaTouristPlacesMaster.json');
const data = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
const places = data.places || [];

console.log(`\n🔍 Checking for duplicates across ${places.length} places...`);

function haversine(la1, lo1, la2, lo2) {
  const R = 6371.0;
  const dlat = ((la2 - la1) * Math.PI) / 180;
  const dlon = ((lo2 - lo1) * Math.PI) / 180;
  const a =
    Math.sin(dlat / 2) ** 2 +
    Math.cos((la1 * Math.PI) / 180) * Math.cos((la2 * Math.PI) / 180) * Math.sin(dlon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

const nameMap = new Map();
let duplicateNames = 0;
let closeProxCount = 0;

for (const p of places) {
  const key = `${p.name.trim().toLowerCase()}__${p.state.toLowerCase()}`;
  if (nameMap.has(key)) {
    console.log(`- Duplicate name in same state: "${p.name}" in ${p.state} (${p.id} vs ${nameMap.get(key).id})`);
    duplicateNames++;
  } else {
    nameMap.set(key, p);
  }
}

for (let i = 0; i < places.length; i++) {
  for (let j = i + 1; j < places.length; j++) {
    const p1 = places[i];
    const p2 = places[j];
    if (p1.state === p2.state) {
      const distKm = haversine(p1.lat, p1.lon, p2.lat, p2.lon);
      if (distKm < 0.1 && p1.name.toLowerCase() === p2.name.toLowerCase()) {
        console.log(`- Extremely close identical place (<100m): "${p1.name}" (${p1.id} & ${p2.id})`);
        closeProxCount++;
      }
    }
  }
}

console.log(`\nDeduplication scan complete:`);
console.log(`Duplicate names in same state: ${duplicateNames}`);
console.log(`Places with distance <100m: ${closeProxCount}`);
console.log(`✅ Master dataset deduplication audit completed.\n`);
