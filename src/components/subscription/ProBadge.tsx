import { Sparkles } from "lucide-react";
import type { SubscriptionPlanId } from "@/types/subscription";
import { getPlanDisplayName, getProBadgeLabel } from "@/lib/subscriptionDisplay";

interface Props {
  planId: SubscriptionPlanId;
  size?: "sm" | "md";
  showPlanName?: boolean;
}

export function ProBadge({ planId, size = "sm", showPlanName = false }: Props) {
  const label = getProBadgeLabel(planId);
  if (!label) return null;

  const isFamily = planId === "family";
  const isPremium = planId === "care_premium";

  return (
    <span
      className="inline-flex items-center gap-1 font-bold uppercase tracking-wide"
      style={{
        fontSize: size === "md" ? 11 : 9,
        padding: size === "md" ? "4px 10px" : "3px 8px",
        borderRadius: 20,
        background: isFamily
          ? "linear-gradient(135deg, #F59E0B, #6C63FF)"
          : isPremium
            ? "linear-gradient(135deg, #6C63FF, #1D6FE8)"
            : "linear-gradient(135deg, #1D6FE8, #0FB8C3)",
        color: "#fff",
        boxShadow: "0 2px 8px rgba(108,99,255,0.35)",
      }}
    >
      <Sparkles size={size === "md" ? 12 : 10} />
      {label}
      {showPlanName && (
        <span style={{ opacity: 0.9, fontWeight: 600, textTransform: "none" }}>
          · {getPlanDisplayName(planId)}
        </span>
      )}
    </span>
  );
}
