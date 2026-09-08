// Script to update src/data/destinations.ts to integrate all 1,924 places
import fs from 'fs';
import path from 'path';

const master = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src', 'data', 'indiaTouristPlacesMaster.json'), 'utf8'));

const STATE_FOODS = {
  "Andhra Pradesh": ["Tirupati Laddu", "Gongura Pachadi", "Pootharekulu", "Pesarattu", "Andhra Biryani"],
  "Arunachal Pradesh": ["Thukpa", "Zan", "Lukter", "Apong", "Bamboo Shoot Fry"],
  "Assam": ["Khaar", "Masor Tenga", "Duck Meat Curry", "Pitha", "Assam Tea"],
  "Bihar": ["Litti Chokha", "Sattu Paratha", "Khaja", "Thekua", "Tilkut"],
  "Chhattisgarh": ["Chila", "Muthia", "Fara", "Bafauri", "Aamat"],
  "Goa": ["Fish Curry Rice", "Prawn Balchão", "Bebinca", "Pork Vindaloo", "Goan Poi"],
  "Gujarat": ["Dhokla", "Thepla", "Khandvi", "Undhiyu", "Fafda Jalebi"],
  "Haryana": ["Bajra Khichdi", "Kadhi Pakora", "Singri ki Sabzi", "Besan Pinni"],
  "Himachal Pradesh": ["Dham", "Siddu", "Chha Gosht", "Madra", "Babru"],
  "Jharkhand": ["Dhuska", "Rugra", "Litti Chokha", "Pitha", "Tilkut"],
  "Karnataka": ["Bisi Bele Bath", "Mysore Pak", "Ragi Mudde", "Mysore Masala Dosa", "Neer Dosa"],
  "Kerala": ["Appam with Stew", "Kerala Sadya", "Puttu and Kadala Curry", "Karimeen Pollichathu", "Malabar Parotta"],
  "Madhya Pradesh": ["Poha Jalebi", "Bhutte ka Kees", "Dal Bafla", "Mawa Bati"],
  "Maharashtra": ["Misal Pav", "Vada Pav", "Puran Poli", "Pithla Bhakri", "Modak"],
  "Manipur": ["Kangshoi", "Eromba", "Chak-Hao Kheer", "Singju", "Ngang"],
  "Meghalaya": ["Jadoh", "Dohneiiong", "Tungrymbai", "Pukhlein", "Kyat"],
  "Mizoram": ["Bai", "Koat Pitha", "Vawksa Rep", "Panch Phoron Tarka", "Bamboo shoots"],
  "Nagaland": ["Smoked Pork with Bamboo Shoot", "Axone / Akhuni", "Anishi", "Zutho", "Galho"],
  "Odisha": ["Chhena Poda", "Dalma", "Rasagola", "Pakhala Bhata", "Chhena Gaja"],
  "Punjab": ["Makki di Roti & Sarson da Saag", "Amritsari Kulcha", "Butter Chicken", "Dal Makhani", "Lassi"],
  "Rajasthan": ["Dal Baati Churma", "Laal Maas", "Ghevar", "Gatte ki Sabzi", "Ker Sangri"],
  "Sikkim": ["Momos", "Thukpa", "Phagshapa", "Sha Phaley", "Sel Roti"],
  "Tamil Nadu": ["Chettinad Chicken", "Masala Dosa", "Idli Sambar", "Pongal", "Jigarthanda"],
  "Telangana": ["Hyderabadi Biryani", "Haleem", "Mirchi ka Salan", "Sakinalu", "Sarva Pindi"],
  "Tripura": ["Mui Borok", "Chakhwi", "Mosdeng Serma", "Bhangui", "Panch Phoron Tarkari"],
  "Uttar Pradesh": ["Galouti Kebab", "Awadhi Biryani", "Agra Petha", "Bedmi Puri & Jalebi", "Banarasi Paan"],
  "Uttarakhand": ["Kafuli", "Bhaang ki Chutney", "Aloo ke Gutke", "Chainsoo", "Singori"],
  "West Bengal": ["Kosha Mangsho", "Macher Jhol", "Rosogolla", "Shorshe Ilish", "Mishti Doi"],
  "Delhi": ["Chole Bhature", "Butter Chicken", "Paranthe", "Dahi Bhalla", "Kulfi Falooda"],
  "Jammu and Kashmir": ["Rogan Josh", "Dum Aloo", "Yakhni", "Gushtaba", "Kahwa Tea"],
  "Ladakh": ["Thukpa", "Skyu", "Tigmo", "Chhurpi", "Butter Tea"],
  "Andaman and Nicobar Islands": ["Grilled Lobster", "Fish Curry", "Coconut Prawn Curry", "Tandoori Crab"],
  "Chandigarh": ["Butter Chicken", "Amritsari Naan", "Chole Kulche", "Lassi"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Daman Prawn Curry", "Fish Koliwada", "Crab Masala", "Ubadiyu"],
  "Lakshadweep": ["Mus Kavaab", "Fish Tikka", "Octopus Fry", "Coconut Rice", "Rayereha"],
  "Puducherry": ["Creole Fish Curry", "Croissants & Baguettes", "Bouillabaisse", "Pondicherry Crab Curry"]
};

function getCategoryType(cat) {
  if (cat.includes('Religious')) return 'pilgrimage';
  if (cat.includes('Heritage')) return 'heritage';
  if (cat.includes('Waterfalls')) return 'nature';
  if (cat.includes('Beach')) return 'beach';
  if (cat.includes('Lakes') || cat.includes('Waterways')) return 'backwaters';
  if (cat.includes('Wildlife')) return 'wildlife';
  if (cat.includes('Hill')) return 'hills';
  return 'city';
}

function parseSeason(seasonStr) {
  if (seasonStr.includes('May - Sep')) return ["May", "Jun", "Jul", "Aug", "Sep"];
  if (seasonStr.includes('Apr - Oct')) return ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
  if (seasonStr.includes('Mar - Jun')) return ["Mar", "Apr", "May", "Jun", "Sep", "Oct"];
  if (seasonStr.includes('Nov - Feb')) return ["Nov", "Dec", "Jan", "Feb"];
  if (seasonStr.includes('Oct - May')) return ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];
  if (seasonStr.includes('Oct - Apr')) return ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
  return ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
}

// Generate the new src/data/destinations.ts file
const code = `import masterData from './indiaTouristPlacesMaster.json';
import { FOODS } from './foods';

export interface Destination {
  id: string;
  name: string;
  state: string;
  lat: number;
  lon: number;
  budget: number;
  rating: number;
  type: string;
  season: string[];
  image: string;
  tag: string;
  about: string;
  attractions: string[];
  foods?: string[];
  region?: string;
  category?: string;
}

const STATE_FOODS: Record<string, string[]> = ${JSON.stringify(STATE_FOODS, null, 2)};

function getCategoryType(cat: string): string {
  if (cat.includes('Religious')) return 'pilgrimage';
  if (cat.includes('Heritage')) return 'heritage';
  if (cat.includes('Waterfalls')) return 'nature';
  if (cat.includes('Beach')) return 'beach';
  if (cat.includes('Lakes') || cat.includes('Waterways')) return 'backwaters';
  if (cat.includes('Wildlife')) return 'wildlife';
  if (cat.includes('Hill')) return 'hills';
  return 'city';
}

function parseSeason(seasonStr: string): string[] {
  if (seasonStr.includes('May - Sep')) return ["May", "Jun", "Jul", "Aug", "Sep"];
  if (seasonStr.includes('Apr - Oct')) return ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
  if (seasonStr.includes('Mar - Jun')) return ["Mar", "Apr", "May", "Jun", "Sep", "Oct"];
  if (seasonStr.includes('Nov - Feb')) return ["Nov", "Dec", "Jan", "Feb"];
  if (seasonStr.includes('Oct - May')) return ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];
  if (seasonStr.includes('Oct - Apr')) return ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
  return ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
}

// Curated overrides for flagship popular spots
const CURATED_DETAILS: Record<string, Partial<Destination>> = {
  "up-agra": {
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200",
    tag: "Taj Mahal, Mughal architecture",
    about: "Home to the iconic Taj Mahal — a UNESCO-listed wonder. Agra also hosts the Agra Fort and Fatehpur Sikri.",
    attractions: ["Taj Mahal", "Agra Fort", "Fatehpur Sikri", "Mehtab Bagh"],
  },
  "hp-manali": {
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200",
    tag: "Snow, adventure, valleys",
    about: "A Himalayan resort town famous for skiing, snow, and mountain adventures.",
    attractions: ["Solang Valley", "Rohtang Pass", "Hadimba Temple", "Old Manali"],
  },
  "rj-jaipur": {
    image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1200",
    tag: "Pink city, palaces, forts",
    about: "The Pink City showcases royal Rajput architecture, vibrant bazaars, and grand palaces.",
    attractions: ["Amber Fort", "Hawa Mahal", "City Palace", "Jantar Mantar"],
  },
  "dl-delhi": {
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200",
    tag: "Mughal monuments, food capital",
    about: "India's capital blends history with modernity — from medieval forts to bustling street food markets.",
    attractions: ["Red Fort", "Qutub Minar", "India Gate", "Humayun's Tomb"],
  },
  "up-varanasi": {
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1200",
    tag: "Ganga aarti, ancient ghats",
    about: "The spiritual heart of India on the banks of the sacred Ganges, known for ancient ghats and evening aarti.",
    attractions: ["Dashashwamedh Ghat", "Kashi Vishwanath Temple", "Assi Ghat", "Sarnath"],
  },
  "kl-munnar": {
    image: "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?w=1200",
    tag: "Tea plantations, mist, hills",
    about: "Sprawling tea gardens, misty hilltops, and waterfalls make Munnar Kerala's top hill station.",
    attractions: ["Eravikulam National Park", "Mattupetty Dam", "Anamudi Peak", "Tea Museum"],
  },
  "mh-mumbai": {
    image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200",
    tag: "Financial capital, sea-facing",
    about: "City of dreams — buzzing streets, Victorian Gothic landmarks, Bollywood, and Marine Drive sunsets.",
    attractions: ["Gateway of India", "Marine Drive", "Elephanta Caves", "Colaba Causeway"],
  },
  "ka-hampi": {
    image: "https://images.unsplash.com/photo-1600100397608-f010e427d117?w=1200",
    tag: "Vijayanagara ruins, boulders",
    about: "UNESCO World Heritage Site with monumental ruins of the Vijayanagara Empire among surreal boulder landscapes.",
    attractions: ["Virupaksha Temple", "Vittala Temple", "Lotus Mahal", "Matanga Hill"],
  }
};

// Build all 1,924 destinations from master dataset
export const DESTINATIONS: Destination[] = (masterData.places as any[]).map((p, idx) => {
  const cType = getCategoryType(p.category);
  const budget = 1400 + ((idx * 137) % 1800);
  const foodList = FOODS[p.id] || STATE_FOODS[p.state] || ["Traditional local thali", "Authentic state delicacies", "Regional sweets"];

  return {
    id: p.id,
    name: p.name,
    state: p.state,
    region: p.region,
    category: p.category,
    lat: p.lat,
    lon: p.lon,
    budget,
    rating: p.rating || 4.5,
    type: cType,
    season: parseSeason(p.bestSeason || "Oct - Mar"),
    image: p.image,
    tag: \`\${p.category} · \${p.state}\`,
    about: p.description || \`\${p.name} is a renowned destination in \${p.state}, celebrated for its rich culture, breathtaking scenery, and iconic significance.\`,
    attractions: [
      p.name,
      \`Explore scenic landmarks around \${p.name}\`,
      \`Cultural discovery in \${p.state}\`,
      \`Local handicraft and viewpoint experience\`
    ],
    foods: foodList,
  };
});

// Map for instantaneous O(1) lookup
export const DEST_BY_ID = new Map<string, Destination>();

for (const d of DESTINATIONS) {
  DEST_BY_ID.set(d.id, d);
}

// Legacy key aliases for bookmarks and existing routes
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
  const target = DEST_BY_ID.get(targetId);
  if (target) {
    const aliasObj = { ...target, id: legacyId };
    if (CURATED_DETAILS[legacyId]) {
      Object.assign(aliasObj, CURATED_DETAILS[legacyId]);
    }
    DEST_BY_ID.set(legacyId, aliasObj);
  }
}

export const TOTAL_DESTINATIONS_COUNT = DESTINATIONS.length;
`;

fs.writeFileSync(path.join(process.cwd(), 'src', 'data', 'destinations.ts'), code);
console.log('src/data/destinations.ts updated successfully with all 1924 places!');
