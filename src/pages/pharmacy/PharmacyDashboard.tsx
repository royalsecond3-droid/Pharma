import { useEffect, useState } from "react";
import { Bell, CheckCircle, Search } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { api } from "@/api/client";
import { PatientList } from "@/components/portal/PatientList";
import { useStaffAuth } from "@/context/StaffAuthContext";
import type { PharmacyReservation } from "@/types/aura";

export function PharmacyDashboard() {
  const { staff } = useStaffAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<PharmacyReservation[]>([]);

  useEffect(() => {
    api.getPharmacyReservations().then((r) => setReservations(r.reservations));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{staff?.facilityName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pharmacist: {staff?.fullName}
        </p>
      </div>

      {reservations.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <Bell size={20} />
            Reservation queue ({reservations.length})
          </div>
          <ul className="mt-3 space-y-2">
            {reservations.slice(0, 5).map((r) => (
              <li
                key={r.id}
                className="flex justify-between rounded-lg bg-white px-3 py-2 text-sm shadow-sm"
              >
                <span>
                  <strong>{r.patientName}</strong> — {r.medication} ×{r.quantity}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(r.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

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
        <div className="mt-2 font-bold">Vetted directory sync</div>
        <p className="text-sm text-muted-foreground">
          Patient reservations from Find Care update your local stock queue in real time.
        </p>
      </div>
    </div>
  );
}
