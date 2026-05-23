import { CheckCircle, Search } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { PatientList } from "@/components/portal/PatientList";
import { useStaffAuth } from "@/context/StaffAuthContext";

export function PharmacyDashboard() {
  const { staff } = useStaffAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{staff?.facilityName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pharmacist: {staff?.fullName}
        </p>
      </div>

      <Link
        to="/pharmacy/dispense"
        className="flex items-center gap-4 rounded-2xl border border-border bg-card p-6 no-underline shadow-sm hover:shadow-md"
      >
        <div
          className="flex h-14 w-14 items-center justify-center rounded-xl"
          style={{ background: "#0FB8C318" }}
        >
          <Search size={28} color="#0FB8C3" />
        </div>
        <div>
          <div className="font-bold text-foreground">Dispense medication</div>
          <div className="text-sm text-muted-foreground">
            Look up patient by Fayda ID and fulfill prescriptions
          </div>
        </div>
      </Link>

      <PatientList
        title="Patients with pending prescriptions"
        pendingOnly
        onSelect={(fin) => navigate(`/pharmacy/dispense?fin=${fin}`)}
      />

      <div className="rounded-2xl border border-border bg-card p-5">
        <CheckCircle size={20} className="text-green-600" />
        <div className="mt-2 font-bold">Paperless workflow</div>
        <p className="text-sm text-muted-foreground">
          Select a patient from the list — only those with pending pharmacy fulfillment
          are shown.
        </p>
      </div>
    </div>
  );
}
