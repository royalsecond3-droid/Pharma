import { mockStore } from "@/data/mockStore";
import { AURA_DIRECTORY } from "@/data/auraDirectory";
import { SARAH_JOHNSON_FIN } from "@/services/subscriptionService";
import type { Prescription } from "@/types";
import type {
  MedicationSupplyItem,
  MedicationSupplySummary,
} from "@/types/medicationSupply";

const SUPPLY_KEY = "aura_medication_supply";

function loadAll(): MedicationSupplyItem[] {
  try {
    const raw = localStorage.getItem(SUPPLY_KEY);
    if (raw) return JSON.parse(raw) as MedicationSupplyItem[];
  } catch {
    /* ignore */
  }
  return [];
}

function saveAll(items: MedicationSupplyItem[]) {
  localStorage.setItem(SUPPLY_KEY, JSON.stringify(items));
}

function pharmacyPrice(medication: string): number {
  const node = AURA_DIRECTORY.find(
    (n) => n.type === "pharmacy" && n.inventoryType === "medication" && n.itemId === medication,
  );
  return node?.priceEtb ?? 750;
}

function defaultPharmacy(medication: string): string {
  const node = AURA_DIRECTORY.find(
    (n) => n.type === "pharmacy" && n.inventoryType === "medication" && n.itemId === medication,
  );
  return node?.name ?? "Nearby pharmacy";
}

function itemFromRx(
  fin: string,
  rx: Prescription,
  status: "paid" | "unpaid",
  extra?: Partial<MedicationSupplyItem>,
): MedicationSupplyItem {
  return {
    id: `${fin}-${rx.id}-${status}`,
    fin,
    medication: rx.medication,
    dosage: rx.dosage,
    hospital: rx.hospital,
    icon: rx.icon,
    color: rx.color,
    amountEtb: pharmacyPrice(rx.medication),
    pharmacyName: defaultPharmacy(rx.medication),
    status,
    prescriptionId: rx.id,
    createdAt: new Date().toISOString(),
    ...extra,
  };
}

function seedForPatient(fin: string, prescriptions: Prescription[]): MedicationSupplyItem[] {
  const active = prescriptions.filter((p) => p.status === "active");
  if (active.length === 0) return [];

  const seeds: MedicationSupplyItem[] = [];

  if (fin === SARAH_JOHNSON_FIN) {
    const donepezil = active.find((p) => p.medication === "Donepezil");
    const memantine = active.find((p) => p.medication === "Memantine");
    const vitamin = active.find((p) => p.medication === "Vitamin D3");

    if (donepezil) {
      seeds.push(
        itemFromRx(fin, donepezil, "unpaid", {
          id: `${fin}-supply-donepezil`,
          pharmacyName: "CityCare Pharmacy — Bole",
          amountEtb: 890,
        }),
      );
    }
    if (memantine) {
      seeds.push(
        itemFromRx(fin, memantine, "paid", {
          id: `${fin}-supply-memantine`,
          pharmacyName: "HealthFirst Pharmacy — CMC",
          amountEtb: 1150,
          paidAt: new Date(Date.now() - 5 * 86400000).toISOString(),
          receiptRef: "AURA-RX-MEM-2025",
        }),
      );
    }
    if (vitamin) {
      seeds.push(
        itemFromRx(fin, vitamin, "unpaid", {
          id: `${fin}-supply-vitd`,
          pharmacyName: "MedPlus Pharmacy — Piassa",
          amountEtb: 320,
        }),
      );
    }
    return seeds;
  }

  active.forEach((rx, i) => {
    const paid = i % 2 === 1;
    seeds.push(
      itemFromRx(fin, rx, paid ? "paid" : "unpaid", {
        id: `${fin}-supply-${rx.id}`,
        ...(paid
          ? {
              paidAt: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
              receiptRef: `AURA-RX-${rx.id}`,
            }
          : {}),
      }),
    );
  });

  return seeds;
}

function ensureSeeded(fin: string): MedicationSupplyItem[] {
  const all = loadAll();
  let mine = all.filter((i) => i.fin === fin);
  if (mine.length > 0) return mine;

  const prescriptions = mockStore.listPrescriptionsSync(fin);
  const seeded = seedForPatient(fin, prescriptions);
  if (seeded.length) {
    saveAll([...all, ...seeded]);
    mine = seeded;
  }
  return mine;
}

export const medicationSupplyService = {
  getSummary(fin: string): MedicationSupplySummary {
    const mine = ensureSeeded(fin);
    return {
      paid: mine.filter((i) => i.status === "paid"),
      unpaid: mine.filter((i) => i.status === "unpaid"),
    };
  },

  markPaid(
    fin: string,
    data: {
      medication: string;
      amountEtb: number;
      pharmacyName?: string;
      receiptRef: string;
    },
  ): MedicationSupplyItem {
    const all = loadAll();
    const medKey = data.medication.toLowerCase();
    const idx = all.findIndex(
      (i) =>
        i.fin === fin &&
        i.status === "unpaid" &&
        i.medication.toLowerCase() === medKey,
    );

    const paidAt = new Date().toISOString();
    if (idx >= 0) {
      const updated: MedicationSupplyItem = {
        ...all[idx],
        status: "paid",
        amountEtb: data.amountEtb,
        pharmacyName: data.pharmacyName ?? all[idx].pharmacyName,
        paidAt,
        receiptRef: data.receiptRef,
      };
      all[idx] = updated;
      saveAll(all);
      return updated;
    }

    const rx = mockStore
      .listPrescriptionsSync(fin)
      .find((p) => p.medication.toLowerCase() === medKey);
    const created: MedicationSupplyItem = {
      id: `${fin}-supply-paid-${Date.now()}`,
      fin,
      medication: data.medication,
      dosage: rx?.dosage ?? "—",
      hospital: rx?.hospital ?? "—",
      icon: rx?.icon ?? "💊",
      color: rx?.color ?? "#1D6FE8",
      amountEtb: data.amountEtb,
      pharmacyName: data.pharmacyName ?? defaultPharmacy(data.medication),
      status: "paid",
      paidAt,
      receiptRef: data.receiptRef,
      prescriptionId: rx?.id,
      createdAt: paidAt,
    };
    all.push(created);
    saveAll(all);
    return created;
  },

  addUnpaid(
    fin: string,
    data: {
      medication: string;
      amountEtb: number;
      pharmacyName: string;
    },
  ): MedicationSupplyItem {
    const all = loadAll();
    const medKey = data.medication.toLowerCase();
    const existing = all.find(
      (i) => i.fin === fin && i.medication.toLowerCase() === medKey && i.status === "unpaid",
    );
    if (existing) return existing;

    const rx = mockStore
      .listPrescriptionsSync(fin)
      .find((p) => p.medication.toLowerCase() === medKey);
    const item: MedicationSupplyItem = {
      id: `${fin}-supply-unpaid-${Date.now()}`,
      fin,
      medication: data.medication,
      dosage: rx?.dosage ?? "—",
      hospital: rx?.hospital ?? "—",
      icon: rx?.icon ?? "💊",
      color: rx?.color ?? "#1D6FE8",
      amountEtb: data.amountEtb,
      pharmacyName: data.pharmacyName,
      status: "unpaid",
      prescriptionId: rx?.id,
      createdAt: new Date().toISOString(),
    };
    all.push(item);
    saveAll(all);
    return item;
  },
};
