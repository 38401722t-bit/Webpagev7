import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { CloudRain, Prohibit, Car, TrainSimple, PencilSimple, Clock, Wallet } from "@phosphor-icons/react";

const triggers = [
  { id: "weather", label: "Bad weather", icon: CloudRain, hint: "e.g. Heavy rain in Goa on day 2" },
  { id: "closure", label: "Closure", icon: Prohibit, hint: "e.g. Amber Fort closed on Monday" },
  { id: "traffic", label: "Traffic", icon: Car, hint: "e.g. NH48 jammed, 3h extra on the drive" },
  { id: "transport_delay", label: "Transport delay", icon: TrainSimple, hint: "e.g. Train delayed by 4 hours" },
  { id: "late_arrival", label: "Late arrival", icon: Clock, hint: "e.g. Reaching hotel at 11pm on day 1" },
  { id: "budget_change", label: "Budget change", icon: Wallet, hint: "e.g. Cut total budget to ₹25,000" },
  { id: "user_change", label: "My change", icon: PencilSimple, hint: "e.g. Skip the museum, add a sunset boat ride" },
];

const ReplanDialog = ({ open, onClose, onSubmit, tripTitle }) => {
  const [type, setType] = useState("weather");
  const [details, setDetails] = useState("");
  const [day, setDay] = useState("");
  const [budget, setBudget] = useState("");
  const t = triggers.find((x) => x.id === type);
  const submit = () => {
    if (!details.trim()) return;
    onSubmit({ trigger_type: type, details: details.trim(), day: day ? +day : null, new_budget: type === "budget_change" && budget ? +budget : null });
    setDetails("");
  };
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="glass-strong border-white/10 max-w-lg" data-testid="replan-dialog">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Replan {tripTitle ? `“${tripTitle}”` : "this trip"}</DialogTitle>
          <DialogDescription>Tell TripPilot what changed. It edits only the affected parts of your itinerary.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-2">
          {triggers.map((tr) => (
            <button key={tr.id} onClick={() => setType(tr.id)} data-testid={`replan-trigger-${tr.id}`}
              className={`p-2.5 rounded-2xl border text-xs flex flex-col items-center gap-1 transition-colors ${type === tr.id ? "bg-primary text-primary-foreground border-primary" : "bg-white/5 border-white/10 hover:bg-white/10"}`}>
              <tr.icon size={18} weight="duotone" />{tr.label}
            </button>
          ))}
        </div>
        <Input data-testid="replan-details" value={details} onChange={(e) => setDetails(e.target.value)} placeholder={t?.hint} className="h-11 bg-white/5 border-white/10 mt-3" onKeyDown={(e) => e.key === "Enter" && submit()} />
        <div className="grid grid-cols-2 gap-2">
          <Input data-testid="replan-day" type="number" min={1} value={day} onChange={(e) => setDay(e.target.value)} placeholder="Affected day (optional)" className="h-10 bg-white/5 border-white/10" />
          {type === "budget_change" && <Input data-testid="replan-budget" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="New total budget ₹" className="h-10 bg-white/5 border-white/10" />}
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" onClick={onClose} className="rounded-full bg-white/5 border-white/10">Cancel</Button>
          <Button onClick={submit} disabled={!details.trim()} data-testid="replan-submit" className="rounded-full btn-3d bg-primary text-primary-foreground">Replan</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReplanDialog;
