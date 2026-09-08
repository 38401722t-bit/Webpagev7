import { Router, Request, Response } from "express";
import { BudgetService } from "../services/budgetService";
import { validateBody } from "../middleware/validate";
import { BudgetEstimateSchema } from "../validators/schemas";

const router = Router();

router.post("/estimate", validateBody(BudgetEstimateSchema), (req: Request, res: Response) => {
  const result = BudgetService.estimate(req.body);
  res.json(result);
});

router.get("/estimate", (req: Request, res: Response) => {
  const { days, people, transport, hotel_level, party_type, destination_ids } = req.query;
  const ids = destination_ids ? String(destination_ids).split(",").filter(Boolean) : undefined;
  const result = BudgetService.estimate({
    days: days ? Number(days) : 5,
    people: people ? Number(people) : 2,
    transport: (transport as any) || "Train",
    hotel_level: (hotel_level as any) || "comfort",
    party_type: (party_type as any) || "Couple",
    destination_ids: ids,
  });
  res.json(result);
});

export default router;
