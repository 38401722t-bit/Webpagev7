import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Compass, House, MapTrifold, Airplane, Heart, UserCircle, SignIn, SignOut, Gear, List, X, Bell, Sparkle, CaretDown, Path, Buildings, Translate, ShieldCheck, NavigationArrow, Suitcase, SquaresFour, CloudSun } from "@phosphor-icons/react";
import { Button } from "./ui/button";
import NotificationsBell from "./NotificationsBell";
import ModeToggle from "./ModeToggle";

const exploreLinks = [
  { to: "/destinations", label: "Destinations", icon: MapTrifold, desc: "1,940+ places across India" },
  { to: "/weather", label: "Weather forecast", icon: CloudSun, desc: "Live weather & 5-day forecasts" },
  { to: "/states", label: "By state", icon: Buildings, desc: "Browse region by region" },
  { to: "/explore", label: "Along the route", icon: Path, desc: "Stops between two cities" },
  { to: "/routes", label: "Compare transport", icon: Airplane, desc: "Train · bus · flight · drive" },
  { to: "/multi", label: "Multi-stop map", icon: NavigationArrow, desc: "Shortest visiting order" },
];
const moreLinks = [
  { to: "/translator", label: "Voice translator", icon: Translate },
  { to: "/safety", label: "Safety info", icon: ShieldCheck },
  { to: "/alerts", label: "Fare alerts", icon: Bell },
  { to: "/wishlist", label: "Wishlist", icon: Heart },
  { to: "/tracking", label: "Live tracking", icon: NavigationArrow },
  { to: "/dashboard", label: "Dashboard", icon: SquaresFour },
];
const explorePaths = exploreLinks.map((l) => l.to);
const morePaths = moreLinks.map((l) => l.to);
const bottomLinks = [
  { to: "/", label: "Home", icon: House },
  { to: "/destinations", label: "Destinations", icon: MapTrifold },
  { to: "/weather", label: "Weather", icon: CloudSun },
  { to: "/ai", label: "TripPilot AI", icon: Sparkle },
  { to: "/planner", label: "Plan", icon: Airplane },
];

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menu, setMenu] = useState(false);
  const [open, setOpen] = useState(null); // "explore" | "more"
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef();
  const navRef = useRef();

  useEffect(() => {
    const h = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false);
      if (navRef.current && !navRef.current.contains(e.target)) setOpen(null);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  useEffect(() => { setMobileOpen(false); setOpen(null); }, [location.pathname]);

  const pill = (active) =>
    `px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 inline-flex items-center gap-1.5 ${
      active
        ? "text-slate-900 bg-slate-100 font-bold shadow-sm"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
    }`;
  const isExplore = explorePaths.some((p) => location.pathname.startsWith(p));
  const isMore = morePaths.some((p) => location.pathname.startsWith(p));

  return (
    <>
      <header className="fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 z-50 w-[min(96%,1200px)]">
        <div className="glass bg-white/90 backdrop-blur-xl border border-white/70 rounded-full px-4 md:px-6 h-16 flex items-center justify-between gap-3 shadow-[0_10px_35px_-5px_rgba(15,23,42,0.07)]">
          {/* Logo with Mountains & Rising Sun matching reference */}
          <Link to="/" data-testid="brand-link" className="flex items-center gap-2.5 shrink-0 group">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-sky-500 p-0.5 shadow-sm flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center overflow-hidden">
                <svg viewBox="0 0 36 36" className="w-7 h-7" fill="none">
                  {/* Sun */}
                  <circle cx="26" cy="11" r="5" fill="#F59E0B" />
                  {/* Sun Rays */}
                  <path d="M26 3V5M26 17V19M18 11H20M32 11H34" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
                  {/* Background Mountain */}
                  <path d="M12 28L20 16L27 25L33 18L38 28H12Z" fill="#34D399" />
                  {/* Foreground Mountain */}
                  <path d="M2 28L13 13L24 28H2Z" fill="#059669" />
                  {/* Water waves */}
                  <path d="M1 29C6 27.5 12 29.5 18 28C24 26.5 30 28.5 36 28" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <div className="leading-none text-left">
              <div className="font-bold text-base sm:text-lg text-sky-700 tracking-tight flex items-center gap-1 font-sans">
                Explore <span className="text-slate-900 font-extrabold">India</span>
              </div>
              <div className="text-[10px] font-semibold text-slate-500 tracking-wider mt-0.5">
                Travel · Discover · Belong
              </div>
            </div>
          </Link>

          {/* Center Navigation matching reference */}
          <nav ref={navRef} className="hidden md:flex items-center gap-1 relative" aria-label="Primary">
            <NavLink to="/" end data-testid="nav-home" className={({ isActive }) => pill(isActive)}>Home</NavLink>
            <NavLink to="/destinations" data-testid="nav-destinations" className={({ isActive }) => pill(isActive)}>Destinations</NavLink>
            <NavLink to="/planner" data-testid="nav-planner" className={({ isActive }) => pill(isActive)}>Plan Trip</NavLink>
            <NavLink to="/weather" data-testid="nav-weather" className={({ isActive }) => pill(isActive)}>Weather</NavLink>
            <button data-testid="nav-more" aria-haspopup="menu" aria-expanded={open === "more"} onClick={() => setOpen(open === "more" ? null : "more")} className={pill(isMore || open === "more")}>
              More <CaretDown size={12} className={`transition-transform ${open === "more" ? "rotate-180" : ""}`} />
            </button>

            {open === "explore" && (
              <div role="menu" data-testid="explore-menu" className="absolute left-16 top-14 w-[420px] bg-white rounded-3xl p-3 grid grid-cols-2 gap-1 fade-up shadow-2xl border border-slate-100">
                {exploreLinks.map((l) => (
                  <Link key={l.to} to={l.to} role="menuitem" data-testid={`explore-${l.to.slice(1)}`} onClick={() => setOpen(null)} className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                    <l.icon size={20} weight="duotone" className="text-primary mt-0.5 shrink-0" />
                    <div><div className="text-sm font-semibold text-slate-900">{l.label}</div><div className="text-xs text-slate-500">{l.desc}</div></div>
                  </Link>
                ))}
              </div>
            )}
            {open === "more" && (
              <div role="menu" data-testid="more-menu" className="absolute right-0 top-14 w-64 bg-white rounded-3xl p-2.5 fade-up shadow-2xl border border-slate-100">
                <Link to="/ai" role="menuitem" data-testid="more-ai" onClick={() => setOpen(null)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-purple-700 hover:bg-purple-50 transition-colors">
                  <Sparkle size={18} weight="fill" className="text-purple-600" /> TripPilot AI Assistant
                </Link>
                {moreLinks.map((l) => (
                  <Link key={l.to} to={l.to} role="menuitem" data-testid={`more-${l.to.slice(1)}`} onClick={() => setOpen(null)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium">
                    <l.icon size={16} className="text-sky-600" /> {l.label}
                  </Link>
                ))}
              </div>
            )}
          </nav>

          {/* Right Action: Circular Profile Avatar matching reference */}
          <div className="flex items-center gap-2">
            {user && <NotificationsBell />}
            <div className="relative" ref={menuRef}>
              <button
                data-testid="profile-btn"
                onClick={() => setMenu((m) => !m)}
                aria-label="User profile menu"
                className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-800 hover:bg-slate-50 hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
              >
                {user ? (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-sky-500 flex items-center justify-center text-white font-bold text-sm">
                    {user.name.slice(0, 1).toUpperCase()}
                  </div>
                ) : (
                  <UserCircle size={24} weight="fill" className="text-slate-700" />
                )}
              </button>

              {menu && (
                <div className="absolute right-0 top-14 w-64 bg-white rounded-2xl p-2.5 fade-up shadow-2xl border border-slate-100">
                  {user ? (
                    <>
                      <div className="p-3 border-b border-slate-100">
                        <div className="font-bold text-sm text-slate-900">{user.name}</div>
                        <div className="text-xs text-slate-500 truncate">{user.email}</div>
                      </div>
                      <MenuItem to="/dashboard" icon={House} label="Dashboard" onClick={() => setMenu(false)} testid="menu-dashboard" />
                      <MenuItem to="/trips" icon={Airplane} label="My Trips" onClick={() => setMenu(false)} testid="menu-trips" />
                      <MenuItem to="/ai" icon={Sparkle} label="AI Travel Assistant" onClick={() => setMenu(false)} testid="menu-ai" />
                      <MenuItem to="/wishlist" icon={Heart} label="Wishlist" onClick={() => setMenu(false)} testid="menu-wishlist" />
                      <MenuItem to="/alerts" icon={Bell} label="Fare Alerts" onClick={() => setMenu(false)} testid="menu-alerts" />
                      <MenuItem to="/account" icon={UserCircle} label="My Account" onClick={() => setMenu(false)} testid="menu-account" />
                      <button data-testid="logout-btn" onClick={() => { logout(); setMenu(false); navigate("/"); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-rose-600 hover:bg-rose-50 transition-colors mt-1 font-semibold">
                        <SignOut size={16} /> Sign out
                      </button>
                    </>
                  ) : (
                    <div className="p-2 space-y-2">
                      <div className="text-xs text-slate-500 px-2 py-1">Welcome to Exploro India</div>
                      <Link
                        to="/login"
                        onClick={() => setMenu(false)}
                        data-testid="header-login-btn"
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors"
                      >
                        <SignIn size={16} /> Log In
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setMenu(false)}
                        data-testid="header-signup-btn"
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 transition-all"
                      >
                        Sign Up Free
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              className="md:hidden w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50"
              onClick={() => setMobileOpen(true)}
              data-testid="mobile-menu-btn"
              aria-label="Open menu"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-background/70 backdrop-blur-md" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-3 top-3 bottom-3 w-[min(84vw,320px)] glass-strong rounded-3xl p-4 fade-up overflow-y-auto" data-testid="mobile-drawer">
            <div className="flex justify-between items-center"><ModeToggle compact /><button onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={22} /></button></div>
            <div className="space-y-1 mt-3">
              <DrawerLink to="/" label="Home" />
              <DrawerLink to="/planner" label="Plan Trip" />
              <DrawerLink to="/trips" label="My Trips" />
              <DrawerLink to="/ai" label="AI Travel" accent />
            </div>
            <DrawerGroup title="Explore" links={exploreLinks} />
            <DrawerGroup title="More" links={moreLinks} />
          </div>
        </div>
      )}

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden pb-safe pt-2 px-3">
        <div className="glass-strong rounded-3xl px-2 py-2 flex items-center justify-around">
          {bottomLinks.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === "/"} data-testid={`bnav-${n.label.toLowerCase()}`}
              className={({ isActive }) => `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}>
              <n.icon size={20} weight={n.to === "/ai" ? "fill" : "regular"} />
              <span className="text-[10px] font-medium">{n.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </>
  );
};

const DrawerLink = ({ to, label, accent }) => (
  <NavLink to={to} end={to === "/"} className={({ isActive }) => `block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${isActive ? "bg-orange-500 text-white" : accent ? "text-purple-600 hover:bg-purple-50" : "text-slate-700 hover:bg-slate-100"}`}>{label}</NavLink>
);

const DrawerGroup = ({ title, links }) => (
  <div className="mt-4">
    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 px-4 mb-1">{title}</div>
    {links.map((l) => (
      <NavLink key={l.to} to={l.to} className={({ isActive }) => `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isActive ? "bg-orange-500 text-white" : "text-slate-700 hover:bg-slate-100"}`}>
        <l.icon size={16} className="text-sky-600" /> {l.label}
      </NavLink>
    ))}
  </div>
);

const MenuItem = ({ to, icon: Icon, label, onClick, testid }) => (
  <Link to={to} onClick={onClick} data-testid={testid}
    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-white/5 transition-colors">
    <Icon size={16} /> {label}
  </Link>
);

export default Header;
