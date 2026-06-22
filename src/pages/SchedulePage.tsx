import { useMemo } from "react";
import { Bell, Clock, Truck } from "lucide-react";
import { api } from "@/api/truckngoClient";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/context/AuthContext";
import { useApiData } from "@/hooks/useApi";

const REMINDER_META = {
  "12h": { label: "12 hours before", color: "#64748B", icon: Bell },
  "3h": { label: "3 hours before", color: "#F59E0B", icon: Clock },
  "30m": { label: "30 minutes before", color: "#DC2626", icon: Truck },
};

export function SchedulePage() {
  const { user } = useAuth();
  const { data, loading } = useApiData(
    useMemo(() => (id: string) => api.getCollectionSchedule(id), []),
  );

  return (
    <>
      <AppHeader userName={user?.fullName ?? "Resident"} greeting="Collection alerts," />
      <div className="px-5 pb-6">
        <p className="mb-4 text-sm text-muted-foreground">
          Never wait outside listening for truck horns. We notify you automatically before arrival.
        </p>

        {data?.schedule && (
          <div className="mb-6 rounded-2xl border border-border bg-card p-4">
            <div className="text-sm font-bold text-foreground">Upcoming collection</div>
            <div className="mt-1 text-lg font-bold text-primary">
              {data.schedule.nextDate} · {data.schedule.nextTime}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Driver: {data.schedule.driverName} · Truck {data.schedule.truckId}
            </div>
          </div>
        )}

        <h3 className="mb-3 text-sm font-bold">Notification journey</h3>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading reminders...</p>
        ) : (
          (data?.reminders ?? []).map((r) => {
            const meta = REMINDER_META[r.type];
            const Icon = meta.icon;
            return (
              <div
                key={r.id}
                className="mb-3 flex gap-3 rounded-2xl border border-border bg-card p-4"
                style={{ opacity: r.read ? 0.7 : 1 }}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${meta.color}18` }}
                >
                  <Icon size={20} color={meta.color} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: meta.color }}>
                      {meta.label}
                    </span>
                    {!r.read && (
                      <span className="rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-foreground">{r.message}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{r.sentAt}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
