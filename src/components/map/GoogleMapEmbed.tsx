import { googleMapsEmbedUrl } from "@/lib/mapUtils";
import type { CareMapMarker } from "@/components/map/CareMap";

interface Props {
  markers: CareMapMarker[];
  selectedId?: string | null;
  height?: number;
}

export function GoogleMapEmbed({ markers, selectedId, height = 280 }: Props) {
  const selected = markers.find((m) => m.id === selectedId);
  const focus = selected ?? markers.find((m) => m.kind === "patient") ?? markers[0];
  if (!focus) return null;

  const src = googleMapsEmbedUrl(focus.lat, focus.lng, selected?.kind === "patient" ? 13 : 16);

  return (
    <iframe
      title="Google Maps"
      src={src}
      width="100%"
      height={height}
      style={{ border: 0, borderRadius: 16 }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
