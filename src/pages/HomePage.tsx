import { useMemo } from "react";
import {
  Bell,
  Calendar,
  ChevronDown,
  ChevronRight,
  Leaf,
  MapPin,
  Recycle,
  ShoppingBag,
  Trophy,
} from "lucide-react";
import { Link } from "react-router";
import { api } from "@/api/truckngoClient";
import { useAuth } from "@/context/AuthContext";
import { useApiData } from "@/hooks/useApi";
import { TRUCK_SRC } from "@/lib/brand";

export function HomePage() {
  const { user } = useAuth();

  const { data, loading } = useApiData(
    useMemo(() => (id: string) => api.getDashboard(id), []),
  );

  const schedule = data?.schedule;
  const points = data?.profile.pointsBalance ?? user?.pointsBalance ?? 0;
  const firstName = user?.fullName?.split(" ")[0] ?? "Resident";

  return (
    <div className="min-h-full bg-background pb-6">
      <div className="px-5 pt-5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full border-0 bg-transparent text-sm font-semibold text-foreground"
          >
            <MapPin size={16} className="text-primary" />
            {user?.city ?? "Addis Ababa"}, Ethiopia
            <ChevronDown size={14} className="text-muted-foreground" />
          </button>
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card"
          >
            <Bell size={18} className="text-foreground" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
          </button>
        </div>

        <h1 className="mt-4 text-xl font-bold text-foreground">
          Hello, {firstName} 👋
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Let&apos;s make our city cleaner today!
        </p>
      </div>

      {schedule && (
        <div className="relative mx-5 mt-5 min-h-[200px] overflow-hidden rounded-3xl bg-primary p-5 pb-8 text-white shadow-lg">
          <div className="relative z-10 max-w-[58%]">
            <p className="text-xs font-medium opacity-90">Next Collection</p>
            <p className="mt-1 text-2xl font-bold leading-tight">
              Today, {schedule.nextTime}
            </p>
            <p className="mt-1 text-sm opacity-90">In {schedule.etaMinutes} min</p>
            <Link
              to="/resident/track"
              className="mt-4 inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-xs font-bold text-primary no-underline"
            >
              Live Tracking
              <ChevronRight size={14} />
            </Link>
          </div>
          <img
            src={TRUCK_SRC}
            alt=""
            aria-hidden
            className="pointer-events-none absolute -bottom-28 -right-12 z-0 h-[360px] w-auto max-w-none object-contain object-bottom drop-shadow-2xl"
          />
        </div>
      )}

      <div className="mx-5 mt-4 grid grid-cols-2 gap-3">
        <Link
          to="/resident/wallet"
          className="rounded-2xl border border-border bg-card p-4 no-underline shadow-sm"
        >
          <p className="text-xs text-muted-foreground">Wallet Balance</p>
          <p className="mt-1 text-xl font-bold text-foreground">
            {loading ? "—" : points.toLocaleString()} <span className="text-sm font-semibold">Points</span>
          </p>
          <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary">
            +120 this week <ChevronRight size={12} />
          </p>
        </Link>

        <Link
          to="/resident/community"
          className="rounded-2xl border border-border bg-card p-4 no-underline shadow-sm"
        >
          <p className="text-xs text-muted-foreground">Your Impact</p>
          <p className="mt-1 text-xl font-bold text-foreground">
            18.5 <span className="text-sm font-semibold">kg CO₂ Saved</span>
          </p>
          <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary">
            View Impact <ChevronRight size={12} />
          </p>
        </Link>
      </div>

      <div className="mx-5 mt-6">
        <p className="mb-3 text-sm font-bold text-foreground">Quick Actions</p>
        <div className="grid grid-cols-4 gap-3">
          {[
            { to: "/resident/sort", icon: Recycle, label: "Upload Waste", bg: "#DCFCE7", color: "#1B5E20" },
            { to: "/resident/schedule", icon: Calendar, label: "My Schedule", bg: "#EDE9FE", color: "#7C3AED" },
            { to: "/resident/marketplace", icon: ShoppingBag, label: "Marketplace", bg: "#FFEDD5", color: "#EA580C" },
            { to: "/resident/community", icon: Trophy, label: "Rewards", bg: "#FEF9C3", color: "#CA8A04" },
          ].map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="flex flex-col items-center gap-2 no-underline"
            >
              <span
                className="flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ background: action.bg }}
              >
                <action.icon size={24} color={action.color} />
              </span>
              <span className="text-center text-[10px] font-semibold leading-tight text-foreground">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="mx-5 mt-6">
        <p className="mb-3 text-sm font-bold text-foreground">Recent Activity</p>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : !data?.submissions.length ? (
          <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
            No activity yet. Upload sorted waste to earn points!
          </div>
        ) : (
          data.submissions.slice(0, 3).map((sub) => (
            <div
              key={sub.id}
              className="mb-2 flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Leaf size={18} className="text-primary" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Waste upload verified</p>
                <p className="text-xs text-muted-foreground">{sub.date}</p>
              </div>
              {sub.pointsAwarded > 0 && (
                <span className="text-sm font-bold text-primary">+{sub.pointsAwarded} pts</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
