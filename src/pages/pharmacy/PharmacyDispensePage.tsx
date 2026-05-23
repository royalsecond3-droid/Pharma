import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { CheckCircle, Clock } from "lucide-react";
import { PatientList } from "@/components/portal/PatientList";
import { api } from "@/api/client";
import { FaydaLookup } from "@/components/portal/FaydaLookup";
import { useStaffAuth } from "@/context/StaffAuthContext";
import { formatFinDisplay } from "@/lib/fayda";
import type { Prescription, UserProfile } from "@/types";

export function PharmacyDispensePage() {
  const { staff } = useStaffAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState<UserProfile | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [error, setError] = useState<string | null>(null);

  const lookup = async (fin: string) => {
    if (!staff) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.pharmacyGetPatient(staff.id, fin);
      setPatient(data.patient);
      setPrescriptions(data.prescriptions);
    } catch (e) {
      setPatient(null);
      setPrescriptions([]);
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

  const dispense = async (id: number) => {
    if (!staff) return;
    await api.pharmacyDispense(staff.id, id);
    const fin = patient?.faydaFin;
    if (fin) lookup(fin);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
      <PatientList
        title="Pending fulfillment"
        pendingOnly
        compact
        onSelect={lookup}
      />

      <div className="min-w-0 max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground">Prescription fulfillment</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Retrieve authorized medications using patient Fayda ID
      </p>

      <div className="mt-6">
        <FaydaLookup onLookup={lookup} loading={loading} buttonLabel="Retrieve prescriptions" />
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      {patient && (
        <div className="mt-8">
          <div className="mb-4 rounded-2xl border border-border bg-card p-4">
            <div className="font-bold">{patient.fullName}</div>
            <div className="text-sm text-muted-foreground">
              FIN · {formatFinDisplay(patient.faydaFin)}
            </div>
          </div>

          <div className="space-y-3">
            {prescriptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active prescriptions.</p>
            ) : (
              prescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="rounded-2xl border border-border bg-card p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{rx.icon}</span>
                        <span className="font-bold">{rx.medication}</span>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {rx.dosage} · {rx.schedule}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {rx.hospital} · Dr. issued
                      </div>
                      {rx.doctorNotes && (
                        <p className="mt-2 text-xs italic text-muted-foreground">
                          {rx.doctorNotes}
                        </p>
                      )}
                    </div>
                    <div>
                      {rx.fulfillmentStatus === "dispensed" ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                          <CheckCircle size={14} />
                          Dispensed
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => dispense(rx.id)}
                          className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold text-white"
                          style={{ background: "#0FB8C3" }}
                        >
                          <Clock size={14} />
                          Mark dispensed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
