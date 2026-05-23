import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  MapPin,
  Phone,
  ShieldAlert,
  Users,
} from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { APP_NAME } from "@/lib/brand";

const SOS_STORAGE_KEY = "tanecare_sos_events";

interface SosEvent {
  at: string;
  fin: string;
  patientName: string;
}

const EMERGENCY_NUMBERS = [
  { label: "Ethiopia Emergency", number: "911", primary: true },
  { label: "Ambulance", number: "907", primary: false },
] as const;

export function SosPage() {
  const { user, faydaFin } = useAuth();
  const [holding, setHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [alertSent, setAlertSent] = useState(false);
  const [lastAlert, setLastAlert] = useState<SosEvent | null>(null);

  useEffect(() => {
    if (!faydaFin) return;
    try {
      const raw = localStorage.getItem(SOS_STORAGE_KEY);
      if (!raw) return;
      const events = JSON.parse(raw) as SosEvent[];
      const mine = events.filter((e) => e.fin === faydaFin);
      if (mine.length) setLastAlert(mine[mine.length - 1]);
    } catch {
      /* ignore */
    }
  }, [faydaFin]);

  const sendSosAlert = useCallback(() => {
    if (!faydaFin) return;
    const event: SosEvent = {
      at: new Date().toISOString(),
      fin: faydaFin,
      patientName: user?.fullName ?? "Patient",
    };
    try {
      const raw = localStorage.getItem(SOS_STORAGE_KEY);
      const events: SosEvent[] = raw ? JSON.parse(raw) : [];
      events.push(event);
      localStorage.setItem(SOS_STORAGE_KEY, JSON.stringify(events.slice(-20)));
    } catch {
      /* ignore */
    }
    setLastAlert(event);
    setAlertSent(true);
    setHolding(false);
    setHoldProgress(0);
  }, [faydaFin, user?.fullName]);

  useEffect(() => {
    if (!holding) return;
    const start = Date.now();
    const duration = 2000;
    const tick = window.setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / duration) * 100);
      setHoldProgress(p);
      if (p >= 100) {
        clearInterval(tick);
        sendSosAlert();
      }
    }, 50);
    return () => clearInterval(tick);
  }, [holding, sendSosAlert]);

  const caregiverPhone = user?.phone ?? "+251 911 000 000";
  const caregiverName = "Caregiver / family";

  return (
    <div className="pb-28">
      <div className="px-5 pt-5">
        <div className="flex items-center gap-2">
          <ShieldAlert size={22} color="#E53E3E" />
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#0F1B35",
              letterSpacing: -0.3,
            }}
          >
            SOS Emergency
          </h1>
        </div>
        <p style={{ fontSize: 12, color: "#5A7399", marginTop: 4 }}>
          Hold the button for 2 seconds to alert your caregiver and share your
          Fayda-linked profile with {APP_NAME}.
        </p>
      </div>

      {alertSent && (
        <div
          className="mx-5 mt-4 rounded-2xl p-4"
          style={{ background: "#E0F7EF", border: "1.5px solid #10B98144" }}
        >
          <p style={{ fontSize: 14, fontWeight: 700, color: "#10B981" }}>
            SOS alert sent (demo)
          </p>
          <p style={{ fontSize: 12, color: "#5A7399", marginTop: 4 }}>
            Caregiver and emergency contacts would be notified with your location
            and health summary. In production this connects to SMS, push, and
            emergency services.
          </p>
        </div>
      )}

      <div className="mt-8 flex flex-col items-center px-5">
        <button
          type="button"
          onPointerDown={() => {
            setAlertSent(false);
            setHolding(true);
          }}
          onPointerUp={() => {
            setHolding(false);
            setHoldProgress(0);
          }}
          onPointerLeave={() => {
            setHolding(false);
            setHoldProgress(0);
          }}
          style={{
            width: 200,
            height: 200,
            borderRadius: "50%",
            border: "6px solid #fff",
            background: holding
              ? `conic-gradient(#E53E3E ${holdProgress}%, #ff6b6b ${holdProgress}%)`
              : "linear-gradient(145deg, #E53E3E 0%, #C53030 100%)",
            color: "#fff",
            fontSize: 28,
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 12px 40px rgba(229,62,62,0.45)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            touchAction: "none",
            userSelect: "none",
          }}
        >
          <AlertTriangle size={40} />
          SOS
          <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.9 }}>
            {holding ? "Keep holding…" : "Hold 2 sec"}
          </span>
        </button>
        <p style={{ fontSize: 11, color: "#9BA7B4", marginTop: 16, textAlign: "center" }}>
          Release to cancel · Demo mode — no real emergency dispatch
        </p>
      </div>

      {lastAlert && (
        <p
          className="mx-5 mt-4 text-center text-xs"
          style={{ color: "#5A7399" }}
        >
          Last alert:{" "}
          {new Date(lastAlert.at).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      )}

      <div className="mt-6 px-5">
        <h2 style={{ fontSize: 13, fontWeight: 700, color: "#0F1B35", marginBottom: 10 }}>
          Quick call
        </h2>
        <div className="flex flex-col gap-2">
          <a
            href={`tel:${caregiverPhone.replace(/\s/g, "")}`}
            className="flex items-center gap-3 rounded-2xl p-4 no-underline"
            style={{
              background: "#fff",
              boxShadow: "0 4px 14px rgba(29,111,232,0.08)",
              border: "1.5px solid rgba(29,111,232,0.08)",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "#E0EEFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users size={20} color="#1D6FE8" />
            </div>
            <div className="flex-1">
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1B35" }}>
                {caregiverName}
              </div>
              <div style={{ fontSize: 12, color: "#5A7399" }}>{caregiverPhone}</div>
            </div>
            <Phone size={18} color="#1D6FE8" />
          </a>
          {EMERGENCY_NUMBERS.map((e) => (
            <a
              key={e.number}
              href={`tel:${e.number}`}
              className="flex items-center gap-3 rounded-2xl p-4 no-underline"
              style={{
                background: e.primary ? "#FEE2E2" : "#fff",
                boxShadow: "0 4px 14px rgba(229,62,62,0.1)",
                border: e.primary ? "1.5px solid #E53E3E33" : "1.5px solid rgba(29,111,232,0.08)",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: e.primary ? "#FECACA" : "#F4F8FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Phone size={20} color={e.primary ? "#E53E3E" : "#5A7399"} />
              </div>
              <div className="flex-1">
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1B35" }}>
                  {e.label}
                </div>
                <div style={{ fontSize: 12, color: "#5A7399" }}>{e.number}</div>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div
        className="mx-5 mt-6 flex items-start gap-3 rounded-2xl p-4"
        style={{ background: "#F4F8FF" }}
      >
        <MapPin size={18} color="#1D6FE8" className="mt-0.5 shrink-0" />
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#0F1B35" }}>
            Location sharing (coming soon)
          </p>
          <p style={{ fontSize: 11, color: "#5A7399", marginTop: 4 }}>
            Live GPS will be sent to caregivers when SOS is triggered. Update your
            phone in{" "}
            <Link to="/patient/profile" className="text-primary">
              Profile
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
