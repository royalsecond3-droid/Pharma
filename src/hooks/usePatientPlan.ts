import { useEffect, useState } from "react";
import { api } from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import { getPlanDisplayName, isProAccount } from "@/lib/subscriptionDisplay";
import type { SubscriptionPlanId } from "@/types/subscription";

export function usePatientPlan() {
  const { faydaFin } = useAuth();
  const [planId, setPlanId] = useState<SubscriptionPlanId>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!faydaFin) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .getSubscription(faydaFin)
      .then((r) => setPlanId(r.subscription.planId))
      .finally(() => setLoading(false));
  }, [faydaFin]);

  return {
    planId,
    planName: getPlanDisplayName(planId),
    isPro: isProAccount(planId),
    loading,
  };
}
