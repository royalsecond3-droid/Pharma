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
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [contraTags, setContraTags] = useState("");
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
      const auraResult = await api.addMedicalLog(patientFin, {
        source: "manual_form",
        metrics: {
          systolic: systolic ? Number(systolic) : undefined,
          diastolic: diastolic ? Number(diastolic) : undefined,
          heartRate: heartRate ? Number(heartRate) : undefined,
        },
        condition: diagnosis || chiefComplaint || "Clinical visit",
        facilityId: staff.facilityName.replace(/\s+/g, "-").toLowerCase().slice(0, 24) || "hosp-addis-01",
        contraindicationTags: contraTags
          ? contraTags.split(",").map((t) => t.trim().toLowerCase())
          : [],
      });
      if (auraResult.duplicate) {
        setMessage("Duplicate entry blocked — identical timestamp & condition exists");
        return;
      }
      setMessage("Health record saved · vitals analyzed for patient insights");
      setChiefComplaint("");
      setDiagnosis("");
      setNotes("");
      setSystolic("");
      setDiastolic("");
      setHeartRate("");
      setContraTags("");
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
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Systolic
              </label>
              <input
                type="number"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                placeholder="120"
                className="mt-1 w-full rounded-xl border border-border px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Diastolic
              </label>
              <input
                type="number"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                placeholder="80"
                className="mt-1 w-full rounded-xl border border-border px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Heart rate
              </label>
              <input
                type="number"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                placeholder="72"
                className="mt-1 w-full rounded-xl border border-border px-3 py-2.5 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">
              Safety flags (comma-separated, e.g. pacemaker)
            </label>
            <input
              value={contraTags}
              onChange={(e) => setContraTags(e.target.value)}
              placeholder="pacemaker, metallic implant"
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
