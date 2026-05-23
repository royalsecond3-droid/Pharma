import { useMemo } from "react";
import { CheckCircle, ChevronRight, Clock, Pill } from "lucide-react";
import { Link } from "react-router";
import { api } from "@/api/client";
import { AppHeader } from "@/components/AppHeader";
import { PrescriptionCard } from "@/components/PrescriptionCard";
import { useAuth } from "@/context/AuthContext";
import { useApiData } from "@/hooks/useApi";

export function HomePage() {
  const { user } = useAuth();

  const { data: stats, loading: statsLoading } = useApiData(
    useMemo(() => (fin: string) => api.getStats(fin), []),
  );

  const { data: rxData, loading: rxLoading } = useApiData(
    useMemo(() => (fin: string) => api.getPrescriptions(fin), []),
  );

  const recent = rxData?.prescriptions.slice(0, 2) ?? [];

  return (
    <>
      <AppHeader userName={user?.fullName ?? "Patient"} />
      <div className="mt-2 flex gap-3 px-5">
        {[
          {
            label: "Active Rx",
            value: statsLoading ? "—" : String(stats?.activeRx ?? 0),
            icon: <Pill size={14} color="#1D6FE8" />,
          },
          {
            label: "Completed",
            value: statsLoading ? "—" : String(stats?.completed ?? 0),
            icon: <CheckCircle size={14} color="#10B981" />,
          },
          {
            label: "Today",
            value: statsLoading ? "—" : String(stats?.today ?? 0),
            icon: <Clock size={14} color="#F59E0B" />,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              flex: 1,
              background: "#fff",
              borderRadius: 14,
              padding: "10px 12px",
              boxShadow: "0 2px 12px rgba(29,111,232,0.08)",
              border: "1.5px solid rgba(29,111,232,0.08)",
            }}
          >
            <div className="mb-1 flex items-center gap-1.5">
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  background: "#F4F8FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {stat.icon}
              </div>
              <span style={{ fontSize: 10, fontWeight: 500, color: "#5A7399" }}>
                {stat.label}
              </span>
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                lineHeight: 1,
                color: "#0F1B35",
              }}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-3 mt-6 flex items-center justify-between px-5">
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#0F1B35",
            letterSpacing: -0.3,
          }}
        >
          Recent Prescriptions
        </div>
        <Link
          to="/patient/meds"
          style={{
            fontSize: 12,
            color: "#1D6FE8",
            fontWeight: 600,
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          View all <ChevronRight size={14} />
        </Link>
      </div>

      <div className="flex flex-col gap-3 px-5 pb-6">
        {rxLoading ? (
          <p className="py-8 text-center text-sm" style={{ color: "#5A7399" }}>
            Loading prescriptions…
          </p>
        ) : recent.length === 0 ? (
          <p className="py-8 text-center text-sm" style={{ color: "#5A7399" }}>
            No prescriptions yet.
          </p>
        ) : (
          recent.map((rx) => <PrescriptionCard key={rx.id} rx={rx} />)
        )}
      </div>
    </>
  );
}
