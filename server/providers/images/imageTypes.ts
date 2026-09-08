export interface ImageResult {
  placeId: string;
  provider: "pexels" | "unsplash" | "wikimedia" | "local" | "placeholder";
  providerImageId?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  sourceUrl?: string;
  author?: string;
  authorUrl?: string;
  license?: string;
  licenseUrl?: string;
  altText: string;
  width?: number;
  height?: number;
  orientation?: "landscape" | "portrait" | "square";
  qualityScore: number;
  relevanceScore: number;
  isPrimary: boolean;
}

export function calculateRelevanceScore(query: string, titleOrAlt: string, tags: string[] = []): number {
  const queryTokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  const targetText = `${titleOrAlt} ${tags.join(" ")}`.toLowerCase();

  let matches = 0;
  for (const token of queryTokens) {
    if (token.length > 2 && targetText.includes(token)) {
      matches++;
    }
  }

  const tokenRatio = queryTokens.length ? matches / queryTokens.length : 0.5;
  // Score between 50 and 98
  return Math.min(98, Math.max(50, Math.round(50 + tokenRatio * 45)));
}

export function rankImages(images: ImageResult[]): ImageResult[] {
  return [...images].sort((a, b) => {
    // Prefer higher relevance, then higher quality, prefer landscape for hero places
    const scoreA = a.relevanceScore * 0.6 + a.qualityScore * 0.4 + (a.orientation === "landscape" ? 5 : 0);
    const scoreB = b.relevanceScore * 0.6 + b.qualityScore * 0.4 + (b.orientation === "landscape" ? 5 : 0);
    return scoreB - scoreA;
  });
}
