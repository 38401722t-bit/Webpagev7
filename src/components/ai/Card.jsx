export const AICard = ({ title, icon: Icon, testid, children, className = "", right }) => (
  <section data-testid={testid} className={`glass rounded-3xl p-4 md:p-5 ${className}`}>
    {(title || right) && (
      <header className="flex items-center justify-between gap-3 mb-3">
        <div className="label-eyebrow flex items-center gap-1.5">{Icon && <Icon size={12} weight="duotone" />}{title}</div>
        {right}
      </header>
    )}
    {children}
  </section>
);

export const Chip = ({ children, tone = "default", className = "" }) => {
  const tones = {
    default: "bg-white/5 border-white/10 text-foreground/80",
    primary: "bg-primary/15 border-primary/25 text-primary",
    secondary: "bg-secondary/15 border-secondary/25 text-secondary",
    warning: "bg-amber-400/15 border-amber-400/30 text-amber-300",
    danger: "bg-red-500/15 border-red-500/30 text-red-300",
    info: "bg-sky-400/10 border-sky-400/25 text-sky-200",
    success: "bg-emerald-400/15 border-emerald-400/30 text-emerald-300",
  };
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium ${tones[tone] || tones.default} ${className}`}>{children}</span>;
};

export const inr = (n) => (n == null ? "—" : `₹${Number(n).toLocaleString("en-IN")}`);
