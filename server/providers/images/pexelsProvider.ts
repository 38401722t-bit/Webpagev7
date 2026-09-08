import { ImageResult, calculateRelevanceScore } from "./imageTypes";
import { CONFIG } from "../../config/env";

export class PexelsProvider {
  static async searchImages(query: string, placeId: string, limit = 3): Promise<ImageResult[]> {
    if (!CONFIG.PEXELS_API_KEY) return [];

    try {
      const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query + " India")}&per_page=${limit}&orientation=landscape`;
      const res = await fetch(url, {
        headers: { Authorization: CONFIG.PEXELS_API_KEY },
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) return [];
      const data = await res.json();
      if (!data.photos || !Array.isArray(data.photos)) return [];

      return data.photos.map((photo: any) => ({
        placeId,
        provider: "pexels" as const,
        providerImageId: `pexels-${photo.id}`,
        imageUrl: photo.src?.large2x || photo.src?.large || photo.src?.medium,
        thumbnailUrl: photo.src?.medium || photo.src?.small,
        sourceUrl: photo.url,
        author: photo.photographer,
        authorUrl: photo.photographer_url,
        license: "Pexels Free-to-Use License",
        licenseUrl: "https://www.pexels.com/license/",
        altText: photo.alt || `${query} photography by ${photo.photographer}`,
        width: photo.width,
        height: photo.height,
        orientation: photo.width >= photo.height ? "landscape" : "portrait",
        qualityScore: 92,
        relevanceScore: calculateRelevanceScore(query, photo.alt || query),
        isPrimary: false,
      }));
    } catch {
      return [];
    }
  }
}

export class UnsplashProvider {
  static async searchImages(query: string, placeId: string, limit = 3): Promise<ImageResult[]> {
    if (!CONFIG.UNSPLASH_ACCESS_KEY) return [];

    try {
      const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query + " India")}&per_page=${limit}&orientation=landscape`;
      const res = await fetch(url, {
        headers: { Authorization: `Client-ID ${CONFIG.UNSPLASH_ACCESS_KEY}` },
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) return [];
      const data = await res.json();
      if (!data.results || !Array.isArray(data.results)) return [];

      return data.results.map((photo: any) => ({
        placeId,
        provider: "unsplash" as const,
        providerImageId: `unsplash-${photo.id}`,
        imageUrl: photo.urls?.regular || photo.urls?.small,
        thumbnailUrl: photo.urls?.thumb || photo.urls?.small,
        sourceUrl: photo.links?.html,
        author: photo.user?.name,
        authorUrl: photo.user?.links?.html,
        license: "Unsplash License",
        licenseUrl: "https://unsplash.com/license",
        altText: photo.alt_description || `${query} on Unsplash`,
        width: photo.width,
        height: photo.height,
        orientation: photo.width >= photo.height ? "landscape" : "portrait",
        qualityScore: 94,
        relevanceScore: calculateRelevanceScore(query, photo.alt_description || query),
        isPrimary: false,
      }));
    } catch {
      return [];
    }
  }
}
