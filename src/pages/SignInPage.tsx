import { useState } from "react";
import { Leaf, MapPin, Recycle, Shield, Truck } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { DEMO_RESIDENT_IDS } from "@/data/truckngoStore";
import { useAuth } from "@/context/AuthContext";
import { APP_NAME, LOGO_SRC, TRUCK_SRC } from "@/lib/brand";

export function SignInPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [residentId, setResidentId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!residentId.trim()) {
      setError("Enter your resident ID");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login(residentId.trim().toUpperCase());
      navigate("/resident/home");
    } catch {
      setError("Resident not found. Try a demo ID below.");
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (id: string) => {
    setResidentId(id);
    setLoading(true);
    setError(null);
    try {
      await login(id);
      navigate("/resident/home");
    } catch {
      setError("Could not sign in with this demo account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh w-full flex-col bg-[#F0FDF4]">
      {/* Hero */}
      <div
        className="relative overflow-hidden px-6 pb-16 pt-10"
        style={{
          background: "linear-gradient(160deg, #1B5E20 0%, #2E7D32 45%, #4ADE80 100%)",
        }}
      >
        <Link
          to="/resident/login"
          className="relative z-20 inline-flex items-center gap-1 text-sm font-semibold text-white/90 no-underline"
        >
          ← Back
        </Link>

        {/* Truck — bottom of hero, decorative only */}
        <img
          src={TRUCK_SRC}
          alt=""
          aria-hidden
          className="pointer-events-none absolute -bottom-28 -right-12 z-0 h-[360px] w-auto max-w-none object-contain object-bottom drop-shadow-2xl"
        />

        <div className="relative z-10 mt-6 max-w-[58%]">
          <img src={LOGO_SRC} alt={APP_NAME} className="h-24 w-24 object-contain" />
          <p className="mt-3 text-2xl font-extrabold text-white">{APP_NAME}</p>
          <h1 className="mt-2 text-[28px] font-bold leading-tight text-white">Welcome back</h1>
          <p className="mt-2 text-sm leading-relaxed text-white/80">
            Sign in to track your truck, earn rewards & keep your city clean.
          </p>
        </div>

        {/* Floating badges */}
        <div className="relative z-10 mt-6 flex flex-wrap gap-2">
          {[
            { icon: Truck, label: "Live tracking" },
            { icon: Recycle, label: "Smart sorting" },
            { icon: Leaf, label: "Earn points" },
          ].map((item) => (
            <span
              key={item.label}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur"
            >
              <item.icon size={13} />
              {item.label}
            </span>
          ))}
        </div>

        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-8 left-8 h-24 w-24 rounded-full bg-white/10" />
      </div>

      {/* Form card */}
      <div className="relative z-20 -mt-10 flex-1 px-5 pb-10">
        <div className="rounded-[28px] bg-white p-6 shadow-[0_12px_40px_rgba(27,94,32,0.12)]">
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-[#F0FDF4] p-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1B5E20]">
              <MapPin size={22} color="#fff" />
            </span>
            <div>
              <p className="text-sm font-bold text-[#111827]">Resident sign in</p>
              <p className="text-xs text-[#6B7280]">Use your household ID from registration</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Resident ID
            </label>
            <div className="relative mt-2">
              <Shield
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#1B5E20]"
              />
              <input
                value={residentId}
                onChange={(e) => setResidentId(e.target.value.toUpperCase())}
                placeholder="R100001"
                disabled={loading}
                className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] py-4 pl-11 pr-4 text-base font-semibold outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/15"
              />
            </div>
            {error && (
              <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#1B5E20] py-4 text-base font-bold text-white shadow-[0_4px_14px_rgba(27,94,32,0.35)] disabled:opacity-60"
            >
              <Truck size={18} />
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[#6B7280]">
            New here?{" "}
            <Link to="/resident/register" className="font-bold text-[#1B5E20] no-underline">
              Create account
            </Link>
          </p>
        </div>

        {/* Demo accounts */}
        <div className="mt-6 overflow-hidden rounded-[28px] border border-[#DCFCE7] bg-white shadow-sm">
          <div
            className="flex items-center gap-3 px-5 py-4"
            style={{ background: "linear-gradient(90deg, #F0FDF4, #ECFDF5)" }}
          >
            <img src={TRUCK_SRC} alt="" className="h-16 w-24 object-contain" />
            <div>
              <p className="text-sm font-bold text-[#111827]">Quick demo login</p>
              <p className="text-xs text-[#6B7280]">Tap any account to jump in instantly</p>
            </div>
          </div>

          <div className="space-y-2 p-4 pt-2">
            {DEMO_RESIDENT_IDS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => quickLogin(r.id)}
                disabled={loading}
                className="flex w-full items-center justify-between rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3.5 text-left transition hover:border-[#1B5E20]/40 hover:bg-[#F0FDF4] disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1B5E20]/10">
                    <Recycle size={16} className="text-[#1B5E20]" />
                  </span>
                  <span className="text-sm font-semibold text-[#111827]">{r.name}</span>
                </div>
                <span className="rounded-lg bg-white px-2 py-1 font-mono text-xs text-[#6B7280]">
                  {r.id}
                </span>
              </button>
            ))}
          </div>
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] text-[#6B7280]">
          <Shield size={12} className="text-[#1B5E20]" />
          Secure resident access · Route assigned automatically
        </p>
      </div>
    </div>
  );
}
