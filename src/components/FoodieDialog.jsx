import { useEffect, useState } from "react";
import { http } from "../lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Star, MapPin, ArrowUpRight, Lightbulb, ForkKnife } from "@phosphor-icons/react";

const FoodieDialog = ({ open, onClose, destId, destName, dish }) => {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!open || !dish) return;
    setData(null); setErr(null);
    http.get(`/foodie/${destId}?dish=${encodeURIComponent(dish)}`)
      .then((r) => setData(r.data))
      .catch(() => setErr("Could not load restaurants"));
  }, [open, destId, dish]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose?.()}>
      <DialogContent className="glass-strong border-white/10 max-w-2xl max-h-[85vh] overflow-y-auto no-scrollbar" data-testid="foodie-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ForkKnife size={22} weight="duotone" className="text-secondary" />
            <span>Where to eat <span className="italic text-secondary">{dish}</span> in {destName}</span>
          </DialogTitle>
        </DialogHeader>

        {err && <div className="text-sm text-muted-foreground py-6" data-testid="foodie-error">{err}</div>}
        {!data && !err && (
          <div className="space-y-3 py-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        )}

        {data && data.restaurants.length === 0 && (
          <div className="text-sm text-muted-foreground py-6 text-center">No restaurant suggestions right now — try a Google search instead.</div>
        )}

        {data && data.restaurants.length > 0 && (
          <div className="space-y-3 mt-2">
            {data.restaurants.map((r) => (
              <a key={r.id} href={r.maps_url} target="_blank" rel="noreferrer" data-testid={`foodie-${r.id}`}
                className="block glass rounded-2xl p-4 glass-hover">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold flex items-center gap-1">{r.name}<ArrowUpRight size={14} className="opacity-60" /></div>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {r.area && <span className="flex items-center gap-1"><MapPin size={11} />{r.area}</span>}
                      {r.rating && <span className="flex items-center gap-0.5"><Star size={11} weight="fill" className="text-amber-400" />{r.rating}</span>}
                      {r.price_range && <span>{r.price_range}</span>}
                    </div>
                    {r.signature && <div className="mt-2 text-sm text-foreground/85">Try: <span className="italic">{r.signature}</span></div>}
                    {r.tip && (
                      <div className="mt-2 flex items-start gap-1.5 text-xs text-primary/90">
                        <Lightbulb size={14} weight="duotone" className="shrink-0 mt-0.5" />
                        <span>{r.tip}</span>
                      </div>
                    )}
                  </div>
                </div>
              </a>
            ))}
            <p className="text-xs text-muted-foreground pt-1">Restaurant picks are AI-generated for planning — confirm hours and location on Google Maps before you visit.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FoodieDialog;
