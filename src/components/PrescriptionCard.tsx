import { Calendar, Clock, Pill } from "lucide-react";
import type { Prescription } from "@/types";
import { formatCourseSummary, getDoseTimes, getDurationDays } from "@/lib/schedule";
import { useLanguage } from "@/context/LanguageContext";

export function PrescriptionCard({ rx }: { rx: Prescription }) {
  const { t } = useLanguage();

  return (
    <article
      style={{
        background: "#fff",
        borderRadius: 20,
        padding: "16px",
        boxShadow: "0 4px 16px rgba(29,111,232,0.07)",
        border: "1.5px solid rgba(29,111,232,0.06)",
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
            border: `1.5px solid ${rx.color}30`,
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
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#0F1B35",
                  letterSpacing: -0.2,
                }}
              >
                {rx.medication}
              </div>
              <div style={{ fontSize: 11, color: "#5A7399", marginTop: 1 }}>
                {rx.hospital}
              </div>
            </div>
            <div
              style={{
                padding: "3px 10px",
                borderRadius: 20,
                fontSize: 10,
                fontWeight: 700,
                flexShrink: 0,
                background: rx.status === "active" ? "#E0F7EF" : "#F3F4F6",
                color: rx.status === "active" ? "#10B981" : "#9CA3AF",
              }}
            >
              {rx.status === "active" ? `● ${t("medsActive")}` : `✓ ${t("medsDone")}`}
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <div
              style={{
                background: `${rx.color}15`,
                borderRadius: 8,
                padding: "3px 8px",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Pill size={11} color={rx.color} />
              <span style={{ fontSize: 11, fontWeight: 600, color: rx.color }}>
                {rx.dosage}
              </span>
            </div>
            <div
              style={{
                background: "#F4F8FF",
                borderRadius: 8,
                padding: "3px 8px",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Clock size={11} color="#5A7399" />
              <span style={{ fontSize: 11, color: "#5A7399" }}>
                {getDoseTimes(rx).join(" · ")}
              </span>
            </div>
            <div
              style={{
                background: "#F4F8FF",
                borderRadius: 8,
                padding: "3px 8px",
                fontSize: 11,
                color: "#5A7399",
              }}
            >
              {getDurationDays(rx)} {t("homeDays")} · {formatCourseSummary(rx)}
            </div>
          </div>

          <div className="mt-2 flex items-center gap-3">
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Calendar size={10} color="#5A7399" />
              <span style={{ fontSize: 10, color: "#5A7399" }}>{rx.startDate}</span>
            </div>
            <div style={{ width: 16, height: 1, background: "#dce8fb" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Calendar size={10} color="#5A7399" />
              <span style={{ fontSize: 10, color: "#5A7399" }}>{rx.endDate}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
