import { useEffect, useMemo, useState } from "react";
import { Bell, Clock, Stethoscope, Vibrate, Volume2, X } from "lucide-react";
import { api } from "@/api/client";
import { MedicationPlanCard } from "@/components/schedule/MedicationPlanCard";
import { useAuth } from "@/context/AuthContext";
import { useApiData } from "@/hooks/useApi";
import type { Prescription } from "@/types";
import { useLanguage } from "@/context/LanguageContext";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function SchedulePage() {
  const { faydaFin } = useAuth();
  const { t } = useLanguage();
  const [settingAlarm, setSettingAlarm] = useState<string | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customMed, setCustomMed] = useState("");
  const [customTime, setCustomTime] = useState("08:00 AM");
  const [sound, setSound] = useState(true);
  const [vibrate, setVibrate] = useState(true);
  const [pillCounts, setPillCounts] = useState<Record<number, number>>({});
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const rxFetcher = useMemo(
    () => (fin: string) => api.getPrescriptions(fin, { status: "active" }),
    [],
  );
  const alarmFetcher = useMemo(() => (fin: string) => api.getAlarms(fin), []);

  const { data: rxData, loading: rxLoading } = useApiData(rxFetcher);
  const { data: alarmData, loading: alarmLoading, reload } = useApiData(alarmFetcher);

  const prescriptions = rxData?.prescriptions ?? [];
  const alarms = alarmData?.alarms ?? [];

  useEffect(() => {
    if (!faydaFin || !prescriptions.length) return;
    api.getAlertPipeline(faydaFin).then(() => {
      setPillCounts((prev) => {
        const next = { ...prev };
        for (const rx of prescriptions) {
          if (next[rx.id] == null) next[rx.id] = 45;
        }
        return next;
      });
    });
  }, [faydaFin, prescriptions.length]);

  const handleConfirmDose = async (rx: Prescription) => {
    if (!faydaFin) return;
    setConfirmingId(rx.id);
    try {
      const { remainingPills } = await api.confirmPillDose(faydaFin, rx.id);
      setPillCounts((c) => ({ ...c, [rx.id]: remainingPills }));
    } finally {
      setConfirmingId(null);
    }
  };

  const handleSetAlarm = async (rx: Prescription, time: string) => {
    if (!faydaFin) return;
    const key = `${rx.id}-${time}`;
    setSettingAlarm(key);
    try {
      await api.createAlarm(faydaFin, {
        time,
        medication: rx.medication,
        days: [...DAYS],
        sound: true,
        vibration: true,
        prescriptionId: rx.id,
      });
      await reload();
    } finally {
      setSettingAlarm(null);
    }
  };

  const handleCustomAlarm = async () => {
    if (!faydaFin || !customMed.trim()) return;
    setSettingAlarm("custom");
    try {
      await api.createAlarm(faydaFin, {
        time: customTime,
        medication: customMed.trim(),
        days: [...DAYS],
        sound,
        vibration: vibrate,
      });
      setCustomMed("");
      setShowCustom(false);
      await reload();
    } finally {
      setSettingAlarm(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!faydaFin) return;
    await api.deleteAlarm(faydaFin, id);
    await reload();
  };

  const loading = rxLoading || alarmLoading;

  return (
    <div className="pb-28">
      <div className="px-5 pt-5">
        <h1
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "#0F1B35",
            letterSpacing: -0.3,
          }}
        >
          {t("scheduleTitle")}
        </h1>
        <p style={{ fontSize: 12, color: "#5A7399", marginTop: 4 }}>
          {t("scheduleSubtitle")}
        </p>
      </div>

      <div
        style={{
          margin: "16px 20px 0",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Stethoscope size={16} color="#6C63FF" />
        <span style={{ fontSize: 13, fontWeight: 700, color: "#0F1B35" }}>
          {t("scheduleByDoctor")}
        </span>
      </div>

      <div className="mt-3 flex flex-col gap-3 px-5">
        {rxLoading ? (
          <p style={{ fontSize: 12, color: "#5A7399" }}>{t("scheduleLoadingPlan")}</p>
        ) : prescriptions.length === 0 ? (
          <p
            style={{
              fontSize: 12,
              color: "#5A7399",
              padding: 16,
              background: "#F4F8FF",
              borderRadius: 16,
            }}
          >
            {t("scheduleNoActive")}
          </p>
        ) : (
          prescriptions.map((rx) => (
            <MedicationPlanCard
              key={rx.id}
              rx={rx}
              t={t}
              alarms={alarms}
              onSetAlarm={handleSetAlarm}
              onConfirmDose={handleConfirmDose}
              remainingPills={pillCounts[rx.id]}
              confirmingDose={confirmingId === rx.id}
              settingAlarm={settingAlarm}
            />
          ))
        )}
      </div>

      <div style={{ margin: "20px 20px 0" }}>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={16} color="#1D6FE8" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0F1B35" }}>
              {t("scheduleActiveReminders")}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowCustom((v) => !v)}
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#1D6FE8",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            {showCustom ? t("scheduleCancel") : t("scheduleCustomAlarm")}
          </button>
        </div>

        {showCustom && (
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 14,
              marginBottom: 12,
              boxShadow: "0 4px 14px rgba(29,111,232,0.07)",
            }}
          >
            <input
              placeholder={t("scheduleMedicationName")}
              value={customMed}
              onChange={(e) => setCustomMed(e.target.value)}
              className="mb-2 w-full rounded-xl border border-border px-3 py-2 text-sm"
            />
            <input
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              placeholder={t("scheduleTimePlaceholder")}
              className="mb-2 w-full rounded-xl border border-border px-3 py-2 text-sm"
            />
            <div className="mb-3 flex gap-4">
              {[
                { label: t("scheduleSound"), val: sound, set: setSound, icon: Volume2 },
                { label: t("scheduleVibrate"), val: vibrate, set: setVibrate, icon: Vibrate },
              ].map(({ label, val, set, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => set(!val)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    color: val ? "#1D6FE8" : "#5A7399",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleCustomAlarm}
              disabled={!customMed.trim() || settingAlarm === "custom"}
              style={{
                width: "100%",
                padding: "10px 0",
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg, #1D6FE8, #0FB8C3)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                opacity: !customMed.trim() ? 0.5 : 1,
              }}
            >
              {t("scheduleSaveCustom")}
            </button>
          </div>
        )}

        {loading ? (
          <p style={{ fontSize: 12, color: "#5A7399" }}>{t("scheduleLoadingReminders")}</p>
        ) : alarms.length === 0 ? (
          <p style={{ fontSize: 12, color: "#5A7399" }}>
            {t("scheduleTapSetAlarm")}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {alarms.map((alarm) => (
              <div
                key={alarm.id}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  padding: "14px 16px",
                  boxShadow: "0 4px 14px rgba(29,111,232,0.07)",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  border: "1.5px solid rgba(29,111,232,0.06)",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 13,
                    background: "linear-gradient(135deg, #E0EEFF, #D8F8FB)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Clock size={20} color="#1D6FE8" />
                </div>
                <div className="flex-1">
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#0F1B35",
                      letterSpacing: -0.5,
                    }}
                  >
                    {alarm.time}
                  </div>
                  <div style={{ fontSize: 11, color: "#5A7399", marginTop: 1 }}>
                    {alarm.medication}
                  </div>
                  <div style={{ fontSize: 10, color: "#9BA7B4", marginTop: 2 }}>
                    {alarm.days.join(", ")}
                    {alarm.prescriptionId ? ` · ${t("scheduleLinkedRx")}` : ""}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(alarm.id)}
                  aria-label={t("scheduleRemoveAlarm")}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <X size={14} color="#9BA7B4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
