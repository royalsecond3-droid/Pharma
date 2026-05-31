import { osmEmbedUrl } from "@/lib/mapUtils";
import { DEFAULT_PATIENT_LOCATION } from "@/lib/aura/proximity";
import type { CareMapMarker } from "@/components/map/CareMap";

interface Props {
  markers: CareMapMarker[];
  selectedId?: string | null;
  height?: number;
}

export function OsmEmbedMap({ markers, selectedId, height = 280 }: Props) {
  const selected = markers.find((m) => m.id === selectedId);
  const focus = selected ?? markers.find((m) => m.kind === "patient");
  const center = DEFAULT_PATIENT_LOCATION;
  const src = osmEmbedUrl(
    center,
    focus ? { lat: focus.lat, lng: focus.lng } : center,
  );

  return (
    <iframe
      title="OpenStreetMap"
      src={src}
      width="100%"
      height={height}
      style={{ border: 0, borderRadius: 16 }}
      loading="lazy"
    />
  );
}
