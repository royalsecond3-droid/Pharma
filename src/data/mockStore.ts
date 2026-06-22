import type {
  HealthRecord,
  LegacyAdminStats,
  LegacyStaffProfile,
  LegacyStaffRole,
  MedicationAlarm,
  PatientBundle,
  PatientListItem,
  Prescription,
  PrescriptionStatus,
  UserProfile,
} from "@/types/healthcare";
import { DEMO_PATIENT_FINS } from "@/data/mockPatients";
import { getDurationDays, inferDoseTimes } from "@/lib/schedule";

type RxInput = Omit<Prescription, "durationDays" | "doseTimes"> &
  Partial<Pick<Prescription, "durationDays" | "doseTimes">>;

function enrichPrescription(rx: RxInput): Prescription {
  const durationDays =
    rx.durationDays && rx.durationDays > 0
      ? rx.durationDays
      : getDurationDays({ ...rx, durationDays: 90, doseTimes: [] } as Prescription);
  const doseTimes = rx.doseTimes?.length ? rx.doseTimes : inferDoseTimes(rx.schedule);
  return { ...rx, durationDays, doseTimes };
}

const PROFILES: Record<
  string,
  UserProfile & { email: string; phone: string; conditionNotes: string }
> = {
  "123456789012": {
    id: 1,
    faydaFin: "123456789012",
    fullName: "Sarah Johnson",
    email: "sarah.j@email.et",
    phone: "+251 911 234 567",
    conditionNotes:
      "Alzheimer's disease — mild cognitive impairment. Caregiver-assisted medication management.",
  },
  "234567890123": {
    id: 2,
    faydaFin: "234567890123",
    fullName: "Abebe Tadesse",
    email: "abebe.t@email.et",
    phone: "+251 912 345 678",
    conditionNotes:
      "Alzheimer's disease — moderate stage. Lives with family; requires structured reminder schedule.",
  },
  "345678901234": {
    id: 3,
    faydaFin: "345678901234",
    fullName: "Helen Girma",
    email: "helen.g@email.et",
    phone: "+251 913 456 789",
    conditionNotes:
      "Vascular dementia with anxiety. Dual therapy for cognition and mood stabilization.",
  },
  "456789012345": {
    id: 4,
    faydaFin: "456789012345",
    fullName: "Dawit Mekonnen",
    email: "dawit.m@email.et",
    phone: "+251 914 567 890",
    conditionNotes:
      "Early-onset Alzheimer's. Active in memory clinic program; monthly neurology follow-up.",
  },
  "567890123456": {
    id: 5,
    faydaFin: "567890123456",
    fullName: "Ruth Haile",
    email: "ruth.h@email.et",
    phone: "+251 915 678 901",
    conditionNotes:
      "Mild cognitive impairment (MCI) — under observation. Preventive cognitive support medications.",
  },
  "678901234567": {
    id: 6,
    faydaFin: "678901234567",
    fullName: "Yonas Bekele",
    email: "yonas.b@email.et",
    phone: "+251 916 789 012",
    conditionNotes:
      "Alzheimer's with insomnia. Evening dosing adjusted; caregiver reports improved sleep routine.",
  },
  "789012345678": {
    id: 7,
    faydaFin: "789012345678",
    fullName: "Meron Assefa",
    email: "meron.a@email.et",
    phone: "+251 917 890 123",
    conditionNotes:
      "Mixed dementia (Alzheimer's + vascular). Hypertension comorbidity; coordinated cardiology care.",
  },
  "890123456789": {
    id: 8,
    faydaFin: "890123456789",
    fullName: "Tigist Worku",
    email: "tigist.w@email.et",
    phone: "+251 918 901 234",
    conditionNotes:
      "Late-stage Alzheimer's — palliative-focused care plan. Simplified medication regimen.",
  },
};

const PRESCRIPTIONS: Record<string, RxInput[]> = {
  "123456789012": [
    {
      id: 101,
      hospital: "St. Mary's Medical Center",
      medication: "Donepezil",
      dosage: "10mg",
      schedule: "Once daily at bedtime",
      durationDays: 245,
      doseTimes: ["09:00 PM"],
      startDate: "May 1, 2025",
      endDate: "Dec 31, 2025",
      status: "active",
      fulfillmentStatus: "pending",
      icon: "🧠",
      color: "#6C63FF",
      doctorNotes: "Cholinesterase inhibitor for cognitive support",
    },
    {
      id: 102,
      hospital: "St. Mary's Medical Center",
      medication: "Memantine",
      dosage: "10mg",
      schedule: "Twice daily",
      durationDays: 245,
      doseTimes: ["08:00 AM", "08:00 PM"],
      startDate: "May 1, 2025",
      endDate: "Dec 31, 2025",
      status: "active",
      fulfillmentStatus: "dispensed",
      icon: "💊",
      color: "#1D6FE8",
      doctorNotes: "NMDA receptor antagonist",
    },
    {
      id: 103,
      hospital: "City General Hospital",
      medication: "Vitamin D3",
      dosage: "1000 IU",
      schedule: "Once daily with meals",
      durationDays: 184,
      doseTimes: ["08:00 AM"],
      startDate: "Mar 15, 2025",
      endDate: "Sep 15, 2025",
      status: "active",
      fulfillmentStatus: "pending",
      icon: "☀️",
      color: "#F59E0B",
    },
    {
      id: 104,
      hospital: "Greenview Clinic",
      medication: "Atorvastatin",
      dosage: "20mg",
      schedule: "Once daily at bedtime",
      startDate: "Jan 10, 2025",
      endDate: "Apr 10, 2025",
      status: "completed",
      fulfillmentStatus: "dispensed",
      icon: "🧬",
      color: "#10B981",
    },
  ],
  "234567890123": [
    {
      id: 201,
      hospital: "St. Mary's Medical Center",
      medication: "Donepezil",
      dosage: "10mg",
      schedule: "Once daily at bedtime",
      startDate: "Jan 1, 2025",
      endDate: "Dec 31, 2025",
      status: "active",
      fulfillmentStatus: "pending",
      icon: "🧠",
      color: "#6C63FF",
    },
    {
      id: 202,
      hospital: "St. Mary's Medical Center",
      medication: "Memantine",
      dosage: "10mg",
      schedule: "Twice daily",
      startDate: "Jan 1, 2025",
      endDate: "Dec 31, 2025",
      status: "active",
      fulfillmentStatus: "dispensed",
      icon: "💊",
      color: "#1D6FE8",
    },
  ],
};

const DEFAULT_RX: RxInput[] = [
  {
    id: 901,
    hospital: "St. Mary's Medical Center",
    medication: "Donepezil",
    dosage: "10mg",
    schedule: "Once daily at bedtime",
    startDate: "May 1, 2025",
    endDate: "Dec 31, 2025",
    status: "active",
    fulfillmentStatus: "pending",
    icon: "🧠",
    color: "#6C63FF",
  },
  {
    id: 902,
    hospital: "St. Mary's Medical Center",
    medication: "Memantine",
    dosage: "10mg",
    schedule: "Twice daily",
    startDate: "May 1, 2025",
    endDate: "Dec 31, 2025",
    status: "active",
    fulfillmentStatus: "pending",
    icon: "💊",
    color: "#1D6FE8",
  },
];

const DEFAULT_ALARMS: MedicationAlarm[] = [
  {
    id: 1,
    prescriptionId: 101,
    time: "09:00 PM",
    medication: "Donepezil",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    sound: true,
    vibration: true,
  },
  {
    id: 2,
    prescriptionId: 102,
    time: "08:00 AM",
    medication: "Memantine",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    sound: true,
    vibration: true,
  },
  {
    id: 3,
    prescriptionId: 102,
    time: "08:00 PM",
    medication: "Memantine",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    sound: true,
    vibration: true,
  },
];

const HEALTH_RECORDS: Record<string, HealthRecord[]> = {
  "123456789012": [
    {
      id: 1,
      visitDate: "2025-05-01",
      chiefComplaint: "Memory lapses and difficulty with daily routines",
      diagnosis: "Alzheimer's disease — early stage",
      notes:
        "Patient linked via Fayda ID. Digital prescription issued. Caregiver education provided.",
      doctorName: "Dr. Abebe Kebede",
      facilityName: "St. Mary's Medical Center",
    },
  ],
};

const STAFF_MOCK: LegacyStaffProfile[] = [
  {
    id: 1,
    email: "admin@tanecare.et",
    role: "admin",
    fullName: "System Administrator",
    facilityName: "Tena Care HQ",
    licenseId: "ADM-001",
  },
  {
    id: 2,
    email: "doctor@tanecare.et",
    role: "doctor",
    fullName: "Dr. Abebe Kebede",
    facilityName: "St. Mary's Medical Center",
    licenseId: "MD-ETH-8842",
  },
  {
    id: 3,
    email: "pharmacy@tanecare.et",
    role: "pharmacy",
    fullName: "Helen Tadesse",
    facilityName: "CityCare Pharmacy",
    licenseId: "PHM-ETH-2201",
  },
];

const STAFF_PASSWORDS: Record<string, string> = {
  "admin@tanecare.et": "admin123",
  "doctor@tanecare.et": "doctor123",
  "pharmacy@tanecare.et": "pharmacy123",
};

function alarmStorageKey(fin: string) {
  return `medicare_mock_alarms_${fin}`;
}

function loadAlarms(fin: string): MedicationAlarm[] {
  try {
    const raw = localStorage.getItem(alarmStorageKey(fin));
    if (raw) return JSON.parse(raw) as MedicationAlarm[];
  } catch {
    /* ignore */
  }
  return structuredClone(DEFAULT_ALARMS);
}

function saveAlarms(fin: string, alarms: MedicationAlarm[]) {
  localStorage.setItem(alarmStorageKey(fin), JSON.stringify(alarms));
}

function profileOverridesKey(fin: string) {
  return `tanecare_mock_profile_${fin}`;
}

function getProfile(fin: string): UserProfile {
  const base = PROFILES[fin];
  if (!base) {
    const demo = DEMO_PATIENT_FINS.find((p) => p.fin === fin);
    return {
      id: 99,
      faydaFin: fin,
      fullName: demo?.name ?? "Patient",
      email: null,
      phone: null,
      conditionNotes: "Registered via Fayda National ID.",
    };
  }
  try {
    const over = localStorage.getItem(profileOverridesKey(fin));
    if (over) return { ...base, ...JSON.parse(over) };
  } catch {
    /* ignore */
  }
  return base;
}

function getPrescriptions(fin: string): Prescription[] {
  const list = PRESCRIPTIONS[fin] ?? DEFAULT_RX;
  return structuredClone(list.map(enrichPrescription));
}

function delay<T>(value: T): Promise<T> {
  return new Promise((r) => setTimeout(() => r(value), 300));
}

export const mockStore = {
  createSession(fin: string) {
    return delay({ user: getProfile(fin) });
  },

  getProfile(fin: string) {
    return delay({ user: getProfile(fin) });
  },

  updateProfile(
    fin: string,
    data: Partial<Pick<UserProfile, "fullName" | "email" | "phone">>,
  ) {
    const current = getProfile(fin);
    const updated = { ...current, ...data };
    localStorage.setItem(profileOverridesKey(fin), JSON.stringify(updated));
    return delay({ user: updated });
  },

  getStats(fin: string) {
    const rx = getPrescriptions(fin);
    const alarms = loadAlarms(fin);
    return delay({
      activeRx: rx.filter((p) => p.status === "active").length,
      completed: rx.filter((p) => p.status === "completed").length,
      today: alarms.length,
    });
  },

  /** Synchronous list for supply/payment helpers (mock mode). */
  listPrescriptionsSync(fin: string) {
    return getPrescriptions(fin);
  },

  getPrescriptions(fin: string, params?: { status?: PrescriptionStatus | "all"; search?: string }) {
    let list = getPrescriptions(fin);
    if (params?.status && params.status !== "all") {
      list = list.filter((p) => p.status === params.status);
    }
    const q = params?.search?.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.medication.toLowerCase().includes(q) ||
          p.hospital.toLowerCase().includes(q),
      );
    }
    return delay({ prescriptions: list });
  },

  getAlarms(fin: string) {
    return delay({ alarms: loadAlarms(fin) });
  },

  createAlarm(fin: string, alarm: Omit<MedicationAlarm, "id">) {
    const alarms = loadAlarms(fin);
    const created = { ...alarm, id: Date.now() };
    alarms.push(created);
    saveAlarms(fin, alarms);
    return delay({ alarm: created });
  },

  deleteAlarm(fin: string, id: number) {
    const alarms = loadAlarms(fin).filter((a) => a.id !== id);
    saveAlarms(fin, alarms);
    return delay(undefined);
  },

  staffLogin(email: string, password: string, role: LegacyStaffRole) {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();
    const staff = STAFF_MOCK.find(
      (s) => s.email === normalizedEmail && s.role === role,
    );
    if (!staff || STAFF_PASSWORDS[normalizedEmail] !== normalizedPassword) {
      return Promise.reject(
        new Error(
          `Use the ${role} demo account for this portal (see below), not another portal's login.`,
        ),
      );
    }
    return delay({ staff });
  },

  /** One-click demo login — no password typing required. */
  staffLoginDemo(role: LegacyStaffRole) {
    const staff = STAFF_MOCK.find((s) => s.role === role);
    if (!staff) {
      return Promise.reject(new Error("Unknown role"));
    }
    return delay({ staff });
  },

  getPatientList(params?: { search?: string; pendingOnly?: boolean }) {
    const patients: PatientListItem[] = Object.keys(PROFILES).map((fin) => {
      const p = getProfile(fin);
      const rx = getPrescriptions(fin);
      return {
        ...p,
        prescriptionCount: rx.length,
        pendingPrescriptions: rx.filter(
          (r) => r.status === "active" && r.fulfillmentStatus === "pending",
        ).length,
        healthRecordCount: HEALTH_RECORDS[fin]?.length ?? 0,
      };
    });

    const q = params?.search?.trim().toLowerCase();
    let filtered = patients.filter((p) => {
      const matchSearch =
        !q ||
        p.fullName.toLowerCase().includes(q) ||
        p.faydaFin.includes(q.replace(/\D/g, ""));
      const matchPending =
        !params?.pendingOnly || (p.pendingPrescriptions ?? 0) > 0;
      return matchSearch && matchPending;
    });

    return delay({ patients: filtered, total: filtered.length });
  },

  doctorGetPatient(fin: string): Promise<PatientBundle> {
    const patient = getProfile(fin);
    const prescriptions = getPrescriptions(fin).map((rx) => ({
      ...rx,
      patientName: patient.fullName,
      patientFin: fin,
    }));
    return delay({
      patient,
      prescriptions,
      healthRecords: HEALTH_RECORDS[fin] ?? [],
      alarms: loadAlarms(fin).map((a) => ({
        id: a.id,
        time: a.time,
        medication: a.medication,
      })),
    });
  },

  doctorRegisterPatient(
    fin: string,
    data: { fullName?: string; conditionNotes?: string },
  ) {
    if (!PROFILES[fin]) {
      PROFILES[fin] = {
        id: Object.keys(PROFILES).length + 1,
        faydaFin: fin,
        fullName: data.fullName ?? "New Patient",
        email: "",
        phone: "",
        conditionNotes: data.conditionNotes ?? "",
      };
    }
    return delay({ patient: getProfile(fin) });
  },

  doctorIssuePrescription(data: {
    patientFin: string;
    medication: string;
    dosage: string;
    schedule?: string;
    durationDays?: number;
    doseTimes?: string[];
    doctorNotes?: string;
  }) {
    const fin = data.patientFin;
    if (!PRESCRIPTIONS[fin]) PRESCRIPTIONS[fin] = [];
    const start = new Date();
    const durationDays = data.durationDays ?? 90;
    const end = new Date(start);
    end.setDate(end.getDate() + durationDays);
    const fmt = (d: Date) =>
      d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const doseTimes =
      data.doseTimes?.length ? data.doseTimes : inferDoseTimes(data.schedule ?? "Once daily");
    const rx = enrichPrescription({
      id: Date.now(),
      hospital: "St. Mary's Medical Center",
      medication: data.medication,
      dosage: data.dosage,
      schedule: data.schedule ?? "As directed",
      durationDays,
      doseTimes,
      startDate: fmt(start),
      endDate: fmt(end),
      status: "active",
      fulfillmentStatus: "pending",
      icon: "🧠",
      color: "#6C63FF",
      doctorNotes: data.doctorNotes,
    });
    PRESCRIPTIONS[fin].push(rx);
    return delay({ prescription: rx });
  },

  doctorAddHealthRecord() {
    return delay({ id: Date.now() });
  },

  pharmacyGetPatient(fin: string) {
    const patient = getProfile(fin);
    const prescriptions = getPrescriptions(fin)
      .filter((p) => p.status === "active")
      .map((rx) => ({ ...rx, patientName: patient.fullName, patientFin: fin }));
    return delay({ patient, prescriptions });
  },

  pharmacyDispense(prescriptionId: number) {
    for (const fin of Object.keys(PRESCRIPTIONS)) {
      const rx = PRESCRIPTIONS[fin].find((p) => p.id === prescriptionId);
      if (rx) {
        rx.fulfillmentStatus = "dispensed";
        return delay({ prescription: rx });
      }
    }
    return Promise.reject(new Error("Prescription not found"));
  },

  adminStats(): Promise<LegacyAdminStats> {
    const allFin = Object.keys(PROFILES);
    let prescriptions = 0;
    let pending = 0;
    let dispensed = 0;
    for (const fin of allFin) {
      const rx = getPrescriptions(fin);
      prescriptions += rx.length;
      pending += rx.filter(
        (r) => r.status === "active" && r.fulfillmentStatus === "pending",
      ).length;
      dispensed += rx.filter((r) => r.fulfillmentStatus === "dispensed").length;
    }
    return delay({
      patients: allFin.length,
      prescriptions,
      pendingFulfillment: pending,
      dispensed,
      staff: STAFF_MOCK.length,
      healthRecords: Object.values(HEALTH_RECORDS).flat().length,
    });
  },

  adminStaff() {
    return delay({
      staff: STAFF_MOCK.map((s) => ({ ...s, createdAt: "2025-01-01" })),
    });
  },

  adminPrescriptions() {
    const all: Prescription[] = [];
    for (const fin of Object.keys(PROFILES)) {
      const p = getProfile(fin);
      getPrescriptions(fin).forEach((rx) => {
        all.push({ ...rx, patientName: p.fullName, patientFin: fin });
      });
    }
    return delay({ prescriptions: all });
  },
};
