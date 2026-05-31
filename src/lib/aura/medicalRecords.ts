import type {
  HealthTrendInsight,
  MedicalHistoryLog,
  PersonalInsights,
  VitalsMetrics,
} from "@/types/aura";

const BP_SYSTOLIC_HIGH = 140;
const BP_DIASTOLIC_HIGH = 90;
const HR_HIGH = 100;
const HR_LOW = 50;

export function isDuplicateLog(
  existing: MedicalHistoryLog[],
  incoming: Pick<MedicalHistoryLog, "timelineAt" | "userFin" | "condition">,
): boolean {
  return existing.some(
    (e) =>
      e.userFin === incoming.userFin &&
      e.timelineAt === incoming.timelineAt &&
      e.condition.toLowerCase() === incoming.condition.toLowerCase(),
  );
}

export function analyzeVitals(metrics: VitalsMetrics): HealthTrendInsight[] {
  const trends: HealthTrendInsight[] = [];

  if (metrics.systolic != null && metrics.diastolic != null) {
    const high =
      metrics.systolic >= BP_SYSTOLIC_HIGH || metrics.diastolic >= BP_DIASTOLIC_HIGH;
    trends.push({
      label: "Blood pressure",
      status: high ? "alert" : metrics.systolic >= 130 ? "watch" : "good",
      summary: high
        ? `${metrics.systolic}/${metrics.diastolic} mmHg — above standard range`
        : `${metrics.systolic}/${metrics.diastolic} mmHg — within range`,
      goal: high ? "Reduce sodium; recheck in 7 days" : "Maintain current routine",
    });
  }

  if (metrics.heartRate != null) {
    const hr = metrics.heartRate;
    const status =
      hr > HR_HIGH || hr < HR_LOW ? "alert" : hr > 85 ? "watch" : "good";
    trends.push({
      label: "Heart rate",
      status,
      summary: `${hr} bpm`,
      goal: status !== "good" ? "Consult provider if symptoms persist" : undefined,
    });
  }

  if (metrics.glucoseMgDl != null) {
    const g = metrics.glucoseMgDl;
    trends.push({
      label: "Blood glucose",
      status: g >= 180 ? "alert" : g >= 140 ? "watch" : "good",
      summary: `${g} mg/dL`,
      goal: g >= 140 ? "Track meals; follow diabetes care plan" : undefined,
    });
  }

  return trends;
}

export function buildPersonalInsights(logs: MedicalHistoryLog[]): PersonalInsights {
  const verified = logs.filter((l) => l.analysisState === "verified");
  const latest = verified.sort(
    (a, b) => new Date(b.timelineAt).getTime() - new Date(a.timelineAt).getTime(),
  )[0];

  const trends = latest ? analyzeVitals(latest.metrics) : [];
  const wellnessGoals: string[] = [];

  if (trends.some((t) => t.status === "alert")) {
    wellnessGoals.push("Schedule a follow-up with your care team this week");
  }
  if (verified.length < 2) {
    wellnessGoals.push("Log vitals at your next clinic visit for trend tracking");
  } else {
    wellnessGoals.push("Keep taking medications on your reminder schedule");
  }
  wellnessGoals.push("Use Find Care to locate rare medications near you");

  return {
    trends,
    wellnessGoals,
    lastUpdated: latest?.timelineAt ?? new Date().toISOString(),
  };
}

export function extractContraindicationTags(logs: MedicalHistoryLog[]): string[] {
  const tags = new Set<string>();
  const text = logs
    .map((l) => `${l.condition} ${l.contraindicationTags.join(" ")}`.toLowerCase())
    .join(" ");
  for (const kw of [
    "pacemaker",
    "metallic implant",
    "cochlear implant",
    "metal fragment",
    "severe renal impairment",
  ]) {
    if (text.includes(kw)) tags.add(kw);
  }
  return [...tags];
}
