import { useState } from "react";
import {
  Activity,
  CheckCircle,
  Heart,
  IdCard,
  Scan,
  Shield,
  Stethoscope,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { MobileShell } from "@/components/layout/MobileShell";
import { DEMO_PATIENT_FINS } from "@/data/mockPatients";
import { useAuth } from "@/context/AuthContext";
import {
  finValidationMessage,
  formatFinDisplay,
  isValidFin,
  normalizeFin,
} from "@/lib/fayda";

export function LoginPage() {
  const navigate = useNavigate();
  const { loginWithFayda } = useAuth();
  const [fin, setFin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const handleFinChange = (raw: string) => {
    setFin(formatFinDisplay(raw));
    if (error) setError(null);
  };

  const verifyAndLogin = async (normalizedFin: string) => {
    setVerifying(true);
    setError(null);
    try {
      await loginWithFayda(normalizedFin);
      navigate("/patient/home");
    } catch {
      setError("Could not sign in. Check your Fayda ID and try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizeFin(fin);
    const message = finValidationMessage(fin);
    if (message || !isValidFin(fin)) {
      setError(message ?? "Invalid Fayda National ID");
      return;
    }
    await verifyAndLogin(normalized);
  };

  const handleOpenFaydaApp = async () => {
    const normalized = normalizeFin(fin);
    if (!isValidFin(fin)) {
      setError(
        finValidationMessage(fin) ??
          "Enter your Fayda National ID first, or open the Fayda app to verify.",
      );
      return;
    }
    await verifyAndLogin(normalized);
  };

  return (
    <MobileShell>
      <div className="flex min-h-dvh flex-col px-6 pb-8">
        <div
          className="relative -mx-6 flex flex-col items-center px-6 pb-8 pt-10"
          style={{
            background: "linear-gradient(160deg, #1D6FE8 0%, #0FB8C3 100%)",
            borderRadius: "0 0 36px 36px",
          }}
        >
          <div className="mb-3 flex items-center gap-3">
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(12px)",
                border: "1.5px solid rgba(255,255,255,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Stethoscope size={26} color="#fff" />
            </div>
            <div>
              <div
                style={{
                  color: "#fff",
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: -0.5,
                }}
              >
                Tane Care
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.75)",
                  fontSize: 11,
                  fontWeight: 500,
                }}
              >
                Patient Portal
              </div>
            </div>
          </div>
          <div
            style={{
              color: "#fff",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: -0.5,
              textAlign: "center",
            }}
          >
            Sign in with Fayda
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: 13,
              textAlign: "center",
              marginTop: 4,
              maxWidth: 280,
            }}
          >
            Use your Ethiopian National ID (Fayda) to access your health records
          </div>
          <div style={{ position: "absolute", right: 20, top: 20, opacity: 0.12 }}>
            <Heart size={64} color="#fff" />
          </div>
          <div style={{ position: "absolute", left: 20, bottom: 16, opacity: 0.1 }}>
            <Activity size={48} color="#fff" />
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            marginTop: 24,
            background: "#fff",
            borderRadius: 24,
            padding: "24px 20px",
            boxShadow: "0 8px 32px rgba(29,111,232,0.10)",
          }}
        >
          <div
            className="mb-5 flex items-center gap-2"
            style={{
              background: "linear-gradient(135deg, #E8F5E9 0%, #E0F7F8 100%)",
              borderRadius: 12,
              padding: "10px 12px",
              border: "1px solid rgba(15, 184, 195, 0.25)",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <IdCard size={18} color="#0B7A3E" />
            </div>
            <div className="flex-1">
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0F1B35" }}>
                Fayda National ID
              </div>
              <div style={{ fontSize: 10, color: "#5A7399" }}>
                Official digital identity · Ethiopia
              </div>
            </div>
            <CheckCircle size={16} color="#0FB8C3" />
          </div>

          <div className="mb-4">
            <label
              htmlFor="fayda-fin"
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#5A7399",
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              Fayda ID number (FIN)
            </label>
            <div
              style={{
                marginTop: 6,
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#F4F8FF",
                borderRadius: 12,
                padding: "13px 16px",
                border: error
                  ? "1.5px solid #E53E3E"
                  : "1.5px solid rgba(29,111,232,0.12)",
              }}
            >
              <IdCard size={16} color="#1D6FE8" />
              <input
                id="fayda-fin"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="0000 0000 0000"
                value={fin}
                onChange={(e) => handleFinChange(e.target.value)}
                disabled={verifying}
                aria-invalid={!!error}
                aria-describedby={error ? "fin-error" : undefined}
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  outline: "none",
                  fontSize: 15,
                  color: "#0F1B35",
                  letterSpacing: 1.2,
                  fontWeight: 600,
                }}
              />
            </div>
            {error && (
              <p
                id="fin-error"
                role="alert"
                style={{ fontSize: 11, color: "#E53E3E", marginTop: 6 }}
              >
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={verifying}
            style={{
              width: "100%",
              padding: "15px 0",
              borderRadius: 14,
              background: verifying
                ? "#9BA7B4"
                : "linear-gradient(135deg, #1D6FE8 0%, #0FB8C3 100%)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              border: "none",
              cursor: verifying ? "wait" : "pointer",
              boxShadow: verifying
                ? "none"
                : "0 6px 20px rgba(29,111,232,0.35)",
              letterSpacing: 0.2,
            }}
          >
            {verifying ? "Verifying…" : "Verify National ID"}
          </button>

          <div className="my-5 flex items-center gap-3">
            <div style={{ flex: 1, height: 1, background: "rgba(29,111,232,0.10)" }} />
            <span style={{ fontSize: 12, color: "#5A7399", fontWeight: 500 }}>or</span>
            <div style={{ flex: 1, height: 1, background: "rgba(29,111,232,0.10)" }} />
          </div>

          <button
            type="button"
            onClick={handleOpenFaydaApp}
            disabled={verifying}
            style={{
              width: "100%",
              padding: "14px 0",
              borderRadius: 14,
              background: "#fff",
              color: "#0B7A3E",
              fontSize: 14,
              fontWeight: 700,
              border: "2px solid #0B7A3E",
              cursor: verifying ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Scan size={18} />
            Verify with Fayda App
          </button>

          <div className="mt-5 flex items-start gap-2">
            <Shield size={14} color="#5A7399" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 11, color: "#5A7399", lineHeight: 1.5, margin: 0 }}>
              Login is only available through Fayda National ID. Your identity is
              verified securely and is never shared without your consent.
            </p>
          </div>
        </form>

        <div
          className="mt-5 rounded-2xl border border-border p-4"
          style={{ background: "#F4F8FF" }}
        >
          <p style={{ fontSize: 11, fontWeight: 700, color: "#0F1B35", marginBottom: 8 }}>
            Demo patients (tap FIN to copy)
          </p>
          <div className="flex flex-col gap-1.5">
            {DEMO_PATIENT_FINS.slice(0, 4).map((p) => (
              <button
                key={p.fin}
                type="button"
                onClick={() => setFin(formatFinDisplay(p.fin))}
                className="flex justify-between rounded-lg bg-white/80 px-3 py-2 text-left text-xs"
                style={{ border: "1px solid rgba(29,111,232,0.1)" }}
              >
                <span style={{ fontWeight: 600, color: "#0F1B35" }}>{p.name}</span>
                <span style={{ fontFamily: "monospace", color: "#5A7399" }}>{p.fin}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="mt-4 text-center">
          <Link to="/" style={{ fontSize: 12, color: "#5A7399", textDecoration: "none" }}>
            ← All portals
          </Link>
        </p>

        <p
          className="mt-4 text-center"
          style={{ fontSize: 12, color: "#5A7399", lineHeight: 1.5 }}
        >
          Don&apos;t have Fayda yet?{" "}
          <a
            href="https://id.et"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#1D6FE8", fontWeight: 700, textDecoration: "none" }}
          >
            Register at id.et
          </a>
        </p>
      </div>
    </MobileShell>
  );
}
