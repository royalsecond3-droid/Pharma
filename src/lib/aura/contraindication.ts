import {
  AURA_DIRECTORY,
  EQUIPMENT_ALTERNATIVES,
  EQUIPMENT_CONTRAINDICATIONS,
} from "@/data/auraDirectory";
import type { EquipmentAllocationResult } from "@/types/aura";
import { haversineKm } from "@/lib/aura/proximity";
import { estimateTravel } from "@/lib/travelEta";

function patientHasConflict(
  equipmentId: string,
  patientTags: string[],
): boolean {
  const vulnerabilities = EQUIPMENT_CONTRAINDICATIONS[equipmentId] ?? [];
  const normalized = patientTags.map((t) => t.toLowerCase());
  return vulnerabilities.some((v) => normalized.some((t) => t.includes(v)));
}

export function allocateEquipment(
  equipmentId: string,
  patientTags: string[],
  patientLat: number,
  patientLng: number,
  radiusKm = 50,
): EquipmentAllocationResult {
  const conflict = patientHasConflict(equipmentId, patientTags);
  const allocatedEquipment = conflict
    ? (EQUIPMENT_ALTERNATIVES[equipmentId] ?? "Ultrasound")
    : equipmentId;

  const facilities = AURA_DIRECTORY.filter(
    (n) =>
      n.inventoryType === "equipment" &&
      n.itemId === allocatedEquipment &&
      n.stock > 0,
  )
    .map((n) => {
      const travel = estimateTravel(haversineKm(patientLat, patientLng, n.lat, n.lng));
      return {
        facilityId: n.facilityId,
        name: n.name,
        distanceKm: travel.distanceKm,
        etaMinutes: travel.etaMinutes,
        etaLabel: travel.etaLabel,
        stock: n.stock,
        priceEtb: n.priceEtb,
        lat: n.lat,
        lng: n.lng,
        city: n.city,
      };
    })
    .filter((f) => f.distanceKm <= radiusKm)
    .sort((a, b) => a.etaMinutes - b.etaMinutes || a.priceEtb - b.priceEtb);

  return {
    requestedEquipment: equipmentId,
    allocatedEquipment,
    contraindicationFound: conflict,
    safetyNotice: conflict
      ? `Safety substitution: ${equipmentId} is not recommended. Showing ${allocatedEquipment} facilities instead.`
      : null,
    facilities,
  };
}
