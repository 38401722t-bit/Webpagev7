import { DEST_BY_ID } from "../../src/data/destinations";

export interface BudgetEstimateInput {
  destination_ids?: string[];
  days?: number;
  people?: number;
  adults?: number;
  children?: number;
  seniors?: number;
  party_type?: "Solo" | "Couple" | "Family" | "Friends" | "Group" | "Custom";
  transport?: "Train" | "Flight" | "Bus" | "Road" | "Cab" | "Self-Drive";
  hotel_level?: "budget" | "comfort" | "standard" | "premium" | "luxury";
  food_preference?: "Vegetarian" | "Non-Vegetarian" | "Street Food" | "Fine Dining" | "Mixed";
}

export class BudgetService {
  static estimate(params: BudgetEstimateInput) {
    const days = Math.max(1, Math.min(60, Number(params.days) || 5));
    const people = Math.max(1, Math.min(50, Number(params.people) || 2));
    const adults = Math.max(1, Number(params.adults) || (params.party_type === "Solo" ? 1 : people));
    const children = Math.max(0, Number(params.children) || 0);
    const seniors = Math.max(0, Number(params.seniors) || 0);

    const transportMode = params.transport || "Train";
    const hotelLevel = params.hotel_level || "comfort";

    // Room count optimization: 2 people per room; odd numbers get extra bed or room
    const rooms = Math.ceil(people / 2);

    // Baseline daily destination cost
    let baseDailyCost = 2800;
    if (params.destination_ids && params.destination_ids.length > 0) {
      const valid = params.destination_ids.map((id) => DEST_BY_ID.get(id)).filter(Boolean);
      if (valid.length > 0) {
        baseDailyCost = Math.round(valid.reduce((sum, d: any) => sum + d.budget, 0) / valid.length);
      }
    }

    // Transport Rates (roundtrip per person)
    const transportRates: Record<string, { budget: number; standard: number; luxury: number }> = {
      Train: { budget: 750, standard: 1800, luxury: 3600 },
      Flight: { budget: 4500, standard: 7500, luxury: 14000 },
      Bus: { budget: 600, standard: 1200, luxury: 2200 },
      Road: { budget: 1000, standard: 2200, luxury: 4500 },
      Cab: { budget: 2500, standard: 4500, luxury: 8500 },
      "Self-Drive": { budget: 1800, standard: 3200, luxury: 6000 },
    };

    // Accommodation Rates (per room per night)
    const hotelRates: Record<string, { budget: number; standard: number; luxury: number }> = {
      budget: { budget: 800, standard: 1400, luxury: 2400 },
      comfort: { budget: 1800, standard: 3200, luxury: 5500 },
      standard: { budget: 1800, standard: 3200, luxury: 5500 },
      premium: { budget: 3500, standard: 6500, luxury: 12000 },
      luxury: { budget: 5500, standard: 10500, luxury: 22000 },
    };

    const tTier = transportRates[transportMode] || transportRates.Train;
    const hTier = hotelRates[hotelLevel] || hotelRates.comfort;

    // Calculate Tiers
    const calculateForTier = (tier: "budget" | "standard" | "luxury") => {
      // Child travel discounts: 30% off transport, 40% off food & activities
      const effectiveTransportUnits = adults + seniors * 0.9 + children * 0.7;
      const effectiveFoodUnits = adults + seniors + children * 0.6;

      const transportCost = Math.round(tTier[tier] * effectiveTransportUnits);
      const hotelCost = Math.round(hTier[tier] * rooms * days);

      const dailyFoodPerHead = tier === "budget" ? 450 : tier === "standard" ? 950 : 2200;
      const foodCost = Math.round(dailyFoodPerHead * effectiveFoodUnits * days);

      const dailyActivitiesPerHead = tier === "budget" ? 250 : tier === "standard" ? 600 : 1500;
      const activitiesCost = Math.round(dailyActivitiesPerHead * (adults + seniors + children * 0.5) * days);

      const dailyLocalTransit = tier === "budget" ? 200 * people : tier === "standard" ? 500 * people : 1400 * people;
      const localTransitCost = Math.round(dailyLocalTransit * days);

      const subtotal = transportCost + hotelCost + foodCost + activitiesCost + localTransitCost;
      const bufferCost = Math.round(subtotal * 0.08); // 8% contingency buffer
      const total = subtotal + bufferCost;

      return {
        total,
        per_person: Math.round(total / people),
        per_day: Math.round(total / days),
        breakdown: [
          { category: "Intercity Transport", amount: transportCost, note: `${transportMode} tickets & transfers` },
          { category: "Hotel & Stay", amount: hotelCost, note: `${rooms} room(s) for ${days} nights (${hotelLevel} tier)` },
          { category: "Meals & Dining", amount: foodCost, note: `Regional breakfast, lunch, snacks & thali meals` },
          { category: "Monuments & Entry Fees", amount: activitiesCost, note: `Archaeological Survey of India (ASI) passes & guide tours` },
          { category: "Local Transit & Auto/Cabs", amount: localTransitCost, note: `In-city cabs, metros, autos and ferry rides` },
          { category: "Contingency & Emergency Buffer", amount: bufferCost, note: `8% reserve for unexpected expenses` },
        ],
      };
    };

    const budgetCalc = calculateForTier("budget");
    const standardCalc = calculateForTier("standard");
    const luxuryCalc = calculateForTier("luxury");

    return {
      days,
      people,
      party_type: params.party_type || (people === 1 ? "Solo" : people === 2 ? "Couple" : people <= 4 ? "Family" : "Friends"),
      composition: { adults, children, seniors, rooms },
      transport_mode: transportMode,
      hotel_level: hotelLevel,
      standard: standardCalc,
      budget: budgetCalc,
      luxury: luxuryCalc,
      tiers: {
        budget: budgetCalc.total,
        standard: standardCalc.total,
        luxury: luxuryCalc.total,
      },
      per_person_standard: standardCalc.per_person,
      per_day_standard: standardCalc.per_day,
      breakdown: standardCalc.breakdown,
    };
  }
}
