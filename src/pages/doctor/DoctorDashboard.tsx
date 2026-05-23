import { FileText, Pill, Users } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { PatientList } from "@/components/portal/PatientList";
import { DEMO_PATIENT_FINS } from "@/data/mockPatients";
import { useStaffAuth } from "@/context/StaffAuthContext";

export function DoctorDashboard() {
  const { staff } = useStaffAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome, {staff?.fullName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{staff?.facilityName}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            to: "/doctor/patient",
            icon: Users,
            label: "Patient lookup",
            desc: "Find patient by Fayda National ID",
          },
          {
            to: "/doctor/prescribe",
            icon: Pill,
            label: "Issue prescription",
            desc: "Digital Rx linked to Fayda ID",
          },
          {
            to: "/doctor/records",
            icon: FileText,
            label: "Health records",
            desc: "Add consultation notes to EHR",
          },
        ].map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="rounded-2xl border border-border bg-card p-5 no-underline shadow-sm hover:shadow-md"
          >
            <card.icon size={24} style={{ color: "#6C63FF" }} />
            <div className="mt-3 font-bold text-foreground">{card.label}</div>
            <div className="mt-1 text-sm text-muted-foreground">{card.desc}</div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PatientList
          title="All patients"
          onSelect={(fin) => navigate(`/doctor/patient?fin=${fin}`)}
        />

        <div className="space-y-4">
          <div
            className="rounded-2xl border border-border p-5 text-sm leading-relaxed text-muted-foreground"
            style={{ background: "#F4F8FF" }}
          >
            <strong className="text-foreground">Consultation workflow:</strong> Select a
            patient below or enter their Fayda ID to update EHR and issue digital
            prescriptions.
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-sm font-bold text-foreground">Demo Fayda IDs</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Tap a patient in the list, or use these FINs for lookup:
            </p>
            <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto">
              {DEMO_PATIENT_FINS.map((p) => (
                <li key={p.fin}>
                  <button
                    type="button"
                    onClick={() => navigate(`/doctor/patient?fin=${p.fin}`)}
                    className="flex w-full justify-between rounded-lg bg-secondary/50 px-3 py-2 text-left text-xs hover:bg-secondary"
                  >
                    <span className="font-medium text-foreground">{p.name}</span>
                    <span className="font-mono text-muted-foreground">{p.fin}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
