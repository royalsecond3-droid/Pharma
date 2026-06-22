import { Bell, Clock, MapPin, User } from "lucide-react";
import { Link } from "react-router";
import type { ReactNode } from "react";

interface AppHeaderProps {
  greeting?: string;
  userName: string;
  subtitle?: string;
  rightSlot?: ReactNode;
  showScheduleLink?: boolean;
}

export function AppHeader({
  greeting = "Welcome back,",
  userName,
  subtitle,
  rightSlot,
  showScheduleLink = true,
}: AppHeaderProps) {
  return (
    <div
      style={{
        background: "linear-gradient(160deg, #0F766E 0%, #14B8A6 60%, #22C55E 100%)",
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
            }}
          >
            <User size={20} color="#fff" />
          </div>
          <div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11 }}>{greeting}</div>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 700, letterSpacing: -0.3 }}>
              {userName}
            </div>
            {subtitle && (
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 10, marginTop: 2 }}>
                {subtitle}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showScheduleLink && (
            <Link
              to="/resident/schedule"
              aria-label="Collection reminders"
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                background: "rgba(255,255,255,0.2)",
                border: "1.5px solid rgba(255,255,255,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                position: "relative",
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
                  background: "#FBBF24",
                  border: "1.5px solid #0F766E",
                }}
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function PointsBadge({ points }: { points: number }) {
  return (
    <div
      className="flex items-center gap-1.5 rounded-full px-3 py-1"
      style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)" }}
    >
      <MapPin size={12} color="#FBBF24" />
      <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>{points} pts</span>
    </div>
  );
}
