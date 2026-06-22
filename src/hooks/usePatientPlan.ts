import type { SubscriptionPlanId } from "@/types/subscription";

/** Legacy hook — TRUCKNGO does not use subscription tiers. */
export function usePatientPlan() {
  return {
    planId: "free" as SubscriptionPlanId,
    planName: "Resident",
    isPro: true,
    loading: false,
  };
}
