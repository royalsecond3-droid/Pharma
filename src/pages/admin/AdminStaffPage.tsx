import { useEffect, useState } from "react";
import { api } from "@/api/truckngoClient";
import { useStaffAuth } from "@/context/StaffAuthContext";
import type { DriverListItem, ResidentListItem } from "@/types/truckngo";

export function AdminStaffPage() {
  const { staff } = useStaffAuth();
  const [tab, setTab] = useState<"residents" | "drivers">("residents");
  const [residents, setResidents] = useState<ResidentListItem[]>([]);
  const [drivers, setDrivers] = useState<DriverListItem[]>([]);

  useEffect(() => {
    if (!staff) return;
    api.adminResidents(staff.id).then((r) => setResidents(r.residents));
    api.adminDrivers(staff.id).then((r) => setDrivers(r.drivers));
  }, [staff]);

  return (
    <div>
      <h1 className="text-2xl font-bold">People Management</h1>
      <p className="mt-1 text-sm text-muted-foreground">Residents & collection drivers</p>

      <div className="mt-4 flex gap-2">
        {(["residents", "drivers"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize ${
              tab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "residents" ? (
        <div className="mt-6 space-y-2">
          {residents.map((r) => (
            <div key={r.residentId} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <div>
                <div className="font-semibold">{r.fullName}</div>
                <div className="text-xs text-muted-foreground">{r.neighborhood}, {r.zone} · {r.residentId}</div>
              </div>
              <div className="text-right text-xs">
                <div className="font-bold text-primary">{r.pointsBalance} pts</div>
                <div className="text-muted-foreground">{r.submissionsCount} submissions</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {drivers.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <div>
                <div className="font-semibold">{d.fullName}</div>
                <div className="text-xs text-muted-foreground">{d.email}</div>
              </div>
              <div className="text-right text-xs">
                <div className="font-bold capitalize">{d.status.replace("_", " ")}</div>
                <div className="text-muted-foreground">{d.efficiencyScore}% efficiency · {d.routesCompleted} routes</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
