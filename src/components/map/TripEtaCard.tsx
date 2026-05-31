import type { CareMapMarker } from "@/components/map/CareMap";

interface Props {
  marker: CareMapMarker;
  onStart: () => void;
  routeActive?: boolean;
}

export function TripEtaCard({ marker, onStart, routeActive }: Props) {
  if (marker.kind === "patient" || !marker.etaLabel) return null;

  return (
    <div className="flex items-center justify-between gap-3 border-t border-[#E8EEF5] pt-3 text-sm">
      <div className="min-w-0 text-[#5A7399]">
        <span className="font-medium text-[#0F1B35]">{marker.label}</span>
        <span className="mx-1">·</span>
        {marker.etaLabel}
        <span className="mx-1">·</span>
        {marker.distanceKm?.toFixed(1)} km
      </div>
      <button
        type="button"
        onClick={onStart}
        className="shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold text-white"
        style={{
          background: routeActive ? "#34A853" : "#1A73E8",
        }}
      >
        {routeActive ? "On route" : "Start"}
      </button>
    </div>
  );
}
