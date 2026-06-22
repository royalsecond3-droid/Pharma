import {
  CircleUserRound,
  Gift,
  Home,
  MapPin,
  Wallet,
} from "lucide-react";
import { NavLink, useLocation } from "react-router";

const NAV_ITEMS = [
  { to: "/resident/home", icon: Home, label: "Home" },
  { to: "/resident/track", icon: MapPin, label: "Tracking" },
  { to: "/resident/wallet", icon: Wallet, label: "Wallet" },
  { to: "/resident/marketplace", icon: Gift, label: "Rewards" },
  { to: "/resident/profile", icon: CircleUserRound, label: "Profile" },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 border-t border-border bg-card px-2 pt-2 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: "max(10px, env(safe-area-inset-bottom))" }}
      aria-label="Main navigation"
    >
      <div className="flex items-end justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.to || pathname.startsWith(`${item.to}/`);
          const Icon = item.icon;
          const isTracking = item.to === "/resident/track";

          return (
            <NavLink
              key={item.to}
              to={item.to}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className="flex flex-1 flex-col items-center gap-0.5 py-1 no-underline"
            >
              {isTracking && isActive ? (
                <span className="mb-0.5 flex h-11 w-11 items-center justify-center rounded-full bg-primary shadow-md">
                  <Icon size={22} color="#fff" strokeWidth={2.5} />
                </span>
              ) : (
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 2}
                  color={isActive ? "#1B5E20" : "#94A3B8"}
                />
              )}
              <span
                className="text-[10px] font-semibold"
                style={{ color: isActive ? "#1B5E20" : "#94A3B8" }}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
