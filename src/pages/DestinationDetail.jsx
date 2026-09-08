import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { http } from "../lib/api";
import {
  ArrowLeft,
  Star,
  MapPin,
  CalendarBlank,
  Sparkle,
  ForkKnife,
  Airplane,
  NavigationArrow,
  ShareNetwork,
} from "@phosphor-icons/react";
import { Button } from "../components/ui/button";
import WishlistButton from "../components/WishlistButton";
import WeatherCard from "../components/WeatherCard";
import CrowdCard from "../components/CrowdCard";
import HotelsCard from "../components/HotelsCard";
import MapView from "../components/MapView";
import FeedbackSection from "../components/FeedbackSection";
import FoodieDialog from "../components/FoodieDialog";
import AskAI from "../components/AskAI";
import { toast } from "sonner";

const DestinationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dest, setDest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDish, setSelectedDish] = useState(null);
  const [foodDialogOpen, setFoodDialogOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    http
      .get(`/destinations/${id}`)
      .then((res) => {
        setDest(res.data);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Destination not found");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${dest.name}, ${dest.state} - Exploro India`,
          text: dest.description,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-24 px-4 max-w-6xl mx-auto flex items-center justify-center">
        <div className="text-center space-y-4 animate-pulse">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Loading destination details…</p>
        </div>
      </div>
    );
  }

  if (!dest) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <h2 className="font-serif text-3xl mb-4">Destination Not Found</h2>
        <p className="text-muted-foreground mb-6">The place you are looking for does not exist in our directory.</p>
        <Link to="/destinations">
          <Button className="rounded-full">Back to Destinations</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 pt-6 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/destinations"
          className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-slate-950 font-semibold bg-white px-4 py-2 rounded-full border border-slate-200 shadow-xs transition-all"
        >
          <ArrowLeft size={16} /> All Destinations
        </Link>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleShare}
            className="rounded-full bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold shadow-xs"
          >
            <ShareNetwork size={16} className="mr-1.5 text-slate-500" /> Share
          </Button>
          <WishlistButton destinationId={dest.id} size={18} label className="px-4 py-2 bg-white border border-slate-200 text-slate-800 shadow-xs" />
        </div>
      </div>

      {/* Hero Visual Card */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-100 shadow-xl mb-8">
        <div className="relative h-[380px] md:h-[480px] w-full">
          <img
            src={dest.image}
            alt={dest.name}
            className="w-full h-full object-cover brightness-[0.8]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>

        <div className="absolute bottom-0 inset-x-0 p-6 md:p-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500 text-white shadow-sm">
              {dest.type}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-md flex items-center gap-1 border border-white/20">
              <MapPin size={13} /> {dest.state}
            </span>
            {dest.best_season && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-md flex items-center gap-1 border border-white/20">
                <CalendarBlank size={13} /> Best: {dest.best_season}
              </span>
            )}
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 flex items-center gap-1 shadow-sm">
              <Star size={13} weight="fill" /> {dest.rating || 4.8}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-3 drop-shadow-md">
            {dest.name}
          </h1>

          <p className="text-white/95 text-sm md:text-base max-w-3xl leading-relaxed mb-6 font-medium drop-shadow-sm">
            {dest.description}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <AskAI
              prompt={`Create a detailed 3-day travel itinerary for ${dest.name} in ${dest.state} with budget, weather tips and best spots.`}
              label="Plan with TripPilot AI"
              size="default"
              variant="default"
              className="px-5 py-2.5 font-bold"
            />
            <Link to={`/planner?to=${encodeURIComponent(dest.id)}`}>
              <button className="btn-orange px-5 py-2.5 rounded-full text-white font-bold text-sm shadow-md flex items-center gap-2">
                <Airplane size={16} weight="fill" /> Build Custom Itinerary
              </button>
            </Link>
            <Link to={`/food-trail/${dest.id}`}>
              <Button variant="outline" className="rounded-full bg-white/20 backdrop-blur-md text-white border-white/40 hover:bg-white/30 font-semibold text-sm">
                <ForkKnife size={16} className="mr-2 text-amber-300" /> View Gastronomic Trail
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid of Intel Cards: Weather, Crowd, Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 space-y-6">
          <WeatherCard city={dest.name} lat={dest.lat} lon={dest.lon} />
          <CrowdCard destId={dest.id} />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="label-eyebrow text-sky-600 font-bold uppercase tracking-wider text-[11px]">Interactive Location</div>
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Geographic Coordinates</h3>
              </div>
              <Link to={`/multi?dest=${dest.id}`}>
                <Button size="sm" variant="outline" className="rounded-full text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50">
                  <NavigationArrow size={14} className="mr-1.5 text-sky-600" /> Multi-stop Map
                </Button>
              </Link>
            </div>
            <MapView
              center={[dest.lat, dest.lon]}
              zoom={11}
              markers={[
                {
                  id: dest.id,
                  name: dest.name,
                  lat: dest.lat,
                  lon: dest.lon,
                  subtitle: `${dest.state} · ${dest.type}`,
                },
              ]}
              height="360px"
            />
          </div>

          {/* Local Food Highlights */}
          {dest.foods && dest.foods.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <ForkKnife size={22} weight="duotone" />
                  </div>
                  <div>
                    <div className="label-eyebrow text-amber-700 font-bold uppercase tracking-wider text-[11px]">Culinary Heritage</div>
                    <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Famous Dishes to Taste</h3>
                  </div>
                </div>
                <Link to={`/food-trail/${dest.id}`} className="text-xs text-sky-600 hover:text-sky-700 font-bold">
                  Explore full trail &rarr;
                </Link>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {dest.foods.map((food, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedDish(food);
                      setFoodDialogOpen(true);
                    }}
                    className="px-4 py-2 rounded-2xl text-xs font-bold bg-slate-50 border border-slate-200 hover:border-orange-300 hover:bg-orange-50 text-slate-800 transition-all flex items-center gap-2 group cursor-pointer"
                  >
                    <span>{food}</span>
                    <span className="text-[10px] text-slate-400 group-hover:text-orange-600">
                      Find spots &rarr;
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stays & Accommodations */}
      <div className="mb-8">
        <HotelsCard lat={dest.lat} lon={dest.lon} />
      </div>

      {/* Community Feedback & Reviews */}
      <div className="mb-8">
        <FeedbackSection destId={dest.id} destName={dest.name} />
      </div>

      {/* Foodie Dialog */}
      {selectedDish && (
        <FoodieDialog
          open={foodDialogOpen}
          onClose={() => setFoodDialogOpen(false)}
          destId={dest.id}
          destName={dest.name}
          dish={selectedDish}
        />
      )}
    </div>
  );
};

export default DestinationDetail;
