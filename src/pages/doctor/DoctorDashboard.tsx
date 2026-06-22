import { useEffect, useState } from "react";
import { CheckCircle, MapPin, Route, Truck, Users } from "lucide-react";
import { Link } from "react-router";
import { api } from "@/api/truckngoClient";
import { useStaffAuth } from "@/context/StaffAuthContext";
import type { DriverRoute } from "@/types/truckngo";

export function DoctorDashboard() {
  const { staff } = useStaffAuth();
  const [route, setRoute] = useState<DriverRoute | null>(null);

  useEffect(() => {
    if (!staff) return;
    api.getDriverRoute(staff.id).then((r) => setRoute(r.route));
  }, [staff]);

  if (!route) {
    return <p className="text-sm text-muted-foreground">Loading route...</p>;
  }

  const completed = route.stops.filter((s) => s.completed).length;

  return (
    <div>
      <h1 className="text-2xl font-bold">Daily Route</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Welcome, {staff?.fullName} — {route.zone} zone
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Truck, label: "Truck", value: route.truckPlate, color: "#0F766E" },
          { icon: Users, label: "Households", value: String(route.totalHouseholds), color: "#14B8A6" },
          { icon: Route, label: "Progress", value: `${route.progress}%`, color: "#22C55E" },
          { icon: MapPin, label: "Distance", value: `${route.distanceKm} km`, color: "#F59E0B" },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-5">
            <c.icon size={22} style={{ color: c.color }} />
            <div className="mt-3 text-2xl font-bold">{c.value}</div>
            <div className="text-sm text-muted-foreground">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Route map & stops</h2>
          <span className="text-sm text-muted-foreground">ETA: {route.estimatedCompletion}</span>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          {completed}/{route.stops.length} stops completed
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${route.progress}%` }} />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          to="/driver/route"
          className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground no-underline"
        >
          Execute route →
        </Link>
        <Link
          to="/driver/summary"
          className="rounded-xl border border-border px-5 py-3 text-sm font-bold text-foreground no-underline"
        >
          View summary
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <CheckCircle size={16} />
          Zone entry trigger active — nearby residents receive alerts automatically
        </div>
      </div>
    </div>
  );
}
