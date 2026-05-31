import { haversineKm } from "@/lib/aura/proximity";
import type { MapPoint } from "@/lib/mapUtils";

/** Uber-style drive ETA from straight-line distance + Addis urban traffic factor. */
export function estimateTravel(distanceKm: number): {
  distanceKm: number;
  etaMinutes: number;
  etaLabel: string;
} {
  const roadFactor = 1.35;
  const adjustedKm = distanceKm * roadFactor;
  const avgSpeedKmh = 22;
  const etaMinutes = Math.max(2, Math.round((adjustedKm / avgSpeedKmh) * 60));
  const etaLabel =
    etaMinutes >= 60
      ? `${Math.floor(etaMinutes / 60)} hr ${etaMinutes % 60} min`
      : `${etaMinutes} min`;

  return {
    distanceKm: Math.round(adjustedKm * 10) / 10,
    etaMinutes,
    etaLabel,
  };
}

export function travelFromOrigin(
  origin: MapPoint,
  dest: MapPoint,
): ReturnType<typeof estimateTravel> {
  return estimateTravel(haversineKm(origin.lat, origin.lng, dest.lat, dest.lng));
}
