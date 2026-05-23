import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useStaffAuth } from "@/context/StaffAuthContext";
import type { StaffRole } from "@/types";

const ROLE_CONFIG: Record<
  StaffRole,
  {
    title: string;
    subtitle: string;
    demoEmail: string;
    demoPassword: string;
    accent: string;
    home: string;
  }
> = {
  doctor: {
    title: "Healthcare Provider Portal",
    subtitle: "Electronic health records & digital prescribing",
    demoEmail: "doctor@medicare.et",
    demoPassword: "doctor123",
    accent: "#6C63FF",
    home: "/doctor",
  },
  pharmacy: {
    title: "Pharmacy Portal",
    subtitle: "Fayda-verified prescription fulfillment",
    demoEmail: "pharmacy@medicare.et",
    demoPassword: "pharmacy123",
    accent: "#0FB8C3",
    home: "/pharmacy",
  },
  admin: {
    title: "Administration Portal",
    subtitle: "Platform management & analytics",
    demoEmail: "admin@medicare.et",
    demoPassword: "admin123",
    accent: "#0F1B35",
    home: "/admin",
  },
};

export function StaffLoginPage({ role }: { role: StaffRole }) {
  const cfg = ROLE_CONFIG[role];
  const navigate = useNavigate();
  const { login, loginDemo } = useStaffAuth();
  const [email, setEmail] = useState(cfg.demoEmail);
  const [password, setPassword] = useState(cfg.demoPassword);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const goHome = () => navigate(cfg.home);

  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginDemo(role);
      goHome();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email.trim(), password, role);
      goHome();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : `Wrong credentials for the ${role} portal.`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 inline-block text-sm text-primary no-underline">
          ← All portals
        </Link>

        <div
          className="rounded-3xl border border-border bg-card p-8 shadow-lg"
          style={{ borderTop: `4px solid ${cfg.accent}` }}
        >
          <h1 className="text-xl font-bold text-foreground">{cfg.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{cfg.subtitle}</p>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="mt-5 w-full rounded-xl py-3.5 text-sm font-bold text-white disabled:opacity-60"
            style={{ background: cfg.accent }}
          >
            {loading ? "Signing in…" : "Continue with demo account"}
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or sign in manually</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                className="mt-1 w-full rounded-xl border border-border bg-input-background px-4 py-3 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="mt-1 w-full rounded-xl border border-border bg-input-background px-4 py-3 text-sm outline-none"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl border-2 py-3 text-sm font-bold disabled:opacity-60"
              style={{ borderColor: cfg.accent, color: cfg.accent }}
            >
              Sign in
            </button>
          </form>

          <div
            className="mt-4 rounded-lg p-3 text-xs"
            style={{ background: `${cfg.accent}12` }}
          >
            <p className="font-semibold text-foreground">This portal only</p>
            <p className="mt-1 text-muted-foreground">
              Email: <strong className="text-foreground">{cfg.demoEmail}</strong>
              <br />
              Password: <strong className="text-foreground">{cfg.demoPassword}</strong>
            </p>
            <p className="mt-2 text-muted-foreground">
              Each portal has its own login — doctor credentials won&apos;t work on
              admin or pharmacy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
