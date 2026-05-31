export type SubscriptionPlanId = "free" | "care_plus" | "care_premium" | "family";
export type SubscriptionStatus = "active" | "trialing" | "past_due" | "cancelled" | "expired";
export type PaymentMethodType = "telebirr" | "cbe_birr" | "chapa" | "card";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";
export type BillingCycle = "monthly" | "annual";

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  tagline: string;
  priceEtbMonthly: number;
  priceEtbAnnual: number;
  features: string[];
  popular?: boolean;
}

export interface UserSubscription {
  planId: SubscriptionPlanId;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodEnd: string;
  autoRenew: boolean;
  trialEndsAt?: string;
}

export interface SavedPaymentMethod {
  id: string;
  type: PaymentMethodType;
  label: string;
  lastFour?: string;
  isDefault: boolean;
}

export interface PaymentTransaction {
  id: number;
  fin: string;
  amountEtb: number;
  description: string;
  method: PaymentMethodType;
  status: PaymentStatus;
  planId?: SubscriptionPlanId;
  createdAt: string;
  receiptRef: string;
}

export interface CheckoutPayload {
  planId: SubscriptionPlanId;
  billingCycle: BillingCycle;
  paymentMethod: PaymentMethodType;
  phone?: string;
}

export interface FamilyMember {
  fin: string;
  fullName: string;
  relation: string;
  isPrimary: boolean;
}
