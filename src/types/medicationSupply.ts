export type MedicationPaymentStatus = "paid" | "unpaid";

export interface MedicationSupplyItem {
  id: string;
  fin: string;
  medication: string;
  dosage: string;
  hospital: string;
  icon: string;
  color: string;
  amountEtb: number;
  pharmacyName: string;
  status: MedicationPaymentStatus;
  paidAt?: string;
  receiptRef?: string;
  prescriptionId?: number;
  createdAt: string;
}

export interface MedicationSupplySummary {
  paid: MedicationSupplyItem[];
  unpaid: MedicationSupplyItem[];
}
