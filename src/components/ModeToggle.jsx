import { useMode } from "../context/ModeContext";

const ModeToggle = ({ compact = false }) => {
  const { mode, setMode } = useMode();
  return (
    <div data-testid="mode-toggle" role="radiogroup" aria-label="Interface mode"
      className={`inline-flex items-center rounded-full glass border border-white/10 p-0.5 ${compact ? "h-8" : "h-9"}`}>
      {["simple", "advanced"].map((m) => (
        <button key={m} role="radio" aria-checked={mode === m} data-testid={`mode-${m}`} onClick={() => setMode(m)}
          className={`px-3 h-full rounded-full text-[11px] font-semibold tracking-wide uppercase transition-colors ${mode === m ? "bg-primary text-primary-foreground shadow" : "text-foreground/60 hover:text-foreground"}`}>
          {m}
        </button>
      ))}
    </div>
  );
};

export default ModeToggle;
