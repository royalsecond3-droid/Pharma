import { useEffect, useState } from "react";
import { Award, BarChart3, Gift, Leaf, Recycle, TrendingUp, Truck, Users } from "lucide-react";
import { api } from "@/api/truckngoClient";
import { useStaffAuth } from "@/context/StaffAuthContext";
import type { AnalyticsData } from "@/types/truckngo";

export function AdminAnalyticsPage() {
  const { staff } = useStaffAuth();
  const [tab, setTab] = useState<"analytics" | "rewards">("analytics");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [rewards, setRewards] = useState<{
    rules: { id: string; name: string; points: number }[];
    pendingRedemptions: number;
    partnerships: number;
    fraudFlags: number;
  } | null>(null);

  useEffect(() => {
    if (!staff) return;
    api.adminAnalytics(staff.id).then(setAnalytics);
    api.adminRewards(staff.id).then(setRewards);
  }, [staff]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Analytics & Rewards</h1>
      <p className="mt-1 text-sm text-muted-foreground">Environmental impact, participation & reward management</p>

      <div className="mt-4 flex gap-2">
        {(["analytics", "rewards"] as const).map((t) => (
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

      {tab === "analytics" && analytics && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Recycle, label: "Recycling compliance", value: `${analytics.recyclingComplianceRate}%`, color: "#22C55E" },
              { icon: Truck, label: "Truck utilization", value: `${analytics.truckUtilization}%`, color: "#0F766E" },
              { icon: Users, label: "Participation", value: `${analytics.residentParticipation}%`, color: "#14B8A6" },
              { icon: TrendingUp, label: "Success rate", value: `${analytics.collectionSuccessRate}%`, color: "#F59E0B" },
              { icon: Gift, label: "Rewards distributed", value: analytics.rewardsDistributed.toLocaleString(), color: "#F59E0B" },
              { icon: Leaf, label: "CO₂ saved", value: `${(analytics.co2SavedKg / 1000).toFixed(1)}t`, color: "#22C55E" },
            ].map((c) => (
              <div key={c.label} className="rounded-2xl border border-border bg-card p-4">
                <c.icon size={20} style={{ color: c.color }} />
                <div className="mt-2 text-xl font-bold">{c.value}</div>
                <div className="text-xs text-muted-foreground">{c.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-card p-5">
            <h3 className="flex items-center gap-2 font-bold">
              <BarChart3 size={18} />
              Waste collected per zone
            </h3>
            <div className="mt-4 space-y-3">
              {analytics.wastePerZone.map((z) => (
                <div key={z.zone}>
                  <div className="flex justify-between text-sm">
                    <span>{z.zone}</span>
                    <span className="font-bold">{z.kg.toLocaleString()} kg</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(z.kg / 5000) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === "rewards" && rewards && (
        <div className="mt-6">
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <div className="text-2xl font-bold text-primary">{rewards.pendingRedemptions}</div>
              <div className="text-xs text-muted-foreground">Pending redemptions</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <div className="text-2xl font-bold">{rewards.partnerships}</div>
              <div className="text-xs text-muted-foreground">Partnerships</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <div className="text-2xl font-bold text-destructive">{rewards.fraudFlags}</div>
              <div className="text-xs text-muted-foreground">Fraud flags</div>
            </div>
          </div>

          <h3 className="mb-3 flex items-center gap-2 font-bold">
            <Award size={16} />
            Reward rules
          </h3>
          {rewards.rules.map((r) => (
            <div key={r.id} className="mb-2 flex justify-between rounded-xl border border-border bg-card p-4">
              <span className="font-semibold">{r.name}</span>
              <span className="font-bold text-primary">+{r.points} pts</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
