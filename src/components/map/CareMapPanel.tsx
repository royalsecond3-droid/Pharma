import { CareMap, type CareMapMarker } from "@/components/map/CareMap";
import { LeafletCareMap } from "@/components/map/LeafletCareMap";
import { TripEtaCard } from "@/components/map/TripEtaCard";

interface Props {
  markers: CareMapMarker[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  isPro?: boolean;
  proOnly?: boolean;
  height?: number;
  routeActive?: boolean;
  onStartRoute?: () => void;
}

/** One street map + simple Start to show direction line. */
export function CareMapPanel({
  markers,
  selectedId,
  onSelect,
  isPro = true,
  proOnly = true,
  height = 260,
  routeActive = false,
  onStartRoute,
}: Props) {
  const selected = markers.find((m) => m.id === selectedId);

  if (proOnly && !isPro) {
    return (
      <CareMap
        markers={markers}
        selectedId={selectedId}
        onSelect={onSelect}
        isPro={false}
        proOnly
        height={height}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#DADCE0] bg-white shadow-sm">
      <LeafletCareMap
        markers={markers}
        selectedId={selectedId}
        onSelect={onSelect}
        height={height}
        showRoute={routeActive}
      />
      {selected && selected.kind !== "patient" && onStartRoute && (
        <div className="px-3 pb-3">
          <TripEtaCard
            marker={selected}
            onStart={onStartRoute}
            routeActive={routeActive}
          />
        </div>
      )}
    </div>
  );
}
