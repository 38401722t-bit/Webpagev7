import React, { useState, useEffect } from "react";
import { Camera, ExternalLink, Image as ImageIcon } from "lucide-react";

/**
 * PlaceImage Component
 * - Multi-tier fallback (Place images -> Curated -> Wikimedia -> Placeholder)
 * - Skeleton loading state with smooth fade-in
 * - Broken image recovery
 * - Provider attribution tooltip/badge (Pexels, Unsplash, Wikimedia)
 * - Multiple aspect ratios (card, hero, banner, thumbnail)
 */
export default function PlaceImage({
  placeId,
  placeName,
  stateName,
  fallbackSrc,
  alt,
  className = "",
  aspectRatio = "card", // "card" (4:3 / 16:9), "hero" (16:9), "banner" (21:9), "square" (1:1), "thumb"
  showAttribution = false,
  priority = false,
}) {
  const [src, setSrc] = useState(fallbackSrc || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    let isMounted = true;

    // If fallbackSrc is already a direct full URL, start with it
    if (fallbackSrc && !src) {
      setSrc(fallbackSrc);
    }

    // Attempt to fetch ranked image metadata if placeId is given
    if (placeId) {
      fetch(`/api/images/place/${encodeURIComponent(placeId)}?name=${encodeURIComponent(placeName || "")}&state=${encodeURIComponent(stateName || "")}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!isMounted || !data?.images?.length) return;
          const primary = data.images[0];
          setMeta(primary);
          if (primary.imageUrl) {
            setSrc(primary.imageUrl);
          }
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, [placeId, placeName, stateName, fallbackSrc]);

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setError(true);
    setLoading(false);
    // Reliable India travel fallback
    setSrc("https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&auto=format&fit=crop&q=80");
  };

  const aspectClasses = {
    card: "aspect-[16/10]",
    hero: "aspect-[16/9] min-h-[320px]",
    banner: "aspect-[21/9]",
    square: "aspect-square",
    thumb: "w-16 h-16 shrink-0",
  }[aspectRatio] || "aspect-[16/10]";

  return (
    <div className={`relative overflow-hidden bg-slate-100 dark:bg-slate-800 ${aspectClasses} ${className}`}>
      {/* Loading Skeleton */}
      {loading && (
        <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 animate-pulse flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-slate-400/50" />
        </div>
      )}

      {/* Image Element */}
      {src && (
        <img
          src={src}
          alt={alt || `${placeName || "Tourist Place"}, ${stateName || "India"}`}
          loading={priority ? "eager" : "lazy"}
          referrerPolicy="no-referrer"
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            loading ? "opacity-0" : "opacity-100"
          }`}
        />
      )}

      {/* Attribution Overlay (shows photographer and license when available) */}
      {showAttribution && meta && meta.author && (
        <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded text-[10px] bg-black/60 backdrop-blur-md text-white/90 flex items-center gap-1 max-w-[85%] truncate opacity-80 hover:opacity-100 transition-opacity">
          <Camera className="w-3 h-3 shrink-0 text-amber-300" />
          <span className="truncate">Photo: {meta.author}</span>
          {meta.sourceUrl && (
            <a
              href={meta.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-300 hover:underline inline-flex items-center ml-0.5"
              title="View source & license"
            >
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
