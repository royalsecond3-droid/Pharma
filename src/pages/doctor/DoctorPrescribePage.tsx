import { useState } from "react";
import { api } from "@/api/client";
import { FaydaLookup } from "@/components/portal/FaydaLookup";
import { useStaffAuth } from "@/context/StaffAuthContext";
import { formatFinDisplay } from "@/lib/fayda";

const DOSE_PRESETS = [
  {
    label: "Once daily — morning (8 AM)",
    schedule: "Once daily in the morning",
    times: ["08:00 AM"],
  },
  {
    label: "Once daily — bedtime (9 PM)",
    schedule: "Once daily at bedtime",
    times: ["09:00 PM"],
  },
  {
    label: "Twice daily (8 AM & 8 PM)",
    schedule: "Twice daily",
    times: ["08:00 AM", "08:00 PM"],
  },
  {
    label: "Three times daily",
    schedule: "Three times daily",
    times: ["08:00 AM", "02:00 PM", "08:00 PM"],
  },
] as const;

export function DoctorPrescribePage() {
  const { staff } = useStaffAuth();
  const [patientFin, setPatientFin] = useState<string | null>(null);
  const [medication, setMedication] = useState("");
  const [dosage, setDosage] = useState("");
  const [durationDays, setDurationDays] = useState(90);
  const [presetIndex, setPresetIndex] = useState(1);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const preset = DOSE_PRESETS[presetIndex];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staff || !patientFin) return;
    setLoading(true);
    setMessage(null);
    try {
      await api.doctorIssuePrescription(staff.id, {
        patientFin,
        medication,
        dosage,
        schedule: preset.schedule,
        durationDays,
        doseTimes: [...preset.times],
        doctorNotes: notes || undefined,
      });
      setMessage(
        `Prescription issued: ${medication} for ${durationDays} days at ${preset.times.join(", ")}`,
      );
      setMedication("");
      setDosage("");
      setNotes("");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to issue prescription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-foreground">Issue digital prescription</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Set medication, dosage, how many days to take it, and dose times — synced to the
        patient schedule & alarms
      </p>

      <div className="mt-6">
        <FaydaLookup onLookup={setPatientFin} buttonLabel="Confirm patient" />
      </div>

      {patientFin && (
        <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-primary">
            Patient FIN: {formatFinDisplay(patientFin)}
          </p>
          {[
            { label: "Medication", value: medication, set: setMedication },
            { label: "Dosage", value: dosage, set: setDosage },
          ].map((f) => (
            <div key={f.label}>
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                {f.label}
              </label>
              <input
                required
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border px-4 py-2.5 text-sm"
              />
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">
              Course length (days)
            </label>
            <input
              type="number"
              min={1}
              max={365}
              required
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value) || 90)}
              className="mt-1 w-full rounded-xl border border-border px-4 py-2.5 text-sm"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Patient app shows day X of {durationDays} and days remaining
            </p>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">
              Dose times (alarms)
            </label>
            <select
              value={presetIndex}
              onChange={(e) => setPresetIndex(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-border px-4 py-2.5 text-sm"
            >
              {DOSE_PRESETS.map((p, i) => (
                <option key={p.label} value={i}>
                  {p.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-muted-foreground">
              Times: {preset.times.join(" · ")}
            </p>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">
              Clinical notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-xl border border-border px-4 py-2.5 text-sm"
            />
          </div>
          {message && (
            <p
              className={`text-sm ${message.includes("issued") ? "text-green-600" : "text-destructive"}`}
            >
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3 text-sm font-bold text-white disabled:opacity-60"
            style={{ background: "#6C63FF" }}
          >
            {loading ? "Issuing…" : "Issue prescription"}
          </button>
        </form>
      )}
    </div>
  );
}
