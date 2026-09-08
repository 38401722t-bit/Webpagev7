import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { http } from "../lib/api";
import {
  ArrowRight,
  ArrowsLeftRight,
  MagnifyingGlass,
  MapPin,
  CalendarBlank,
  UsersThree,
  Sparkle,
  Bed,
  Coins,
  Robot,
  Heart,
  CloudSun,
  Mountains,
  Crosshair,
  Microphone,
  Stop,
  CaretDown,
} from "@phosphor-icons/react";
import { Button } from "../components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { Input } from "../components/ui/input";
import WishlistButton from "../components/WishlistButton";
import WeatherCard from "../components/WeatherCard";
import { toast } from "sonner";

// 5 Curated Destinations directly matching the user's reference image
const FEATURED_DESTINATIONS = [
  {
    id: "goa",
    destId: "ga-north-goa",
    name: "Goa",
    subtitle: "Beaches & More",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80",
    rating: 4.8,
  },
  {
    id: "manali",
    destId: "hp-manali",
    name: "Manali",
    subtitle: "Mountains Call",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80",
    rating: 4.9,
  },
  {
    id: "kerala",
    destId: "kl-alleppey",
    name: "Kerala",
    subtitle: "God's Own Country",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80",
    rating: 4.9,
  },
  {
    id: "jaipur",
    destId: "rj-jaipur",
    name: "Jaipur",
    subtitle: "Royal Heritage",
    image: "https://images.unsplash.com/photo-1609948549485-6188e0b6796c?w=800&q=80",
    rating: 4.7,
  },
  {
    id: "varanasi",
    destId: "up-varanasi",
    name: "Varanasi",
    subtitle: "Spiritual India",
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&q=80",
    rating: 4.8,
  },
];

const QUICK_CATEGORIES = [
  {
    icon: Mountains,
    color: "text-emerald-600 bg-emerald-50",
    title: "Popular Places",
    to: "/destinations",
  },
  {
    icon: Crosshair,
    color: "text-cyan-600 bg-cyan-50",
    title: "Near Me",
    to: "/explore",
  },
  {
    icon: CloudSun,
    color: "text-amber-600 bg-amber-50",
    title: "Live Weather",
    to: "/weather",
  },
  {
    icon: Bed,
    color: "text-indigo-600 bg-indigo-50",
    title: "Hotels",
    to: "/destinations",
  },
  {
    icon: Coins,
    color: "text-yellow-600 bg-yellow-50",
    title: "Budget Planner",
    to: "/planner",
  },
  {
    icon: Robot,
    color: "text-sky-600 bg-sky-50",
    title: "AI Assistant",
    to: "/ai",
  },
];

const POPULAR_CITIES = [
  "Hyderabad",
  "Goa",
  "Manali",
  "Kerala",
  "Jaipur",
  "Varanasi",
  "Delhi",
  "Mumbai",
  "Bengaluru",
  "Udaipur",
  "Kochi",
  "Kolkata",
  "Chennai",
  "Srinagar",
];

const Home = () => {
  const [fromCity, setFromCity] = useState("Hyderabad");
  const [toCity, setToCity] = useState("Goa");
  const [travelDates, setTravelDates] = useState("10 Sep - 15 Sep");
  const [people, setPeople] = useState("2");
  const [weatherCity, setWeatherCity] = useState("Jaipur");
  const [allDestinations, setAllDestinations] = useState([]);
  const [listening, setListening] = useState(false);
  const recogRef = useRef(null);
  const navigate = useNavigate();

  const hasMic = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    http.get("/destinations").then((r) => {
      setAllDestinations(r.data);
    }).catch(() => {});
  }, []);

  const swapCities = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  const handlePlanTrip = () => {
    // Look up matching destination IDs
    const matchedDest = allDestinations.find(
      (d) => d.name.toLowerCase().includes(toCity.toLowerCase()) || d.state.toLowerCase().includes(toCity.toLowerCase())
    );
    if (matchedDest) {
      navigate(`/explore?from=${encodeURIComponent(fromCity)}&to=${matchedDest.id}&people=${people}`);
    } else {
      navigate(`/planner?from=${encodeURIComponent(fromCity)}&to=${encodeURIComponent(toCity)}&people=${people}`);
    }
  };

  const voiceSearch = () => {
    if (!hasMic) {
      toast.error("Voice search isn't supported by this browser");
      navigate("/translator");
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR();
    r.lang = "en-IN";
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.continuous = false;
    r.onstart = () => setListening(true);
    r.onend = () => setListening(false);
    r.onerror = (e) => {
      setListening(false);
      if (e.error !== "aborted") toast.error(`Voice error: ${e.error}`);
    };
    r.onresult = (e) => {
      const spoken = Array.from(e.results)
        .map((res) => res[0].transcript)
        .join(" ")
        .trim()
        .toLowerCase();
      if (!spoken) return;
      const match = allDestinations.find(
        (d) => spoken.includes(d.name.toLowerCase()) || spoken.includes(d.state.toLowerCase())
      );
      if (match) {
        setToCity(match.name);
        toast.success(`Selected "${match.name}"`);
        navigate(`/destinations/${match.id}`);
      } else {
        toast.info(`Heard "${spoken}"`);
        setToCity(spoken.charAt(0).toUpperCase() + spoken.slice(1));
      }
    };
    recogRef.current = r;
    try {
      r.start();
    } catch {
      setListening(false);
      toast.error("Could not access microphone");
    }
  };

  const stopVoice = () => {
    try {
      recogRef.current?.stop();
    } catch {}
    setListening(false);
  };

  return (
    <div className="pb-24">
      {/* 1. HERO SECTION matching reference image */}
      <section className="relative w-full min-h-[480px] sm:min-h-[520px] md:min-h-[580px] flex flex-col justify-center items-center text-center overflow-hidden pt-28 pb-32 px-4">
        {/* Scenic Alpine Mountain Lake Background Backdrop */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=85')`,
          }}
        />

        {/* Soft Vignette Overlay: Crisp white text on top, smooth fade into #F4F7FB canvas at bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-[#F4F7FB]" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 fade-up">
          <span className="block text-white/95 font-semibold text-lg sm:text-xl md:text-2xl uppercase tracking-[0.2em] drop-shadow-md mb-1">
            Explore
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.05] drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
            Incredible India
          </h1>
          <p className="mt-3 text-base sm:text-lg md:text-xl text-white font-medium drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)] max-w-2xl mx-auto">
            Simple trips. Memorable experiences.
          </p>

          {/* Quick Voice & AI Prompt Buttons */}
          <div className="mt-5 flex items-center justify-center gap-3">
            <Link
              to="/ai"
              data-testid="hero-ai-btn"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white text-xs sm:text-sm font-semibold border border-white/40 hover:bg-white/30 transition-colors shadow-sm"
            >
              <Sparkle size={16} weight="fill" className="text-amber-300" /> Ask TripPilot AI
            </Link>
            <button
              onClick={listening ? stopVoice : voiceSearch}
              data-testid="hero-mic-btn"
              aria-label="Voice search destination"
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full backdrop-blur-md text-xs sm:text-sm font-semibold border transition-colors shadow-sm ${
                listening
                  ? "bg-rose-500 text-white border-rose-400 animate-pulse"
                  : "bg-white/20 text-white border-white/40 hover:bg-white/30"
              }`}
            >
              {listening ? <Stop size={16} weight="fill" /> : <Microphone size={16} weight="fill" />}
              <span>{listening ? "Listening…" : "Voice"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. FLOATING TRIP BOOKING BAR matching reference image */}
      <section className="-mt-16 sm:-mt-20 relative z-20 max-w-5xl mx-auto px-4 w-full">
        <div className="bg-white rounded-2xl md:rounded-3xl p-3 md:p-4 shadow-[0_15px_45px_-10px_rgba(15,23,42,0.12)] border border-slate-100/90">
          <div className="grid grid-cols-1 md:grid-cols-[1.3fr_auto_1.3fr_1.3fr_1.1fr_auto] gap-2 md:gap-3 items-center">
            {/* FROM FIELD */}
            <div className="bg-slate-50 hover:bg-slate-100/80 rounded-xl md:rounded-2xl p-2.5 px-3.5 transition-colors border border-slate-100 flex items-center gap-3">
              <MapPin size={22} weight="duotone" className="text-slate-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-600">From</div>
                <input
                  type="text"
                  value={fromCity}
                  onChange={(e) => setFromCity(e.target.value)}
                  placeholder="Departure city"
                  className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none placeholder:text-slate-400"
                  data-testid="home-from-input"
                />
              </div>
            </div>

            {/* SWAP BUTTON */}
            <div className="hidden md:flex justify-center">
              <button
                type="button"
                onClick={swapCities}
                title="Swap cities"
                aria-label="Swap origin and destination"
                className="w-9 h-9 rounded-full border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <ArrowsLeftRight size={15} weight="bold" />
              </button>
            </div>

            {/* TO FIELD */}
            <div className="bg-slate-50 hover:bg-slate-100/80 rounded-xl md:rounded-2xl p-2.5 px-3.5 transition-colors border border-slate-100 flex items-center gap-3">
              <MapPin size={22} weight="duotone" className="text-slate-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-600">To</div>
                <input
                  type="text"
                  value={toCity}
                  onChange={(e) => setToCity(e.target.value)}
                  placeholder="Destination city"
                  className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none placeholder:text-slate-400"
                  data-testid="home-to-input"
                />
              </div>
            </div>

            {/* TRAVEL DATES FIELD */}
            <div className="bg-slate-50 hover:bg-slate-100/80 rounded-xl md:rounded-2xl p-2.5 px-3.5 transition-colors border border-slate-100 flex items-center gap-3">
              <CalendarBlank size={22} weight="duotone" className="text-slate-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-600">Travel Dates</div>
                <input
                  type="text"
                  value={travelDates}
                  onChange={(e) => setTravelDates(e.target.value)}
                  placeholder="e.g. 10 Sep - 15 Sep"
                  className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none placeholder:text-slate-400"
                  data-testid="home-dates-input"
                />
              </div>
            </div>

            {/* PEOPLE FIELD */}
            <div className="bg-slate-50 hover:bg-slate-100/80 rounded-xl md:rounded-2xl p-2.5 px-3.5 transition-colors border border-slate-100 flex items-center gap-3">
              <UsersThree size={22} weight="duotone" className="text-slate-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-600">Guests</div>
                <select
                  value={people}
                  onChange={(e) => setPeople(e.target.value)}
                  className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
                  data-testid="home-people-select"
                >
                  <option value="1">1 Person</option>
                  <option value="2">2 People</option>
                  <option value="3">3 People</option>
                  <option value="4">4 People</option>
                  <option value="5">5+ People</option>
                  <option value="10">Group (10+)</option>
                </select>
              </div>
            </div>

            {/* PLAN MY TRIP BUTTON matching orange CTA */}
            <button
              onClick={handlePlanTrip}
              data-testid="home-search-btn"
              className="btn-orange w-full md:w-auto h-12 md:h-14 px-6 md:px-7 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 text-white font-bold text-sm md:text-base cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap"
            >
              <MagnifyingGlass size={18} weight="bold" />
              <span>Plan My Trip</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. CATEGORY QUICK-NAV TILES (The 6 Cards in Reference Image) */}
      <section className="max-w-5xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {QUICK_CATEGORIES.map((cat, idx) => (
            <Link
              key={idx}
              to={cat.to}
              data-testid={`quick-cat-${cat.title.toLowerCase().replace(/\s+/g, "-")}`}
              className="bg-white rounded-2xl p-4 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.04)] border border-slate-100 hover:border-sky-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col items-center justify-center text-center group cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${cat.color}`}>
                <cat.icon size={24} weight="duotone" />
              </div>
              <div className="mt-2.5 font-bold text-xs sm:text-sm text-slate-800 group-hover:text-sky-700 transition-colors">
                {cat.title}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. POPULAR DESTINATIONS SECTION (The 5 Portrait Cards in Reference Image) */}
      <section className="max-w-5xl mx-auto px-4 mt-14" data-testid="popular-destinations-section">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Popular Destinations
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Iconic heritage, serene beaches, and alpine mountain getaways.
            </p>
          </div>
          <Link
            to="/destinations"
            data-testid="see-all-btn"
            className="text-sm font-bold text-sky-600 hover:text-sky-700 inline-flex items-center gap-1 group transition-colors"
          >
            <span>View All</span>
            <ArrowRight size={14} weight="bold" className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 5 Portrait Cards Grid matching reference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {FEATURED_DESTINATIONS.map((dest) => (
            <div
              key={dest.id}
              data-testid={`popular-${dest.id}`}
              className="relative rounded-2xl overflow-hidden aspect-[3/4] shadow-[0_8px_20px_-4px_rgba(15,23,42,0.1)] border border-slate-100 group hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300"
            >
              {/* Background Image */}
              <img
                src={dest.image}
                alt={dest.name}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Protective Dark Gradient Scrim for crisp text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

              {/* Top Row: Wishlist Heart & Rating */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20">
                  ★ {dest.rating}
                </span>
                <WishlistButton
                  destinationId={dest.destId}
                  className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-800 backdrop-blur-md shadow-sm"
                />
              </div>

              {/* Bottom Row: Destination Title & Subtitle */}
              <Link
                to={`/destinations/${dest.destId}`}
                className="absolute inset-x-0 bottom-0 p-4 z-10 block"
              >
                <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight drop-shadow-sm group-hover:text-amber-200 transition-colors">
                  {dest.name}
                </div>
                <div className="text-xs font-semibold text-white/90 mt-0.5 drop-shadow-sm">
                  {dest.subtitle}
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* "Travel More, Live Better" Handwritten Script Accent matching reference image */}
        <div className="flex flex-col items-end mt-4 mr-2">
          <span className="font-script text-3xl sm:text-4xl text-slate-800 font-bold -rotate-1 select-none">
            Travel More, Live Better
          </span>
          <svg className="w-36 h-2 text-orange-500/80 -mt-1" viewBox="0 0 140 8" fill="none">
            <path d="M2 6C35 2 95 2 138 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      </section>

      {/* 5. LIVE METEOROLOGY & WEATHER SHOWCASE */}
      <section className="max-w-5xl mx-auto px-4 mt-14" data-testid="home-weather-section">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-3">
          <div>
            <div className="label-eyebrow text-sky-600 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <CloudSun size={18} weight="duotone" className="text-amber-500" />
              <span>Real-Time Meteorology</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Live Weather Across India
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Check live temperature, humidity, and 5-day forecasts before planning daily excursions.
            </p>
          </div>
          <Link
            to={`/weather?city=${encodeURIComponent(weatherCity)}`}
            data-testid="home-weather-see-more"
            className="text-xs sm:text-sm font-bold text-sky-600 hover:text-sky-700 inline-flex items-center gap-1 transition-colors"
          >
            <span>All Indian Cities</span>
            <ArrowRight size={14} weight="bold" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Quick city selector buttons */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05)] space-y-4">
            <div className="font-bold text-sm text-slate-800">Select an Indian City</div>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_CITIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setWeatherCity(c)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    weatherCity.toLowerCase() === c.toLowerCase()
                      ? "bg-sky-600 text-white border-sky-600 font-bold shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium"
                  }`}
                  data-testid={`home-weather-chip-${c.toLowerCase()}`}
                >
                  {c}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const q = e.target.elements.citySearch?.value?.trim();
                if (q) {
                  setWeatherCity(q);
                  navigate(`/weather?city=${encodeURIComponent(q)}`);
                }
              }}
              className="pt-3 border-t border-slate-100 flex gap-2"
            >
              <Input
                name="citySearch"
                placeholder="Search any Indian city..."
                className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl text-xs sm:text-sm h-10 focus:border-sky-500 font-medium"
              />
              <Button
                type="submit"
                size="sm"
                className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold h-10 px-4 shadow-sm shrink-0"
              >
                <MagnifyingGlass size={16} weight="bold" />
              </Button>
            </form>
          </div>

          {/* Live Weather Card Display */}
          <div className="lg:col-span-8">
            <WeatherCard city={weatherCity} />
          </div>
        </div>
      </section>

      {/* 6. AI TRIP PILOT & INTERACTIVE ASSISTANT HIGHLIGHT */}
      <section className="max-w-5xl mx-auto px-4 mt-16">
        <div className="bg-gradient-to-br from-purple-50 via-white to-sky-50 rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-[0_10px_30px_-5px_rgba(147,51,234,0.06)] relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkle size={14} weight="fill" /> Powered by TripPilot AI
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Plan your multi-day Indian journey in seconds
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Tell TripPilot your destination, travel style, and budget. Our intelligent travel agents optimize your route, discover hidden local foods, and curate unforgettable stays.
              </p>
            </div>
            <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Link to="/ai" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold shadow-lg shadow-purple-500/25 h-12 px-6"
                >
                  <Sparkle size={18} weight="fill" className="mr-2" />
                  Chat with TripPilot
                </Button>
              </Link>
              <Link to="/planner" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto rounded-2xl border-slate-200 text-slate-800 hover:bg-slate-100 font-bold h-12 px-6"
                >
                  Interactive Planner
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. BOTTOM COMMUNITY & ACCOUNT CTA */}
      <section className="max-w-5xl mx-auto px-4 mt-16">
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-100 shadow-[0_15px_40px_-10px_rgba(15,23,42,0.06)] relative overflow-hidden">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Ready to discover Incredible India?
            </h3>
            <p className="text-sm sm:text-base text-slate-600 mt-2.5 leading-relaxed">
              Create a free account to save favorite destinations, build custom itineraries, and access live fare alerts anytime.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link to="/register">
                <button className="btn-orange rounded-full px-8 py-3.5 text-white font-bold text-sm sm:text-base cursor-pointer shadow-lg shadow-orange-500/25">
                  Get Started Free
                </button>
              </Link>
              <Link to="/explore">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full border-slate-200 text-slate-700 hover:bg-slate-50 font-bold h-12 px-7"
                >
                  Explore All 28 States
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export const DestCard = ({ d, testid }) => (
  <Link
    to={`/destinations/${d.id}`}
    data-testid={testid}
    className="group relative block rounded-2xl overflow-hidden aspect-[3/4] bg-white border border-slate-100 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.06)] hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
  >
    <div className="relative w-full h-full overflow-hidden">
      <img
        src={d.image}
        alt={d.name}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />
      <div className="absolute top-3 right-3 z-10">
        <WishlistButton destinationId={d.id} className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-800 backdrop-blur-md shadow-sm" />
      </div>
      <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-white text-[11px] font-bold border border-white/20">
        ★ {d.rating}
      </div>
      <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white z-10">
        <div className="text-[10px] tracking-wider uppercase font-bold text-amber-300 drop-shadow-sm">{d.state}</div>
        <div className="font-extrabold text-xl leading-snug tracking-tight text-white drop-shadow-sm group-hover:text-amber-200 transition-colors">{d.name}</div>
        <div className="text-xs text-white/90 font-medium mt-0.5 flex items-center justify-between">
          <span>₹{d.budget || 1500}/day</span>
          <span className="text-[11px] text-white/80 truncate max-w-[110px]">{d.tag}</span>
        </div>
      </div>
    </div>
  </Link>
);

export default Home;
