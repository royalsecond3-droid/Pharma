export function formatAlarmTime(
  hour: number,
  minute: number,
  ampm: "AM" | "PM",
): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${ampm}`;
}
