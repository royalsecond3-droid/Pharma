import { PAYMENT_METHOD_LABELS, SUBSCRIPTION_PLANS } from "@/data/subscriptionPlans";
import type {
  BillingCycle,
  CheckoutPayload,
  PaymentMethodType,
  PaymentTransaction,
  SavedPaymentMethod,
  SubscriptionPlanId,
  UserSubscription,
} from "@/types/subscription";

const SUB_KEY = "aura_subscription";
const TX_KEY = "aura_payments";
const METHODS_KEY = "aura_payment_methods";
const ADMIN_REVENUE_KEY = "aura_subscription_revenue";
const FAMILY_KEY = "aura_family_members";

/** Demo primary account — Sarah Johnson */
export const SARAH_JOHNSON_FIN = "123456789012";

const SARAH_FAMILY_SUBSCRIPTION: UserSubscription = {
  planId: "family",
  status: "active",
  billingCycle: "annual",
  currentPeriodEnd: new Date(Date.now() + 365 * 86400000).toISOString(),
  autoRenew: true,
};

const SARAH_FAMILY_MEMBERS: import("@/types/subscription").FamilyMember[] = [
  { fin: SARAH_JOHNSON_FIN, fullName: "Sarah Johnson", relation: "Primary", isPrimary: true },
  { fin: "234567890123", fullName: "Abebe Tadesse", relation: "Spouse / caregiver", isPrimary: false },
  { fin: "345678901234", fullName: "Helen Girma", relation: "Mother", isPrimary: false },
  { fin: "456789012345", fullName: "Dawit Mekonnen", relation: "Son", isPrimary: false },
];

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    /* ignore */
  }
  return fallback;
}

function saveJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function defaultSubscription(): UserSubscription {
  return {
    planId: "free",
    status: "active",
    billingCycle: "monthly",
    currentPeriodEnd: new Date(Date.now() + 365 * 86400000).toISOString(),
    autoRenew: false,
  };
}

function ensureSarahFamilyCore() {
  const all = loadJson<Record<string, UserSubscription>>(SUB_KEY, {});
  all[SARAH_JOHNSON_FIN] = SARAH_FAMILY_SUBSCRIPTION;
  saveJson(SUB_KEY, all);

  const familyAll = loadJson<Record<string, import("@/types/subscription").FamilyMember[]>>(
    FAMILY_KEY,
    {},
  );
  familyAll[SARAH_JOHNSON_FIN] = SARAH_FAMILY_MEMBERS;
  saveJson(FAMILY_KEY, familyAll);

  const txs = loadJson<PaymentTransaction[]>(TX_KEY, []);
  const hasSarahPayment = txs.some(
    (t) => t.fin === SARAH_JOHNSON_FIN && t.planId === "family" && t.status === "completed",
  );
  if (!hasSarahPayment) {
    txs.unshift({
      id: Date.now(),
      fin: SARAH_JOHNSON_FIN,
      amountEtb: 8990,
      description: "Family Core (annual)",
      method: "telebirr",
      status: "completed",
      planId: "family",
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      receiptRef: "AURA-SARAH-FAMILY-2025",
    });
    saveJson(TX_KEY, txs);
  }
}

function planPrice(planId: SubscriptionPlanId, cycle: BillingCycle): number {
  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
  if (!plan || planId === "free") return 0;
  return cycle === "annual" ? plan.priceEtbAnnual : plan.priceEtbMonthly;
}

function receiptRef() {
  return `AURA-${Date.now().toString(36).toUpperCase()}`;
}

function bumpRevenue(amount: number) {
  const rev = loadJson<{ totalEtb: number; transactions: number }>(ADMIN_REVENUE_KEY, {
    totalEtb: 12450,
    transactions: 42,
  });
  rev.totalEtb += amount;
  rev.transactions += 1;
  saveJson(ADMIN_REVENUE_KEY, rev);
}

export function planIncludesFeature(
  planId: SubscriptionPlanId,
  feature: "find_care" | "insights" | "lab_wizard" | "family" | "priority_rx",
): boolean {
  const tier: Record<SubscriptionPlanId, string[]> = {
    free: [],
    care_plus: ["find_care", "insights", "priority_rx"],
    care_premium: ["find_care", "insights", "priority_rx", "lab_wizard"],
    family: ["find_care", "insights", "priority_rx", "lab_wizard", "family"],
  };
  return tier[planId].includes(feature);
}

export const subscriptionService = {
  getPlans() {
    return SUBSCRIPTION_PLANS;
  },

  getSubscription(fin: string): UserSubscription {
    if (fin === SARAH_JOHNSON_FIN) {
      ensureSarahFamilyCore();
      return SARAH_FAMILY_SUBSCRIPTION;
    }
    const all = loadJson<Record<string, UserSubscription>>(SUB_KEY, {});
    return all[fin] ?? defaultSubscription();
  },

  getFamilyMembers(primaryFin: string) {
    if (primaryFin === SARAH_JOHNSON_FIN) {
      ensureSarahFamilyCore();
      return SARAH_FAMILY_MEMBERS;
    }
    const all = loadJson<Record<string, import("@/types/subscription").FamilyMember[]>>(
      FAMILY_KEY,
      {},
    );
    return all[primaryFin] ?? [];
  },

  getPaymentMethods(fin: string): SavedPaymentMethod[] {
    const all = loadJson<Record<string, SavedPaymentMethod[]>>(METHODS_KEY, {});
    return (
      all[fin] ?? [
        {
          id: "default-telebirr",
          type: "telebirr",
          label: "Telebirr",
          lastFour: "4567",
          isDefault: true,
        },
      ]
    );
  },

  savePaymentMethod(
    fin: string,
    method: { type: PaymentMethodType; label: string; lastFour?: string },
  ): SavedPaymentMethod {
    const all = loadJson<Record<string, SavedPaymentMethod[]>>(METHODS_KEY, {});
    const list = all[fin] ?? [];
    const entry: SavedPaymentMethod = {
      id: `pm-${Date.now()}`,
      type: method.type,
      label: method.label,
      lastFour: method.lastFour,
      isDefault: list.length === 0,
    };
    list.push(entry);
    all[fin] = list;
    saveJson(METHODS_KEY, all);
    return entry;
  },

  getTransactions(fin: string): PaymentTransaction[] {
    const all = loadJson<PaymentTransaction[]>(TX_KEY, []);
    return all.filter((t) => t.fin === fin).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  async processCheckout(
    fin: string,
    payload: CheckoutPayload,
  ): Promise<{ subscription: UserSubscription; transaction: PaymentTransaction }> {
    await new Promise((r) => setTimeout(r, 1200));

    const amount = planPrice(payload.planId, payload.billingCycle);
    if (amount === 0) {
      const sub: UserSubscription = {
        planId: "free",
        status: "active",
        billingCycle: "monthly",
        currentPeriodEnd: new Date(Date.now() + 365 * 86400000).toISOString(),
        autoRenew: false,
      };
      const all = loadJson<Record<string, UserSubscription>>(SUB_KEY, {});
      all[fin] = sub;
      saveJson(SUB_KEY, all);
      return {
        subscription: sub,
        transaction: {
          id: Date.now(),
          fin,
          amountEtb: 0,
          description: "Downgraded to Aura Free",
          method: payload.paymentMethod,
          status: "completed",
          createdAt: new Date().toISOString(),
          receiptRef: receiptRef(),
        },
      };
    }

    const failRoll = Math.random();
    if (failRoll < 0.05) {
      const failed: PaymentTransaction = {
        id: Date.now(),
        fin,
        amountEtb: amount,
        description: `Subscription — ${payload.planId}`,
        method: payload.paymentMethod,
        status: "failed",
        planId: payload.planId,
        createdAt: new Date().toISOString(),
        receiptRef: receiptRef(),
      };
      const txs = loadJson<PaymentTransaction[]>(TX_KEY, []);
      txs.unshift(failed);
      saveJson(TX_KEY, txs);
      throw new Error("Payment declined. Check your wallet balance and try again.");
    }

    const periodMs =
      payload.billingCycle === "annual" ? 365 * 86400000 : 30 * 86400000;
    const sub: UserSubscription = {
      planId: payload.planId,
      status: "active",
      billingCycle: payload.billingCycle,
      currentPeriodEnd: new Date(Date.now() + periodMs).toISOString(),
      autoRenew: true,
    };

    const all = loadJson<Record<string, UserSubscription>>(SUB_KEY, {});
    all[fin] = sub;
    saveJson(SUB_KEY, all);

    const tx: PaymentTransaction = {
      id: Date.now(),
      fin,
      amountEtb: amount,
      description: `${SUBSCRIPTION_PLANS.find((p) => p.id === payload.planId)?.name ?? payload.planId} (${payload.billingCycle})`,
      method: payload.paymentMethod,
      status: "completed",
      planId: payload.planId,
      createdAt: new Date().toISOString(),
      receiptRef: receiptRef(),
    };

    const txs = loadJson<PaymentTransaction[]>(TX_KEY, []);
    txs.unshift(tx);
    saveJson(TX_KEY, txs);
    bumpRevenue(amount);

    if (payload.phone) {
      subscriptionService.savePaymentMethod(fin, {
        type: payload.paymentMethod,
        label: PAYMENT_METHOD_LABELS[payload.paymentMethod]?.label ?? payload.paymentMethod,
        lastFour: payload.phone.slice(-4),
      });
    }

    return { subscription: sub, transaction: tx };
  },

  payReservation(
    fin: string,
    data: {
      amountEtb: number;
      medication: string;
      method: PaymentMethodType;
    },
  ): PaymentTransaction {
    const tx: PaymentTransaction = {
      id: Date.now(),
      fin,
      amountEtb: data.amountEtb,
      description: `Pharmacy reservation — ${data.medication}`,
      method: data.method,
      status: "completed",
      createdAt: new Date().toISOString(),
      receiptRef: receiptRef(),
    };
    const txs = loadJson<PaymentTransaction[]>(TX_KEY, []);
    txs.unshift(tx);
    saveJson(TX_KEY, txs);
    bumpRevenue(data.amountEtb);
    return tx;
  },

  cancelSubscription(fin: string): UserSubscription {
    const all = loadJson<Record<string, UserSubscription>>(SUB_KEY, {});
    const current = all[fin] ?? defaultSubscription();
    const updated: UserSubscription = {
      ...current,
      autoRenew: false,
      status: "cancelled",
    };
    all[fin] = updated;
    saveJson(SUB_KEY, all);
    return updated;
  },

  startTrial(fin: string, planId: SubscriptionPlanId): UserSubscription {
    const trialEnd = new Date(Date.now() + 14 * 86400000).toISOString();
    const sub: UserSubscription = {
      planId,
      status: "trialing",
      billingCycle: "monthly",
      currentPeriodEnd: trialEnd,
      autoRenew: true,
      trialEndsAt: trialEnd,
    };
    const all = loadJson<Record<string, UserSubscription>>(SUB_KEY, {});
    all[fin] = sub;
    saveJson(SUB_KEY, all);
    return sub;
  },

  getAdminRevenue() {
    return loadJson<{ totalEtb: number; transactions: number }>(ADMIN_REVENUE_KEY, {
      totalEtb: 12450,
      transactions: 42,
    });
  },
};
