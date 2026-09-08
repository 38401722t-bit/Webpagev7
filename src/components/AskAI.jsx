import { Link } from "react-router-dom";
import { Sparkle } from "@phosphor-icons/react";
import { Button } from "./ui/button";

// Contextual "Ask AI" entry point: prefills TripPilot with a prompt and optional trip context.
const AskAI = ({ prompt, tripId, label = "Ask AI", replan = false, size = "sm", className = "", testid = "ask-ai-btn", variant = "outline" }) => {
  const q = new URLSearchParams();
  if (prompt) q.set("q", prompt);
  if (tripId) q.set("trip", tripId);
  if (replan) q.set("replan", "1");
  return (
    <Link to={`/ai${q.toString() ? `?${q}` : ""}`} data-testid={testid}>
      <Button size={size} variant={variant} className={`rounded-full ${variant === "outline" ? "bg-secondary/15 border-secondary/30 text-secondary hover:bg-secondary/25" : "btn-3d bg-secondary text-secondary-foreground hover:bg-secondary/90"} ${className}`}>
        <Sparkle size={14} weight="fill" className="mr-1" />{label}
      </Button>
    </Link>
  );
};

export default AskAI;
