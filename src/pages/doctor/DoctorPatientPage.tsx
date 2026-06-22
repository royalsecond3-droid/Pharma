import { useEffect, useState } from "react";
import { CheckCircle, MapPin } from "lucide-react";
import { api } from "@/api/truckngoClient";
import { useStaffAuth } from "@/context/StaffAuthContext";
import type { DriverRoute } from "@/types/truckngo";

export function DoctorPatientPage() {
  const { staff } = useStaffAuth();
  const [route, setRoute] = useState<DriverRoute | null>(null);
  const [completing, setCompleting] = useState<string | null>(null);

  const load = () => {
    if (!staff) return;
    api.getDriverRoute(staff.id).then((r) => setRoute(r.route));
  };

  useEffect(load, [staff]);

  const completeStop = async (stopId: string) => {
    if (!staff) return;
    setCompleting(stopId);
    try {
      await api.completeStop(staff.id, stopId);
      load();
    } finally {
      setCompleting(null);
    }
  };

  if (!route) return <p className="text-sm text-muted-foreground">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold">Route Execution</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        GPS updates continuously · Mark each collection complete
      </p>

      <div className="mt-6 space-y-3">
        {route.stops.map((stop, index) => (
          <div
            key={stop.id}
            className={`flex items-center gap-4 rounded-2xl border p-4 ${
              stop.completed ? "border-primary/30 bg-primary/5" : "border-border bg-card"
            }`}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
              style={{ background: stop.completed ? "#22C55E" : "#ECFDF5", color: stop.completed ? "#fff" : "#0F766E" }}
            >
              {stop.completed ? <CheckCircle size={20} /> : index + 1}
            </div>
            <div className="flex-1">
              <div className="font-semibold">{stop.residentName}</div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin size={12} />
                {stop.address}
              </div>
              {stop.completedAt && (
                <div className="mt-1 text-xs text-primary">Completed at {stop.completedAt}</div>
              )}
            </div>
            {!stop.completed && (
              <button
                type="button"
                onClick={() => completeStop(stop.id)}
                disabled={completing === stop.id}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50"
              >
                {completing === stop.id ? "..." : "Complete"}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl bg-secondary p-4 text-sm text-muted-foreground">
        When you enter a neighborhood, nearby residents receive automatic alerts with updated ETA.
      </div>
    </div>
  );
}
