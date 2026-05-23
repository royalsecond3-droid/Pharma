import { useNavigate } from "react-router";
import { PatientList } from "@/components/portal/PatientList";

export function DoctorPatientsPage() {
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">All patients</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Select a patient to open their full record
      </p>
      <div className="mt-6">
        <PatientList onSelect={(fin) => navigate(`/doctor/patient?fin=${fin}`)} />
      </div>
    </div>
  );
}
