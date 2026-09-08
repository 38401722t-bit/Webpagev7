import React from "react";
import { useSearchParams } from "react-router-dom";
import { Airplane } from "@phosphor-icons/react";
import TripPlanner from "../components/TripPlanner";

const Planner = () => {
  const [searchParams] = useSearchParams();
  const initialDestination = searchParams.get("to") || "Jaipur";

  return (
    <div className="min-h-screen pb-24 pt-6 px-4 md:px-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="label-eyebrow flex items-center gap-1.5 text-sky-600 font-bold uppercase tracking-wider text-[11px]">
          <Airplane size={14} className="text-sky-600" /> AI Travel Architect
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold mt-1 mb-2 text-slate-900 tracking-tight">
          Interactive Trip Planner
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl font-medium">
          Customize your destination, exact calendar dates, and travel interests. TripPilot orchestrates multi-agent itineraries with verified transport, budget estimates, and live weather advisories.
        </p>
      </div>

      {/* AI-Powered Trip Planner Component */}
      <TripPlanner initialDestination={initialDestination} />
    </div>
  );
};

export default Planner;
