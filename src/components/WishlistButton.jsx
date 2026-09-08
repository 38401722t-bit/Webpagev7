import { useAuth } from "../context/AuthContext";
import { http } from "../lib/api";
import { Heart } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const WishlistButton = ({ destinationId, className = "", size = 18, label = false }) => {
  const { user, wishlistIds, refreshWishlist } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const on = wishlistIds?.has(destinationId);

  const toggle = async (e) => {
    e?.preventDefault(); e?.stopPropagation();
    if (!user) { toast.error("Please log in to save"); navigate("/login"); return; }
    setBusy(true);
    try {
      if (on) {
        const list = await http.get("/wishlist");
        const it = list.data.find((w) => w.destination_id === destinationId);
        if (it) await http.delete(`/wishlist/${it.id}`);
        toast.success("Removed from wishlist");
      } else {
        await http.post("/wishlist", { destination_id: destinationId });
        toast.success("Added to wishlist");
      }
      await refreshWishlist();
    } catch (e) { toast.error(e?.response?.data?.detail || "Could not update"); }
    setBusy(false);
  };

  return (
    <button onClick={toggle} disabled={busy} data-testid={`wishlist-btn-${destinationId}`}
      className={`inline-flex items-center gap-1.5 rounded-full transition-all duration-300 ${on ? "bg-secondary/20 text-secondary" : "bg-white/10 text-foreground/80 hover:bg-white/20"} ${className}`}>
      <Heart size={size} weight={on ? "fill" : "regular"} />
      {label && <span className="text-xs font-medium">{on ? "Saved" : "Save"}</span>}
    </button>
  );
};

export default WishlistButton;
