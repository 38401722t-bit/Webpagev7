import { useEffect, useState, useRef } from "react";
import { http, API } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Star, Trash, ChatText, Image as ImageIcon, X } from "@phosphor-icons/react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Stars = ({ value, onChange, size = 18 }) => (
  <div className="flex gap-1">
    {[1,2,3,4,5].map((n) => (
      <button key={n} type="button" onClick={() => onChange?.(n)} data-testid={`star-${n}`}
        className={`transition-transform duration-150 ${onChange ? "hover:scale-125" : ""}`}>
        <Star size={size} weight={n <= value ? "fill" : "regular"} className={n <= value ? "text-amber-400" : "text-muted-foreground/40"} />
      </button>
    ))}
  </div>
);

const FeedbackSection = ({ destId, destName }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [avg, setAvg] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [photoPath, setPhotoPath] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const load = async () => {
    const { data } = await http.get(`/feedback/${destId}`);
    setItems(data.items); setAvg(data.average_rating);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [destId]);

  const pickPhoto = () => fileRef.current?.click();
  const onPickFile = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 6 * 1024 * 1024) { toast.error("Image must be under 6 MB"); return; }
    setUploading(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const { data } = await http.post("/upload/photo", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setPhotoPath(data.path);
      setPhotoPreview(URL.createObjectURL(file));
      toast.success("Photo attached");
    } catch (e) { toast.error(e?.response?.data?.detail || "Upload failed"); }
    setUploading(false);
  };
  const removePhoto = () => { setPhotoPath(null); if (photoPreview) URL.revokeObjectURL(photoPreview); setPhotoPreview(null); };

  const submit = async () => {
    if (!comment.trim()) { toast.error("Please write a comment"); return; }
    setSubmitting(true);
    try {
      await http.post("/feedback", { destination_id: destId, rating, comment, photo_path: photoPath });
      setComment(""); setRating(5); removePhoto(); toast.success("Thanks for your feedback!"); load();
    } catch (e) { toast.error(e?.response?.data?.detail || "Could not submit"); }
    setSubmitting(false);
  };

  const remove = async (id) => {
    try { await http.delete(`/feedback/${id}`); toast.success("Deleted"); load(); }
    catch { toast.error("Could not delete"); }
  };

  return (
    <div className="glass rounded-3xl p-6" data-testid="feedback-section">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <div className="label-eyebrow">Traveller reviews</div>
          <div className="font-serif text-3xl">What people say about {destName}</div>
        </div>
        {avg !== null && (
          <div className="text-right">
            <div className="font-serif text-4xl">{avg}<span className="text-lg text-muted-foreground">/5</span></div>
            <div className="text-xs text-muted-foreground">{items.length} review{items.length!==1?"s":""}</div>
          </div>
        )}
      </div>

      {user ? (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-sm font-medium">Your rating:</div>
            <Stars value={rating} onChange={setRating} />
          </div>
          <Textarea data-testid="feedback-input" placeholder={`Share your experience of ${destName}…`} value={comment} onChange={(e) => setComment(e.target.value)} className="bg-white/5 border-white/10" rows={3} />
          <input ref={fileRef} type="file" accept="image/*" onChange={onPickFile} className="hidden" data-testid="feedback-photo-input" />
          {photoPreview && (
            <div className="relative mt-3 inline-block">
              <img src={photoPreview} alt="preview" className="w-32 h-32 rounded-2xl object-cover border border-white/10" data-testid="feedback-photo-preview" />
              <button onClick={removePhoto} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center" data-testid="feedback-photo-remove"><X size={12} /></button>
            </div>
          )}
          <div className="mt-3 flex justify-between items-center flex-wrap gap-2">
            <Button data-testid="feedback-photo-btn" type="button" variant="outline" size="sm" onClick={pickPhoto} disabled={uploading} className="rounded-full bg-white/5 border-white/10">
              <ImageIcon size={14} className="mr-1" />{uploading ? "Uploading…" : photoPath ? "Change photo" : "Add photo"}
            </Button>
            <Button data-testid="submit-feedback-btn" onClick={submit} disabled={submitting} className="rounded-full btn-3d bg-primary text-primary-foreground hover:bg-primary/90">
              {submitting ? "Posting…" : "Post feedback"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-6 flex items-center justify-between flex-wrap gap-3">
          <div className="text-sm">Log in to share your experience about this place.</div>
          <div className="flex gap-2">
            <Link to="/login"><Button data-testid="feedback-login-btn" variant="outline" size="sm">Log in</Button></Link>
            <Link to="/register"><Button size="sm" className="rounded-full">Sign up</Button></Link>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {items.length === 0 && <div className="text-sm text-muted-foreground flex items-center gap-2"><ChatText size={18} />Be the first to review.</div>}
        {items.map((f) => (
          <div key={f.id} className="p-4 rounded-2xl bg-white/5 border border-white/10" data-testid={`review-${f.id}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground flex items-center justify-center font-semibold text-sm">{f.user_name.slice(0,1).toUpperCase()}</div>
                <div>
                  <div className="font-medium text-sm">{f.user_name}</div>
                  <div className="text-xs text-muted-foreground">{new Date(f.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Stars value={f.rating} size={14} />
                {user?.id === f.user_id && (
                  <button onClick={() => remove(f.id)} data-testid={`delete-${f.id}`} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash size={16} />
                  </button>
                )}
              </div>
            </div>
            <p className="mt-3 text-sm">{f.comment}</p>
            {f.photo_path && (
              <a href={`${API}/files/${f.photo_path}`} target="_blank" rel="noreferrer" className="mt-3 block">
                <img src={`${API}/files/${f.photo_path}`} alt="review" className="w-full max-w-md rounded-2xl border border-white/10" data-testid={`review-photo-${f.id}`} loading="lazy" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackSection;
