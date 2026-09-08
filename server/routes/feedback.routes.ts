import { Router, Response } from "express";
import { DataRepository } from "../repositories/dataRepository";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { FeedbackCreateSchema } from "../validators/schemas";
import { DEST_BY_ID } from "../../src/data/destinations";
import { placesService } from "../../src/services/placesService";

const router = Router();

// Post feedback
router.post("/", authenticateToken, validateBody(FeedbackCreateSchema), async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const { destination_id, rating, comment, photo_path } = req.body;

  const valid = DEST_BY_ID.has(destination_id) || placesService.getPlaceById(destination_id);
  if (!valid) {
    return res.status(400).json({ detail: "Valid destination_id required" });
  }

  const fb = await DataRepository.createFeedback({
    id: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    destination_id,
    user_id: user.id,
    user_name: user.name,
    rating: Math.min(5, Math.max(1, Number(rating) || 5)),
    comment: (comment || "").trim(),
    photo_path: photo_path || null,
    created_at: new Date().toISOString(),
  });

  res.status(201).json(fb);
});

// Get feedback for destination
router.get("/:dest_id", async (req, res) => {
  const result = await DataRepository.getFeedback(req.params.dest_id);
  res.json(result);
});

// Delete feedback
router.delete("/:fb_id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const ok = await DataRepository.deleteFeedback(user.id, req.params.fb_id);
  if (!ok) {
    return res.status(404).json({ detail: "Feedback not found" });
  }
  res.json({ ok: true });
});

export default router;
