import { useMemo, useState } from "react";
import { ChevronRight, Clock, MapPin, Navigation } from "lucide-react";
import { api } from "@/api/truckngoClient";
import { PageHeader } from "@/components/PageHeader";
import { TruckTrackingMap } from "@/components/map/TruckTrackingMap";
import { useAuth } from "@/context/AuthContext";
import { useApiData } from "@/hooks/useApi";
import { TRUCK_SRC } from "@/lib/brand";
import type { RouteStop } from "@/types/truckngo";

const MAP_HEIGHT = 520;

function findHomeStop(stops: RouteStop[], userName?: string): string | undefined {
  if (!userName) return stops.find((s) => !s.completed)?.id;
  const first = userName.split(" ")[0]?.toLowerCase();
  const match = stops.find((s) => s.residentName.toLowerCase().includes(first ?? ""));
  return match?.id ?? stops.find((s) => !s.completed)?.id;
}

export function FindCarePage() {
  const { user } = useAuth();
  const [showDetails, setShowDetails] = useState(false);

  const { data, loading, error } = useApiData(
    useMemo(() => (id: string) => api.getTruckTracking(id), []),
  );

  const schedule = data?.schedule;
  const stops = data?.route ?? [];
  const homeStopId = findHomeStop(stops, user?.fullName);

  return (
    <div className="flex flex-col bg-background">
      <PageHeader title="Live Tracking" showMenu />

      <div
        className="relative mx-5 overflow-hidden rounded-3xl border border-border shadow-sm"
        style={{ height: MAP_HEIGHT }}
      >
        {loading && (
          <div
            className="absolute inset-0 z-[1100] flex items-center justify-center bg-[#E8F5E9] text-sm text-muted-foreground"
          >
            Loading truck position...
          </div>
        )}

        {error && (
          <div className="absolute left-4 right-4 top-20 z-[1100] rounded-xl bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">
            {error}
          </div>
        )}

        {data?.location && (
          <>
            <TruckTrackingMap
              truck={data.location}
              stops={stops}
              homeStopId={homeStopId}
              height={MAP_HEIGHT}
            />

            <div className="pointer-events-none absolute inset-0 z-[1000]">
              <div className="pointer-events-auto absolute left-4 right-4 top-4 flex items-center gap-3 rounded-2xl bg-card p-3 shadow-md">
                <img src={TRUCK_SRC} alt="Truck" className="h-10 w-14 object-contain" />
                <div>
                  <p className="text-sm font-bold text-foreground">
                    Truck #{schedule?.truckId ?? "TRK-1024"}
                  </p>
                  <p className="text-xs font-semibold text-primary">In Progress</p>
                </div>
                <div className="ml-auto flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                  LIVE
                </div>
              </div>

              {schedule && (
                <div className="pointer-events-auto absolute bottom-4 left-4 right-4 rounded-3xl bg-card p-5 shadow-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">ETA</p>
                      <p className="text-3xl font-bold text-foreground">{schedule.nextTime}</p>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">0.8 km away</p>
                  </div>
                  <p className="mt-2 flex items-center gap-1 text-sm font-semibold text-primary">
                    <MapPin size={14} />
                    In {schedule.etaMinutes} min
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowDetails((v) => !v)}
                    className="mt-4 flex w-full items-center justify-center gap-1 rounded-full border-2 border-primary bg-transparent py-3 text-sm font-bold text-primary"
                  >
                    {showDetails ? "Hide Details" : "View Details"}
                    <ChevronRight size={16} className={showDetails ? "rotate-90" : ""} />
                  </button>

                  {showDetails && (
                    <div className="mt-4 max-h-36 space-y-2 overflow-y-auto border-t border-border pt-3">
                      {stops.map((stop) => (
                        <div key={stop.id} className="flex items-center gap-2 text-xs">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ background: stop.completed ? "#94A3B8" : "#1B5E20" }}
                          />
                          <span className="flex-1 truncate font-medium">{stop.address}</span>
                          <span className="text-muted-foreground">
                            {stop.completed ? stop.completedAt : "Pending"}
                          </span>
                        </div>
                      ))}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Navigation size={12} />
                        Driver {schedule.driverName} · {schedule.stopsRemaining} stops left
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <p className="flex items-center justify-center gap-2 px-5 py-4 text-center text-xs text-muted-foreground">
        <Clock size={12} />
        Pinch or scroll to zoom · drag to move the map
      </p>
    </div>
  );
}
