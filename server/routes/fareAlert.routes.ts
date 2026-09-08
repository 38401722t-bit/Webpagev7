import { Router, Request, Response } from "express";
import { optionalToken, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

export interface FareAlert {
  id: string;
  user_id: string;
  from: string;
  to: string;
  mode: string;
  target_price_inr: number;
  current_price: number;
  trend: "dropping" | "stable" | "increasing";
  active: boolean;
  created_at: string;
}

// In-memory persistent fare alerts store
const fareAlertsStore: FareAlert[] = [
  {
    id: "alert-demo-1",
    user_id: "user-demo-1",
    from: "Delhi",
    to: "Goa",
    mode: "flight",
    target_price_inr: 3500,
    current_price: 3299,
    trend: "dropping",
    active: true,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "alert-demo-2",
    user_id: "user-demo-1",
    from: "Mumbai",
    to: "Jaipur",
    mode: "train",
    target_price_inr: 1200,
    current_price: 1050,
    trend: "stable",
    active: true,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

router.get("/", optionalToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || "user-demo-1";
  const userAlerts = fareAlertsStore.filter((a) => a.user_id === userId || a.user_id === "user-demo-1");
  res.json(userAlerts);
});

router.post("/", optionalToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || "user-demo-1";
  const { from, to, mode, target_price_inr } = req.body;

  if (!from || !to) {
    return res.status(400).json({ detail: "Both origin and destination are required" });
  }

  const target = Number(target_price_inr) || 2000;
  // Compute a realistic current estimated price
  const baseMultiplier = mode === "flight" ? 1.15 : mode === "train" ? 1.05 : 0.95;
  const currentPrice = Math.round(target * baseMultiplier);

  const newAlert: FareAlert = {
    id: `fa-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    user_id: userId,
    from: String(from).trim(),
    to: String(to).trim(),
    mode: String(mode || "flight").toLowerCase(),
    target_price_inr: target,
    current_price: currentPrice,
    trend: currentPrice <= target ? "dropping" : "stable",
    active: true,
    created_at: new Date().toISOString(),
  };

  fareAlertsStore.unshift(newAlert);
  res.status(201).json(newAlert);
});

router.delete("/:id", optionalToken, (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const idx = fareAlertsStore.findIndex((a) => a.id === id);
  if (idx !== -1) {
    fareAlertsStore.splice(idx, 1);
  }
  res.json({ ok: true, id });
});

export default router;
