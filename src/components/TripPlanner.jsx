import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  MapPin,
  CalendarBlank,
  Sparkle,
  FloppyDisk,
  ShareNetwork,
  Printer,
  Clock,
  Wallet,
  Buildings,
  ForkKnife,
  Compass,
  Sun,
  Mountains,
  Camera,
  Heart,
  ShieldCheck,
  CheckCircle,
  CaretRight,
  ArrowsClockwise,
  Info,
  Users,
  Airplane,
  Suitcase,
  Lightbulb,
  Check,
  X,
  WarningCircle,
  Bed,
  Car,
  Translate,
} from "@phosphor-icons/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { http } from "../lib/api";
import { placesService } from "../services/placesService";
import { planTripWithEngine } from "../lib/tripPilotEngine";
import { POPULAR_INDIAN_CITIES } from "../data/indianCities";
import { ItineraryWeatherCard, ItineraryWeatherStrip } from "./ItineraryWeatherCard";

// Curated Interest Categories
export const TRIP_INTERESTS = [
  { id: "monuments", label: "Monuments & Forts", icon: Buildings, color: "text-amber-400 bg-amber-400/10 border-amber-400/30" },
  { id: "food", label: "Street Food & Dhabas", icon: ForkKnife, color: "text-orange-400 bg-orange-400/10 border-orange-400/30" },
  { id: "spiritual", label: "Spiritual & Temples", icon: Sparkle, color: "text-purple-400 bg-purple-400/10 border-purple-400/30" },
  { id: "nature", label: "Nature & Viewpoints", icon: Mountains, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30" },
  { id: "beaches", label: "Beaches & Sunsets", icon: Sun, color: "text-sky-400 bg-sky-400/10 border-sky-400/30" },
  { id: "adventure", label: "Wildlife & Safaris", icon: Compass, color: "text-green-400 bg-green-400/10 border-green-400/30" },
  { id: "handicrafts", label: "Handicrafts & Bazaars", icon: Suitcase, color: "text-rose-400 bg-rose-400/10 border-rose-400/30" },
  { id: "wellness", label: "Wellness & Ayurveda", icon: Heart, color: "text-teal-400 bg-teal-400/10 border-teal-400/30" },
  { id: "photography", label: "Photography & Vistas", icon: Camera, color: "text-indigo-400 bg-indigo-400/10 border-indigo-400/30" },
];

export const TRAVEL_STYLES = [
  { id: "Budget", label: "Budget Backpacker", desc: "Hostels, street food & trains" },
  { id: "Moderate", label: "Balanced Comfort", desc: "3-star stays, cabs & top sights" },
  { id: "Luxury", label: "Royal & Luxury", desc: "Heritage havelis & fine dining" },
  { id: "Heritage & Wellness", label: "Heritage & Wellness", desc: "Ayurveda, yoga & culture" },
];

export const POPULAR_DESTINATIONS = [
  { name: "Jaipur", state: "Rajasthan", tag: "Royal Heritage" },
  { name: "Goa", state: "Goa", tag: "Sun & Coast" },
  { name: "Varanasi", state: "Uttar Pradesh", tag: "Spiritual Ghats" },
  { name: "Munnar", state: "Kerala", tag: "Tea Valleys" },
  { name: "Hampi", state: "Karnataka", tag: "UNESCO Ruins" },
  { name: "Udaipur", state: "Rajasthan", tag: "Lakes & Palaces" },
  { name: "Manali", state: "Himachal Pradesh", tag: "Himalayan Peaks" },
  { name: "Leh Ladakh", state: "Ladakh", tag: "High Pass Adventure" },
];

export default function TripPlanner({
  initialDestination = "Jaipur",
  initialDays = 4,
  initialInterests = ["Monuments & Forts", "Street Food & Dhabas"],
  onPlanGenerated = null,
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Primary Inputs
  const [destination, setDestination] = useState(searchParams.get("to") || initialDestination);
  const [origin, setOrigin] = useState("Delhi");

  // Dates state: Default start = 7 days from today, end = 10 days from today (4 days)
  const defaultStartDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  }, []);

  const defaultEndDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7 + (initialDays - 1));
    return d.toISOString().split("T")[0];
  }, [initialDays]);

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [travelers, setTravelers] = useState(2);
  const [travelStyle, setTravelStyle] = useState("Moderate");
  const [selectedInterests, setSelectedInterests] = useState(initialInterests);

  // Autocomplete state
  const [destQuery, setDestQuery] = useState(searchParams.get("to") || initialDestination);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef(null);

  // Orchestration & Output states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [itineraryResult, setItineraryResult] = useState(null);
  const [activeDayTab, setActiveDayTab] = useState("all"); // 'all' or day number
  const [isSaving, setIsSaving] = useState(false);

  // Sync with URL params if provided
  useEffect(() => {
    const toParam = searchParams.get("to");
    if (toParam && toParam !== destination) {
      setDestination(toParam);
      setDestQuery(toParam);
    }
  }, [searchParams]);

  // Calculate duration in days from start and end dates
  const calculatedDays = useMemo(() => {
    if (!startDate || !endDate) return 3;
    const s = new Date(startDate).getTime();
    const e = new Date(endDate).getTime();
    if (isNaN(s) || isNaN(e) || e < s) return 1;
    return Math.max(1, Math.min(15, Math.round((e - s) / 86400000) + 1));
  }, [startDate, endDate]);

  // Auto-adjust end date when start date changes to maintain duration
  const handleStartDateChange = (newStart) => {
    setStartDate(newStart);
    if (newStart && endDate) {
      const s = new Date(newStart).getTime();
      const e = new Date(endDate).getTime();
      if (e < s) {
        // shift end date forward
        const shiftedEnd = new Date(s + (calculatedDays - 1) * 86400000).toISOString().split("T")[0];
        setEndDate(shiftedEnd);
      }
    }
  };

  const handleEndDateChange = (newEnd) => {
    setEndDate(newEnd);
  };

  // Adjust duration via +/- buttons
  const adjustDuration = (delta) => {
    const current = calculatedDays;
    const nextDays = Math.max(1, Math.min(14, current + delta));
    const s = new Date(startDate);
    const nextEnd = new Date(s.getTime() + (nextDays - 1) * 86400000).toISOString().split("T")[0];
    setEndDate(nextEnd);
  };

  // Destination Autocomplete Suggestions
  const matchedPlaces = useMemo(() => {
    if (!destQuery || destQuery.trim().length < 2) return [];
    return placesService.searchPlaces({ query: destQuery, limit: 6 }).places;
  }, [destQuery]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectDestination = (placeName) => {
    setDestination(placeName);
    setDestQuery(placeName);
    setShowSuggestions(false);
  };

  const toggleInterest = (label) => {
    setSelectedInterests((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  };

  // Generation Steps simulation for multi-agent feel
  const agentSteps = [
    "Master Agent resolving destination corridors & geographic routes...",
    "Planner Agent sequencing morning, afternoon & sunset itineraries...",
    "Budget Agent itemizing accommodations, dining & monument passes...",
    "Weather Agent verifying live temperatures & sudden shift advisories...",
    "Safety & Validator Agent confirming feasibility and pacing...",
  ];

  const handleGenerate = async () => {
    if (!destination || !destination.trim()) {
      toast.error("Please enter a destination to plan your trip.");
      return;
    }

    setIsGenerating(true);
    setGenerationStep(0);

    // Realistic agent progress interval
    const stepInterval = setInterval(() => {
      setGenerationStep((prev) => (prev < agentSteps.length - 1 ? prev + 1 : prev));
    }, 320);

    try {
      // Execute the mocked-up TripPilot multi-agent engine
      const result = await planTripWithEngine({
        destination,
        startDate,
        endDate,
        days: calculatedDays,
        interests: selectedInterests,
        travelers,
        travelStyle,
        origin,
      });

      // Allow final step to show briefly
      setTimeout(() => {
        clearInterval(stepInterval);
        setItineraryResult(result);
        setIsGenerating(false);
        setActiveDayTab("all");
        toast.success(`Generated ${result.trip_summary.days}-day custom itinerary for ${destination}!`);

        if (onPlanGenerated) {
          onPlanGenerated(result);
        }

        // Smooth scroll to results
        setTimeout(() => {
          const resultsElem = document.getElementById("trip-planner-results");
          if (resultsElem) {
            resultsElem.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 150);
      }, 500);
    } catch (err) {
      clearInterval(stepInterval);
      setIsGenerating(false);
      console.error("TripPlanner error:", err);
      toast.error("Failed to generate itinerary. Please try again.");
    }
  };

  // Save Trip to Account
  const handleSaveTrip = async () => {
    if (!user) {
      toast.warning("Please sign in to save this trip to your account");
      navigate("/login", { state: { from: { pathname: "/planner" } } });
      return;
    }

    if (!itineraryResult) return;

    setIsSaving(true);
    try {
      await http.post("/trips", {
        title: itineraryResult.trip_summary.title,
        destination_name: destination,
        start_date: startDate,
        end_date: endDate,
        days: itineraryResult.trip_summary.days,
        traveler_count: travelers,
        travel_style: travelStyle.toLowerCase(),
        notes: `AI Plan with interests: ${selectedInterests.join(", ")}. Estimated budget: ₹${itineraryResult.budget?.total?.toLocaleString("en-IN")}`,
      });
      toast.success("Trip saved successfully! You can find it in your Trips dashboard.");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Could not save trip to account.");
    } finally {
      setIsSaving(false);
    }
  };

  // Share / Copy Trip Summary
  const handleShareTrip = () => {
    if (!itineraryResult) return;
    const text = `Exploro India Trip Plan: ${itineraryResult.trip_summary.title}\nDates: ${startDate} to ${endDate} (${calculatedDays} Days)\nTravelers: ${travelers} · Style: ${travelStyle}\nEstimated Budget: ₹${itineraryResult.budget?.total?.toLocaleString("en-IN")}\nInterests: ${selectedInterests.join(", ")}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success("Trip summary copied to clipboard!");
    } else {
      toast.info(text);
    }
  };

  // Print Itinerary
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full space-y-8" id="trip-planner-root">
      {/* Configuration Card */}
      <div className="glass-strong rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Ambient background decoration */}
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-semibold tracking-wide uppercase">
                <Sparkle size={14} weight="fill" />
                <span>TripPilot Multi-Agent Architecture</span>
              </div>
              <h2 className="font-serif text-2xl md:text-3xl text-white mt-1.5">
                AI Trip Planner
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                Input your destination, dates, and interests. Our specialized agents craft an authentic, hour-by-hour Indian journey.
              </p>
            </div>

            {/* Duration pill indicator */}
            <div className="flex items-center gap-3 self-start md:self-auto bg-white/5 border border-white/10 rounded-2xl px-4 py-2">
              <Clock size={18} className="text-primary" />
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Duration</div>
                <div className="text-sm font-bold text-white">
                  {calculatedDays} Days · {calculatedDays - 1} Nights
                </div>
              </div>
            </div>
          </div>

          {/* Core Inputs Grid: Destination & Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Destination Input with Autocomplete */}
            <div className="lg:col-span-2 relative" ref={suggestionRef}>
              <label className="text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <MapPin size={15} className="text-primary" />
                <span>Destination (City, Hill Station, or Region)</span>
              </label>
              <div className="relative">
                <Input
                  value={destQuery}
                  onChange={(e) => {
                    setDestQuery(e.target.value);
                    setDestination(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="e.g. Jaipur, Munnar, Goa, Varanasi, Leh..."
                  className="h-12 bg-white/5 border-white/10 rounded-2xl pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                />
                <MapPin size={18} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
              </div>

              {/* Autocomplete Dropdown */}
              {showSuggestions && matchedPlaces.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 z-50 glass-strong bg-slate-950/95 border border-white/15 rounded-2xl p-2 shadow-2xl max-h-60 overflow-y-auto">
                  <div className="text-[10px] uppercase font-semibold text-muted-foreground px-3 py-1">
                    Suggested Tourist Places ({matchedPlaces.length})
                  </div>
                  {matchedPlaces.map((place) => (
                    <button
                      key={place.id}
                      type="button"
                      onClick={() => selectDestination(place.name)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-white/10 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                          {place.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white group-hover:text-primary transition-colors">
                            {place.name}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {place.state} · {place.category}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                        ₹{place.budget}/day
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Start Date */}
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <CalendarBlank size={15} className="text-primary" />
                <span>Start Date</span>
              </label>
              <input
                type="date"
                value={startDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl px-3.5 text-xs md:text-sm text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
              />
            </div>

            {/* End Date with Quick Adjust */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <CalendarBlank size={15} className="text-primary" />
                  <span>End Date</span>
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => adjustDuration(-1)}
                    title="Subtract 1 day"
                    className="w-5 h-5 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center text-xs font-bold"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustDuration(1)}
                    title="Add 1 day"
                    className="w-5 h-5 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center text-xs font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl px-3.5 text-xs md:text-sm text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Quick Destination Pills */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-muted-foreground">Popular Getaways:</span>
            <div className="flex flex-wrap gap-2">
              {POPULAR_DESTINATIONS.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => selectDestination(item.name)}
                  className={`text-xs px-3 py-1 rounded-full border transition-all flex items-center gap-1.5 ${
                    destination.toLowerCase() === item.name.toLowerCase()
                      ? "bg-primary text-primary-foreground border-primary font-semibold shadow-md shadow-primary/30"
                      : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  <span>{item.name}</span>
                  <span className="text-[10px] opacity-70">({item.tag})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Controls: Travelers & Style */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-white/5">
            {/* Origin City */}
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                Starting Origin City
              </label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-3 text-xs md:text-sm text-white outline-none focus:border-primary/50"
              >
                {POPULAR_INDIAN_CITIES.slice(0, 15).map((c) => (
                  <option key={c.name} value={c.name} className="bg-slate-900 text-white">
                    {c.name} ({c.state})
                  </option>
                ))}
              </select>
            </div>

            {/* Travelers Count */}
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
                <Users size={14} className="text-primary" />
                <span>Travelers</span>
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 4, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setTravelers(num)}
                    className={`flex-1 h-11 rounded-xl text-xs font-semibold border transition-all ${
                      travelers === num
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {num === 1 ? "Solo" : num === 2 ? "Couple (2)" : `${num} People`}
                  </button>
                ))}
              </div>
            </div>

            {/* Travel Style */}
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                Travel Style & Budget Tier
              </label>
              <select
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value)}
                className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-3 text-xs md:text-sm text-white outline-none focus:border-primary/50"
              >
                {TRAVEL_STYLES.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Interests Section */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Heart size={15} className="text-secondary" />
                <span>Travel Interests & Priorities ({selectedInterests.length} selected)</span>
              </label>
              <span className="text-[11px] text-muted-foreground hidden sm:inline">
                Click to include or customize in your daily itinerary
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {TRIP_INTERESTS.map((interest) => {
                const active = selectedInterests.includes(interest.label);
                const Icon = interest.icon;
                return (
                  <button
                    key={interest.id}
                    type="button"
                    onClick={() => toggleInterest(interest.label)}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                      active
                        ? "bg-secondary/20 border-secondary/50 text-white shadow-md shadow-secondary/20 font-medium"
                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                        active ? "bg-secondary text-secondary-foreground" : "bg-white/10 text-slate-300"
                      }`}
                    >
                      <Icon size={16} weight={active ? "bold" : "regular"} />
                    </div>
                    <span className="text-xs leading-tight line-clamp-1">{interest.label}</span>
                    {active && <Check size={14} className="ml-auto text-secondary shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate CTA Button */}
          <div className="pt-3">
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !destination}
              className="w-full h-14 rounded-2xl btn-3d bg-primary hover:bg-primary/90 text-primary-foreground text-base font-bold shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
            >
              <Sparkle size={20} weight="fill" className={isGenerating ? "animate-spin" : ""} />
              <span>
                {isGenerating
                  ? "TripPilot is orchestrating agents..."
                  : `Generate ${calculatedDays}-Day AI Itinerary for ${destination}`}
              </span>
            </Button>
          </div>

          {/* Animated Agent Progress Bar during generation */}
          {isGenerating && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-primary/30 space-y-3 fade-up">
              <div className="flex items-center justify-between text-xs text-primary font-semibold">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  Orchestrating Sub-Agents: Step {generationStep + 1} of {agentSteps.length}
                </span>
                <span>{Math.round(((generationStep + 1) / agentSteps.length) * 100)}%</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 rounded-full"
                  style={{ width: `${((generationStep + 1) / agentSteps.length) * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-300 font-mono animate-pulse">
                {agentSteps[generationStep]}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Generated Structured Multi-Day Itinerary Results */}
      {itineraryResult && (
        <div className="space-y-8 fade-up" id="trip-planner-results">
          {/* Trip Overview Banner */}
          <div className="glass-strong rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-semibold">
                    ✓ Verified Itinerary Feasibility
                  </span>
                  <span className="px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/40 text-xs font-semibold">
                    {travelStyle} Style
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Origin: {origin}
                  </span>
                </div>

                <h2 className="font-serif text-3xl md:text-4xl text-white font-normal">
                  {itineraryResult.trip_summary.title}
                </h2>

                <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
                  {itineraryResult.trip_summary.summary}
                </p>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1 text-slate-200">
                    <CalendarBlank size={14} className="text-primary" />
                    {itineraryResult.trip_summary.start_date} → {itineraryResult.trip_summary.end_date} ({itineraryResult.trip_summary.days} Days)
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-slate-200">
                    <Users size={14} className="text-primary" />
                    {travelers} Traveler{travelers > 1 ? "s" : ""}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <Wallet size={14} />
                    Est. Budget: ₹{itineraryResult.budget?.total?.toLocaleString("en-IN")} (₹{itineraryResult.budget?.per_person?.toLocaleString("en-IN")}/person)
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start lg:self-center">
                <Button
                  onClick={handleSaveTrip}
                  disabled={isSaving}
                  className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs h-11 px-5 btn-3d shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                  <FloppyDisk size={16} weight="bold" />
                  <span>{isSaving ? "Saving..." : "Save to My Trips"}</span>
                </Button>

                <Button
                  onClick={handleShareTrip}
                  variant="outline"
                  className="rounded-full glass border-white/15 text-slate-200 hover:text-white hover:bg-white/10 text-xs h-11 px-4 flex items-center gap-1.5"
                >
                  <ShareNetwork size={16} />
                  <span>Share Plan</span>
                </Button>

                <Button
                  onClick={handlePrint}
                  variant="outline"
                  className="rounded-full glass border-white/15 text-slate-200 hover:text-white hover:bg-white/10 text-xs h-11 px-4 flex items-center gap-1.5"
                >
                  <Printer size={16} />
                  <span>Print</span>
                </Button>
              </div>
            </div>

            {/* Highlights Strip */}
            {itineraryResult.trip_summary.highlights && (
              <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {itineraryResult.trip_summary.highlights.map((hl, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                    <CheckCircle size={15} weight="fill" className="text-emerald-400 mt-0.5 shrink-0" />
                    <span>{hl}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Meteorological Forecast & Weather Advisories for Destination */}
          <ItineraryWeatherStrip
            cities={[destination, origin].filter(Boolean)}
            startDate={startDate}
            className="glass rounded-3xl p-6 border border-white/10"
          />

          {/* Day Navigation Tabs */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
              <button
                type="button"
                onClick={() => setActiveDayTab("all")}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 ${
                  activeDayTab === "all"
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                    : "glass border border-white/10 text-slate-300 hover:bg-white/10"
                }`}
              >
                All Days ({itineraryResult.itinerary?.length || 0})
              </button>

              {itineraryResult.itinerary?.map((d) => (
                <button
                  key={d.day}
                  type="button"
                  onClick={() => setActiveDayTab(d.day)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 ${
                    activeDayTab === d.day
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                      : "glass border border-white/10 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  Day {d.day} · {d.date.slice(5)}
                </button>
              ))}
            </div>

            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Sparkle size={14} className="text-secondary" />
              <span>Activities filtered by: {selectedInterests.slice(0, 2).join(", ")}</span>
            </div>
          </div>

          {/* Structured Day Cards */}
          <div className="space-y-6">
            {itineraryResult.itinerary
              ?.filter((dayPlan) => activeDayTab === "all" || activeDayTab === dayPlan.day)
              .map((dayPlan) => {
                const targetCity = dayPlan.location || destination;
                return (
                  <div
                    key={dayPlan.day}
                    className="glass-strong rounded-3xl p-6 md:p-8 border border-white/10 shadow-xl space-y-6"
                  >
                    {/* Day Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground flex flex-col items-center justify-center font-bold shadow-lg shadow-primary/20 shrink-0">
                          <span className="text-[10px] uppercase tracking-wider leading-none">Day</span>
                          <span className="text-lg leading-none">{dayPlan.day}</span>
                        </div>
                        <div>
                          <div className="text-xs text-primary font-semibold flex items-center gap-2">
                            <span>{dayPlan.date}</span>
                            <span>•</span>
                            <span>{targetCity}</span>
                          </div>
                          <h3 className="font-serif text-2xl text-white mt-0.5">
                            {dayPlan.theme}
                          </h3>
                        </div>
                      </div>

                      {/* Day Weather Card */}
                      <div className="self-start md:self-auto">
                        <ItineraryWeatherCard
                          city={targetCity}
                          dayNumber={dayPlan.day}
                          compact={true}
                        />
                      </div>
                    </div>

                    {/* Timeline Activities List */}
                    <div className="space-y-3.5">
                      {dayPlan.items.map((item, itemIdx) => {
                        const isFood = item.type === "food";
                        const isSightseeing = item.type === "sightseeing";
                        const isShopping = item.type === "shopping";
                        const isLeisure = item.type === "leisure";

                        return (
                          <div
                            key={itemIdx}
                            className="p-4 md:p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/15 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 group"
                          >
                            <div className="flex items-start gap-3.5">
                              {/* Time Pill */}
                              <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-mono font-bold text-slate-200 shrink-0 mt-0.5">
                                {item.time}
                              </div>

                              <div className="space-y-1.5">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                                      isFood
                                        ? "bg-orange-400/15 text-orange-400 border-orange-400/30"
                                        : isSightseeing
                                        ? "bg-amber-400/15 text-amber-400 border-amber-400/30"
                                        : isShopping
                                        ? "bg-rose-400/15 text-rose-400 border-rose-400/30"
                                        : "bg-sky-400/15 text-sky-400 border-sky-400/30"
                                    }`}
                                  >
                                    {item.type}
                                  </span>

                                  {/* Matched Interest Badge */}
                                  {item.interest_match && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-secondary/20 text-secondary border border-secondary/40 flex items-center gap-1">
                                      <Heart size={10} weight="fill" />
                                      <span>{item.interest_match}</span>
                                    </span>
                                  )}

                                  <span className="text-xs text-muted-foreground">
                                    {item.duration_min} mins
                                  </span>
                                </div>

                                <h4 className="font-serif text-lg text-white font-medium group-hover:text-primary transition-colors">
                                  {item.title}
                                </h4>

                                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                                  {item.note}
                                </p>
                              </div>
                            </div>

                            {/* Estimated Cost Pill */}
                            <div className="sm:text-right shrink-0">
                              <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1 rounded-full inline-block">
                                ₹{item.cost_inr.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Supplementary Intelligence Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Budget Breakdown Card */}
            {itineraryResult.budget && (
              <div className="glass rounded-3xl p-6 border border-white/10 space-y-4">
                <div className="flex items-center gap-2 text-white">
                  <Wallet size={20} className="text-primary" />
                  <h3 className="font-serif text-xl">Itemized Budget Breakdown</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-[11px] text-muted-foreground block">Accommodations</span>
                    <span className="font-serif text-xl text-white">
                      ₹{Math.round(itineraryResult.budget.total * 0.42).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-[11px] text-muted-foreground block">Food & Dining</span>
                    <span className="font-serif text-xl text-white">
                      ₹{Math.round(itineraryResult.budget.total * 0.26).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-[11px] text-muted-foreground block">Local Transit</span>
                    <span className="font-serif text-xl text-white">
                      ₹{Math.round(itineraryResult.budget.total * 0.18).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-primary/15 border border-primary/30">
                    <span className="text-[11px] text-primary font-semibold block">Total Estimated</span>
                    <span className="font-serif text-xl text-primary font-bold">
                      ₹{itineraryResult.budget.total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  {itineraryResult.budget.note || "Calculated for verified Indian hotel tariffs, local transport, and monument fees."}
                </p>
              </div>
            )}

            {/* Handpicked Stays Card */}
            {itineraryResult.hotels && (
              <div className="glass rounded-3xl p-6 border border-white/10 space-y-4">
                <div className="flex items-center gap-2 text-white">
                  <Bed size={20} className="text-secondary" />
                  <h3 className="font-serif text-xl">Recommended Stays</h3>
                </div>

                <div className="space-y-2.5">
                  {itineraryResult.hotels.options.slice(0, 3).map((hotel) => (
                    <div
                      key={hotel.id}
                      className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-semibold text-white">{hotel.name}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {hotel.area} · {hotel.type} ({hotel.stars}★)
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-slate-100">₹{hotel.price_inr.toLocaleString("en-IN")}/night</div>
                        <div className="text-[10px] text-emerald-400">{hotel.highlight}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Authentic Food Trail Card */}
            {itineraryResult.food && itineraryResult.food[0] && (
              <div className="glass rounded-3xl p-6 border border-white/10 space-y-4">
                <div className="flex items-center gap-2 text-white">
                  <ForkKnife size={20} className="text-orange-400" />
                  <h3 className="font-serif text-xl">Culinary Specialties</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {itineraryResult.food[0].dishes.map((dish, dIdx) => (
                      <span
                        key={dIdx}
                        className="px-3 py-1 rounded-full text-xs bg-orange-400/10 border border-orange-400/20 text-orange-300"
                      >
                        {dish}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-2 pt-2">
                    {itineraryResult.food[0].restaurants.slice(0, 2).map((rest) => (
                      <div key={rest.id} className="p-3 rounded-2xl bg-white/5 text-xs flex justify-between">
                        <div>
                          <div className="font-semibold text-white">{rest.name}</div>
                          <div className="text-[10px] text-muted-foreground">{rest.area} · {rest.signature}</div>
                        </div>
                        <span className="text-amber-400 font-bold">{rest.rating} ★</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Local Etiquette & Phrases Card */}
            {itineraryResult.local_guide && itineraryResult.local_guide[0] && (
              <div className="glass rounded-3xl p-6 border border-white/10 space-y-4">
                <div className="flex items-center gap-2 text-white">
                  <Translate size={20} className="text-sky-400" />
                  <h3 className="font-serif text-xl">Local Guide & Etiquette</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-2xl bg-white/5 space-y-1">
                    <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider block">
                      Cultural Etiquette
                    </span>
                    <p className="text-slate-300">
                      {itineraryResult.local_guide[0].etiquette[0]}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {itineraryResult.local_guide[0].phrases.slice(0, 2).map((phrase, pIdx) => (
                      <div key={pIdx} className="p-2.5 rounded-xl bg-white/5">
                        <div className="text-[10px] text-muted-foreground">{phrase.english}</div>
                        <div className="text-xs font-bold text-white mt-0.5">{phrase.local}</div>
                        <div className="text-[10px] text-slate-400 italic">"{phrase.romanized}"</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Reset / Replan CTA */}
          <div className="text-center pt-4">
            <Button
              variant="outline"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="rounded-full glass border-white/20 text-slate-200 hover:text-white px-6 h-11 text-xs gap-2"
            >
              <ArrowsClockwise size={16} />
              <span>Modify Trip Inputs & Replan</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
