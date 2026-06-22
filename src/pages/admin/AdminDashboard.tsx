import { useEffect, useState } from "react";
import { Activity, AlertTriangle, Recycle, Truck, Users } from "lucide-react";
import { api } from "@/api/truckngoClient";
import { useStaffAuth } from "@/context/StaffAuthContext";
import type { AdminStats } from "@/types/truckngo";

export function AdminDashboard() {
  const { staff } = useStaffAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    if (!staff) return;
    api.adminStats(staff.id).then(setStats).catch(() => setStats(null));
  }, [staff]);

  const cards = stats
    ? [
        { label: "Active trucks", value: stats.activeTrucks, icon: Truck, color: "#0F766E" },
        { label: "Drivers online", value: stats.driversOnline, icon: Users, color: "#14B8A6" },
        { label: "Collection progress", value: `${stats.collectionProgress}%`, icon: Activity, color: "#22C55E" },
        { label: "Pending issues", value: stats.pendingIssues, icon: AlertTriangle, color: "#F59E0B" },
        { label: "Total residents", value: stats.totalResidents.toLocaleString(), icon: Users, color: "#0F766E" },
        { label: "Recycling compliance", value: `${stats.recyclingCompliance}%`, icon: Recycle, color: "#14B8A6" },
      ]
    : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Operations Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Live city operations — trucks, drivers, collection progress & issues
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <c.icon size={22} style={{ color: c.color }} />
            <div className="mt-3 text-2xl font-bold">{c.value}</div>
            <div className="text-sm text-muted-foreground">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-[#ECFDF5] p-5">
        <h2 className="font-bold">Live city map</h2>
        <div className="relative mt-4 h-48 overflow-hidden rounded-xl bg-white">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: "linear-gradient(#0F766E 1px, transparent 1px), linear-gradient(90deg, #0F766E 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }} />
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute flex h-8 w-8 items-center justify-center rounded-full bg-primary shadow-md"
              style={{ left: `${20 + i * 30}%`, top: `${30 + i * 15}%` }}
            >
              <Truck size={16} color="#fff" />
            </div>
          ))}
          <div className="absolute bottom-2 left-2 rounded bg-white/90 px-2 py-1 text-[10px] font-semibold">
            {stats?.routesActive ?? 0} active routes
          </div>
        </div>
      </div>

      {!stats && <p className="mt-8 text-sm text-muted-foreground">Loading statistics…</p>}
    </div>
  );
}
