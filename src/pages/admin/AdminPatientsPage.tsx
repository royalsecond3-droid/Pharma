import { useEffect, useState } from "react";
import { api } from "@/api/truckngoClient";
import { useStaffAuth } from "@/context/StaffAuthContext";
import type { Zone } from "@/types/truckngo";

export function AdminPatientsPage() {
  const { staff } = useStaffAuth();
  const [zones, setZones] = useState<Zone[]>([]);

  useEffect(() => {
    if (!staff) return;
    api.adminZones(staff.id).then((r) => setZones(r.zones));
  }, [staff]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Zone Management</h1>
      <p className="mt-1 text-sm text-muted-foreground">Create, edit, merge zones and assign trucks & drivers</p>

      <div className="mt-6 space-y-3">
        {zones.map((z) => (
          <div key={z.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
            <div>
              <div className="font-bold">{z.name}</div>
              <div className="text-sm text-muted-foreground">{z.city} · {z.residents.toLocaleString()} residents</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Collection: {z.collectionDays.join(", ")}
              </div>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="rounded-full bg-secondary px-3 py-1 font-semibold text-primary">
                Truck: {z.truckId ?? "Unassigned"}
              </span>
              <span className="rounded-full bg-muted px-3 py-1 font-semibold">
                Driver: {z.driverId ? `#${z.driverId}` : "Unassigned"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
