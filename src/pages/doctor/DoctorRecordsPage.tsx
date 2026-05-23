import { useState } from "react";
import { api } from "@/api/client";
import { FaydaLookup } from "@/components/portal/FaydaLookup";
import { useStaffAuth } from "@/context/StaffAuthContext";
import { formatFinDisplay } from "@/lib/fayda";

export function DoctorRecordsPage() {
  const { staff } = useStaffAuth();
  const [patientFin, setPatientFin] = useState<string | null>(null);
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staff || !patientFin || !notes.trim()) return;
    setLoading(true);
    setMessage(null);
    try {
      await api.doctorAddHealthRecord(staff.id, {
        patientFin,
        chiefComplaint: chiefComplaint || undefined,
        diagnosis: diagnosis || undefined,
        notes,
      });
      setMessage("Health record saved to EHR");
      setChiefComplaint("");
      setDiagnosis("");
      setNotes("");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to save record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-foreground">Electronic health records</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Add consultation notes linked to patient Fayda ID
      </p>

      <div className="mt-6">
        <FaydaLookup onLookup={setPatientFin} buttonLabel="Select patient" />
      </div>

      {patientFin && (
        <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">FIN · {formatFinDisplay(patientFin)}</p>
          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">
              Chief complaint
            </label>
            <input
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">
              Diagnosis
            </label>
            <input
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Alzheimer's disease — early stage"
              className="mt-1 w-full rounded-xl border border-border px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">
              Clinical notes *
            </label>
            <textarea
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              className="mt-1 w-full rounded-xl border border-border px-4 py-2.5 text-sm"
            />
          </div>
          {message && (
            <p className={`text-sm ${message.includes("saved") ? "text-green-600" : "text-destructive"}`}>
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3 text-sm font-bold text-white"
            style={{ background: "#6C63FF" }}
          >
            {loading ? "Saving…" : "Save to EHR"}
          </button>
        </form>
      )}
    </div>
  );
}
