import { Router } from "express";
import authRoutes from "./auth.routes";
import destinationRoutes from "./destination.routes";
import weatherRoutes from "./weather.routes";
import routingRoutes from "./routing.routes";
import hospitalityRoutes from "./hospitality.routes";
import budgetRoutes from "./budget.routes";
import wishlistRoutes from "./wishlist.routes";
import tripRoutes from "./trip.routes";
import alertRoutes from "./alert.routes";
import feedbackRoutes from "./feedback.routes";
import notificationRoutes from "./notification.routes";
import aiRoutes from "./ai.routes";
import imageRoutes from "./image.routes";
import transportRoutes from "./transport.routes";
import fareAlertRoutes from "./fareAlert.routes";
import translateRoutes from "./translate.routes";
import { placesService } from "../../src/services/placesService";
import { isDbConnected } from "../config/db";

const apiRouter = Router();

// Health check
apiRouter.get("/health", (req, res) => {
  res.json({
    status: "ok",
    app: "Exploro India",
    database: isDbConnected() ? "mongodb-connected" : "memory-active",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
  });
});

// States Master Shortcut
apiRouter.get("/states", (req, res) => {
  res.json(placesService.getAllStates());
});

// Photo upload simulation/fallback
apiRouter.post("/upload/photo", (req, res) => {
  res.json({
    path: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800",
    url: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800",
    ok: true,
  });
});

// Mount modules
apiRouter.use("/auth", authRoutes);
apiRouter.use("/destinations", destinationRoutes);
apiRouter.use("/weather", weatherRoutes);
apiRouter.use("/route", routingRoutes);
apiRouter.use("/routes", routingRoutes); // Alias
apiRouter.use("/budget", budgetRoutes);
apiRouter.use("/wishlist", wishlistRoutes);
apiRouter.use("/trips", tripRoutes);
apiRouter.use("/alerts", alertRoutes);
apiRouter.use("/fare-alerts", fareAlertRoutes);
apiRouter.use("/transport", transportRoutes);
apiRouter.use("/translate", translateRoutes);
apiRouter.use("/feedback", feedbackRoutes);
apiRouter.use("/notifications", notificationRoutes);
apiRouter.use("/ai", aiRoutes);
apiRouter.use("/images", imageRoutes);

// Hospitality & Place Enhancements (hotels, crowd, foodie, restaurants, foods)
apiRouter.use("/", hospitalityRoutes);

export default apiRouter;
