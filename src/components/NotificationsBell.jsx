import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { http } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Bell, CircleDashed, Check, Heart, Airplane, ChatCircleText, LinkSimple } from "@phosphor-icons/react";

const iconFor = (type) => {
  switch (type) {
    case "fare_hit": return LinkSimple;
    case "invite": return Airplane;
    case "invite_accepted": return Check;
    case "comment": return ChatCircleText;
    default: return CircleDashed;
  }
};
const linkFor = (n) => {
  if (n.type === "fare_hit") return "/alerts";
  if (n.type === "invite") return "/trips";
  if (n.type === "invite_accepted") return "/trips";
  if (n.type === "comment") return "/trips";
  return "#";
};

const NotificationsBell = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef();

  const load = async () => {
    try {
      const { data } = await http.get("/notifications");
      setItems(data.items || []);
      setUnread(data.unread || 0);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    if (!user) return;
    load();
    const iv = setInterval(load, 45000);
    return () => clearInterval(iv);
  }, [user]);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  if (!user) return null;

  const markAllRead = async () => {
    try { await http.post("/notifications/read-all"); load(); } catch {}
  };
  const openItem = async (n) => {
    if (!n.read) { try { await http.patch(`/notifications/${n.id}/read`); } catch {} }
    setOpen(false); load();
  };

  return (
    <div className="relative" ref={ref}>
      <button data-testid="notif-btn" onClick={() => { setOpen((o) => !o); if (!open) load(); }}
        className="relative w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
        <Bell size={18} weight={unread > 0 ? "fill" : "regular"} className={unread > 0 ? "text-primary" : ""} />
        {unread > 0 && <span data-testid="notif-count" className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-secondary text-primary-foreground text-[10px] font-bold flex items-center justify-center">{unread > 9 ? "9+" : unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-12 w-80 glass-strong rounded-2xl fade-up overflow-hidden" data-testid="notif-panel">
          <div className="flex items-center justify-between p-3 border-b border-white/10">
            <div className="font-semibold text-sm">Notifications</div>
            {unread > 0 && <button onClick={markAllRead} data-testid="notif-read-all" className="text-xs text-primary underline underline-offset-4">Mark all read</button>}
          </div>
          <div className="max-h-96 overflow-y-auto no-scrollbar">
            {items.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">You&apos;re all caught up.</div>}
            {items.map((n) => {
              const I = iconFor(n.type);
              return (
                <Link key={n.id} to={linkFor(n)} onClick={() => openItem(n)} data-testid={`notif-item-${n.id}`}
                  className={`flex gap-3 p-3 border-b border-white/5 hover:bg-white/5 transition-colors ${!n.read ? "bg-primary/5" : ""}`}>
                  <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0"><I size={16} weight="duotone" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{n.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">{n.message}</div>
                    <div className="text-[10px] text-muted-foreground/70 mt-1">{new Date(n.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-primary self-center shrink-0" />}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsBell;
