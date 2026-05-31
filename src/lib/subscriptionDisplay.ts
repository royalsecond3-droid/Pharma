import type { SubscriptionPlanId } from "@/types/subscription";

export function isProAccount(planId: SubscriptionPlanId): boolean {
  return planId !== "free";
}

export function getPlanDisplayName(planId: SubscriptionPlanId): string {
  const names: Record<SubscriptionPlanId, string> = {
    free: "Free",
    care_plus: "Care Plus",
    care_premium: "Care Premium",
    family: "Family Core",
  };
  return names[planId];
}

export function getProBadgeLabel(planId: SubscriptionPlanId): string | null {
  if (planId === "free") return null;
  if (planId === "family") return "PRO";
  if (planId === "care_premium") return "PRO";
  return "PLUS";
}
