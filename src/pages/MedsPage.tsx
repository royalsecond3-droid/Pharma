import { useMemo, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { Link } from "react-router";
import { api } from "@/api/client";
import { PrescriptionCard } from "@/components/PrescriptionCard";
import { useApiData } from "@/hooks/useApi";
import type { PrescriptionStatus } from "@/types";

type FilterTab = "all" | PrescriptionStatus;

export function MedsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  const fetcher = useMemo(
    () => (fin: string) =>
      api.getPrescriptions(fin, {
        status: activeTab,
        search: search.trim() || undefined,
      }),
    [activeTab, search],
  );

  const { data, loading, error } = useApiData(fetcher, [activeTab, search]);
  const prescriptions = data?.prescriptions ?? [];

  return (
    <div className="pb-6">
      <div className="px-5 pt-5">
        <h1
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "#0F1B35",
            letterSpacing: -0.3,
            marginBottom: 4,
          }}
        >
          My Medications
        </h1>
        <p style={{ fontSize: 12, color: "#5A7399", marginBottom: 12 }}>
          All prescriptions linked to your Fayda ID
        </p>
        <Link
          to="/patient/find"
          className="mb-4 flex items-center gap-2 rounded-lg border border-[#E8EEF5] bg-white px-3 py-2.5 text-sm font-medium text-[#1D6FE8] no-underline"
        >
          <MapPin size={16} />
          Show all medications on map
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#fff",
            borderRadius: 14,
            padding: "12px 16px",
            boxShadow: "0 2px 12px rgba(29,111,232,0.08)",
            border: "1.5px solid rgba(29,111,232,0.08)",
            marginBottom: 16,
          }}
        >
          <Search size={16} color="#5A7399" />
          <input
            type="search"
            placeholder="Search medications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              fontSize: 13,
              color: "#0F1B35",
            }}
          />
        </div>

        <div className="mb-4 flex gap-2">
          {(["all", "active", "completed"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "7px 14px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                background:
                  activeTab === tab
                    ? "linear-gradient(135deg, #1D6FE8, #0FB8C3)"
                    : "#fff",
                color: activeTab === tab ? "#fff" : "#5A7399",
                border:
                  activeTab === tab ? "none" : "1.5px solid rgba(29,111,232,0.15)",
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 px-5">
        {loading ? (
          <p className="py-8 text-center text-sm" style={{ color: "#5A7399" }}>
            Loading…
          </p>
        ) : error ? (
          <p className="py-8 text-center text-sm" style={{ color: "#E53E3E" }}>
            {error}
          </p>
        ) : prescriptions.length === 0 ? (
          <p className="py-8 text-center text-sm" style={{ color: "#5A7399" }}>
            No prescriptions match your filters.
          </p>
        ) : (
          prescriptions.map((rx) => <PrescriptionCard key={rx.id} rx={rx} />)
        )}
      </div>
    </div>
  );
}
