import { ImageResult, calculateRelevanceScore } from "./imageTypes";

export class WikimediaProvider {
  static async searchImages(query: string, placeId: string, limit = 3): Promise<ImageResult[]> {
    try {
      // Wikimedia Commons API - free, legal, open license
      const endpoint = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(
        query + " India filetype:bitmap"
      )}&gsrlimit=${limit * 2}&prop=imageinfo&iiprop=url|size|extmetadata|dimensions&format=json&origin=*`;

      const response = await fetch(endpoint, {
        headers: { "User-Agent": "ExploroIndia/1.0 (info@exploro.in)" },
        signal: AbortSignal.timeout(6000),
      });

      if (!response.ok) return [];

      const data = await response.json();
      const pages = data?.query?.pages;
      if (!pages) return [];

      const results: ImageResult[] = [];
      for (const key of Object.keys(pages)) {
        const page = pages[key];
        const info = page.imageinfo?.[0];
        if (!info || !info.url) continue;

        // Skip non-standard formats (e.g. svg, tif)
        if (!/\.(jpe?g|png|webp)$/i.test(info.url)) continue;

        const width = info.width || 800;
        const height = info.height || 600;
        const orientation = width > height ? "landscape" : width < height ? "portrait" : "square";

        const meta = info.extmetadata || {};
        const author = meta.Artist?.value?.replace(/<[^>]*>?/gm, "") || "Wikimedia Commons Contributor";
        const license = meta.LicenseShortName?.value || "Creative Commons Attribution";
        const licenseUrl = meta.LicenseUrl?.value || "https://creativecommons.org/licenses/";
        const description = meta.ImageDescription?.value?.replace(/<[^>]*>?/gm, "") || page.title || query;

        const relevance = calculateRelevanceScore(query, description);

        // Quality score estimation based on resolution
        const resolutionScore = Math.min(95, Math.max(60, Math.round((Math.min(width, 1920) / 1920) * 40 + 55)));

        results.push({
          placeId,
          provider: "wikimedia",
          providerImageId: `wm-${page.pageid}`,
          imageUrl: info.thumburl || info.url,
          thumbnailUrl: info.thumburl || info.url,
          sourceUrl: info.descriptionurl || `https://commons.wikimedia.org/?curid=${page.pageid}`,
          author,
          authorUrl: "https://commons.wikimedia.org",
          license,
          licenseUrl,
          altText: `${query} - ${description.slice(0, 80)}`,
          width,
          height,
          orientation,
          qualityScore: resolutionScore,
          relevanceScore: relevance,
          isPrimary: false,
        });

        if (results.length >= limit) break;
      }

      return results;
    } catch (err) {
      // Gracefully return empty on network/API failure
      return [];
    }
  }
}
