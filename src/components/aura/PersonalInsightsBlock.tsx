import { useEffect, useState } from "react";
import { Activity, Target } from "lucide-react";
import { api } from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import type { PersonalInsights } from "@/types/aura";

const STATUS_COLORS = {
  good: { bg: "#ECFDF5", text: "#059669", border: "#A7F3D0" },
  watch: { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" },
  alert: { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
};

export function PersonalInsightsBlock() {
  const { residentId: fin } = useAuth();
  const [insights, setInsights] = useState<PersonalInsights | null>(null);

  useEffect(() => {
    if (!fin) return;
    api.getPersonalInsights(fin).then((r) => setInsights(r.insights));
  }, [fin]);

  if (!insights) return null;

  return (
    <section className="mx-5 mt-4 rounded-2xl border border-[rgba(29,111,232,0.12)] bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Activity size={18} color="#1D6FE8" />
        <h2 className="text-[15px] font-bold text-[#0F1B35]">Personal Insights</h2>
      </div>

      {insights.trends.length === 0 ? (
        <p className="text-sm text-[#5A7399]">
          Add a clinic visit or vitals entry to see your health trends.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {insights.trends.map((t) => {
            const c = STATUS_COLORS[t.status];
            return (
              <div
                key={t.label}
                className="rounded-xl px-3 py-2"
                style={{ background: c.bg, border: `1px solid ${c.border}` }}
              >
                <div className="text-xs font-semibold" style={{ color: c.text }}>
                  {t.label} · {t.status === "good" ? "On track" : t.status === "watch" ? "Watch" : "Attention"}
                </div>
                <div className="mt-0.5 text-sm text-[#0F1B35]">{t.summary}</div>
                {t.goal && (
                  <div className="mt-1 text-xs text-[#5A7399]">{t.goal}</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {insights.wellnessGoals.length > 0 && (
        <div className="mt-3 border-t border-[rgba(29,111,232,0.08)] pt-3">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase text-[#5A7399]">
            <Target size={12} /> Wellness goals
          </div>
          <ul className="m-0 list-disc space-y-1 pl-4 text-sm text-[#0F1B35]">
            {insights.wellnessGoals.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
