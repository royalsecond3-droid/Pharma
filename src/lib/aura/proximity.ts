import { AURA_DIRECTORY } from "@/data/auraDirectory";
import { estimateTravel } from "@/lib/travelEta";
import type { PharmacyNearby } from "@/types/aura";

const EARTH_RADIUS_KM = 6371;

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Default patient location — Addis Ababa center */
export const DEFAULT_PATIENT_LOCATION = { lat: 9.03, lng: 38.74 };

export function findNearbyPharmacies(
  medication: string,
  lat: number,
  lng: number,
  radiusKm = 15,
): PharmacyNearby[] {
  return AURA_DIRECTORY.filter(
    (n) =>
      n.type === "pharmacy" &&
      n.inventoryType === "medication" &&
      n.itemId.toLowerCase() === medication.toLowerCase() &&
      n.stock > 0,
  )
    .map((n) => {
      const straightKm = haversineKm(lat, lng, n.lat, n.lng);
      const travel = estimateTravel(straightKm);
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
    .filter((p) => p.distanceKm <= radiusKm * 1.35)
    .sort((a, b) => a.etaMinutes - b.etaMinutes || a.priceEtb - b.priceEtb);
}

/** All pharmacy dots for every medication in one map view */
export function findAllNearbyPharmacies(
  medications: string[],
  lat: number,
  lng: number,
  radiusKm = 15,
): PharmacyNearby[] {
  const seen = new Set<string>();
  const all: PharmacyNearby[] = [];

  for (const med of medications) {
    for (const p of findNearbyPharmacies(med, lat, lng, radiusKm)) {
      const key = `${p.facilityId}::${med}`;
      if (seen.has(key)) continue;
      seen.add(key);
      all.push({ ...p, medication: med });
    }
  }

  return all.sort((a, b) => a.etaMinutes - b.etaMinutes || a.priceEtb - b.priceEtb);
}

export function markerIdForPharmacy(p: PharmacyNearby): string {
  return p.medication ? `${p.facilityId}::${p.medication}` : p.facilityId;
}

export function facilityIdFromMarkerId(markerId: string): string {
  return markerId.includes("::") ? markerId.split("::")[0]! : markerId;
}
