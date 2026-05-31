import { Crown } from "lucide-react";
import { Link } from "react-router";
import type { SubscriptionPlanId } from "@/types/subscription";

interface Props {
  feature: string;
  requiredPlan?: SubscriptionPlanId;
  currentPlan: SubscriptionPlanId;
}

const PLAN_RANK: Record<SubscriptionPlanId, number> = {
  free: 0,
  care_plus: 1,
  care_premium: 2,
  family: 3,
};

export function SubscriptionGate({ feature, requiredPlan = "care_plus", currentPlan }: Props) {
  if (PLAN_RANK[currentPlan] >= PLAN_RANK[requiredPlan]) return null;

  return (
    <div
      className="mx-5 mb-4 flex items-start gap-3 rounded-2xl p-4"
      style={{ background: "linear-gradient(135deg, #6C63FF18, #1D6FE818)", border: "1px solid #6C63FF33" }}
    >
      <Crown size={22} color="#6C63FF" className="shrink-0" />
      <div className="flex-1">
        <div className="text-sm font-bold text-[#0F1B35]">{feature} is a premium feature</div>
        <p className="mt-1 text-xs text-[#5A7399]">
          Upgrade to Care Plus or higher to unlock Find Care, insights, and more.
        </p>
        <Link
          to="/patient/subscription"
          className="mt-2 inline-block text-xs font-bold text-[#6C63FF] no-underline"
        >
          View plans & pay →
        </Link>
      </div>
    </div>
  );
}
