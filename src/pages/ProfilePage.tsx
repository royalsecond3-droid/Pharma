import { useEffect, useState } from "react";
import { Crown, IdCard, LogOut, Shield, User } from "lucide-react";
import { ProBadge } from "@/components/subscription/ProBadge";
import { isProAccount } from "@/lib/subscriptionDisplay";
import { Link } from "react-router";
import { useNavigate } from "react-router";
import { api } from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import { formatFinDisplay } from "@/lib/fayda";
import { SUBSCRIPTION_PLANS } from "@/data/subscriptionPlans";
import type { SubscriptionPlanId } from "@/types/subscription";

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, faydaFin, logout, refreshUser } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [planId, setPlanId] = useState<SubscriptionPlanId>("free");

  useEffect(() => {
    if (faydaFin) {
      api.getSubscription(faydaFin).then((r) => setPlanId(r.subscription.planId));
    }
  }, [faydaFin]);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setEmail(user.email ?? "");
      setPhone(user.phone ?? "");
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faydaFin) return;
    setSaving(true);
    setMessage(null);
    try {
      await api.updateProfile(faydaFin, {
        fullName: fullName.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      await refreshUser();
      setMessage("Profile saved");
    } catch {
      setMessage("Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/patient/login");
  };

  return (
    <div className="pb-8">
      <div
        className="mx-5 mt-5 flex flex-col items-center rounded-3xl px-6 py-8"
        style={{
          background: "linear-gradient(160deg, #1D6FE8 0%, #0FB8C3 100%)",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: "rgba(255,255,255,0.25)",
            border: "2px solid rgba(255,255,255,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <User size={36} color="#fff" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <div style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>
            {user?.fullName ?? "Patient"}
          </div>
          {isProAccount(planId) && (
            <ProBadge planId={planId} size="md" showPlanName />
          )}
        </div>
        {faydaFin && (
          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              color: "rgba(255,255,255,0.85)",
              letterSpacing: 1,
            }}
          >
            FIN · {formatFinDisplay(faydaFin)}
          </div>
        )}
      </div>

      <Link
        to="/patient/subscription"
        className="mx-5 mt-4 flex items-center gap-3 rounded-2xl p-4 no-underline"
        style={{
          background: "linear-gradient(135deg, #6C63FF 0%, #1D6FE8 100%)",
          boxShadow: "0 8px 24px rgba(108,99,255,0.25)",
        }}
      >
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ background: "rgba(255,255,255,0.2)" }}
        >
          <Crown size={24} color="#fff" />
        </div>
        <div className="flex-1 text-white">
          <div className="text-sm font-bold">
            {SUBSCRIPTION_PLANS.find((p) => p.id === planId)?.name ?? "Aura Free"}
          </div>
          <div className="text-xs opacity-90">
            {planId === "family"
              ? "Family Core · 4 linked profiles · annual billing"
              : "Manage subscription · Pay with Telebirr, CBE, Chapa"}
          </div>
        </div>
        <span className="text-xs font-bold text-white">Upgrade →</span>
      </Link>

      <form
        onSubmit={handleSave}
        className="mx-5 mt-5"
        style={{
          background: "#fff",
          borderRadius: 24,
          padding: "20px",
          boxShadow: "0 8px 32px rgba(29,111,232,0.08)",
        }}
      >
        <div className="mb-4 flex items-center gap-2">
          <IdCard size={16} color="#1D6FE8" />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#0F1B35" }}>
            Personal details
          </span>
        </div>

        {[
          { label: "Full name", value: fullName, set: setFullName, type: "text" },
          { label: "Email", value: email, set: setEmail, type: "email" },
          { label: "Phone", value: phone, set: setPhone, type: "tel" },
        ].map((field) => (
          <div key={field.label} className="mb-4">
            <label
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#5A7399",
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              {field.label}
            </label>
            <input
              type={field.type}
              value={field.value}
              onChange={(e) => field.set(e.target.value)}
              style={{
                width: "100%",
                marginTop: 6,
                background: "#F4F8FF",
                borderRadius: 12,
                padding: "13px 16px",
                border: "1.5px solid rgba(29,111,232,0.12)",
                fontSize: 14,
                color: "#0F1B35",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        ))}

        {message && (
          <p
            style={{
              fontSize: 12,
              color: message.includes("saved") ? "#10B981" : "#E53E3E",
              marginBottom: 12,
            }}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          style={{
            width: "100%",
            padding: "14px 0",
            borderRadius: 14,
            background: "linear-gradient(135deg, #1D6FE8 0%, #0FB8C3 100%)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            border: "none",
            cursor: saving ? "wait" : "pointer",
          }}
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
      </form>

      <div
        className="mx-5 mt-4 flex items-start gap-2 rounded-2xl p-4"
        style={{ background: "#F4F8FF", border: "1px solid rgba(29,111,232,0.12)" }}
      >
        <Shield size={14} color="#5A7399" style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 11, color: "#5A7399", lineHeight: 1.5, margin: 0 }}>
          Your account is linked to Fayda National ID. Prescriptions, payments, and
          schedules are stored securely in the Aura Care platform.
        </p>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="mx-5 mt-6 flex w-[calc(100%-2.5rem)] items-center justify-center gap-2"
        style={{
          padding: "14px 0",
          borderRadius: 14,
          background: "#fff",
          color: "#E53E3E",
          fontSize: 14,
          fontWeight: 700,
          border: "1.5px solid rgba(229,62,62,0.3)",
          cursor: "pointer",
        }}
      >
        <LogOut size={18} />
        Log out
      </button>
    </div>
  );
}
