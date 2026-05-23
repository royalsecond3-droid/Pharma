import { useEffect, useState } from "react";
import { api } from "@/api/client";
import { useStaffAuth } from "@/context/StaffAuthContext";
import type { StaffProfile } from "@/types";

export function AdminStaffPage() {
  const { staff } = useStaffAuth();
  const [list, setList] = useState<(StaffProfile & { createdAt: string })[]>([]);

  useEffect(() => {
    if (!staff) return;
    api.adminStaff(staff.id).then((d) => setList(d.staff));
  }, [staff]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Staff accounts</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Doctors, pharmacists, and administrators
      </p>

      <div className="mt-6 space-y-3">
        {list.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between rounded-2xl border border-border bg-card p-4"
          >
            <div>
              <div className="font-bold">{s.fullName}</div>
              <div className="text-sm text-muted-foreground">{s.email}</div>
              <div className="text-xs text-muted-foreground">{s.facilityName}</div>
            </div>
            <span
              className="rounded-full px-3 py-1 text-xs font-bold capitalize"
              style={{
                background:
                  s.role === "doctor"
                    ? "#6C63FF18"
                    : s.role === "pharmacy"
                      ? "#0FB8C318"
                      : "#0F1B3518",
                color:
                  s.role === "doctor"
                    ? "#6C63FF"
                    : s.role === "pharmacy"
                      ? "#0FB8C3"
                      : "#0F1B35",
              }}
            >
              {s.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
