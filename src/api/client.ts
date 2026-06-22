import { mockStore } from "@/data/mockStore";
import { auraService } from "@/services/auraService";
import { medicationSupplyService } from "@/services/medicationSupplyService";
import { subscriptionService } from "@/services/subscriptionService";
import type {
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
import { labRequestService } from "@/services/labRequestService";
import type {
  EquipmentAllocationResult,
  LabEquipmentRequest,
  PharmacyReservation,
  RecordSource,
  VitalsMetrics,
} from "@/types/aura";
import type { CheckoutPayload, PaymentMethodType } from "@/types/subscription";

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

  staffLogin(email: string, password: string, role: LegacyStaffRole) {
    const tryMock = () => mockStore.staffLogin(email, password, role);
    if (!USE_API) return tryMock();
    return request<{ staff: LegacyStaffProfile }>("/api/staff/login", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
    }).catch(() => tryMock());
  },

  staffLoginDemo(role: LegacyStaffRole) {
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
    return request<LegacyAdminStats>("/api/admin/stats", { staffId: _staffId });
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
    return request<{ staff: (LegacyStaffProfile & { createdAt: string })[] }>(
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

  // ─── Aura Care business logic ─────────────────────────────────────────────

  getPersonalInsights(fin: string) {
    return Promise.resolve({ insights: auraService.getPersonalInsights(fin) });
  },

  getMedicalLogs(fin: string) {
    return Promise.resolve({ logs: auraService.getMedicalLogs(fin) });
  },

  addMedicalLog(
    fin: string,
    data: {
      source: RecordSource;
      metrics: VitalsMetrics;
      condition: string;
      facilityId: string;
      contraindicationTags?: string[];
      timelineAt?: string;
    },
  ) {
    return Promise.resolve(auraService.addMedicalLog(fin, data));
  },

  getNearbyPharmacies(medication: string, lat?: number, lng?: number) {
    return Promise.resolve({
      pharmacies: auraService.getNearbyPharmacies(medication, lat, lng),
    });
  },

  getAllNearbyPharmacies(medications: string[], lat?: number, lng?: number) {
    return Promise.resolve({
      pharmacies: auraService.getAllNearbyPharmacies(medications, lat, lng),
    });
  },

  getAlertPipeline(fin: string) {
    return mockStore.getPrescriptions(fin).then(({ prescriptions }) => ({
      pipeline: auraService.getAlertPipeline(fin, prescriptions),
    }));
  },

  confirmPillDose(fin: string, prescriptionId: number) {
    return Promise.resolve(auraService.confirmPillDose(fin, prescriptionId));
  },

  searchEquipment(fin: string, equipmentId: string, lat?: number, lng?: number) {
    return Promise.resolve({
      result: auraService.searchEquipment(fin, equipmentId, lat, lng),
    } satisfies { result: EquipmentAllocationResult });
  },

  getLabEquipmentRequests(fin: string) {
    return Promise.resolve({
      requests: labRequestService.list(fin),
    } satisfies { requests: LabEquipmentRequest[] });
  },

  createLabEquipmentRequest(
    fin: string,
    data: {
      equipment: string;
      facilityName: string;
      city: string;
      priceEtb: number;
      etaLabel?: string;
    },
  ) {
    return Promise.resolve({
      request: labRequestService.create(fin, data),
    });
  },

  reserveMedication(data: {
    patientFin: string;
    patientName: string;
    medication: string;
    quantity: number;
    facilityId: string;
  }) {
    return Promise.resolve({ reservation: auraService.createPharmacyReservation(data) });
  },

  getPharmacyReservations() {
    return Promise.resolve({
      reservations: auraService.getPharmacyReservations(),
    } satisfies { reservations: PharmacyReservation[] });
  },

  getAdminAuraAnalytics() {
    return Promise.resolve({ analytics: auraService.getAdminAnalytics() });
  },

  doctorGetMedicalLogs(_staffId: number, fin: string) {
    return Promise.resolve({ logs: auraService.getMedicalLogs(fin) });
  },

  // ─── Subscription & payments ─────────────────────────────────────────────────

  getSubscriptionPlans() {
    return Promise.resolve({ plans: subscriptionService.getPlans() });
  },

  getSubscription(fin: string) {
    return Promise.resolve({ subscription: subscriptionService.getSubscription(fin) });
  },

  getFamilyMembers(fin: string) {
    return Promise.resolve({ members: subscriptionService.getFamilyMembers(fin) });
  },

  getPaymentHistory(fin: string) {
    return Promise.resolve({ transactions: subscriptionService.getTransactions(fin) });
  },

  checkoutSubscription(fin: string, payload: CheckoutPayload) {
    return subscriptionService.processCheckout(fin, payload);
  },

  startSubscriptionTrial(fin: string, planId: import("@/types/subscription").SubscriptionPlanId) {
    return Promise.resolve({ subscription: subscriptionService.startTrial(fin, planId) });
  },

  cancelSubscription(fin: string) {
    return Promise.resolve({ subscription: subscriptionService.cancelSubscription(fin) });
  },

  getMedicationSupply(fin: string) {
    return Promise.resolve({ supply: medicationSupplyService.getSummary(fin) });
  },

  addUnpaidMedication(
    fin: string,
    data: { medication: string; amountEtb: number; pharmacyName: string },
  ) {
    return Promise.resolve({
      item: medicationSupplyService.addUnpaid(fin, data),
    });
  },

  payPharmacyOrder(
    fin: string,
    data: {
      amountEtb: number;
      medication: string;
      method: PaymentMethodType;
      pharmacyName?: string;
    },
  ) {
    const tx = subscriptionService.payReservation(fin, data);
    medicationSupplyService.markPaid(fin, {
      medication: data.medication,
      amountEtb: data.amountEtb,
      pharmacyName: data.pharmacyName,
      receiptRef: tx.receiptRef,
    });
    return Promise.resolve({ transaction: tx });
  },

  getAdminSubscriptionRevenue() {
    return Promise.resolve({ revenue: subscriptionService.getAdminRevenue() });
  },
};
