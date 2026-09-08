import { Router, Response } from "express";
import { DataRepository } from "../repositories/dataRepository";
import { optionalToken, authenticateToken, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

router.get("/", optionalToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user ? req.user.id : "user-demo-1";
  const items = await DataRepository.getNotifications(userId);
  res.json(items);
});

router.patch("/:nid/read", async (req, res) => {
  await DataRepository.markNotificationRead(req.params.nid);
  res.json({ ok: true });
});

router.post("/read-all", optionalToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user ? req.user.id : "user-demo-1";
  await DataRepository.markAllNotificationsRead(userId);
  res.json({ ok: true });
});

export default router;
