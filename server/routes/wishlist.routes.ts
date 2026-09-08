import { Router, Response } from "express";
import { DataRepository } from "../repositories/dataRepository";
import { authenticateToken, optionalToken, AuthenticatedRequest } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { WishlistAddSchema } from "../validators/schemas";

const router = Router();

router.get("/", optionalToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user ? req.user.id : "user-demo-1";
  const items = await DataRepository.getWishlist(userId);
  res.json(items);
});

router.post("/", authenticateToken, validateBody(WishlistAddSchema), async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const { destination_id, notes, status } = req.body;

  const item = await DataRepository.addWishlistItem({
    id: `wl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    user_id: user.id,
    destination_id,
    notes: notes || "",
    status: status || "planned",
    created_at: new Date().toISOString(),
  });

  res.status(201).json(item);
});

router.patch("/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const updated = await DataRepository.updateWishlistItem(user.id, req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ detail: "Wishlist item not found" });
  }
  res.json(updated);
});

router.delete("/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const ok = await DataRepository.deleteWishlistItem(user.id, req.params.id);
  if (!ok) {
    return res.status(404).json({ detail: "Wishlist item not found" });
  }
  res.json({ ok: true });
});

export default router;
