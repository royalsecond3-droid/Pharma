import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  Bus,
  Check,
  Coffee,
  Gift,
  Search,
  Ticket,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { api } from "@/api/truckngoClient";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { useApiData } from "@/hooks/useApi";
import type { RewardItem } from "@/types/truckngo";

type CategoryFilter = "all" | RewardItem["category"];

const CATEGORIES: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "transport", label: "Transport" },
  { id: "voucher", label: "Food" },
  { id: "utility", label: "Utilities" },
  { id: "municipal", label: "Municipal" },
];

const TOP_CATEGORIES: {
  id: CategoryFilter;
  label: string;
  icon: typeof Bus;
  color: string;
  bg: string;
}[] = [
  { id: "transport", label: "Transport", icon: Bus, color: "#1B5E20", bg: "#DCFCE7" },
  { id: "voucher", label: "Food", icon: Gift, color: "#7C3AED", bg: "#EDE9FE" },
  { id: "utility", label: "Utilities", icon: Zap, color: "#2563EB", bg: "#DBEAFE" },
  { id: "municipal", label: "Municipal", icon: Ticket, color: "#EA580C", bg: "#FFEDD5" },
];

const ITEM_ICONS: Record<RewardItem["category"], typeof Gift> = {
  utility: Zap,
  voucher: Coffee,
  transport: Bus,
  municipal: Ticket,
};

const ITEM_BG: Record<RewardItem["category"], string> = {
  utility: "#DBEAFE",
  voucher: "#FEF3C7",
  transport: "#DCFCE7",
  municipal: "#EDE9FE",
};

export function MarketplacePage() {
  const { user, refreshUser } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [selected, setSelected] = useState<RewardItem | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const { data, loading, reload } = useApiData(
    useMemo(() => (id: string) => api.getWallet(id), []),
  );

  const balance = data?.balance ?? user?.pointsBalance ?? 0;
  const catalog = data?.catalog ?? [];

  const affordableCount = catalog.filter((item) => item.cost <= balance).length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return catalog.filter((item) => {
      const matchesCategory = category === "all" || item.category === category;
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [catalog, category, search]);

  const popular = useMemo(() => {
    return [...catalog].sort((a, b) => a.cost - b.cost).slice(0, 4);
  }, [catalog]);

  const handleRedeem = async () => {
    if (!selected || !user?.residentId) return;
    setRedeeming(true);
    setToast(null);
    try {
      const res = await api.redeemReward(user.residentId, selected.id);
      setToast({ type: "success", msg: `Redeemed ${res.item.title}! Check your wallet.` });
      setSelected(null);
      await refreshUser();
      reload();
    } catch (e) {
      setToast({
        type: "error",
        msg: e instanceof Error ? e.message : "Could not redeem reward",
      });
    } finally {
      setRedeeming(false);
    }
  };

  const RewardCard = ({ item, compact = false }: { item: RewardItem; compact?: boolean }) => {
    const Icon = ITEM_ICONS[item.category];
    const canAfford = balance >= item.cost;
    return (
      <button
        type="button"
        onClick={() => setSelected(item)}
        className={`overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm transition active:scale-[0.98] ${
          compact ? "" : "w-full"
        }`}
      >
        <div
          className={`flex items-center justify-center ${compact ? "h-24" : "h-28"}`}
          style={{ background: ITEM_BG[item.category] }}
        >
          <Icon size={compact ? 32 : 36} className="text-foreground/70" />
        </div>
        <div className="p-3">
          <p className="text-sm font-bold text-foreground">{item.title}</p>
          <p className="mt-0.5 line-clamp-2 text-[10px] text-muted-foreground">{item.description}</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs font-bold text-primary">{item.cost} pts</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                canAfford ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
              }`}
            >
              {canAfford ? "Available" : "Need more"}
            </span>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-full bg-background pb-6">
      <PageHeader
        title="Rewards"
        showBack={false}
        rightSlot={
          <Link
            to="/resident/wallet"
            className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1.5 text-xs font-bold text-primary no-underline"
          >
            <Wallet size={14} />
            {loading ? "—" : balance.toLocaleString()}
          </Link>
        }
      />

      <div className="px-5">
        {/* Points banner */}
        <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
          <div>
            <p className="text-xs text-muted-foreground">Your balance</p>
            <p className="text-lg font-bold text-foreground">
              {loading ? "—" : balance.toLocaleString()}{" "}
              <span className="text-sm font-semibold text-primary">pts</span>
            </p>
          </div>
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Gift size={20} className="text-primary" />
            {affordableCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                {affordableCount}
              </span>
            )}
          </span>
        </div>

        {toast && (
          <p
            className={`mt-3 rounded-xl px-3 py-2 text-center text-xs font-semibold ${
              toast.type === "success" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
            }`}
          >
            {toast.msg}
          </p>
        )}

        {/* Search */}
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3">
          <Search size={18} className="shrink-0 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rewards..."
            className="flex-1 border-0 bg-transparent text-sm outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="border-0 bg-transparent text-muted-foreground"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold ${
                category === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Top categories */}
        <p className="mb-3 mt-6 text-sm font-bold text-foreground">Browse by Category</p>
        <div className="flex justify-between">
          {TOP_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className="flex flex-col items-center gap-2 border-0 bg-transparent"
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  category === c.id ? "ring-2 ring-primary ring-offset-2" : ""
                }`}
                style={{ background: c.bg }}
              >
                <c.icon size={20} color={c.color} />
              </span>
              <span className="text-[10px] font-semibold text-foreground">{c.label}</span>
            </button>
          ))}
        </div>

        {/* Popular (when no search/filter) */}
        {category === "all" && !search && (
          <>
            <p className="mb-3 mt-6 text-sm font-bold text-foreground">Popular Rewards</p>
            <div className="grid grid-cols-2 gap-3">
              {popular.map((item) => (
                <RewardCard key={item.id} item={item} compact />
              ))}
            </div>
          </>
        )}

        {/* All / filtered rewards */}
        <p className="mb-3 mt-6 text-sm font-bold text-foreground">
          {search ? `Results for "${search}"` : category === "all" ? "All Rewards" : CATEGORIES.find((c) => c.id === category)?.label}
          <span className="ml-1 font-normal text-muted-foreground">({filtered.length})</span>
        </p>

        {loading ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Loading rewards...</p>
        ) : filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No rewards found. Try another search or category.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((item) => (
              <RewardCard key={item.id} item={item} compact />
            ))}
          </div>
        )}
      </div>

      {/* Redeem modal */}
      {selected && (
        <div className="fixed inset-0 z-[200] mx-auto flex max-w-md items-end bg-black/50">
          <div className="w-full rounded-t-3xl bg-card p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ background: ITEM_BG[selected.category] }}
              >
                {(() => {
                  const Icon = ITEM_ICONS[selected.category];
                  return <Icon size={28} className="text-foreground/70" />;
                })()}
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full border-0 bg-secondary"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <h2 className="mt-4 text-xl font-bold text-foreground">{selected.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{selected.description}</p>

            <div className="mt-4 flex items-center justify-between rounded-2xl bg-secondary px-4 py-3">
              <span className="text-sm text-muted-foreground">Cost</span>
              <span className="text-lg font-bold text-primary">{selected.cost} pts</span>
            </div>

            <div className="mt-2 flex items-center justify-between rounded-2xl bg-secondary px-4 py-3">
              <span className="text-sm text-muted-foreground">Your balance</span>
              <span className="text-lg font-bold text-foreground">{balance.toLocaleString()} pts</span>
            </div>

            {balance < selected.cost && (
              <p className="mt-3 text-center text-xs font-semibold text-destructive">
                You need {(selected.cost - balance).toLocaleString()} more points
              </p>
            )}

            <button
              type="button"
              disabled={balance < selected.cost || redeeming}
              onClick={handleRedeem}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border-0 bg-primary py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-40"
            >
              {redeeming ? (
                "Redeeming..."
              ) : (
                <>
                  <Check size={18} />
                  Confirm Redeem
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
