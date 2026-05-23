import { mockStore } from "@/data/mockStore";
import type {
  AdminStats,
  MedicationAlarm,
  PatientBundle,
  PatientListItem,
  Prescription,
  PrescriptionStatus,
  StaffProfile,
  StaffRole,
  UserProfile,
} from "@/types";

/** Use live API only when VITE_USE_API=true. Default: mock data (no server required). */
const USE_API = import.meta.env.VITE_USE_API === "true";

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { fin?: string; staffId?: number } = {},
): Promise<T> {
  const { fin, staffId, headers, ...rest } = options;
  const res = await fetch(path, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(fin ? { "X-Fayda-Fin": fin } : {}),
      ...(staffId ? { "X-Staff-Id": String(staffId) } : {}),
      ...headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      (body as { error?: string }).error ?? res.statusText,
      res.status,
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  createSession(fin: string) {
    if (!USE_API) return mockStore.createSession(fin);
    return request<{ user: UserProfile }>("/api/session", {
      method: "POST",
      body: JSON.stringify({ fin }),
    });
  },

  getProfile(fin: string) {
    if (!USE_API) return mockStore.getProfile(fin);
    return request<{ user: UserProfile }>("/api/profile", { fin });
  },

  updateProfile(
    fin: string,
    data: Partial<Pick<UserProfile, "fullName" | "email" | "phone">>,
  ) {
    if (!USE_API) return mockStore.updateProfile(fin, data);
    return request<{ user: UserProfile }>("/api/profile", {
      method: "PATCH",
      fin,
      body: JSON.stringify(data),
    });
  },

  getStats(fin: string) {
    if (!USE_API) return mockStore.getStats(fin);
    return request<{ activeRx: number; completed: number; today: number }>(
      "/api/stats",
      { fin },
    );
  },

  getPrescriptions(
    fin: string,
    params?: { status?: PrescriptionStatus | "all"; search?: string },
  ) {
    if (!USE_API) return mockStore.getPrescriptions(fin, params);
    const qs = new URLSearchParams();
    if (params?.status && params.status !== "all") qs.set("status", params.status);
    if (params?.search) qs.set("search", params.search);
    const q = qs.toString();
    return request<{ prescriptions: Prescription[] }>(
      `/api/prescriptions${q ? `?${q}` : ""}`,
      { fin },
    );
  },

  getAlarms(fin: string) {
    if (!USE_API) return mockStore.getAlarms(fin);
    return request<{ alarms: MedicationAlarm[] }>("/api/alarms", { fin });
  },

  createAlarm(fin: string, alarm: Omit<MedicationAlarm, "id">) {
    if (!USE_API) return mockStore.createAlarm(fin, alarm);
    return request<{ alarm: MedicationAlarm }>("/api/alarms", {
      method: "POST",
      fin,
      body: JSON.stringify(alarm),
    });
  },

  deleteAlarm(fin: string, id: number) {
    if (!USE_API) return mockStore.deleteAlarm(fin, id);
    return request<void>(`/api/alarms/${id}`, { method: "DELETE", fin });
  },

  staffLogin(email: string, password: string, role: StaffRole) {
    const tryMock = () => mockStore.staffLogin(email, password, role);
    if (!USE_API) return tryMock();
    return request<{ staff: StaffProfile }>("/api/staff/login", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
    }).catch(() => tryMock());
  },

  staffLoginDemo(role: StaffRole) {
    return mockStore.staffLoginDemo(role);
  },

  getPatientList(
    _staffId: number,
    params?: { search?: string; pendingOnly?: boolean },
  ) {
    if (!USE_API) return mockStore.getPatientList(params);
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    if (params?.pendingOnly) qs.set("pendingOnly", "true");
    const q = qs.toString();
    return request<{ patients: PatientListItem[]; total: number }>(
      `/api/staff/patients${q ? `?${q}` : ""}`,
      { staffId: _staffId },
    );
  },

  doctorGetPatient(_staffId: number, fin: string) {
    if (!USE_API) return mockStore.doctorGetPatient(fin);
    return request<PatientBundle>(`/api/doctor/patient/${fin}`, {
      staffId: _staffId,
    });
  },

  doctorRegisterPatient(
    _staffId: number,
    fin: string,
    data: { fullName?: string; conditionNotes?: string },
  ) {
    if (!USE_API) return mockStore.doctorRegisterPatient(fin, data);
    return request<{ patient: UserProfile }>(`/api/doctor/patient/${fin}/register`, {
      method: "POST",
      staffId: _staffId,
      body: JSON.stringify(data),
    });
  },

  doctorIssuePrescription(
    _staffId: number,
    data: {
      patientFin: string;
      medication: string;
      dosage: string;
      schedule?: string;
      durationDays?: number;
      doseTimes?: string[];
      startDate?: string;
      endDate?: string;
      doctorNotes?: string;
      hospital?: string;
    },
  ) {
    if (!USE_API) return mockStore.doctorIssuePrescription(data);
    return request<{ prescription: Prescription }>("/api/doctor/prescriptions", {
      method: "POST",
      staffId: _staffId,
      body: JSON.stringify(data),
    });
  },

  doctorAddHealthRecord(
    _staffId: number,
    data: {
      patientFin: string;
      visitDate?: string;
      chiefComplaint?: string;
      diagnosis?: string;
      notes: string;
    },
  ) {
    if (!USE_API) return mockStore.doctorAddHealthRecord();
    return request<{ id: number }>("/api/doctor/health-records", {
      method: "POST",
      staffId: _staffId,
      body: JSON.stringify(data),
    });
  },

  pharmacyGetPatient(_staffId: number, fin: string) {
    if (!USE_API) return mockStore.pharmacyGetPatient(fin);
    return request<{ patient: UserProfile; prescriptions: Prescription[] }>(
      `/api/pharmacy/patient/${fin}`,
      { staffId: _staffId },
    );
  },

  pharmacyDispense(_staffId: number, prescriptionId: number) {
    if (!USE_API) return mockStore.pharmacyDispense(prescriptionId);
    return request<{ prescription: Prescription }>(
      `/api/pharmacy/prescriptions/${prescriptionId}/dispense`,
      { method: "PATCH", staffId: _staffId },
    );
  },

  adminStats(_staffId: number) {
    if (!USE_API) return mockStore.adminStats();
    return request<AdminStats>("/api/admin/stats", { staffId: _staffId });
  },

  adminPatients(staffId: number, search?: string) {
    if (!USE_API) return mockStore.getPatientList({ search });
    const qs = new URLSearchParams();
    if (search) qs.set("search", search);
    const q = qs.toString();
    return request<{ patients: PatientListItem[]; total: number }>(
      `/api/staff/patients${q ? `?${q}` : ""}`,
      { staffId },
    );
  },

  adminStaff(_staffId: number) {
    if (!USE_API) return mockStore.adminStaff();
    return request<{ staff: (StaffProfile & { createdAt: string })[] }>(
      "/api/admin/staff",
      { staffId: _staffId },
    );
  },

  adminPrescriptions(_staffId: number) {
    if (!USE_API) return mockStore.adminPrescriptions();
    return request<{ prescriptions: Prescription[] }>("/api/admin/prescriptions", {
      staffId: _staffId,
    });
  },
};
