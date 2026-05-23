import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { api } from "@/api/client";
import { FaydaLookup } from "@/components/portal/FaydaLookup";
import { PatientList } from "@/components/portal/PatientList";
import { PrescriptionCard } from "@/components/PrescriptionCard";
import { useStaffAuth } from "@/context/StaffAuthContext";
import { formatFinDisplay } from "@/lib/fayda";
import type { PatientBundle } from "@/types";

export function DoctorPatientPage() {
  const { staff } = useStaffAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFin, setLastFin] = useState<string | null>(null);
  const [bundle, setBundle] = useState<PatientBundle | null>(null);
  const [registerName, setRegisterName] = useState("");
  const [registerCondition, setRegisterCondition] = useState("");

  const lookup = async (fin: string) => {
    if (!staff) return;
    setLastFin(fin);
    setSearchParams({ fin });
    setLoading(true);
    setError(null);
    try {
      const data = await api.doctorGetPatient(staff.id, fin);
      setBundle(data);
    } catch (e) {
      setBundle(null);
      setError(e instanceof Error ? e.message : "Patient not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fin = searchParams.get("fin");
    if (fin && staff) lookup(fin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staff]);

  const register = async () => {
    if (!staff || !lastFin) return;
    setLoading(true);
    setError(null);
    try {
      await api.doctorRegisterPatient(staff.id, lastFin, {
        fullName: registerName || undefined,
        conditionNotes: registerCondition || undefined,
      });
      await lookup(lastFin);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
      <PatientList
        title="Patients"
        compact
        onSelect={lookup}
      />

      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-foreground">Patient lookup</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Retrieve records using Fayda National ID (FIN)
        </p>

        <div className="mt-6">
          <FaydaLookup onLookup={lookup} loading={loading} />
        </div>

        {error && !bundle && lastFin && (
          <div className="mt-6 rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-destructive">{error}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Register patient FIN {formatFinDisplay(lastFin)}:
            </p>
            <div className="mt-3 space-y-2">
              <input
                placeholder="Full name"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-2 text-sm"
              />
              <input
                placeholder="Condition notes"
                value={registerCondition}
                onChange={(e) => setRegisterCondition(e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-2 text-sm"
              />
              <button
                type="button"
                onClick={register}
                disabled={loading}
                className="rounded-xl px-4 py-2 text-sm font-bold text-white"
                style={{ background: "#6C63FF" }}
              >
                Register patient
              </button>
            </div>
          </div>
        )}

        {bundle && (
          <div className="mt-8 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="text-lg font-bold">{bundle.patient.fullName}</h2>
              <p className="text-sm text-muted-foreground">
                FIN · {formatFinDisplay(bundle.patient.faydaFin)}
              </p>
              {bundle.patient.conditionNotes && (
                <p className="mt-3 rounded-lg bg-secondary/40 p-3 text-sm">
                  {bundle.patient.conditionNotes}
                </p>
              )}
            </div>

            <section>
              <h3 className="mb-3 font-bold">Prescriptions</h3>
              <div className="flex flex-col gap-3">
                {bundle.prescriptions.map((rx) => (
                  <PrescriptionCard key={rx.id} rx={rx} />
                ))}
              </div>
            </section>

            <section>
              <h3 className="mb-3 font-bold">Health records</h3>
              {bundle.healthRecords.length === 0 ? (
                <p className="text-sm text-muted-foreground">No records yet.</p>
              ) : (
                <div className="space-y-3">
                  {bundle.healthRecords.map((h) => (
                    <div key={h.id} className="rounded-xl border border-border bg-card p-4">
                      <div className="text-xs text-muted-foreground">
                        {h.visitDate} · {h.doctorName}
                      </div>
                      {h.diagnosis && (
                        <div className="mt-1 text-sm font-semibold">{h.diagnosis}</div>
                      )}
                      <p className="mt-2 text-sm text-muted-foreground">{h.notes}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
