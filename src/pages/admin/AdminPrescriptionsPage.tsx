import { useEffect, useState } from "react";
import { api } from "@/api/client";
import { useStaffAuth } from "@/context/StaffAuthContext";
import { formatFinDisplay } from "@/lib/fayda";
import type { Prescription } from "@/types";

export function AdminPrescriptionsPage() {
  const { staff } = useStaffAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  useEffect(() => {
    if (!staff) return;
    api.adminPrescriptions(staff.id).then((d) => setPrescriptions(d.prescriptions));
  }, [staff]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">All prescriptions</h1>
      <div className="mt-6 space-y-2">
        {prescriptions.map((rx) => (
          <div
            key={rx.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm"
          >
            <div>
              <span className="font-bold">{rx.medication}</span>
              <span className="text-muted-foreground"> · {rx.dosage}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {rx.patientName} · FIN {rx.patientFin ? formatFinDisplay(rx.patientFin) : "—"}
            </div>
            <div className="flex gap-2 text-xs font-semibold">
              <span className={rx.status === "active" ? "text-green-600" : "text-gray-400"}>
                {rx.status}
              </span>
              <span
                className={
                  rx.fulfillmentStatus === "dispensed" ? "text-primary" : "text-amber-600"
                }
              >
                {rx.fulfillmentStatus ?? "pending"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
