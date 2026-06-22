import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  Award,
  Bus,
  ChevronRight,
  Coffee,
  Gift,
  MapPin,
  Sparkles,
  Ticket,
  Truck,
  Zap,
} from "lucide-react";
import { api } from "@/api/truckngoClient";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { useApiData } from "@/hooks/useApi";
import { TRUCK_SRC } from "@/lib/brand";
import { BADGES, type RewardHistory, type RewardItem } from "@/types/truckngo";

type TxFilter = "all" | "earned" | "spent";

const CATEGORY_ICONS: Record<RewardItem["category"], typeof Gift> = {
  utility: Zap,
  voucher: Coffee,
  transport: Bus,
  municipal: Ticket,
};

const CATEGORY_BG: Record<RewardItem["category"], string> = {
  utility: "#DBEAFE",
  voucher: "#FEF3C7",
  transport: "#DCFCE7",
  municipal: "#EDE9FE",
};

function txIcon(tx: RewardHistory) {
  if (tx.type === "redeemed") return { Icon: Gift, color: "#EA580C", bg: "#FFEDD5" };
  if (tx.description.toLowerCase().includes("collection")) {
    return { Icon: Truck, color: "#64748B", bg: "#F1F5F9" };
  }
  if (tx.description.toLowerCase().includes("upload") || tx.description.toLowerCase().includes("sort")) {
    return { Icon: Sparkles, color: "#1B5E20", bg: "#DCFCE7" };
  }
  return { Icon: MapPin, color: "#1B5E20", bg: "#DCFCE7" };
}

function getTopBadge(badgeIds: string[]) {
  const earned = BADGES.filter((b) => badgeIds.includes(b.id));
  return earned[earned.length - 1]?.name ?? "Green Starter";
}

function getNextBadge(totalEarned: number) {
  return BADGES.find((b) => totalEarned < b.minPoints);
}

export function SubscriptionPage() {
  const { user, refreshUser } = useAuth();
  const [filter, setFilter] = useState<TxFilter>("all");
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [redeemMsg, setRedeemMsg] = useState<string | null>(null);

  const { data, loading, reload } = useApiData(
    useMemo(() => (id: string) => api.getWallet(id), []),
  );

  const balance = data?.balance ?? user?.pointsBalance ?? 0;
  const earned = data?.totalEarned ?? user?.totalEarned ?? 0;
  const redeemed = data?.totalRedeemed ?? user?.totalRedeemed ?? 0;
  const weekly = data?.weeklyEarned ?? 0;
  const rank = data?.rank ?? user?.rank ?? 0;
  const badges = data?.badges ?? user?.badges ?? [];
  const history = data?.history ?? [];
  const catalog = data?.catalog ?? [];

  const topBadge = getTopBadge(badges);
  const nextBadge = getNextBadge(earned);
  const badgeProgress = nextBadge
    ? Math.min(100, Math.round((earned / nextBadge.minPoints) * 100))
    : 100;

  const filteredTx = history.filter((tx) => {
    if (filter === "earned") return tx.type === "earned";
    if (filter === "spent") return tx.type === "redeemed";
    return true;
  });

  const handleRedeem = async (rewardId: string) => {
    if (!user?.residentId) return;
    setRedeeming(rewardId);
    setRedeemMsg(null);
    try {
      const res = await api.redeemReward(user.residentId, rewardId);
      setRedeemMsg(`Redeemed ${res.item.title}!`);
      await refreshUser();
      reload();
    } catch (e) {
      setRedeemMsg(e instanceof Error ? e.message : "Redemption failed");
    } finally {
      setRedeeming(null);
    }
  };

  return (
    <div className="min-h-full bg-background pb-6">
      <PageHeader title="My Wallet" showBack={false} showBell />

      <div className="px-5">
        {/* Balance hero */}
        <div className="relative min-h-[200px] overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-[#2E7D32] p-6 pb-8 text-white shadow-lg">
          <div className="relative z-10 max-w-[58%]">
            <p className="text-sm font-medium opacity-90">Available Balance</p>
            <p className="mt-1 text-4xl font-bold tracking-tight">
              {loading ? "—" : balance.toLocaleString()}
            </p>
            <p className="mt-0.5 text-sm opacity-90">Eco Points</p>
            <p className="mt-6 text-xs font-semibold opacity-90">
              +{loading ? "—" : weekly} this week
            </p>
          </div>
          <img
            src={TRUCK_SRC}
            alt=""
            aria-hidden
            className="pointer-events-none absolute -bottom-28 -right-12 z-0 h-[360px] w-auto max-w-none object-contain object-bottom drop-shadow-2xl"
          />
        </div>

        {/* Stats row */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-border bg-card p-3 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Earned</p>
            <p className="mt-1 text-lg font-bold text-foreground">
              {loading ? "—" : earned.toLocaleString()}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-3 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Redeemed</p>
            <p className="mt-1 text-lg font-bold text-foreground">
              {loading ? "—" : redeemed.toLocaleString()}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-3 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Rank</p>
            <p className="mt-1 text-lg font-bold text-primary">#{loading ? "—" : rank}</p>
          </div>
        </div>

        {/* Badge progress */}
        <div className="mt-4 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
              <Award size={22} className="text-primary" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">{topBadge}</p>
              <p className="text-xs text-muted-foreground">
                {nextBadge
                  ? `${nextBadge.minPoints - earned} pts to ${nextBadge.name}`
                  : "Highest badge unlocked!"}
              </p>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${badgeProgress}%` }}
            />
          </div>
        </div>

        {/* Quick redeem */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm font-bold text-foreground">Redeem Rewards</p>
          <Link
            to="/resident/marketplace"
            className="flex items-center gap-0.5 text-xs font-semibold text-primary no-underline"
          >
            View all <ChevronRight size={14} />
          </Link>
        </div>

        {redeemMsg && (
          <p className="mt-2 rounded-xl bg-primary/10 px-3 py-2 text-center text-xs font-semibold text-primary">
            {redeemMsg}
          </p>
        )}

        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {catalog.map((item) => {
            const Icon = CATEGORY_ICONS[item.category];
            const canAfford = balance >= item.cost;
            return (
              <div
                key={item.id}
                className="w-40 shrink-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                <div
                  className="flex h-20 items-center justify-center"
                  style={{ background: CATEGORY_BG[item.category] }}
                >
                  <Icon size={28} className="text-foreground/70" />
                </div>
                <div className="p-3">
                  <p className="truncate text-xs font-bold text-foreground">{item.title}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{item.cost} pts</p>
                  <button
                    type="button"
                    disabled={!canAfford || redeeming === item.id}
                    onClick={() => handleRedeem(item.id)}
                    className="mt-2 w-full rounded-full border-0 bg-primary py-1.5 text-[10px] font-bold text-primary-foreground disabled:opacity-40"
                  >
                    {redeeming === item.id ? "..." : canAfford ? "Redeem" : "Need more"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Transactions */}
        <p className="mb-3 mt-6 text-sm font-bold text-foreground">Recent Transactions</p>

        <div className="mb-3 flex gap-2">
          {(["all", "earned", "spent"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize ${
                filter === key
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-foreground"
              }`}
            >
              {key === "spent" ? "Redeemed" : key}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading transactions...</p>
        ) : filteredTx.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No transactions yet. Upload waste to earn points!
          </p>
        ) : (
          filteredTx.map((tx) => {
            const { Icon, color, bg } = txIcon(tx);
            return (
              <div
                key={`${tx.id}-${tx.date}`}
                className="mb-2 flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                  style={{ background: bg }}
                >
                  <Icon size={20} color={color} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">{tx.date}</p>
                </div>
                <span
                  className="shrink-0 text-sm font-bold"
                  style={{ color: tx.amount > 0 ? "#1B5E20" : "#DC2626" }}
                >
                  {tx.amount > 0 ? "+" : ""}
                  {tx.amount} pts
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
