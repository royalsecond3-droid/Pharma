import { Activity, AlertTriangle, Calendar, Pill, User } from "lucide-react";
import { NavLink } from "react-router";

const NAV_ITEMS: {
  to: string;
  icon: typeof Activity;
  label: string;
  accent?: boolean;
}[] = [
  { to: "/patient/home", icon: Activity, label: "Home" },
  { to: "/patient/meds", icon: Pill, label: "Meds" },
  { to: "/patient/sos", icon: AlertTriangle, label: "SOS", accent: true },
  { to: "/patient/schedule", icon: Calendar, label: "Schedule" },
  { to: "/patient/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  return (
    <nav
      className="sticky bottom-0 z-10 border-t border-border bg-card/95 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl"
      aria-label="Main navigation"
    >
      <div className="flex justify-around">
        {NAV_ITEMS.map(({ to, icon: Icon, label, accent }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 border-none bg-transparent px-2 no-underline ${
                accent
                  ? isActive
                    ? "text-[#E53E3E]"
                    : "text-[#E53E3E]/80"
                  : isActive
                    ? "text-primary"
                    : "text-muted-foreground"
              }`
            }
          >
            <Icon size={accent ? 22 : 20} strokeWidth={accent ? 2.5 : 2} />
            <span className={`text-[10px] font-semibold ${accent ? "text-[#E53E3E]" : ""}`}>
              {label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
