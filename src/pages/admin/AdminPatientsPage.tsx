import { useEffect, useState } from "react";
import { api } from "@/api/client";
import { PatientList } from "@/components/portal/PatientList";
import { DEMO_PATIENT_FINS } from "@/data/mockPatients";
import { useStaffAuth } from "@/context/StaffAuthContext";
import { formatFinDisplay } from "@/lib/fayda";
import type { PatientListItem } from "@/types";

export function AdminPatientsPage() {
  const { staff } = useStaffAuth();
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [selected, setSelected] = useState<PatientListItem | null>(null);

  useEffect(() => {
    if (!staff) return;
    api.getPatientList(staff.id).then((d) => setPatients(d.patients));
  }, [staff]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Patient registry</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {patients.length} patients in Tane Care · Fayda-linked records
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PatientList
          title="All patients"
          onSelect={(fin) => {
            const p = patients.find((x) => x.faydaFin === fin);
            setSelected(p ?? null);
            if (!p && staff) {
              api.getPatientList(staff.id).then((d) => {
                setPatients(d.patients);
                setSelected(d.patients.find((x) => x.faydaFin === fin) ?? null);
              });
            }
          }}
        />

        <div className="space-y-4">
          {selected ? (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="text-lg font-bold">{selected.fullName}</h2>
              <p className="font-mono text-sm text-muted-foreground">
                FIN {formatFinDisplay(selected.faydaFin)}
              </p>
              {selected.email && (
                <p className="mt-2 text-sm text-muted-foreground">{selected.email}</p>
              )}
              {selected.phone && (
                <p className="text-sm text-muted-foreground">{selected.phone}</p>
              )}
              {selected.conditionNotes && (
                <p className="mt-3 rounded-lg bg-secondary/50 p-3 text-sm">
                  {selected.conditionNotes}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-lg bg-secondary px-3 py-1">
                  {selected.prescriptionCount} prescriptions
                </span>
                <span className="rounded-lg bg-amber-100 px-3 py-1 text-amber-800">
                  {selected.pendingPrescriptions} pending pharmacy
                </span>
                <span className="rounded-lg bg-secondary px-3 py-1">
                  {selected.healthRecordCount} EHR entries
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Select a patient from the list to view details
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-sm font-bold">Quick reference — demo patients</h3>
            <ul className="mt-3 space-y-2">
              {DEMO_PATIENT_FINS.map((p) => (
                <li
                  key={p.fin}
                  className="flex justify-between rounded-lg bg-secondary/40 px-3 py-2 text-xs"
                >
                  <span className="font-medium">{p.name}</span>
                  <span className="font-mono text-muted-foreground">{p.fin}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Condition</th>
              <th className="px-4 py-3">Fayda FIN</th>
              <th className="px-4 py-3">Rx</th>
              <th className="px-4 py-3">Pending</th>
              <th className="px-4 py-3">EHR</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr
                key={p.id}
                className="cursor-pointer border-t border-border bg-card hover:bg-secondary/30"
                onClick={() => setSelected(p)}
              >
                <td className="px-4 py-3 font-medium">{p.fullName}</td>
                <td className="max-w-xs truncate px-4 py-3 text-xs text-muted-foreground">
                  {p.conditionNotes ?? "—"}
                </td>
                <td className="px-4 py-3 font-mono text-xs">
                  {formatFinDisplay(p.faydaFin)}
                </td>
                <td className="px-4 py-3">{p.prescriptionCount}</td>
                <td className="px-4 py-3">
                  {(p.pendingPrescriptions ?? 0) > 0 ? (
                    <span className="font-semibold text-amber-600">
                      {p.pendingPrescriptions}
                    </span>
                  ) : (
                    "0"
                  )}
                </td>
                <td className="px-4 py-3">{p.healthRecordCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
