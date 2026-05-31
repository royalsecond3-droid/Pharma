import type { SubscriptionPlan } from "@/types/subscription";

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Aura Free",
    tagline: "Essential care tools",
    priceEtbMonthly: 0,
    priceEtbAnnual: 0,
    features: [
      "Fayda-linked profile",
      "Basic medication reminders",
      "SOS emergency",
      "Up to 2 active prescriptions",
    ],
  },
  {
    id: "care_plus",
    name: "Care Plus",
    tagline: "Smarter daily health",
    priceEtbMonthly: 299,
    priceEtbAnnual: 2990,
    popular: true,
    features: [
      "Personal health insights",
      "Find Care — pharmacy stock & ETB prices",
      "Priority pharmacy reservations",
      "Unlimited prescriptions",
      "SMS dose reminders",
    ],
  },
  {
    id: "care_premium",
    name: "Care Premium",
    tagline: "Full Aura platform",
    priceEtbMonthly: 599,
    priceEtbAnnual: 5990,
    features: [
      "Everything in Care Plus",
      "Lab equipment safety wizard",
      "Contraindication alerts",
      "PDF prescription upload",
      "24/7 caregiver hotline",
    ],
  },
  {
    id: "family",
    name: "Family Core",
    tagline: "Up to 4 Fayda profiles",
    priceEtbMonthly: 899,
    priceEtbAnnual: 8990,
    features: [
      "Everything in Care Premium",
      "4 linked family members",
      "Shared medication calendar",
      "Family Find Care basket",
      "One bill, all profiles",
    ],
  },
];

export const PAYMENT_METHOD_LABELS: Record<
  import("@/types/subscription").PaymentMethodType,
  { label: string; hint: string; icon: string }
> = {
  telebirr: { label: "Telebirr", hint: "Pay with your Telebirr wallet", icon: "📱" },
  cbe_birr: { label: "CBE Birr", hint: "Commercial Bank of Ethiopia", icon: "🏦" },
  chapa: { label: "Chapa", hint: "Card, mobile money & bank transfer", icon: "💳" },
  card: { label: "Debit / Credit card", hint: "Visa or Mastercard", icon: "💳" },
};
