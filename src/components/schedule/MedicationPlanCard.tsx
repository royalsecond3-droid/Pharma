import { Bell, BellRing, Calendar, Clock, Pill } from "lucide-react";
import type { MedicationAlarm, Prescription } from "@/types";
import {
  courseProgress,
  formatCourseSummary,
  getDoseTimes,
  getDurationDays,
} from "@/lib/schedule";

interface Props {
  rx: Prescription;
  t: (key: string) => string;
  alarms: MedicationAlarm[];
  onSetAlarm: (rx: Prescription, time: string) => void;
  onConfirmDose?: (rx: Prescription) => void;
  remainingPills?: number;
  settingAlarm?: string | null;
  confirmingDose?: boolean;
}

function alarmKey(rxId: number, time: string) {
  return `${rxId}-${time}`;
}

export function MedicationPlanCard({
  rx,
  t,
  alarms,
  onSetAlarm,
  onConfirmDose,
  remainingPills,
  settingAlarm,
  confirmingDose,
}: Props) {
  const doseTimes = getDoseTimes(rx);
  const progress = courseProgress(rx);

  const hasAlarmFor = (time: string) =>
    alarms.some(
      (a) =>
        (a.prescriptionId === rx.id ||
          a.medication.toLowerCase() === rx.medication.toLowerCase()) &&
        a.time === time,
    );

  return (
    <article
      style={{
        background: "#fff",
        borderRadius: 20,
        padding: 16,
        boxShadow: "0 4px 16px rgba(29,111,232,0.07)",
        border: `1.5px solid ${rx.color}22`,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 13,
            flexShrink: 0,
            background: `${rx.color}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
          }}
        >
          {rx.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0F1B35" }}>
                {rx.medication}
              </div>
              <div style={{ fontSize: 11, color: "#5A7399" }}>{rx.hospital}</div>
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: 20,
                background: `${rx.color}18`,
                color: rx.color,
              }}
            >
              Dr. Rx
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                fontWeight: 600,
                color: rx.color,
                background: `${rx.color}12`,
                padding: "3px 8px",
                borderRadius: 8,
              }}
            >
              <Pill size={11} />
              {rx.dosage}
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                color: "#5A7399",
                background: "#F4F8FF",
                padding: "3px 8px",
                borderRadius: 8,
              }}
            >
              <Calendar size={11} />
              {getDurationDays(rx)} {t("homeDays")}
            </span>
          </div>
          <p style={{ fontSize: 11, color: "#5A7399", marginTop: 8 }}>
            {formatCourseSummary(rx)}
          </p>
          <div
            style={{
              marginTop: 8,
              height: 6,
              borderRadius: 3,
              background: "#F4F8FF",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${rx.color}, #0FB8C3)`,
                borderRadius: 3,
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#5A7399",
            textTransform: "uppercase",
            letterSpacing: 0.8,
            marginBottom: 8,
          }}
        >
          {t("scheduleTakeTimes")}
        </div>
        <div className="flex flex-col gap-2">
          {doseTimes.map((time) => {
            const active = hasAlarmFor(time);
            const key = alarmKey(rx.id, time);
            const loading = settingAlarm === key;
            return (
              <div
                key={time}
                className="flex items-center justify-between gap-2"
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: active ? "#E0F7EF" : "#F4F8FF",
                  border: active
                    ? "1.5px solid #10B98144"
                    : "1.5px solid rgba(29,111,232,0.08)",
                }}
              >
                <div className="flex items-center gap-2">
                  <Clock size={16} color={active ? "#10B981" : "#1D6FE8"} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#0F1B35" }}>
                    {time}
                  </span>
                  {active && (
                    <span style={{ fontSize: 10, fontWeight: 600, color: "#10B981" }}>
                      {t("scheduleAlarmOn")}
                    </span>
                  )}
                </div>
                {!active && (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => onSetAlarm(rx, time)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "6px 10px",
                      borderRadius: 10,
                      border: "none",
                      background: "linear-gradient(135deg, #1D6FE8, #0FB8C3)",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: loading ? "wait" : "pointer",
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    <Bell size={12} />
                    {loading ? "..." : t("scheduleSetAlarm")}
                  </button>
                )}
                {active && <BellRing size={18} color="#10B981" />}
              </div>
            );
          })}
        </div>
      </div>
      {onConfirmDose && (
        <div className="mt-3 flex items-center justify-between gap-2">
          {remainingPills != null && (
            <span style={{ fontSize: 11, color: "#5A7399" }}>
              {t("schedulePillsLeft")}: <strong>{remainingPills}</strong>
            </span>
          )}
          <button
            type="button"
            disabled={confirmingDose || remainingPills === 0}
            onClick={() => onConfirmDose(rx)}
            className="ml-auto rounded-xl px-4 py-2 text-xs font-bold text-white"
            style={{ background: remainingPills === 0 ? "#94A3B8" : "#10B981" }}
          >
            {confirmingDose ? "..." : t("scheduleDoseTaken")}
          </button>
        </div>
      )}
      {rx.doctorNotes && (
        <p
          style={{
            marginTop: 10,
            fontSize: 11,
            color: "#5A7399",
            fontStyle: "italic",
          }}
        >
          {rx.doctorNotes}
        </p>
      )}
    </article>
  );
}
