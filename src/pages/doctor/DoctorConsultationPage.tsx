import { useEffect, useState } from "react";
import { AlertTriangle, Scan } from "lucide-react";
import { api } from "@/api/client";
import { FaydaLookup } from "@/components/portal/FaydaLookup";
import { useStaffAuth } from "@/context/StaffAuthContext";
import { formatFinDisplay } from "@/lib/fayda";
import type { EquipmentAllocationResult, MedicalHistoryLog } from "@/types/aura";

const EQUIPMENT_OPTIONS = ["MRI", "CT Scanner", "Ultrasound"];

export function DoctorConsultationPage() {
  const { staff } = useStaffAuth();
  const [patientFin, setPatientFin] = useState<string | null>(null);
  const [equipment, setEquipment] = useState("MRI");
  const [logs, setLogs] = useState<MedicalHistoryLog[]>([]);
  const [result, setResult] = useState<EquipmentAllocationResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!staff || !patientFin) return;
    api.doctorGetMedicalLogs(staff.id, patientFin).then((r) => setLogs(r.logs));
  }, [staff, patientFin]);

  const runAllocation = async () => {
    if (!patientFin) return;
    setLoading(true);
    try {
      const { result: r } = await api.searchEquipment(patientFin, equipment);
      setResult(r);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground">Consultation wizard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Lab & special equipment allocation with contraindication safety checks
      </p>

      <div className="mt-6">
        <FaydaLookup onLookup={setPatientFin} buttonLabel="Select patient" />
      </div>

      {patientFin && (
        <div className="mt-6 space-y-6">
          <p className="text-sm font-semibold">FIN · {formatFinDisplay(patientFin)}</p>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-bold uppercase text-muted-foreground">
              Verified history timeline
            </h2>
            {logs.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">No structured records yet.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {logs.map((log) => (
                  <li key={log.id} className="rounded-xl bg-muted/40 px-3 py-2 text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="font-semibold">{log.condition}</span>
                      <span
                        className="shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase"
                        style={{
                          background:
                            log.source === "digital_parse" ? "#E0E7FF" : "#ECFDF5",
                          color: log.source === "digital_parse" ? "#4338CA" : "#059669",
                        }}
                      >
                        {log.source === "digital_parse" ? "Digital" : "Manual"}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {new Date(log.timelineAt).toLocaleString()} · {log.facilityId}
                    </div>
                    {log.contraindicationTags.length > 0 && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-amber-700">
                        <AlertTriangle size={12} />
                        Flags: {log.contraindicationTags.join(", ")}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <Scan size={20} style={{ color: "#6C63FF" }} />
              <h2 className="font-bold">Equipment request</h2>
            </div>
            <select
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              className="mt-3 w-full rounded-xl border border-border px-4 py-2.5 text-sm"
            >
              {EQUIPMENT_OPTIONS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={runAllocation}
              disabled={loading}
              className="mt-4 w-full rounded-xl py-3 text-sm font-bold text-white"
              style={{ background: "#6C63FF" }}
            >
              {loading ? "Running safety tree…" : "Allocate safe facility"}
            </button>
          </div>

          {result && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-bold">Destination manifest</h2>
              {result.safetyNotice && (
                <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
                  {result.safetyNotice}
                </p>
              )}
              <p className="mt-2 text-sm text-muted-foreground">
                {result.facilities.length} facility(ies) · {result.allocatedEquipment}
              </p>
              <ul className="mt-3 space-y-2">
                {result.facilities.map((f) => (
                  <li
                    key={f.facilityId}
                    className="flex justify-between rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <span>
                      {f.name} ({f.distanceKm.toFixed(1)} km)
                    </span>
                    <span className="font-semibold">{f.priceEtb} ETB</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
