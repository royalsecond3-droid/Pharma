export interface MapPoint {
  lat: number;
  lng: number;
}

/** Project lat/lng to % position on a local map viewport (Addis-scale). */
export function latLngToPercent(
  point: MapPoint,
  center: MapPoint,
  spanLng = 0.06,
  spanLat = 0.05,
): { left: number; top: number } {
  const left = 50 + ((point.lng - center.lng) / spanLng) * 45;
  const top = 50 - ((point.lat - center.lat) / spanLat) * 45;
  return {
    left: Math.min(92, Math.max(8, left)),
    top: Math.min(88, Math.max(12, top)),
  };
}

export function buildOsmStaticMapUrl(
  center: MapPoint,
  markers: { lat: number; lng: number; color: string }[],
  width = 640,
  height = 280,
): string {
  const markerParam = markers
    .map((m) => `${m.lat},${m.lng},${m.color}`)
    .join("|");
  const base = "https://staticmap.openstreetmap.de/staticmap.php";
  const params = new URLSearchParams({
    center: `${center.lat},${center.lng}`,
    zoom: "13",
    size: `${width}x${height}`,
    maptype: "mapnik",
  });
  if (markerParam) params.set("markers", markerParam);
  return `${base}?${params.toString()}`;
}

export function openDirections(lat: number, lng: number, label: string) {
  const q = encodeURIComponent(`${lat},${lng} (${label})`);
  window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank", "noopener");
}

/** Google Maps embed (no API key — centers on coordinates). */
export function googleMapsEmbedUrl(lat: number, lng: number, zoom = 15): string {
  return `https://www.google.com/maps?q=${lat},${lng}&hl=en&z=${zoom}&output=embed`;
}

/** OpenStreetMap embed iframe — real tiles, no API key. */
export function osmEmbedUrl(
  center: MapPoint,
  marker?: MapPoint,
  span = 0.04,
): string {
  const minLng = center.lng - span;
  const maxLng = center.lng + span;
  const minLat = center.lat - span * 0.7;
  const maxLat = center.lat + span * 0.7;
  const bbox = `${minLng},${minLat},${maxLng},${maxLat}`;
  const m = marker ?? center;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${m.lat},${m.lng}`;
}

/** Full Google Maps in new tab with search query. */
export function openGoogleMapsSearch(query: string) {
  window.open(
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
    "_blank",
    "noopener",
  );
}

export function openGoogleMapsAll(
  patient: MapPoint,
  places: { lat: number; lng: number; label: string }[],
) {
  if (places.length === 0) {
    openDirections(patient.lat, patient.lng, "My location");
    return;
  }
  const dest = places[0];
  const waypoints = places
    .slice(1, 4)
    .map((p) => `${p.lat},${p.lng}`)
    .join("|");
  const base = `https://www.google.com/maps/dir/?api=1&origin=${patient.lat},${patient.lng}&destination=${dest.lat},${dest.lng}&travelmode=driving`;
  const url = waypoints ? `${base}&waypoints=${waypoints}` : base;
  window.open(url, "_blank", "noopener");
}
