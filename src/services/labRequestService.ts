import { SARAH_JOHNSON_FIN } from "@/services/subscriptionService";
import type { LabEquipmentRequest } from "@/types/aura";

const LAB_REQUESTS_KEY = "aura_lab_requests";

function loadAll(): LabEquipmentRequest[] {
  try {
    const raw = localStorage.getItem(LAB_REQUESTS_KEY);
    if (raw) return JSON.parse(raw) as LabEquipmentRequest[];
  } catch {
    /* ignore */
  }
  return [];
}

function saveAll(items: LabEquipmentRequest[]) {
  localStorage.setItem(LAB_REQUESTS_KEY, JSON.stringify(items));
}

function seedForPatient(fin: string): LabEquipmentRequest[] {
  if (fin === SARAH_JOHNSON_FIN) {
    return [
      {
        id: `${fin}-lab-mri`,
        fin,
        equipment: "MRI",
        facilityName: "St. Mary's Medical Center",
        city: "Addis Ababa",
        priceEtb: 8500,
        status: "requested",
        etaLabel: "~25 min drive",
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: `${fin}-lab-us`,
        fin,
        equipment: "Ultrasound",
        facilityName: "Black Lion Specialized Hospital",
        city: "Addis Ababa",
        priceEtb: 1200,
        status: "booked",
        etaLabel: "~18 min drive",
        createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      },
    ];
  }

  return [
    {
      id: `${fin}-lab-mri`,
      fin,
      equipment: "MRI",
      facilityName: "St. Mary's Medical Center",
      city: "Addis Ababa",
      priceEtb: 8500,
      status: "requested",
      etaLabel: "~25 min drive",
      createdAt: new Date().toISOString(),
    },
  ];
}

function ensureSeeded(fin: string): LabEquipmentRequest[] {
  const all = loadAll();
  let mine = all.filter((r) => r.fin === fin);
  if (mine.length > 0) return mine.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const seeded = seedForPatient(fin);
  if (seeded.length) {
    saveAll([...all, ...seeded]);
    mine = seeded;
  }
  return mine;
}

export const labRequestService = {
  list(fin: string): LabEquipmentRequest[] {
    return ensureSeeded(fin);
  },

  create(
    fin: string,
    data: {
      equipment: string;
      facilityName: string;
      city: string;
      priceEtb: number;
      etaLabel?: string;
    },
  ): LabEquipmentRequest {
    const all = loadAll();
    const item: LabEquipmentRequest = {
      id: `${fin}-lab-${Date.now()}`,
      fin,
      equipment: data.equipment,
      facilityName: data.facilityName,
      city: data.city,
      priceEtb: data.priceEtb,
      status: "requested",
      etaLabel: data.etaLabel,
      createdAt: new Date().toISOString(),
    };
    all.unshift(item);
    saveAll(all);
    return item;
  },
};
