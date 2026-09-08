import { Router, Response } from "express";
import { DataRepository } from "../repositories/dataRepository";
import { authenticateToken, optionalToken, AuthenticatedRequest } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { TripCreateSchema } from "../validators/schemas";
import { DEST_BY_ID } from "../../src/data/destinations";
import { placesService } from "../../src/services/placesService";

const router = Router();

// List trips
router.get("/", optionalToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user ? req.user.id : "user-demo-1";
  const email = req.user ? req.user.email : undefined;
  const trips = await DataRepository.getTrips(userId, email);
  res.json(trips);
});

// Create trip
router.post("/", authenticateToken, validateBody(TripCreateSchema), async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const { title, destination_ids, start_date, end_date, budget, travel_style, members } = req.body;

  const sDate = start_date || new Date().toISOString().split("T")[0];
  const eDate = end_date || new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0];

  const trip = await DataRepository.createTrip({
    id: `trip-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    user_id: user.id,
    title: title.trim(),
    destination_ids: destination_ids || [],
    start_date: sDate,
    end_date: eDate,
    budget: budget || 25000,
    travel_style: travel_style || "heritage & culture",
    share_token: `share-${Math.random().toString(36).slice(2, 9)}`,
    members: members && members.length ? members : [user.email],
    created_at: new Date().toISOString(),
  });

  res.status(201).json(trip);
});

// Single trip
router.get("/:trip_id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const trip = await DataRepository.getTripById(req.params.trip_id);
  if (!trip || (trip.user_id !== user.id && !trip.members?.includes(user.email))) {
    return res.status(404).json({ detail: "Trip not found" });
  }
  res.json(trip);
});

// Update trip
router.patch("/:trip_id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const updated = await DataRepository.updateTrip(user.id, req.params.trip_id, req.body);
  if (!updated) {
    return res.status(404).json({ detail: "Trip not found" });
  }
  res.json(updated);
});

// Delete trip
router.delete("/:trip_id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const ok = await DataRepository.deleteTrip(user.id, req.params.trip_id);
  if (!ok) {
    return res.status(404).json({ detail: "Trip not found" });
  }
  res.json({ ok: true });
});

// Generate share token
router.post("/:trip_id/share", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const trip = await DataRepository.getTripById(req.params.trip_id);
  if (!trip || trip.user_id !== user.id) {
    return res.status(404).json({ detail: "Trip not found" });
  }

  const token = trip.share_token || `share-${Math.random().toString(36).slice(2, 9)}`;
  if (!trip.share_token) {
    await DataRepository.updateTrip(user.id, trip.id, { share_token: token });
  }
  res.json({ share_token: token });
});

// Revoke share token
router.delete("/:trip_id/share", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const trip = await DataRepository.getTripById(req.params.trip_id);
  if (!trip || trip.user_id !== user.id) {
    return res.status(404).json({ detail: "Trip not found" });
  }
  await DataRepository.updateTrip(user.id, trip.id, { share_token: null });
  res.json({ ok: true });
});

// Access shared trip by token
router.get("/shared/:token", async (req, res) => {
  const trip = await DataRepository.getTripByShareToken(req.params.token);
  if (!trip) {
    return res.status(404).json({ detail: "Shared trip not found" });
  }

  const dests = trip.destination_ids
    .map((id) => DEST_BY_ID.get(id) || placesService.getPlaceById(id))
    .filter(Boolean);

  res.json({
    trip,
    destinations: dests,
  });
});

// Trip recap
router.get("/shared/:token/recap", async (req, res) => {
  const trip = await DataRepository.getTripByShareToken(req.params.token);
  if (!trip) {
    return res.status(404).json({ detail: "Trip not found" });
  }

  const dests = trip.destination_ids
    .map((id) => DEST_BY_ID.get(id) || placesService.getPlaceById(id))
    .filter(Boolean);

  res.json({
    title: trip.title,
    dates: `${trip.start_date} to ${trip.end_date}`,
    stops: dests.map((d: any) => ({
      name: d.name,
      state: d.state,
      tag: d.tag || d.category,
      image: d.image,
    })),
    highlights: [
      "Spectacular cultural monument tours and architectural marvels",
      "Delicious regional food trails and spice market explorations",
      "Serene sunrise photography and scenic landscape views",
    ],
  });
});

// Trip Collaboration: In-memory store for comments & votes
const tripCommentsStore = new Map<string, Array<{ id: string; user_id: string; user_name: string; text: string; created_at: string }>>();
const tripVotesStore = new Map<string, Array<{ id: string; stop_id: string; user_id: string; value: number }>>();

// Comments
router.get("/:trip_id/comments", optionalToken, (req: AuthenticatedRequest, res: Response) => {
  const tripId = req.params.trip_id;
  const comments = tripCommentsStore.get(tripId) || [];
  res.json(comments);
});

router.post("/:trip_id/comments", optionalToken, (req: AuthenticatedRequest, res: Response) => {
  const tripId = req.params.trip_id;
  const user = req.user || { id: "user-demo-1", name: "Kiran" };
  const text = String(req.body?.text || "").trim();

  if (!text) {
    return res.status(400).json({ detail: "Comment text cannot be empty" });
  }

  let comments = tripCommentsStore.get(tripId);
  if (!comments) {
    comments = [];
    tripCommentsStore.set(tripId, comments);
  }

  const newComment = {
    id: `cm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    user_id: user.id,
    user_name: user.name || "Explorer",
    text,
    created_at: new Date().toISOString(),
  };

  comments.push(newComment);
  res.status(201).json(newComment);
});

// Votes
router.get("/:trip_id/votes", optionalToken, (req: AuthenticatedRequest, res: Response) => {
  const tripId = req.params.trip_id;
  const votes = tripVotesStore.get(tripId) || [];
  res.json(votes);
});

router.post("/:trip_id/votes", optionalToken, (req: AuthenticatedRequest, res: Response) => {
  const tripId = req.params.trip_id;
  const user = req.user || { id: "user-demo-1", name: "Kiran" };
  const { stop_id, value } = req.body;

  if (!stop_id) {
    return res.status(400).json({ detail: "stop_id is required" });
  }

  let votes = tripVotesStore.get(tripId);
  if (!votes) {
    votes = [];
    tripVotesStore.set(tripId, votes);
  }

  // Remove existing vote by same user for this stop
  const filtered = votes.filter((v) => !(v.stop_id === stop_id && v.user_id === user.id));
  filtered.push({
    id: `vt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    stop_id,
    user_id: user.id,
    value: Number(value) || 1,
  });

  tripVotesStore.set(tripId, filtered);
  res.json({ ok: true, votes: filtered });
});

// Invite member
router.post("/:trip_id/invite", optionalToken, async (req: AuthenticatedRequest, res: Response) => {
  const tripId = req.params.trip_id;
  const email = String(req.body?.email || "").trim();

  if (!email || !email.includes("@")) {
    return res.status(400).json({ detail: "Valid email required" });
  }

  const trip = await DataRepository.getTripById(tripId);
  if (trip) {
    const members = trip.members || [];
    if (!members.includes(email)) {
      members.push(email);
      await DataRepository.updateTrip(trip.user_id, trip.id, { members });
    }
  }

  res.json({ ok: true, message: `Invite sent to ${email}` });
});

export default router;
