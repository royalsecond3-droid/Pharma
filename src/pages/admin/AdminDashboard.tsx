import { useEffect, useState } from "react";
import { Activity, AlertTriangle, FileText, Pill, Users, Zap } from "lucide-react";
import { api } from "@/api/client";
import { useStaffAuth } from "@/context/StaffAuthContext";
import type { AdminStats } from "@/types";
import type { AdminAuraAnalytics } from "@/types/aura";

export function AdminDashboard() {
  const { staff } = useStaffAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [aura, setAura] = useState<AdminAuraAnalytics | null>(null);
  const [revenue, setRevenue] = useState<{ totalEtb: number; transactions: number } | null>(
    null,
  );

  useEffect(() => {
    if (!staff) return;
    api.adminStats(staff.id).then(setStats).catch(() => setStats(null));
    api.getAdminAuraAnalytics().then((r) => setAura(r.analytics));
    api.getAdminSubscriptionRevenue().then((r) => setRevenue(r.revenue));
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
        Aura Care — Fayda-linked health ecosystem & regional logistics
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

      {revenue && (
        <div className="mt-8 rounded-2xl border border-[#6C63FF33] bg-gradient-to-br from-[#6C63FF08] to-[#1D6FE808] p-5">
          <h2 className="text-lg font-bold">Subscription revenue</h2>
          <div className="mt-3 flex gap-8">
            <div>
              <div className="text-3xl font-bold text-[#6C63FF]">
                {revenue.totalEtb.toLocaleString()} ETB
              </div>
              <div className="text-sm text-muted-foreground">Total collected (mock)</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{revenue.transactions}</div>
              <div className="text-sm text-muted-foreground">Successful payments</div>
            </div>
          </div>
        </div>
      )}

      {aura && (
        <div className="mt-10">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Zap size={20} color="#6C63FF" />
            Aura analytics
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="text-2xl font-bold">{aura.recordsIngested}</div>
              <div className="text-sm text-muted-foreground">Records ingested</div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="text-2xl font-bold">{aura.duplicatesBlocked}</div>
              <div className="text-sm text-muted-foreground">Duplicates blocked</div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="text-2xl font-bold">{aura.avgProcessingMs}ms</div>
              <div className="text-sm text-muted-foreground">Avg processing latency</div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-1 text-2xl font-bold">
                <AlertTriangle size={18} className="text-amber-600" />
                {aura.equipmentSafetyExceptions}
              </div>
              <div className="text-sm text-muted-foreground">Safety substitutions</div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-bold">Regional stock</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {aura.regionalStockAlerts.map((r) => (
                  <li key={`${r.city}-${r.medication}`} className="flex justify-between">
                    <span>
                      {r.medication} · {r.city}
                    </span>
                    <span className="font-semibold">{r.totalStock} units</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-bold">Medication demand</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {aura.medicationDemand.map((d) => (
                  <li key={d.medication} className="flex justify-between">
                    <span>{d.medication}</span>
                    <span className="font-semibold">{d.requests} requests</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {!stats && (
        <p className="mt-8 text-sm text-muted-foreground">Loading statistics…</p>
      )}
    </div>
  );
}
