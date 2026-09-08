import { useEffect, useState } from "react";
import { http } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { UserPlus, Users, ThumbsUp, ThumbsDown, PaperPlaneRight, X } from "@phosphor-icons/react";
import { toast } from "sonner";

const TripCollab = ({ trip, onClose, onChanged }) => {
  const { user } = useAuth();
  const [invitees, setInvitees] = useState([]);
  const [comments, setComments] = useState([]);
  const [votes, setVotes] = useState([]);
  const [email, setEmail] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [c, v] = await Promise.all([
      http.get(`/trips/${trip.id}/comments`).catch(() => ({ data: [] })),
      http.get(`/trips/${trip.id}/votes`).catch(() => ({ data: [] })),
    ]);
    setComments(c.data); setVotes(v.data);
  };
  useEffect(() => { if (trip) load(); /* eslint-disable-next-line */ }, [trip?.id]);

  const invite = async (e) => {
    e?.preventDefault();
    if (!email) return;
    setBusy(true);
    try {
      await http.post(`/trips/${trip.id}/invite`, { trip_id: trip.id, email });
      toast.success("Invite sent");
      setEmail("");
    } catch (err) { toast.error(err?.response?.data?.detail || "Could not invite"); }
    setBusy(false);
  };

  const postComment = async () => {
    if (!text.trim()) return;
    try {
      await http.post(`/trips/${trip.id}/comments`, { text });
      setText(""); load();
    } catch (e) { toast.error(e?.response?.data?.detail || "Could not post"); }
  };

  const vote = async (stopId, value) => {
    try { await http.post(`/trips/${trip.id}/votes`, { stop_id: stopId, value }); load(); }
    catch { toast.error("Could not vote"); }
  };

  const voteFor = (stopId) => {
    const rows = votes.filter((v) => v.stop_id === stopId);
    const up = rows.filter((v) => v.value === 1).length;
    const down = rows.filter((v) => v.value === -1).length;
    const mine = rows.find((v) => v.user_id === user?.id);
    return { up, down, mine };
  };

  return (
    <Dialog open={!!trip} onOpenChange={(o) => !o && onClose?.()}>
      <DialogContent className="glass-strong border-white/10 max-w-2xl max-h-[85vh] overflow-y-auto no-scrollbar" data-testid="collab-dialog">
        <DialogHeader><DialogTitle>Collaborate on {trip?.title}</DialogTitle></DialogHeader>

        {trip?.is_owner && (
          <div className="mb-4">
            <div className="label-eyebrow mb-2 flex items-center gap-1"><UserPlus size={12} /> Invite by email</div>
            <form onSubmit={invite} className="flex gap-2">
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="friend@email.com" className="h-10 bg-white/5 border-white/10" data-testid="invite-email-input" />
              <Button type="submit" disabled={busy} className="rounded-full btn-3d bg-primary text-primary-foreground" data-testid="invite-send-btn">{busy ? "Sending…" : "Invite"}</Button>
            </form>
            <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1"><Users size={12} /> {trip.collaborators?.length || 0} collaborator{(trip.collaborators?.length || 0) === 1 ? "" : "s"}</div>
          </div>
        )}

        <div className="mb-4">
          <div className="label-eyebrow mb-2">Vote on stops</div>
          <div className="space-y-1.5">
            {trip?.destinations?.map((d) => {
              const { up, down, mine } = voteFor(d.id);
              return (
                <div key={d.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10" data-testid={`vote-row-${d.id}`}>
                  <img src={d.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{d.name}</div>
                    <div className="text-xs text-muted-foreground">{d.state}</div>
                  </div>
                  <button data-testid={`vote-up-${d.id}`} onClick={() => vote(d.id, 1)} className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs ${mine?.value === 1 ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" : "border-white/10 hover:bg-white/10"}`}>
                    <ThumbsUp size={12} weight={mine?.value === 1 ? "fill" : "regular"} />{up}
                  </button>
                  <button data-testid={`vote-down-${d.id}`} onClick={() => vote(d.id, -1)} className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs ${mine?.value === -1 ? "bg-destructive/20 border-destructive/40 text-destructive" : "border-white/10 hover:bg-white/10"}`}>
                    <ThumbsDown size={12} weight={mine?.value === -1 ? "fill" : "regular"} />{down}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="label-eyebrow mb-2">Group chat</div>
          <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar pr-1" data-testid="collab-comments">
            {comments.length === 0 && <div className="text-sm text-muted-foreground">Say hi to your travel group.</div>}
            {comments.map((c) => (
              <div key={c.id} className="flex items-start gap-2" data-testid={`comment-${c.id}`}>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0">{c.user_name?.slice(0, 1).toUpperCase()}</div>
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">{c.user_name} · {new Date(c.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
                  <div className="text-sm">{c.text}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Share an idea…" className="h-10 bg-white/5 border-white/10" data-testid="comment-input" onKeyDown={(e) => e.key === "Enter" && postComment()} />
            <Button onClick={postComment} className="rounded-full btn-3d bg-primary text-primary-foreground" data-testid="comment-send"><PaperPlaneRight size={14} /></Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TripCollab;
