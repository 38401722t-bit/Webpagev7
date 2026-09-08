import { generateTripPilotResult, TripPilotResult } from "../../src/lib/tripPilotEngine";
import { getGemini } from "../providers/ai/geminiProvider";
import { DataRepository } from "../repositories/dataRepository";

export interface AISessionRun {
  message: string;
  response: TripPilotResult;
  timestamp: string;
}

export interface AISession {
  id: string;
  trip_id?: string;
  runs: AISessionRun[];
}

const aiSessionsStore = new Map<string, AISession>();

export class AITripPilotService {
  static getAgents() {
    return [
      { id: "planner", title: "Itinerary Planner", color: "sky", mission: "Turns destinations, dates, and budget into a balanced day-by-day itinerary." },
      { id: "route", title: "Route Agent", color: "emerald", mission: "Calculates shortest travel paths and surfaces intercity train and flight transit." },
      { id: "budget", title: "Budget Agent", color: "amber", mission: "Estimates budget, standard, and luxury costs for accommodations, transit, and food." },
      { id: "hotel", title: "Hotel Agent", color: "violet", mission: "Finds rated boutique hotels, heritage stays, and backpacker hostels." },
      { id: "food", title: "Food Agent", color: "rose", mission: "Curates iconic regional street food and must-visit heritage eateries." },
      { id: "weather", title: "Weather Agent", color: "cyan", mission: "Monitors real-time live temperatures, forecasts, and monsoon alerts." },
      { id: "safety", title: "Safety Agent", color: "red", mission: "Supplies essential emergency helpline numbers and practical local safety advice." },
      { id: "translator", title: "Translator Agent", color: "fuchsia", mission: "Translates everyday travel phrases into Hindi, Tamil, Bengali, and regional languages." },
    ];
  }

  static async processChat(message: string, tripId?: string, sessionId?: string): Promise<TripPilotResult> {
    const ai = getGemini();
    const trip = tripId ? await DataRepository.getTripById(tripId) : undefined;
    const result = await generateTripPilotResult(message, trip as any, ai);

    if (sessionId) {
      let sess = aiSessionsStore.get(sessionId);
      if (!sess) {
        sess = { id: sessionId, trip_id: tripId, runs: [] };
        aiSessionsStore.set(sessionId, sess);
      }
      sess.runs.push({ message, response: result, timestamp: new Date().toISOString() });
    }

    return result;
  }

  static getSession(sessionId: string): AISession {
    const sess = aiSessionsStore.get(sessionId);
    if (!sess) {
      return { id: sessionId, runs: [] };
    }
    return sess;
  }

  static recordSessionRun(sessionId: string, message: string, response: any, tripId?: string) {
    let sess = aiSessionsStore.get(sessionId);
    if (!sess) {
      sess = { id: sessionId, trip_id: tripId, runs: [] };
      aiSessionsStore.set(sessionId, sess);
    }
    sess.runs.push({ message, response, timestamp: new Date().toISOString() });
  }

  static async replan(tripId?: string, triggerType?: string, details?: string, sessionId?: string): Promise<TripPilotResult> {
    const trip = tripId ? await DataRepository.getTripById(tripId) : undefined;
    const replanMessage = `Replan itinerary to handle sudden weather change: ${details || triggerType}. Move outdoor sightseeing indoors and reschedule high-altitude viewpoints.`;
    const result = await generateTripPilotResult(replanMessage, trip as any, getGemini());
    result.intent = "replan";
    result.reply = `⚠️ **Trip Replanned for Sudden Weather Shift**: ${details || triggerType}

I have modified the affected days to keep you safe and comfortable:
- Shifted open palace courtyards and fort hill climbs to sheltered morning hours.
- Replaced exposed viewpoints with royal indoor stepwells and museum galleries.
- Adjusted travel transit windows with extra buffer.`;

    if (sessionId) {
      this.recordSessionRun(sessionId, `Replan: ${details || triggerType}`, result, tripId);
    }

    return result;
  }
}
