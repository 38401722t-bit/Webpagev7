/**
 * Exploro India - Generate Place Slugs Script
 * Generates URL-friendly, SEO-optimized slugs for all places.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const masterPath = path.join(__dirname, '../src/data/indiaTouristPlacesMaster.json');
const data = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
const places = data.places || [];

console.log(`\n🔤 Generating URL slugs for ${places.length} places...`);

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const slugSet = new Set();
let updatedCount = 0;

for (const p of places) {
  let baseSlug = `${slugify(p.state)}-${slugify(p.name)}`;
  let slug = baseSlug;
  let counter = 1;

  while (slugSet.has(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  slugSet.add(slug);
  p.slug = slug;
  updatedCount++;
}

data.places = places;
fs.writeFileSync(masterPath, JSON.stringify(data, null, 2), 'utf8');

console.log(`✅ Generated ${updatedCount} unique slugs.`);
console.log(`Sample slug: ${places[0].slug}`);
console.log(`Master dataset saved successfully.\n`);
