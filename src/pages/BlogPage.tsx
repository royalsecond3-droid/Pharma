import { useMemo } from "react";
import { Award, Medal, Recycle, TrendingUp, Users } from "lucide-react";
import { api } from "@/api/truckngoClient";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/context/AuthContext";
import { useApiData } from "@/hooks/useApi";
import { BADGES } from "@/types/truckngo";

export function BlogPage() {
  const { user } = useAuth();
  const { data, loading } = useApiData(
    useMemo(() => (id: string) => api.getCommunity(id), []),
  );

  return (
    <>
      <AppHeader userName={user?.fullName ?? "Resident"} greeting="Community," />
      <div className="px-5 pb-6">
        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p>
        ) : (
          <>
            <div className="mb-4 grid grid-cols-2 gap-3">
              {[
                { icon: Recycle, label: "Recycling rate", value: `${data?.stats.recyclingRate}%`, color: "#22C55E" },
                { icon: Users, label: "Households", value: data?.stats.householdsParticipating.toLocaleString(), color: "#0F766E" },
                { icon: TrendingUp, label: "Waste diverted", value: `${(data?.stats.wasteDivertedKg ?? 0) / 1000}t`, color: "#14B8A6" },
                { icon: Medal, label: "Your rank", value: `#${data?.stats.neighborhoodRank}`, color: "#F59E0B" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border bg-card p-3">
                  <s.icon size={18} color={s.color} />
                  <div className="mt-2 text-lg font-bold">{s.value}</div>
                  <div className="text-[10px] text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>

            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
              <Award size={16} color="#F59E0B" />
              Neighborhood leaderboard
            </h3>
            {(data?.leaderboard ?? []).map((entry) => (
              <div
                key={entry.rank}
                className={`mb-2 flex items-center gap-3 rounded-xl border p-3 ${
                  entry.name.startsWith(user?.fullName?.split(" ")[0] ?? "___")
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                }`}
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
                  style={{
                    background: entry.rank <= 3 ? "#F59E0B18" : "#ECFDF5",
                    color: entry.rank <= 3 ? "#F59E0B" : "#0F766E",
                  }}
                >
                  {entry.rank}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{entry.name}</div>
                  <div className="text-[10px] text-muted-foreground">{entry.neighborhood}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-primary">{entry.points}</div>
                  {entry.badge && (
                    <div className="text-[9px] text-muted-foreground">{entry.badge}</div>
                  )}
                </div>
              </div>
            ))}

            <h3 className="mb-3 mt-6 text-sm font-bold">Achievement badges</h3>
            <div className="grid grid-cols-2 gap-2">
              {BADGES.map((b) => {
                const earned = user?.badges.includes(b.id);
                return (
                  <div
                    key={b.id}
                    className="rounded-xl border p-3 text-center"
                    style={{
                      borderColor: earned ? "#22C55E" : undefined,
                      opacity: earned ? 1 : 0.5,
                    }}
                  >
                    <div className="text-2xl">{earned ? "🏆" : "🔒"}</div>
                    <div className="mt-1 text-xs font-bold">{b.name}</div>
                    <div className="text-[9px] text-muted-foreground">{b.minPoints}+ pts</div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
}
