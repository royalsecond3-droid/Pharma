import type { Prescription } from "@/types";
import type {
  AdminAuraAnalytics,
  AuraPrescriptionSchedule,
  EquipmentAllocationResult,
  MedicalHistoryLog,
  PersonalInsights,
  PharmacyNearby,
  PharmacyReservation,
  RecordSource,
  VitalsMetrics,
} from "@/types/aura";
import { allocateEquipment } from "@/lib/aura/contraindication";
import {
  buildPersonalInsights,
  extractContraindicationTags,
  isDuplicateLog,
} from "@/lib/aura/medicalRecords";
import {
  DEFAULT_PATIENT_LOCATION,
  findAllNearbyPharmacies,
  findNearbyPharmacies,
} from "@/lib/aura/proximity";
import {
  canActivateAlerts,
  computeNotificationSchedule,
} from "@/lib/aura/timePipeline";

const LOGS_KEY = "aura_medical_logs";
const SCHEDULES_KEY = "aura_rx_schedules";
const RESERVATIONS_KEY = "aura_pharmacy_reservations";
const ANALYTICS_KEY = "aura_admin_analytics";
const INSIGHTS_CACHE_KEY = "aura_insights_cache";

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

const SEED_LOGS: MedicalHistoryLog[] = [
  {
    id: 1,
    userFin: "123456789012",
    timelineAt: "2025-04-15T10:00:00",
    source: "manual_form",
    metrics: { systolic: 128, diastolic: 82, heartRate: 72 },
    condition: "Hypertension — controlled",
    facilityId: "hosp-addis-01",
    analysisState: "verified",
    contraindicationTags: [],
  },
  {
    id: 2,
    userFin: "123456789012",
    timelineAt: "2025-05-01T09:30:00",
    source: "digital_parse",
    metrics: { systolic: 142, diastolic: 88, heartRate: 78, glucoseMgDl: 118 },
    condition: "Alzheimer's disease — early stage",
    facilityId: "hosp-addis-01",
    analysisState: "verified",
    contraindicationTags: [],
  },
  {
    id: 3,
    userFin: "789012345678",
    timelineAt: "2025-03-10T11:00:00",
    source: "manual_form",
    metrics: { systolic: 135, diastolic: 85, heartRate: 80 },
    condition: "Pacemaker implanted 2019",
    facilityId: "hosp-addis-02",
    analysisState: "verified",
    contraindicationTags: ["pacemaker"],
  },
];

function seedLogs(): MedicalHistoryLog[] {
  const existing = loadJson<MedicalHistoryLog[]>(LOGS_KEY, []);
  if (existing.length === 0) {
    saveJson(LOGS_KEY, SEED_LOGS);
    return SEED_LOGS;
  }
  return existing;
}

function getLogs(fin: string): MedicalHistoryLog[] {
  return seedLogs().filter((l) => l.userFin === fin);
}

function prescriptionToSchedule(fin: string, rx: Prescription): AuraPrescriptionSchedule {
  const doseMatch = rx.dosage.match(/(\d+)/);
  const strengthMg = doseMatch ? Number(doseMatch[1]) : 10;
  const freq = rx.schedule.toLowerCase().includes("twice")
    ? 12
    : rx.schedule.toLowerCase().includes("bedtime")
      ? 24
      : 24;
  const alertTime = rx.doseTimes?.[0] ?? "08:00 AM";
  const endIso = rx.endDate.includes("-")
    ? rx.endDate
    : new Date(rx.endDate).toISOString().slice(0, 10);

  return {
    id: rx.id,
    userFin: fin,
    medication: rx.medication,
    dosageForm: rx.medication.toLowerCase().includes("vitamin") ? "tablet" : "capsule",
    strengthMg,
    frequencyHours: freq,
    alertTime,
    timezone: "Africa/Addis_Ababa",
    totalPills: 90,
    remainingPills: rx.status === "active" ? 45 : 0,
    expirationDate: endIso,
    status:
      rx.status !== "active"
        ? "expired"
        : 45 > 0
          ? "active"
          : "depleted",
    hospital: rx.hospital,
  };
}

function getSchedules(fin: string, prescriptions: Prescription[]): AuraPrescriptionSchedule[] {
  const all = loadJson<Record<string, AuraPrescriptionSchedule[]>>(SCHEDULES_KEY, {});
  if (!all[fin]?.length) {
    const built = prescriptions
      .filter((p) => p.status === "active")
      .map((p) => prescriptionToSchedule(fin, p));
    all[fin] = built;
    saveJson(SCHEDULES_KEY, all);
    return built;
  }
  return all[fin];
}

function bumpAnalytics(field: "ingested" | "duplicate" | "safety") {
  const stats = loadJson<AdminAuraAnalytics>(ANALYTICS_KEY, {
    recordsIngested: 12,
    duplicatesBlocked: 2,
    avgProcessingMs: 48,
    regionalStockAlerts: [
      { city: "Addis Ababa", medication: "Rivastigmine", totalStock: 3 },
      { city: "Bahir Dar", medication: "Donepezil", totalStock: 15 },
    ],
    equipmentSafetyExceptions: 1,
    medicationDemand: [
      { medication: "Donepezil", requests: 24 },
      { medication: "Memantine", requests: 18 },
      { medication: "Rivastigmine", requests: 6 },
    ],
  });
  if (field === "ingested") stats.recordsIngested += 1;
  if (field === "duplicate") stats.duplicatesBlocked += 1;
  if (field === "safety") stats.equipmentSafetyExceptions += 1;
  saveJson(ANALYTICS_KEY, stats);
}

export const auraService = {
  getMedicalLogs(fin: string) {
    return getLogs(fin);
  },

  addMedicalLog(
    fin: string,
    data: {
      timelineAt?: string;
      source: RecordSource;
      metrics: VitalsMetrics;
      condition: string;
      facilityId: string;
      contraindicationTags?: string[];
    },
  ): { log?: MedicalHistoryLog; duplicate: boolean } {
    const logs = seedLogs();
    const timelineAt = data.timelineAt ?? new Date().toISOString();
    const incoming = { userFin: fin, timelineAt, condition: data.condition };

    if (isDuplicateLog(logs, incoming)) {
      bumpAnalytics("duplicate");
      return { duplicate: true };
    }

    const log: MedicalHistoryLog = {
      id: Date.now(),
      userFin: fin,
      timelineAt,
      source: data.source,
      metrics: data.metrics,
      condition: data.condition,
      facilityId: data.facilityId,
      analysisState: "verified",
      contraindicationTags: data.contraindicationTags ?? [],
    };
    logs.push(log);
    saveJson(LOGS_KEY, logs);
    bumpAnalytics("ingested");

    const insights = buildPersonalInsights(getLogs(fin));
    saveJson(`${INSIGHTS_CACHE_KEY}_${fin}`, insights);

    return { log, duplicate: false };
  },

  getPersonalInsights(fin: string): PersonalInsights {
    const cached = loadJson<PersonalInsights | null>(`${INSIGHTS_CACHE_KEY}_${fin}`, null);
    const fresh = buildPersonalInsights(getLogs(fin));
    if (!cached || cached.lastUpdated !== fresh.lastUpdated) {
      saveJson(`${INSIGHTS_CACHE_KEY}_${fin}`, fresh);
    }
    return fresh;
  },

  getNearbyPharmacies(
    medication: string,
    lat = DEFAULT_PATIENT_LOCATION.lat,
    lng = DEFAULT_PATIENT_LOCATION.lng,
    radiusKm = 15,
  ): PharmacyNearby[] {
    return findNearbyPharmacies(medication, lat, lng, radiusKm);
  },

  getAllNearbyPharmacies(
    medications: string[],
    lat = DEFAULT_PATIENT_LOCATION.lat,
    lng = DEFAULT_PATIENT_LOCATION.lng,
    radiusKm = 15,
  ): PharmacyNearby[] {
    return findAllNearbyPharmacies(medications, lat, lng, radiusKm);
  },

  getAlertPipeline(fin: string, prescriptions: Prescription[]) {
    const schedules = getSchedules(fin, prescriptions);
    return schedules
      .filter(canActivateAlerts)
      .map((rx) => ({
        prescriptionId: rx.id,
        medication: rx.medication,
        notifications: computeNotificationSchedule(rx),
        approved: true,
      }));
  },

  confirmPillDose(fin: string, prescriptionId: number): { remainingPills: number } {
    const all = loadJson<Record<string, AuraPrescriptionSchedule[]>>(SCHEDULES_KEY, {});
    const list = all[fin] ?? [];
    const rx = list.find((s) => s.id === prescriptionId);
    if (rx && rx.remainingPills > 0) {
      rx.remainingPills -= 1;
      if (rx.remainingPills === 0) rx.status = "depleted";
      all[fin] = list;
      saveJson(SCHEDULES_KEY, all);
      return { remainingPills: rx.remainingPills };
    }
    return { remainingPills: 0 };
  },

  searchEquipment(
    fin: string,
    equipmentId: string,
    lat = DEFAULT_PATIENT_LOCATION.lat,
    lng = DEFAULT_PATIENT_LOCATION.lng,
  ): EquipmentAllocationResult {
    const tags = extractContraindicationTags(getLogs(fin));
    const result = allocateEquipment(equipmentId, tags, lat, lng);
    if (result.contraindicationFound) bumpAnalytics("safety");
    return result;
  },

  createPharmacyReservation(data: {
    patientFin: string;
    patientName: string;
    medication: string;
    quantity: number;
    facilityId: string;
  }): PharmacyReservation {
    const list = loadJson<PharmacyReservation[]>(RESERVATIONS_KEY, []);
    const res: PharmacyReservation = {
      id: Date.now(),
      ...data,
      status: "queued",
      createdAt: new Date().toISOString(),
    };
    list.unshift(res);
    saveJson(RESERVATIONS_KEY, list);
    const stats = loadJson<AdminAuraAnalytics>(ANALYTICS_KEY, {
      recordsIngested: 12,
      duplicatesBlocked: 2,
      avgProcessingMs: 48,
      regionalStockAlerts: [],
      equipmentSafetyExceptions: 1,
      medicationDemand: [],
    });
    const existing = stats.medicationDemand.find((d) => d.medication === data.medication);
    if (existing) existing.requests += 1;
    else stats.medicationDemand.push({ medication: data.medication, requests: 1 });
    saveJson(ANALYTICS_KEY, stats);
    return res;
  },

  getPharmacyReservations(facilityId?: string): PharmacyReservation[] {
    const list = loadJson<PharmacyReservation[]>(RESERVATIONS_KEY, []);
    if (!facilityId) return list.filter((r) => r.status === "queued");
    return list.filter((r) => r.facilityId === facilityId && r.status === "queued");
  },

  getAdminAnalytics(): AdminAuraAnalytics {
    return loadJson<AdminAuraAnalytics>(ANALYTICS_KEY, {
      recordsIngested: 12,
      duplicatesBlocked: 2,
      avgProcessingMs: 48,
      regionalStockAlerts: [
        { city: "Addis Ababa", medication: "Rivastigmine", totalStock: 3 },
        { city: "Bahir Dar", medication: "Donepezil", totalStock: 15 },
      ],
      equipmentSafetyExceptions: 1,
      medicationDemand: [
        { medication: "Donepezil", requests: 24 },
        { medication: "Memantine", requests: 18 },
      ],
    });
  },
};
