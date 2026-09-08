import { Router, Request, Response } from "express";
import { ImageService } from "../services/imageService";
import { imageRateLimiter } from "../middleware/rateLimit";

const router = Router();

// Ranked images with attribution for a place
router.get("/place/:placeId", imageRateLimiter, async (req: Request, res: Response) => {
  try {
    const { placeId } = req.params;
    const { name, state } = req.query;
    const images = await ImageService.getImagesForPlace(placeId, name ? String(name) : undefined, state ? String(state) : undefined);
    res.json({
      placeId,
      count: images.length,
      images,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      detail: err.message || "Failed to fetch images",
      error: { code: "IMAGE_ERROR", message: err.message },
    });
  }
});

// Primary image fast resolver
router.get("/primary/:placeId", async (req: Request, res: Response) => {
  try {
    const { placeId } = req.params;
    const fallback = req.query.fallback ? String(req.query.fallback) : undefined;
    const url = await ImageService.getPrimaryImage(placeId, fallback);
    res.json({ placeId, imageUrl: url });
  } catch {
    res.json({ placeId: req.params.placeId, imageUrl: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800" });
  }
});

// Direct image search
router.get("/search", imageRateLimiter, async (req: Request, res: Response) => {
  try {
    const query = String(req.query.q || req.query.query || "").trim();
    if (!query) {
      return res.status(400).json({ detail: "Search query 'q' required" });
    }
    const images = await ImageService.getImagesForPlace(`search-${query.toLowerCase().replace(/\s+/g, "-")}`, query);
    res.json({ query, images });
  } catch (err: any) {
    res.status(500).json({ detail: err.message || "Failed to search images" });
  }
});

export default router;
