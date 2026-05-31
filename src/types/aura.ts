/** Aura Care platform models — local mock / SQLite simulation */

export type RecordSource = "digital_parse" | "manual_form";
export type RecordAnalysisState = "pending" | "verified" | "duplicate_blocked";
export type FacilityType = "pharmacy" | "hospital";
export type InventoryType = "medication" | "equipment";
export type DosageForm = "tablet" | "capsule" | "liquid" | "injection" | "patch";

export interface AuraUserProfile {
  faydaFin: string;
  fullName: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export interface VitalsMetrics {
  systolic?: number;
  diastolic?: number;
  heartRate?: number;
  glucoseMgDl?: number;
}

export interface MedicalHistoryLog {
  id: number;
  userFin: string;
  timelineAt: string;
  source: RecordSource;
  metrics: VitalsMetrics;
  condition: string;
  facilityId: string;
  analysisState: RecordAnalysisState;
  contraindicationTags: string[];
}

export interface AuraPrescriptionSchedule {
  id: number;
  userFin: string;
  medication: string;
  dosageForm: DosageForm;
  strengthMg: number;
  frequencyHours: number;
  alertTime: string;
  timezone: string;
  totalPills: number;
  remainingPills: number;
  expirationDate: string;
  status: "active" | "expired" | "depleted";
  hospital: string;
}

export interface DirectoryNode {
  facilityId: string;
  name: string;
  type: FacilityType;
  lat: number;
  lng: number;
  inventoryType: InventoryType;
  itemId: string;
  stock: number;
  priceEtb: number;
  city: string;
}

export interface HealthTrendInsight {
  label: string;
  status: "good" | "watch" | "alert";
  summary: string;
  goal?: string;
}

export interface PersonalInsights {
  trends: HealthTrendInsight[];
  wellnessGoals: string[];
  lastUpdated: string;
}

export interface PharmacyNearby {
  facilityId: string;
  name: string;
  distanceKm: number;
  etaMinutes: number;
  etaLabel: string;
  stock: number;
  priceEtb: number;
  lat: number;
  lng: number;
  city: string;
  /** Set when listing all medications on one map */
  medication?: string;
}

export interface NotificationCountdown {
  atMs: number;
  countdownSeconds: number;
  medication: string;
}

export interface EquipmentAllocationResult {
  requestedEquipment: string;
  allocatedEquipment: string;
  contraindicationFound: boolean;
  safetyNotice: string | null;
  facilities: {
    facilityId: string;
    name: string;
    distanceKm: number;
    etaMinutes: number;
    etaLabel: string;
    stock: number;
    priceEtb: number;
    lat: number;
    lng: number;
    city: string;
  }[];
}

export interface LabEquipmentRequest {
  id: string;
  fin: string;
  equipment: string;
  facilityName: string;
  city: string;
  priceEtb: number;
  status: "requested" | "booked";
  etaLabel?: string;
  createdAt: string;
}

export interface PharmacyReservation {
  id: number;
  patientFin: string;
  patientName: string;
  medication: string;
  quantity: number;
  facilityId: string;
  status: "queued" | "fulfilled";
  createdAt: string;
}

export interface AdminAuraAnalytics {
  recordsIngested: number;
  duplicatesBlocked: number;
  avgProcessingMs: number;
  regionalStockAlerts: { city: string; medication: string; totalStock: number }[];
  equipmentSafetyExceptions: number;
  medicationDemand: { medication: string; requests: number }[];
}
