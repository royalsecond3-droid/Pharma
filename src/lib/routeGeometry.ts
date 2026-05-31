export interface MapCoord {
  lat: number;
  lng: number;
}

/** Bearing in degrees (0 = north, 90 = east) for arrow rotation. */
export function bearingDegrees(from: MapCoord, to: MapCoord): number {
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/** Points along a straight route for arrow placement. */
export function routeArrowPoints(
  from: MapCoord,
  to: MapCoord,
  count = 3,
): { lat: number; lng: number; rotation: number }[] {
  const brg = bearingDegrees(from, to);
  const points: { lat: number; lng: number; rotation: number }[] = [];
  for (let i = 1; i <= count; i++) {
    const t = i / (count + 1);
    points.push({
      lat: from.lat + (to.lat - from.lat) * t,
      lng: from.lng + (to.lng - from.lng) * t,
      rotation: brg,
    });
  }
  return points;
}
