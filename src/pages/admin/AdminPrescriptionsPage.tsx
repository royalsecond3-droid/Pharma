import { useEffect, useState } from "react";
import { api } from "@/api/truckngoClient";
import { useStaffAuth } from "@/context/StaffAuthContext";
import type { FleetTruck } from "@/types/truckngo";

export function AdminPrescriptionsPage() {
  const { staff } = useStaffAuth();
  const [trucks, setTrucks] = useState<FleetTruck[]>([]);

  useEffect(() => {
    if (!staff) return;
    api.adminFleet(staff.id).then((r) => setTrucks(r.trucks));
  }, [staff]);

  const statusColor: Record<string, string> = {
    active: "#22C55E",
    maintenance: "#F59E0B",
    inactive: "#64748B",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Fleet Management</h1>
      <p className="mt-1 text-sm text-muted-foreground">Add, activate, schedule maintenance & monitor utilization</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {trucks.map((t) => (
          <div key={t.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="font-bold">{t.plate}</div>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold capitalize"
                style={{ background: `${statusColor[t.status]}18`, color: statusColor[t.status] }}
              >
                {t.status}
              </span>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{t.model} · {t.id}</div>
            <div className="mt-3 flex justify-between text-xs">
              <span>Utilization: <strong>{t.utilization}%</strong></span>
              <span>Zone: {t.assignedZone ?? "—"}</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">Next maintenance: {t.nextMaintenance}</div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${t.utilization}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
