import type { AuraPrescriptionSchedule, NotificationCountdown } from "@/types/aura";

function parseDateTime(dateStr: string, timeStr: string): number {
  const [y, m, d] = dateStr.includes("-")
    ? dateStr.split("-").map(Number)
    : (() => {
        const parsed = new Date(dateStr);
        return [parsed.getFullYear(), parsed.getMonth() + 1, parsed.getDate()];
      })();
  const match = timeStr.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);
  if (!match) return Date.parse(`${dateStr}T08:00:00`);
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const second = Number(match[3] ?? 0);
  const ampm = match[4]?.toUpperCase();
  if (ampm === "PM" && hour < 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;
  return new Date(y, m - 1, d, hour, minute, second).getTime();
}

function parseExpiration(expirationDate: string): number {
  if (expirationDate.includes("-")) {
    const [y, m, d] = expirationDate.split("-").map(Number);
    return new Date(y, m - 1, d, 23, 59, 59).getTime();
  }
  return new Date(expirationDate).getTime() + 86400000 - 1;
}

/** Time pipeline — future notification milestones in seconds */
export function computeNotificationSchedule(
  rx: AuraPrescriptionSchedule,
  startDate = "2025-05-01",
  maxAlerts = 12,
): NotificationCountdown[] {
  const now = Date.now();
  const baseMs = parseDateTime(
    startDate.includes("-") ? startDate : "2025-05-01",
    rx.alertTime,
  );
  const expirationMs = parseExpiration(rx.expirationDate);
  const intervalMs = rx.frequencyHours * 3_600_000;

  const results: NotificationCountdown[] = [];
  let step = 0;
  let milestone = baseMs;

  while (results.length < maxAlerts) {
    if (milestone > expirationMs) break;
    if (milestone > now) {
      results.push({
        atMs: milestone,
        countdownSeconds: Math.floor((milestone - now) / 1000),
        medication: rx.medication,
      });
    }
    step += 1;
    milestone = baseMs + step * intervalMs;
  }

  return results;
}

export function canActivateAlerts(rx: AuraPrescriptionSchedule): boolean {
  const now = Date.now();
  const exp = parseExpiration(rx.expirationDate);
  return rx.remainingPills > 0 && now < exp && rx.status === "active";
}
