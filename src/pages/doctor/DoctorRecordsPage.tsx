import { useEffect, useState } from "react";
import { Award, Clock, MapPin, TrendingUp, Users } from "lucide-react";
import { api } from "@/api/truckngoClient";
import { useStaffAuth } from "@/context/StaffAuthContext";
import type { RouteSummary } from "@/types/truckngo";

export function DoctorRecordsPage() {
  const { staff } = useStaffAuth();
  const [summary, setSummary] = useState<RouteSummary | null>(null);

  useEffect(() => {
    if (!staff) return;
    api.getRouteSummary(staff.id).then((r) => setSummary(r.summary));
  }, [staff]);

  if (!summary) return <p className="text-sm text-muted-foreground">Loading summary...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold">End of Route Summary</h1>
      <p className="mt-1 text-sm text-muted-foreground">Today&apos;s collection performance</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { icon: MapPin, label: "Distance traveled", value: `${summary.distanceKm} km`, color: "#0F766E" },
          { icon: Users, label: "Households served", value: String(summary.householdsServed), color: "#14B8A6" },
          { icon: TrendingUp, label: "Collections completed", value: String(summary.collectionsCompleted), color: "#22C55E" },
          { icon: Award, label: "Efficiency score", value: `${summary.efficiencyScore}%`, color: "#F59E0B" },
          { icon: Clock, label: "Duration", value: `${summary.durationMinutes} min`, color: "#64748B" },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-5">
            <c.icon size={22} style={{ color: c.color }} />
            <div className="mt-3 text-2xl font-bold">{c.value}</div>
            <div className="text-sm text-muted-foreground">{c.label}</div>
          </div>
        ))}
      </div>

      <div
        className="mt-8 rounded-2xl p-6 text-center text-white"
        style={{ background: "linear-gradient(135deg, #0F766E, #22C55E)" }}
      >
        <div className="text-5xl font-bold">{summary.efficiencyScore}%</div>
        <div className="mt-2 text-sm opacity-90">Route efficiency score</div>
        <p className="mt-4 text-xs opacity-75">
          Great work! Your performance contributes to city-wide collection success.
        </p>
      </div>
    </div>
  );
}
