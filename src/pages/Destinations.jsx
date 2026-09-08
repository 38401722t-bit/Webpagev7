import { useEffect, useMemo, useState } from "react";
import { http } from "../lib/api";
import { DestCard } from "./Home";
import { placesService } from "../services/placesService";
import { MagnifyingGlass, Funnel, Sparkle } from "@phosphor-icons/react";
import { Input } from "../components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";

const CATEGORY_PILLS = [
  { id: "all", label: "All Categories" },
  { id: "spiritual", label: "Spiritual & Temples" },
  { id: "historical", label: "Forts & Heritage" },
  { id: "scenic", label: "Hill Stations & Scenic" },
  { id: "nature", label: "Beaches & Coastal" },
  { id: "wildlife", label: "Wildlife & Safaris" },
  { id: "adventure", label: "Adventure & Treks" },
];

const Destinations = () => {
  // Initialize with authoritative placesService immediately for zero-lag initial load
  const [all, setAll] = useState(() => placesService.getAllPlaces());
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [state, setState] = useState("all");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("rating");
  const [visibleCount, setVisibleCount] = useState(36);

  // Debounce search query to prevent lag on fast keystrokes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQ(q);
    }, 200);
    return () => clearTimeout(handler);
  }, [q]);

  // Hydrate from API in background if needed
  useEffect(() => {
    http.get("/destinations")
      .then((r) => {
        if (Array.isArray(r.data) && r.data.length > 0) {
          setAll(r.data);
        }
      })
      .catch(() => {
        // placesService fallback is already loaded
      });
  }, []);

  const states = useMemo(() => Array.from(new Set(all.map((d) => d.state))).sort(), [all]);
  const types = useMemo(() => Array.from(new Set(all.map((d) => d.type))).sort(), [all]);

  useEffect(() => {
    setVisibleCount(36);
  }, [debouncedQ, state, type, sort]);

  const filtered = useMemo(() => {
    const searchLower = debouncedQ.trim().toLowerCase();

    let list = all.filter((d) => {
      const okQ =
        !searchLower ||
        d.name.toLowerCase().includes(searchLower) ||
        d.state.toLowerCase().includes(searchLower) ||
        (d.category && d.category.toLowerCase().includes(searchLower)) ||
        (d.tags && d.tags.some((t) => t.toLowerCase().includes(searchLower))) ||
        (d.tag && d.tag.toLowerCase().includes(searchLower));

      const okS = state === "all" || d.state.toLowerCase() === state.toLowerCase();
      const okT = type === "all" || d.type === type;
      return okQ && okS && okT;
    });

    list.sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "budget_low") return a.budget - b.budget;
      if (sort === "budget_high") return b.budget - a.budget;
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [all, debouncedQ, state, type, sort]);

  const displayed = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  return (
    <div className="pt-28 pb-24 md:pb-16 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <div className="label-eyebrow flex items-center gap-1.5">
            <Sparkle size={14} className="text-primary" /> Authoritative Directory · 36 States & UTs
          </div>
          <h1 className="font-serif text-5xl mt-2">Discover India</h1>
        </div>
        <div className="text-sm text-muted-foreground font-medium" data-testid="dest-count">
          Showing {displayed.length} of {filtered.length} places
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
        {CATEGORY_PILLS.map((pill) => {
          const isActive = type === pill.id;
          return (
            <button
              key={pill.id}
              onClick={() => setType(pill.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                isActive
                  ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                  : "bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-xs"
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* Search & Select Filters */}
      <div className="grid md:grid-cols-4 gap-3 mb-8 p-4 bg-white rounded-3xl shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06)] border border-slate-100">
        <div className="relative">
          <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            data-testid="search-input"
            className="pl-9 h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl"
            placeholder="Search 1,942 places or state..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select value={state} onValueChange={setState}>
          <SelectTrigger data-testid="state-filter" className="h-11 bg-slate-50 border-slate-200 text-slate-900 rounded-xl">
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent className="max-h-80 bg-white border-slate-200">
            <SelectItem value="all">All 36 States & UTs</SelectItem>
            {states.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger data-testid="type-filter" className="h-11 bg-slate-50 border-slate-200 text-slate-900 rounded-xl">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent className="bg-white border-slate-200">
            <SelectItem value="all">All types</SelectItem>
            {types.map((t) => (
              <SelectItem key={t} value={t} className="capitalize">
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger data-testid="sort-filter" className="h-11 bg-slate-50 border-slate-200 text-slate-900 rounded-xl">
            <Funnel size={16} className="mr-1 text-slate-500" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border-slate-200">
            <SelectItem value="rating">Highest rated</SelectItem>
            <SelectItem value="budget_low">Budget: low → high</SelectItem>
            <SelectItem value="budget_high">Budget: high → low</SelectItem>
            <SelectItem value="name">A → Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid of Places */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {displayed.map((d, i) => (
          <div key={d.id} className="fade-up" style={{ animationDelay: `${Math.min(i, 16) * 30}ms` }}>
            <DestCard d={d} testid={`dest-${d.id}`} />
          </div>
        ))}
      </div>

      {/* Pagination Loaders */}
      {visibleCount < filtered.length && (
        <div className="mt-12 text-center flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => setVisibleCount((prev) => Math.min(prev + 48, filtered.length))}
            className="btn-orange px-8 py-3.5 rounded-full text-white font-bold shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
          >
            Load more places ({filtered.length - visibleCount} remaining)
          </button>
          <button
            onClick={() => setVisibleCount(filtered.length)}
            className="px-6 py-3.5 rounded-full bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
          >
            Show all {filtered.length} places
          </button>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-500 bg-white rounded-3xl border border-slate-100 p-8">
          No destinations match your filters. Try searching by state or broader keyword.
        </div>
      )}
    </div>
  );
};

export default Destinations;
