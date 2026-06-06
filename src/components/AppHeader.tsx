import { Bell, Clock, Languages, User } from "lucide-react";
import { Link } from "react-router";
import type { ReactNode } from "react";
import { ProBadge } from "@/components/subscription/ProBadge";
import type { SubscriptionPlanId } from "@/types/subscription";
import { useLanguage } from "@/context/LanguageContext";

interface AppHeaderProps {
  greeting?: string;
  userName: string;
  planId?: SubscriptionPlanId;
  rightSlot?: ReactNode;
  showAlarmLink?: boolean;
  showLanguageSelector?: boolean;
}

export function AppHeader({
  greeting,
  userName,
  planId,
  rightSlot,
  showAlarmLink = true,
  showLanguageSelector = false,
}: AppHeaderProps) {
  const { language, setLanguage, options, t } = useLanguage();
  const resolvedGreeting = greeting ?? t("goodMorning");

  return (
    <div
      style={{
        background: "linear-gradient(160deg, #1D6FE8 0%, #0E9FD8 60%, #0FB8C3 100%)",
        padding: "16px 20px 28px",
        borderRadius: "0 0 32px 32px",
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "rgba(255,255,255,0.2)",
              border: "1.5px solid rgba(255,255,255,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(8px)",
            }}
          >
            <User size={20} color="#fff" />
          </div>
          <div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11 }}>
              {resolvedGreeting}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: -0.3,
                }}
              >
                {userName}
              </span>
              {planId && <ProBadge planId={planId} size="md" showPlanName />}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showLanguageSelector && (
            <label
              aria-label="Language"
              style={{
                height: 38,
                borderRadius: 11,
                background: "rgba(255,255,255,0.2)",
                border: "1.5px solid rgba(255,255,255,0.4)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "0 8px",
                color: "#fff",
              }}
            >
              <Languages size={14} color="#fff" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as typeof language)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {options.map((option) => (
                  <option key={option.code} value={option.code} style={{ color: "#0F1B35" }}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          )}
          {showAlarmLink && (
            <Link
              to="/patient/schedule"
              aria-label="Medication schedule"
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                background: "rgba(255,255,255,0.2)",
                border: "1.5px solid rgba(255,255,255,0.4)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <Clock size={18} color="#fff" />
            </Link>
          )}
          {rightSlot ?? (
            <button
              type="button"
              aria-label="Notifications"
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                background: "rgba(255,255,255,0.2)",
                border: "1.5px solid rgba(255,255,255,0.4)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                position: "relative",
                borderStyle: "solid",
              }}
            >
              <Bell size={18} color="#fff" />
              <div
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#F59E0B",
                  border: "1.5px solid #1D6FE8",
                }}
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
