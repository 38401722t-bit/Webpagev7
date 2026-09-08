import { useState, useEffect } from "react";
import { Compass, Play, Pause, CaretRight, CaretLeft, SunDim, Sparkle } from "@phosphor-icons/react";

const SCENES = [
  {
    id: "himalayas",
    title: "Alpine Himalayan Lake",
    state: "Himachal & Ladakh",
    tagline: "Serene azure waters reflecting snow-capped peaks and pine ridges",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=85",
  },
  {
    id: "manali",
    title: "Solang Valley, Manali",
    state: "Himachal Pradesh",
    tagline: "Pine-covered slopes and crisp alpine mountain air",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1920&q=85",
  },
  {
    id: "taj",
    title: "Taj Mahal, Agra",
    state: "Uttar Pradesh",
    tagline: "Iconic ivory-white marble wonder under bright blue skies",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1920&q=85",
  },
  {
    id: "jaipur",
    title: "Amber Fort, Jaipur",
    state: "Rajasthan",
    tagline: "Golden sandstone palace ramparts overlooking Maota lake",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1920&q=85",
  },
  {
    id: "munnar",
    title: "Munnar Tea Valleys",
    state: "Kerala",
    tagline: "Lush rolling emerald hills of the Western Ghats",
    image: "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?w=1920&q=85",
  },
  {
    id: "varanasi",
    title: "Varanasi Ghats & Ganges",
    state: "Uttar Pradesh",
    tagline: "Sacred riverfront temples, wooden boats & timeless heritage",
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1920&q=85",
  },
  {
    id: "alleppey",
    title: "Kerala Palm Backwaters",
    state: "Kerala",
    tagline: "Tropical waterways, coconut palms & heritage houseboats",
    image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=1920&q=85",
  },
];

const BRIGHTNESS_MODES = [
  { label: "100% Bright", opacity: "opacity-100", filter: "brightness(1.0) contrast(1.04) saturate(1.1)" },
  { label: "85% Balanced", opacity: "opacity-85", filter: "brightness(0.95) contrast(1.05) saturate(1.15)" },
  { label: "70% Soft", opacity: "opacity-70", filter: "brightness(0.9) contrast(1.08) saturate(1.2)" },
];

const BackgroundSlide = () => {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [bModeIndex, setBModeIndex] = useState(0); // 100% by default, fully visible and bright

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % SCENES.length);
    }, 12000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const current = SCENES[index];
  const bMode = BRIGHTNESS_MODES[bModeIndex];

  return (
    <aside
      aria-label="Scenic Indian background backdrop"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none"
    >
      {/* High-visibility Scenic Panoramas */}
      {SCENES.map((scene, i) => {
        const isActive = i === index;
        return (
          <div
            key={scene.id}
            aria-hidden={!isActive}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? bMode.opacity : "opacity-0"
            }`}
          >
            <div
              className={`w-[125%] h-[125%] -left-[12%] -top-[12%] absolute bg-cover bg-center will-change-transform ${
                isActive && isPlaying ? "animate-pan-drift" : ""
              }`}
              style={{
                backgroundImage: `url(${scene.image})`,
                filter: bMode.filter,
              }}
            />
          </div>
        );
      })}

      {/* Scrim: gentle soft overlay so page content has supreme readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-slate-900/40 pointer-events-none" />

      {/* Floating Scenic Destination Indicator & Controls in clean frosted pill */}
      <div className="fixed bottom-4 right-4 z-40 pointer-events-auto hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 text-xs text-slate-800 shadow-xl border border-slate-200/80 backdrop-blur-md transition-all hover:border-sky-400">
        <Compass size={16} className="text-sky-600 animate-spin-slow shrink-0" />
        <span className="font-semibold text-slate-800 truncate max-w-[190px]">
          {current.title} · <span className="text-slate-500 font-normal">{current.state}</span>
        </span>

        {/* Quick controls */}
        <div className="flex items-center gap-1 border-l border-slate-200 pl-2 ml-1">
          <button
            type="button"
            onClick={() => setIndex((prev) => (prev - 1 + SCENES.length) % SCENES.length)}
            className="p-1 rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
            title="Previous scene"
            aria-label="Previous scene"
          >
            <CaretLeft size={13} weight="bold" />
          </button>
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
            title={isPlaying ? "Pause scenic slideshow" : "Resume scenic slideshow"}
            aria-label={isPlaying ? "Pause slide" : "Play slide"}
          >
            {isPlaying ? <Pause size={13} weight="bold" /> : <Play size={13} weight="bold" />}
          </button>
          <button
            type="button"
            onClick={() => setIndex((prev) => (prev + 1) % SCENES.length)}
            className="p-1 rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
            title="Next scene"
            aria-label="Next scene"
          >
            <CaretRight size={13} weight="bold" />
          </button>
          <button
            type="button"
            onClick={() => setBModeIndex((prev) => (prev + 1) % BRIGHTNESS_MODES.length)}
            className="p-1 ml-1 rounded-full hover:bg-slate-100 text-amber-500 hover:text-amber-600 transition-colors flex items-center gap-0.5"
            title={`Brightness: ${bMode.label} (Click to toggle)`}
            aria-label="Toggle brightness"
          >
            <SunDim size={14} weight="fill" />
            <span className="text-[10px] text-slate-600 font-medium">{bMode.label.split(" ")[0]}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default BackgroundSlide;
