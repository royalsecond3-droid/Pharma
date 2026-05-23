import { useEffect, useState } from "react";
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
import { getSosHistory, sendSosAlert, type SosAlert } from "@/lib/sos";

const EMERGENCY_NUMBERS = [
  { label: "Ethiopia Emergency", number: "911", primary: true },
  { label: "Ambulance", number: "907", primary: false },
] as const;

export function SosPage() {
  const { user, faydaFin } = useAuth();
  const [holding, setHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [lastAlert, setLastAlert] = useState<SosAlert | null>(null);
  const [history, setHistory] = useState<SosAlert[]>([]);

  useEffect(() => {
    if (faydaFin) setHistory(getSosHistory(faydaFin));
  }, [faydaFin, lastAlert]);

  const caregiverPhone = user?.phone ?? "+251 911 000 000";
  const caregiverName = "Caregiver / family";

  const triggerSos = () => {
    if (!faydaFin) return;
    const alert = sendSosAlert({
      fin: faydaFin,
      patientName: user?.fullName ?? "Patient",
      caregiverPhone: user?.phone,
    });
    setLastAlert(alert);
    setHolding(false);
    setHoldProgress(0);
  };

  useEffect(() => {
    if (!holding) return;
    const start = Date.now();
    const duration = 2000;
    const tick = window.setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / duration) * 100);
      setHoldProgress(p);
      if (p >= 100) {
        clearInterval(tick);
        triggerSos();
      }
    }, 50);
    return () => clearInterval(tick);
  }, [holding]);

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

      {lastAlert && (
        <div
          className="mx-5 mt-4 rounded-2xl p-4"
          style={{ background: "#E0F7EF", border: "1.5px solid #10B98144" }}
        >
          <p style={{ fontSize: 14, fontWeight: 700, color: "#10B981" }}>
            SOS alert sent (demo)
          </p>
          <p style={{ fontSize: 12, color: "#5A7399", marginTop: 4 }}>
            {lastAlert.locationNote}
          </p>
          <ul style={{ marginTop: 8, paddingLeft: 16, fontSize: 11, color: "#5A7399" }}>
            {lastAlert.contactsNotified.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 flex flex-col items-center px-5">
        <button
          type="button"
          onPointerDown={() => {
            setLastAlert(null);
            setHolding(true);
          }}
          onPointerUp={() => {
            if (holdProgress < 100) {
              setHolding(false);
              setHoldProgress(0);
            }
          }}
          onPointerLeave={() => {
            if (holdProgress < 100) {
              setHolding(false);
              setHoldProgress(0);
            }
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

      {history.length > 0 && (
        <div className="mt-6 px-5">
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "#0F1B35", marginBottom: 8 }}>
            Recent alerts
          </h2>
          {history.slice(0, 3).map((a) => (
            <p key={a.id} style={{ fontSize: 11, color: "#5A7399", marginBottom: 4 }}>
              {new Date(a.sentAt).toLocaleString()} — {a.contactsNotified.length} contacts
            </p>
          ))}
        </div>
      )}

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
