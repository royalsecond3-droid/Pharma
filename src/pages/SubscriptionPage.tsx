import { useEffect, useState } from "react";
import {
  Check,
  ChevronLeft,
  CreditCard,
  Crown,
  History,
  Sparkles,
  Zap,
} from "lucide-react";
import { Link } from "react-router";
import { api } from "@/api/client";
import { PAYMENT_METHOD_LABELS, SUBSCRIPTION_PLANS } from "@/data/subscriptionPlans";
import { useAuth } from "@/context/AuthContext";
import type {
  BillingCycle,
  CheckoutPayload,
  FamilyMember,
  PaymentMethodType,
  PaymentTransaction,
  SubscriptionPlanId,
  UserSubscription,
} from "@/types/subscription";
import { formatFinDisplay } from "@/lib/fayda";

const METHODS: PaymentMethodType[] = ["telebirr", "cbe_birr", "chapa", "card"];

export function SubscriptionPage() {
  const { faydaFin, user } = useAuth();
  const [tab, setTab] = useState<"plans" | "billing">("plans");
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId>("care_plus");
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [method, setMethod] = useState<PaymentMethodType>("telebirr");
  const [phone, setPhone] = useState("");
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  const refresh = () => {
    if (!faydaFin) return;
    api.getSubscription(faydaFin).then((r) => setSubscription(r.subscription));
    api.getPaymentHistory(faydaFin).then((r) => setTransactions(r.transactions));
    api.getFamilyMembers(faydaFin).then((r) => setFamilyMembers(r.members));
  };

  useEffect(() => {
    refresh();
    if (user?.phone) setPhone(user.phone.replace(/\D/g, "").slice(-10));
  }, [faydaFin, user?.phone]);

  const selected = SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlan)!;
  const price =
    cycle === "annual" ? selected.priceEtbAnnual : selected.priceEtbMonthly;

  const checkout = async () => {
    if (!faydaFin) return;
    if (selectedPlan !== "free" && method !== "card" && phone.length < 9) {
      setError("Enter a valid mobile number for wallet payment");
      return;
    }
    setPaying(true);
    setError(null);
    setMessage(null);
    try {
      const payload: CheckoutPayload = {
        planId: selectedPlan,
        billingCycle: cycle,
        paymentMethod: method,
        phone: phone || undefined,
      };
      const { transaction } = await api.checkoutSubscription(faydaFin, payload);
      setMessage(
        transaction.status === "completed"
          ? `Paid ${transaction.amountEtb} ETB · Ref ${transaction.receiptRef}`
          : "Payment failed",
      );
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  const startTrial = async () => {
    if (!faydaFin) return;
    setPaying(true);
    try {
      await api.startSubscriptionTrial(faydaFin, "care_plus");
      setMessage("14-day Care Plus trial started — no charge today");
      refresh();
    } finally {
      setPaying(false);
    }
  };

  const cancelRenew = async () => {
    if (!faydaFin) return;
    await api.cancelSubscription(faydaFin);
    setMessage("Auto-renew turned off. Access continues until period end.");
    refresh();
  };

  const currentPlan = SUBSCRIPTION_PLANS.find((p) => p.id === subscription?.planId);

  return (
    <div className="pb-28">
      <div className="flex items-center gap-3 px-5 pt-5">
        <Link
          to="/patient/profile"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F4F8FF] no-underline"
        >
          <ChevronLeft size={20} color="#1D6FE8" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-[#0F1B35]">Subscription</h1>
          <p className="text-xs text-[#5A7399]">Pay in ETB · Telebirr, CBE, Chapa & card</p>
        </div>
      </div>

      {subscription && currentPlan && (
        <div
          className="mx-5 mt-4 rounded-2xl p-4 text-white"
          style={{
            background:
              subscription.planId === "free"
                ? "linear-gradient(135deg, #5A7399, #0F1B35)"
                : "linear-gradient(135deg, #6C63FF, #1D6FE8)",
          }}
        >
          <div className="flex items-center gap-2">
            <Crown size={18} />
            <span className="text-sm font-bold">{currentPlan.name}</span>
            {subscription.status === "trialing" && (
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold">
                TRIAL
              </span>
            )}
          </div>
          <p className="mt-1 text-xs opacity-90">
            {subscription.status === "cancelled"
              ? "Cancels at period end"
              : `Renews ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`}
            {subscription.autoRenew ? " · Auto-renew on" : " · Auto-renew off"}
            {subscription.planId === "family" && subscription.billingCycle === "annual"
              ? " · 8,990 ETB/yr"
              : ""}
          </p>
        </div>
      )}

      {subscription?.planId === "family" && familyMembers.length > 0 && (
        <div className="mx-5 mt-4 rounded-2xl border border-[rgba(108,99,255,0.2)] bg-white p-4">
          <h2 className="text-sm font-bold text-[#0F1B35]">Family Core members (4/4)</h2>
          <p className="mt-1 text-xs text-[#5A7399]">
            One subscription covers all linked Fayda profiles
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {familyMembers.map((m) => (
              <li
                key={m.fin}
                className="flex items-center justify-between rounded-xl px-3 py-2.5"
                style={{
                  background: m.isPrimary ? "#6C63FF12" : "#F4F8FF",
                  border: m.isPrimary ? "1px solid #6C63FF33" : "1px solid rgba(29,111,232,0.08)",
                }}
              >
                <div>
                  <div className="text-sm font-semibold text-[#0F1B35]">{m.fullName}</div>
                  <div className="text-[10px] text-[#5A7399]">
                    {m.relation} · FIN {formatFinDisplay(m.fin)}
                  </div>
                </div>
                {m.isPrimary && (
                  <span className="rounded-full bg-[#6C63FF] px-2 py-0.5 text-[10px] font-bold text-white">
                    Primary
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mx-5 mt-4 flex gap-1 rounded-xl bg-[#F4F8FF] p-1">
        {(["plans", "billing"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold"
            style={{
              background: tab === t ? "#fff" : "transparent",
              color: tab === t ? "#1D6FE8" : "#5A7399",
            }}
          >
            {t === "plans" ? <Sparkles size={14} /> : <History size={14} />}
            {t === "plans" ? "Plans & pay" : "Billing"}
          </button>
        ))}
      </div>

      {tab === "plans" && (
        <div className="px-5 pb-6">
          <button
            type="button"
            onClick={startTrial}
            disabled={paying || subscription?.status === "trialing"}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#6C63FF] py-3 text-sm font-bold text-[#6C63FF]"
          >
            <Zap size={16} />
            Try Care Plus free for 14 days
          </button>

          <div className="mt-4 flex gap-2">
            {(["monthly", "annual"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCycle(c)}
                className="flex-1 rounded-xl py-2.5 text-sm font-bold"
                style={{
                  background: cycle === c ? "#1D6FE8" : "#F4F8FF",
                  color: cycle === c ? "#fff" : "#5A7399",
                }}
              >
                {c === "monthly" ? "Monthly" : "Annual (save ~17%)"}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlan(plan.id)}
                className="relative rounded-2xl border-2 p-4 text-left transition-colors"
                style={{
                  borderColor: selectedPlan === plan.id ? "#1D6FE8" : "rgba(29,111,232,0.12)",
                  background: selectedPlan === plan.id ? "#F4F8FF" : "#fff",
                }}
              >
                {plan.popular && (
                  <span
                    className="absolute -top-2 right-3 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                    style={{ background: "#6C63FF" }}
                  >
                    POPULAR
                  </span>
                )}
                <div className="flex justify-between">
                  <div>
                    <div className="font-bold text-[#0F1B35]">{plan.name}</div>
                    <div className="text-xs text-[#5A7399]">{plan.tagline}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-[#1D6FE8]">
                      {cycle === "annual" ? plan.priceEtbAnnual : plan.priceEtbMonthly}{" "}
                      <span className="text-xs font-normal">ETB</span>
                    </div>
                    <div className="text-[10px] text-[#5A7399]">
                      /{cycle === "annual" ? "year" : "mo"}
                    </div>
                  </div>
                </div>
                <ul className="mt-3 space-y-1">
                  {plan.features.slice(0, 4).map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-xs text-[#0F1B35]">
                      <Check size={12} className="mt-0.5 shrink-0 text-[#10B981]" />
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>

          <h2 className="mb-2 mt-6 text-xs font-bold uppercase tracking-wide text-[#5A7399]">
            Payment method
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {METHODS.map((m) => {
              const meta = PAYMENT_METHOD_LABELS[m];
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className="rounded-xl border-2 p-3 text-left"
                  style={{
                    borderColor: method === m ? "#1D6FE8" : "rgba(29,111,232,0.1)",
                    background: method === m ? "#F4F8FF" : "#fff",
                  }}
                >
                  <span className="text-lg">{meta.icon}</span>
                  <div className="mt-1 text-sm font-bold text-[#0F1B35]">{meta.label}</div>
                </button>
              );
            })}
          </div>

          {method !== "card" && selectedPlan !== "free" && (
            <div className="mt-4">
              <label className="text-xs font-semibold uppercase text-[#5A7399]">
                Wallet phone number
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="09xxxxxxxx"
                className="mt-1 w-full rounded-xl border border-[rgba(29,111,232,0.15)] px-4 py-3 text-sm"
              />
            </div>
          )}

          {method === "card" && selectedPlan !== "free" && (
            <div className="mt-4 space-y-3 rounded-xl bg-[#F4F8FF] p-4">
              <input
                placeholder="Card number"
                className="w-full rounded-lg border border-[rgba(29,111,232,0.12)] px-3 py-2.5 text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="MM/YY" className="rounded-lg border px-3 py-2.5 text-sm" />
                <input placeholder="CVV" className="rounded-lg border px-3 py-2.5 text-sm" />
              </div>
              <p className="text-[10px] text-[#5A7399]">Demo only — no real charge</p>
            </div>
          )}

          {error && <p className="mt-3 text-sm text-[#E53E3E]">{error}</p>}
          {message && <p className="mt-3 text-sm font-medium text-[#10B981]">{message}</p>}

          <button
            type="button"
            disabled={paying}
            onClick={checkout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #1D6FE8, #6C63FF)" }}
          >
            <CreditCard size={18} />
            {paying
              ? "Processing payment…"
              : selectedPlan === "free"
                ? "Switch to Free"
                : `Pay ${price.toLocaleString()} ETB`}
          </button>

          {subscription && subscription.planId !== "free" && subscription.autoRenew && (
            <button
              type="button"
              onClick={cancelRenew}
              className="mt-3 w-full text-center text-xs font-semibold text-[#5A7399]"
            >
              Turn off auto-renew
            </button>
          )}
        </div>
      )}

      {tab === "billing" && (
        <div className="mt-4 px-5">
          {transactions.length === 0 ? (
            <p className="py-12 text-center text-sm text-[#5A7399]">No payments yet</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {transactions.map((tx) => (
                <li
                  key={tx.id}
                  className="rounded-2xl border border-[rgba(29,111,232,0.1)] bg-white p-4"
                >
                  <div className="flex justify-between">
                    <span className="font-semibold text-[#0F1B35]">{tx.description}</span>
                    <span className="font-bold text-[#1D6FE8]">{tx.amountEtb} ETB</span>
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-[#5A7399]">
                    <span>
                      {PAYMENT_METHOD_LABELS[tx.method].label} · {tx.receiptRef}
                    </span>
                    <span
                      style={{
                        color:
                          tx.status === "completed"
                            ? "#10B981"
                            : tx.status === "failed"
                              ? "#E53E3E"
                              : "#F59E0B",
                      }}
                    >
                      {tx.status}
                    </span>
                  </div>
                  <div className="mt-1 text-[10px] text-[#5A7399]">
                    {new Date(tx.createdAt).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
