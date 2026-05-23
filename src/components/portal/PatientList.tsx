import { ChevronRight, IdCard, Pill, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/api/client";
import { useStaffAuth } from "@/context/StaffAuthContext";
import { formatFinDisplay } from "@/lib/fayda";
import type { PatientListItem } from "@/types";

interface PatientListProps {
  onSelect?: (fin: string) => void;
  pendingOnly?: boolean;
  title?: string;
  compact?: boolean;
}

export function PatientList({
  onSelect,
  pendingOnly = false,
  title = "Patient list",
  compact = false,
}: PatientListProps) {
  const { staff } = useStaffAuth();
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!staff) return;
    setLoading(true);
    const t = setTimeout(() => {
      api
        .getPatientList(staff.id, { search, pendingOnly })
        .then((d) => setPatients(d.patients))
        .catch(() => setPatients([]))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [staff, search, pendingOnly]);

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-foreground">{title}</h2>
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
            {patients.length} patients
          </span>
        </div>
        <div className="relative mt-3">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            placeholder="Search name or Fayda FIN…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-input-background py-2 pl-9 pr-3 text-sm outline-none"
          />
        </div>
      </div>

      <div className={compact ? "max-h-80 overflow-y-auto" : "max-h-[28rem] overflow-y-auto"}>
        {loading ? (
          <p className="p-6 text-center text-sm text-muted-foreground">Loading patients…</p>
        ) : patients.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">No patients found.</p>
        ) : (
          <ul className="divide-y divide-border">
            {patients.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => onSelect?.(p.faydaFin)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-secondary/40"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                    style={{
                      background: "linear-gradient(135deg, #1D6FE8, #6C63FF)",
                    }}
                  >
                    {p.fullName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-foreground">{p.fullName}</div>
                    <div className="mt-0.5 flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                      <IdCard size={10} />
                      {formatFinDisplay(p.faydaFin)}
                    </div>
                    {!compact && p.conditionNotes && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {p.conditionNotes}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        <Pill size={10} />
                        {p.prescriptionCount} Rx
                      </span>
                      {(p.pendingPrescriptions ?? 0) > 0 && (
                        <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                          {p.pendingPrescriptions} pending
                        </span>
                      )}
                      <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        {p.healthRecordCount} EHR
                      </span>
                    </div>
                  </div>
                  {onSelect && (
                    <ChevronRight size={16} className="mt-2 shrink-0 text-muted-foreground" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
