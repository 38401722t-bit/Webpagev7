import { Router, Response } from "express";
import { DataRepository } from "../repositories/dataRepository";
import { authenticateToken, optionalToken, AuthenticatedRequest } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { AlertCreateSchema } from "../validators/schemas";

const router = Router();

router.get("/", optionalToken, async (req, res) => {
  const alerts = await DataRepository.getAlerts();
  res.json(alerts);
});

router.post("/", authenticateToken, validateBody(AlertCreateSchema), async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const { title, message, level, destination_id } = req.body;

  const alert = await DataRepository.createAlert({
    id: `al-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    user_id: user.id,
    title: title.trim(),
    message: message.trim(),
    level: level || "info",
    destination_id,
    created_at: new Date().toISOString(),
  });

  res.status(201).json(alert);
});

router.delete("/:alert_id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const ok = await DataRepository.deleteAlert(req.params.alert_id);
  if (!ok) {
    return res.status(404).json({ detail: "Alert not found" });
  }
  res.json({ ok: true });
});

export default router;
