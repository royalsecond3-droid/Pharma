export type PrescriptionStatus = "active" | "completed";
export type FulfillmentStatus = "pending" | "dispensed";
export type StaffRole = "doctor" | "pharmacy" | "admin";

export interface Prescription {
  id: number;
  hospital: string;
  medication: string;
  dosage: string;
  schedule: string;
  /** Total days the doctor prescribed this medication. */
  durationDays: number;
  /** Times of day to take the dose (e.g. "08:00 AM"). */
  doseTimes: string[];
  startDate: string;
  endDate: string;
  status: PrescriptionStatus;
  fulfillmentStatus?: FulfillmentStatus;
  icon: string;
  color: string;
  doctorNotes?: string | null;
  dispensedAt?: string | null;
  patientName?: string;
  patientFin?: string;
}

export interface MedicationAlarm {
  id: number;
  time: string;
  medication: string;
  days: string[];
  sound: boolean;
  vibration: boolean;
  /** Links reminder to a doctor prescription when set. */
  prescriptionId?: number;
}

export interface UserProfile {
  id: number;
  faydaFin: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  conditionNotes?: string | null;
}

export interface PatientListItem extends UserProfile {
  prescriptionCount: number;
  pendingPrescriptions: number;
  healthRecordCount: number;
  createdAt?: string;
}

export interface StaffProfile {
  id: number;
  email: string;
  role: StaffRole;
  fullName: string;
  facilityName: string;
  licenseId: string | null;
}

export interface HealthRecord {
  id: number;
  visitDate: string;
  chiefComplaint: string | null;
  diagnosis: string | null;
  notes: string;
  doctorName: string;
  facilityName: string;
}

export interface PatientBundle {
  patient: UserProfile;
  prescriptions: Prescription[];
  healthRecords: HealthRecord[];
  alarms: { id: number; time: string; medication: string }[];
}

export interface AdminStats {
  patients: number;
  prescriptions: number;
  pendingFulfillment: number;
  dispensed: number;
  staff: number;
  healthRecords: number;
}
