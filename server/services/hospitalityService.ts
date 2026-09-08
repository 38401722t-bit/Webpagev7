import { DEST_BY_ID, DESTINATIONS } from "../../src/data/destinations";
import { FOODS } from "../../src/data/foods";

export class HospitalityService {
  static getHotels(destId?: string) {
    const list: any[] = [];
    const targets = destId && DEST_BY_ID.has(destId) ? [DEST_BY_ID.get(destId)!] : DESTINATIONS;

    for (const d of targets) {
      list.push(
        {
          id: `ht-${d.id}-1`,
          destination_id: d.id,
          destination_name: d.name,
          state: d.state,
          name: `${d.name} Heritage Haveli & Spa`,
          price_per_night_inr: Math.round(d.budget * 0.9),
          rating: 4.8,
          tier: "Luxury / Heritage",
          amenities: ["Free WiFi", "Pool", "Breakfast Included", "Cultural Shows", "Ayurvedic Spa"],
          area: "Historic Center",
          image: d.image,
          data_status: "recommended",
          booking_provider: "Curated Heritage Partner",
        },
        {
          id: `ht-${d.id}-2`,
          destination_id: d.id,
          destination_name: d.name,
          state: d.state,
          name: `Zostel & Backpacker Inn ${d.name}`,
          price_per_night_inr: Math.round(d.budget * 0.35),
          rating: 4.5,
          tier: "Budget / Hostels",
          amenities: ["Free WiFi", "Community Lounge", "Rooftop Cafe", "Walking Tours"],
          area: "Old Quarter",
          image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
          data_status: "recommended",
          booking_provider: "Backpacker Community",
        },
        {
          id: `ht-${d.id}-3`,
          destination_id: d.id,
          destination_name: d.name,
          state: d.state,
          name: `${d.name} Grand Comfort Suites`,
          price_per_night_inr: Math.round(d.budget * 0.6),
          rating: 4.6,
          tier: "Standard / Boutique",
          amenities: ["Free WiFi", "AC", "Multi-cuisine Restaurant", "Travel Desk"],
          area: "City Center",
          image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
          data_status: "estimated",
          booking_provider: "Direct Booking",
        }
      );
    }
    return list;
  }

  static getRestaurants(destId?: string) {
    const list: any[] = [];
    const targets = destId && DEST_BY_ID.has(destId) ? [DEST_BY_ID.get(destId)!] : DESTINATIONS;

    for (const d of targets) {
      const foodItem = FOODS.find((f) => f.destination_id === d.id);
      list.push(
        {
          id: `rest-${d.id}-1`,
          destination_id: d.id,
          destination_name: d.name,
          name: `Royal ${d.name} Thali House`,
          cuisine: `${d.state} Traditional & Regional`,
          must_try: foodItem?.dish || d.foods[0] || "Regional Thali",
          price_for_two_inr: 750,
          rating: 4.9,
          type: "Vegetarian / Heritage",
          address: `Near Main Monument, ${d.name}`,
          data_status: "recommended",
        },
        {
          id: `rest-${d.id}-2`,
          destination_id: d.id,
          destination_name: d.name,
          name: `${d.name} Street Food & Kulfi Corner`,
          cuisine: "Street Delights & Chaat",
          must_try: d.foods[1] || "Kachori & Masala Chai",
          price_for_two_inr: 250,
          rating: 4.7,
          type: "Iconic Street Food",
          address: `Bazaar Street, ${d.name}`,
          data_status: "recommended",
        }
      );
    }
    return list;
  }

  static getFoods(destId?: string) {
    if (destId) {
      return FOODS.filter((f) => f.destination_id === destId);
    }
    return FOODS;
  }
}
