import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { http } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useMode } from "../context/ModeContext";
import { Sparkle, Trash, ArrowClockwise, Brain, MapTrifold, ShieldCheck, CloudSun, ForkKnife, Buildings, Airplane } from "@phosphor-icons/react";
import { Button } from "../components/ui/button";
import Composer from "../components/ai/Composer";
import AIMessage, { UserBubble } from "../components/ai/AIMessage";
import AgentProgress from "../components/ai/AgentProgress";
import TripContextPanel from "../components/ai/TripContextPanel";
import ReplanDialog from "../components/ai/ReplanDialog";
import ModeToggle from "../components/ModeToggle";
import { toast } from "sonner";

const QUICK_CHIPS = [
  "Plan a 4-day budget trip to Rajasthan",
  "Romantic monsoon getaway to Kerala backwaters",
  "Varanasi cultural, ghats & spiritual food trail",
  "Compare flight vs train Delhi to Mumbai",
  "Top 5 offbeat hill stations in North-East India",
  "Solo female safety tips for backpacking Himachal",
];

const AGENT_LIST = [
  { name: "Orchestrator", icon: Brain, desc: "Coordinates all specialized agents" },
  { name: "Itinerary Planner", icon: MapTrifold, desc: "Schedules day-by-day sightseeing" },
  { name: "Route & Transport", icon: Airplane, desc: "Optimizes travel paths & trains" },
  { name: "Weather Radar", icon: CloudSun, desc: "Live forecasts & monsoon check" },
  { name: "Hotel Scout", icon: Buildings, desc: "Vetted heritage stays & homestays" },
  { name: "Foodie Guide", icon: ForkKnife, desc: "Regional authentic cuisines" },
  { name: "Safety & Advisory", icon: ShieldCheck, desc: "Verified emergency and local protocols" },
];

const AITravel = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { advanced } = useMode();

  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(null);
  const [activeTrip, setActiveTrip] = useState(null);
  const [showReplan, setShowReplan] = useState(false);

  const bottomRef = useRef(null);

  const initialQuery = searchParams.get("q");
  const initialTripId = searchParams.get("trip");
  const shouldReplan = searchParams.get("replan") === "1";

  // Load trip context if requested
  useEffect(() => {
    if (initialTripId) {
      http
        .get(`/trips`)
        .then((res) => {
          const found = (res.data || []).find((t) => t.id === initialTripId);
          if (found) setActiveTrip(found);
        })
        .catch(() => {});
    }
  }, [initialTripId]);

  // Execute initial search prompt if present in URL
  useEffect(() => {
    if (initialQuery) {
      handleSend(initialQuery);
    }
    if (shouldReplan) {
      setShowReplan(true);
    }
    // Clear the query from URL once handled
    if (initialQuery || shouldReplan) {
      const p = new URLSearchParams(searchParams);
      p.delete("q");
      p.delete("replan");
      setSearchParams(p, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy, currentProgress]);

  const handleSend = async (text) => {
    if (!text.trim() || busy) return;

    const userMsg = { id: "user-" + Date.now(), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setBusy(true);
    setCurrentProgress({ step: "Analyzing query & orchestrating agents…", percent: 25 });

    try {
      const res = await http.post("/ai/chat", {
        prompt: text,
        trip_id: activeTrip?.id || null,
      });

      setCurrentProgress({ step: "Finalizing response…", percent: 95 });
      setTimeout(() => {
        const assistantMsg = {
          id: "ai-" + Date.now(),
          role: "assistant",
          result: res.data,
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setBusy(false);
        setCurrentProgress(null);
      }, 300);
    } catch (err) {
      console.error(err);
      toast.error("TripPilot encountered an error. Please try again.");
      setBusy(false);
      setCurrentProgress(null);
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast.info("Conversation cleared");
  };

  return (
    <div className="min-h-screen pb-32 pt-6 px-4 md:px-8 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Sparkle size={18} weight="fill" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">TripPilot AI</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 uppercase tracking-wider border border-sky-200">
              12 Multi-Agents
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Autonomous multi-agent travel orchestrator powered by Gemini & real-time Indian travel knowledge
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ModeToggle />
          {messages.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={clearChat}
              className="rounded-full bg-white border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs"
            >
              <Trash size={14} className="mr-1.5 text-slate-400" /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* Active Trip Context Header if attached */}
      {activeTrip && (
        <TripContextPanel
          trip={activeTrip}
          onReplan={() => setShowReplan(true)}
          onClear={() => setActiveTrip(null)}
        />
      )}

      {/* Advanced Agent Status Bar */}
      {advanced && (
        <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs mb-6 flex items-center justify-between overflow-x-auto no-scrollbar gap-4">
          <div className="text-xs text-slate-600 font-semibold flex items-center gap-1.5 shrink-0">
            <Brain size={16} className="text-sky-600" /> Active Neural Agents:
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {AGENT_LIST.map((agent, i) => {
              const Icon = agent.icon;
              return (
                <div
                  key={i}
                  title={agent.desc}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] text-slate-700 hover:border-sky-400 cursor-help transition-colors"
                >
                  <Icon size={12} className="text-sky-600" />
                  <span>{agent.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Chat History */}
      <div className="space-y-6 mb-8 min-h-[350px]">
        {messages.length === 0 ? (
          <div className="py-16 text-center space-y-4 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100 flex items-center justify-center mx-auto text-sky-600 shadow-lg shadow-sky-500/10">
              <Sparkle size={32} weight="duotone" />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Where shall we explore in India?</h2>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Ask TripPilot to plan an unforgettable journey, optimize multi-city routes, track real-time weather & crowds, uncover street food, or calculate exact budgets.
            </p>

            <div className="pt-4 flex flex-wrap justify-center gap-2">
              {QUICK_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip)}
                  className="px-3.5 py-2 rounded-2xl text-xs bg-white border border-slate-200 hover:border-sky-400 hover:bg-sky-50 text-slate-700 font-semibold transition-all text-left shadow-xs cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.role === "user") {
              return <UserBubble key={msg.id} text={msg.text} />;
            }
            return (
              <AIMessage
                key={msg.id}
                result={msg.result}
                onPrompt={(prompt) => handleSend(prompt)}
                onApplied={() => {
                  toast.success("Changes applied to trip!");
                }}
              />
            );
          })
        )}

        {/* Live Processing Indicator */}
        {busy && <AgentProgress progress={currentProgress} />}

        <div ref={bottomRef} />
      </div>

      {/* Fixed/Sticky Chat Composer at Bottom */}
      <div className="fixed bottom-0 inset-x-0 p-4 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 z-40 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto">
          <Composer
            onSend={handleSend}
            busy={busy}
            chips={messages.length > 0 ? QUICK_CHIPS.slice(0, 3) : []}
            placeholder="Ask TripPilot anything: itineraries, food trails, routes, budget, weather…"
          />
        </div>
      </div>

      {/* Replan Dialog */}
      {showReplan && (
        <ReplanDialog
          open={showReplan}
          onClose={() => setShowReplan(false)}
          trip={activeTrip}
          onSubmit={(reason) => {
            setShowReplan(false);
            handleSend(`Replan trip ${activeTrip?.title || ""}: ${reason}`);
          }}
        />
      )}
    </div>
  );
};

export default AITravel;
