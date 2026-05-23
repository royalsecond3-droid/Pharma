import { useEffect, useState } from "react";
import { Activity, FileText, Pill, Users } from "lucide-react";
import { api } from "@/api/client";
import { useStaffAuth } from "@/context/StaffAuthContext";
import type { AdminStats } from "@/types";

export function AdminDashboard() {
  const { staff } = useStaffAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    if (!staff) return;
    api.adminStats(staff.id).then(setStats).catch(() => setStats(null));
  }, [staff]);

  const cards = stats
    ? [
        { label: "Patients", value: stats.patients, icon: Users, color: "#1D6FE8" },
        { label: "Prescriptions", value: stats.prescriptions, icon: Pill, color: "#6C63FF" },
        { label: "Pending pharmacy", value: stats.pendingFulfillment, icon: Activity, color: "#F59E0B" },
        { label: "Dispensed", value: stats.dispensed, icon: Pill, color: "#10B981" },
        { label: "Health records", value: stats.healthRecords, icon: FileText, color: "#0FB8C3" },
        { label: "Staff accounts", value: stats.staff, icon: Users, color: "#0F1B35" },
      ]
    : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Platform overview</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Tena Care Fayda-linked health ecosystem
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

      {!stats && (
        <p className="mt-8 text-sm text-muted-foreground">Loading statistics…</p>
      )}
    </div>
  );
}
