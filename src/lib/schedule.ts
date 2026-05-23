import type { Prescription } from "@/types";

/** Infer dose times from doctor schedule text when doseTimes is missing. */
export function inferDoseTimes(schedule: string): string[] {
  const s = schedule.toLowerCase();
  if (s.includes("twice") || s.includes("2x")) {
    return ["08:00 AM", "08:00 PM"];
  }
  if (s.includes("three") || s.includes("3x")) {
    return ["08:00 AM", "02:00 PM", "08:00 PM"];
  }
  if (s.includes("bedtime") || s.includes("night") || s.includes("evening")) {
    return ["09:00 PM"];
  }
  if (s.includes("morning") || s.includes("breakfast") || s.includes("meal")) {
    return ["08:00 AM"];
  }
  return ["08:00 AM"];
}

export function getDoseTimes(rx: Prescription): string[] {
  if (rx.doseTimes?.length) return rx.doseTimes;
  return inferDoseTimes(rx.schedule);
}

function parseDisplayDate(value: string): Date | null {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function getDurationDays(rx: Prescription): number {
  if (rx.durationDays && rx.durationDays > 0) return rx.durationDays;
  const start = parseDisplayDate(rx.startDate);
  const end = parseDisplayDate(rx.endDate);
  if (!start || !end) return 90;
  const days = Math.ceil((end.getTime() - start.getTime()) / 86400000);
  return Math.max(1, days);
}

export function getDaysRemaining(rx: Prescription, now = new Date()): number {
  const end = parseDisplayDate(rx.endDate);
  if (!end) return getDurationDays(rx);
  const diff = Math.ceil((end.getTime() - now.getTime()) / 86400000);
  return Math.max(0, diff);
}

export function getDaysElapsed(rx: Prescription, now = new Date()): number {
  const total = getDurationDays(rx);
  const remaining = getDaysRemaining(rx, now);
  return Math.min(total, Math.max(0, total - remaining));
}

export function courseProgress(rx: Prescription): number {
  const total = getDurationDays(rx);
  if (total <= 0) return 0;
  return Math.min(100, Math.round((getDaysElapsed(rx) / total) * 100));
}

export function formatCourseSummary(rx: Prescription): string {
  const total = getDurationDays(rx);
  const left = getDaysRemaining(rx);
  if (rx.status === "completed") return `Completed · ${total}-day course`;
  if (left === 0) return `Course ended · ${total} days prescribed`;
  return `Day ${getDaysElapsed(rx) + 1} of ${total} · ${left} day${left === 1 ? "" : "s"} left`;
}
