import { Router, Request, Response } from "express";
import { AITripPilotService } from "../services/aiTripPilotService";
import { optionalToken, AuthenticatedRequest } from "../middleware/auth";
import { aiRateLimiter } from "../middleware/rateLimit";
import { validateBody } from "../middleware/validate";
import { AIChatSchema } from "../validators/schemas";
import { DataRepository } from "../repositories/dataRepository";

const router = Router();

// Agents Catalog
router.get("/agents", (req: Request, res: Response) => {
  res.json(AITripPilotService.getAgents());
});

// Chat (TripPilot Multi-Agent Engine)
router.post("/chat", aiRateLimiter, optionalToken, validateBody(AIChatSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { message, trip_id, session_id } = req.body;
    const result = await AITripPilotService.processChat(message, trip_id, session_id);

    res.json({
      status: "complete",
      result,
      message: result.reply,
      ...result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      detail: err.message || "AI TripPilot encountered an error",
      error: { code: "AI_ERROR", message: err.message },
    });
  }
});

// Chat Stream (SSE)
router.post("/chat/stream", aiRateLimiter, optionalToken, async (req: AuthenticatedRequest, res: Response) => {
  const message = String(req.body?.message || req.body?.prompt || "Plan a personalized trip to India").trim();
  const { trip_id, session_id } = req.body;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendEvent = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    sendEvent({ type: "status", label: "Activating TripPilot AI Agents..." });
    sendEvent({
      type: "agents",
      agents: [
        { name: "planner", title: "Itinerary Planner" },
        { name: "weather", title: "Weather & Sudden Shift Agent" },
        { name: "budget", title: "Budget Agent" },
        { name: "hotel", title: "Hotels Agent" },
        { name: "food", title: "Food Trail Agent" },
        { name: "safety", title: "Safety & Helpline Agent" },
        { name: "packing", title: "Weather Packing Agent" },
      ],
    });

    sendEvent({ type: "status", label: "Consulting live weather forecasts & sudden change alerts..." });
    sendEvent({ type: "agent_done", agent: "weather" });

    sendEvent({ type: "status", label: "Optimizing itinerary, budget & heritage monuments..." });
    sendEvent({ type: "agent_done", agent: "planner" });
    sendEvent({ type: "agent_done", agent: "budget" });

    const result = await AITripPilotService.processChat(message, trip_id, session_id);

    sendEvent({ type: "agent_done", agent: "hotel" });
    sendEvent({ type: "agent_done", agent: "food" });
    sendEvent({ type: "agent_done", agent: "safety" });
    sendEvent({ type: "agent_done", agent: "packing" });

    // Stream text chunks for responsive UX
    const replyWords = (result.reply || "").split(" ");
    for (let i = 0; i < replyWords.length; i += 4) {
      const chunk = replyWords.slice(i, i + 4).join(" ") + " ";
      sendEvent({ type: "chunk", text: chunk });
      await new Promise((r) => setTimeout(r, 20));
    }

    sendEvent({
      type: "result",
      data: result,
    });

    res.end();
  } catch (err: any) {
    sendEvent({ type: "error", message: err.message || "Failed to process chat" });
    res.end();
  }
});

// Restore Session
router.get("/session/:sessionId", (req: Request, res: Response) => {
  const sess = AITripPilotService.getSession(req.params.sessionId);
  res.json(sess);
});

// Sudden weather shift replanner
router.post("/replan", aiRateLimiter, optionalToken, async (req: Request, res: Response) => {
  try {
    const { trip_id, trigger_type, details, session_id } = req.body;
    const result = await AITripPilotService.replan(trip_id, trigger_type, details, session_id);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ detail: err.message || "Failed to replan trip" });
  }
});

// Preferences / memory stubs
router.get("/memory", (req: Request, res: Response) => {
  res.json({ preferences: {}, history_count: 0 });
});

router.delete("/memory", (req: Request, res: Response) => {
  res.json({ ok: true, preferences: {} });
});

// Apply AI itinerary to user's saved trips
router.post("/apply", optionalToken, async (req: AuthenticatedRequest, res: Response) => {
  const { trip_summary, itinerary, budget } = req.body;
  const user = req.user;

  const newTrip = await DataRepository.createTrip({
    id: `trip-${Date.now()}`,
    user_id: user?.id || "user-demo-1",
    title: trip_summary?.title || "AI Planned Journey",
    destination_ids: (trip_summary?.destinations || []).map((d: any) => d.name || d.id || d),
    start_date: trip_summary?.start_date || new Date().toISOString().split("T")[0],
    end_date: trip_summary?.end_date || new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0],
    budget: budget?.total || trip_summary?.budget || 35000,
    travel_style: trip_summary?.travel_style || "heritage & culture",
    share_token: `trip-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    members: user ? [user.email] : ["kiran@exploro.in"],
    itineraryDays: itinerary || [],
    created_at: new Date().toISOString(),
  });

  res.json({ ok: true, applied: true, trip: newTrip });
});

export default router;
