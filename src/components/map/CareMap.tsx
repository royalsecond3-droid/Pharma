import { useMemo } from "react";
import { MapPin } from "lucide-react";
import { DEFAULT_PATIENT_LOCATION } from "@/lib/aura/proximity";
import { latLngToPercent } from "@/lib/mapUtils";

export interface CareMapMarker {
  id: string;
  lat: number;
  lng: number;
  label: string;
  sublabel?: string;
  kind: "patient" | "pharmacy" | "hospital";
  distanceKm?: number;
  etaMinutes?: number;
  etaLabel?: string;
  medication?: string;
}

interface Props {
  markers: CareMapMarker[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  proOnly?: boolean;
  isPro?: boolean;
  height?: number;
  /** When false, parent renders TripEtaCard (e.g. CareMapPanel). */
  showTripCard?: boolean;
}

/** Self-contained map — no external tile API (avoids broken staticmap hosts). */
export function CareMap({
  markers,
  selectedId,
  onSelect,
  proOnly = true,
  isPro = true,
  height = 240,
  showTripCard = true,
}: Props) {
  const center = DEFAULT_PATIENT_LOCATION;
  const facilities = markers.filter((m) => m.kind !== "patient");
  const patient = markers.find((m) => m.kind === "patient") ?? {
    id: "patient",
    lat: center.lat,
    lng: center.lng,
    label: "You",
    kind: "patient" as const,
  };

  const positioned = useMemo(
    () =>
      [patient, ...facilities].map((m) => ({
        ...m,
        pos: latLngToPercent({ lat: m.lat, lng: m.lng }, center),
      })),
    [patient, facilities, center.lat, center.lng],
  );

  const selectedMarker = markers.find((m) => m.id === selectedId);

  if (proOnly && !isPro) {
    return (
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{ height, background: "#E8EEF5" }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0F1B35]/10 backdrop-blur-sm">
          <MapPin size={28} color="#5A7399" />
          <p className="mt-2 px-6 text-center text-xs font-semibold text-[#5A7399]">
            PRO map — upgrade to see live facility locations
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[rgba(29,111,232,0.15)] shadow-sm">
      <div className="relative overflow-hidden" style={{ height }}>
        {/* Map canvas */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 400 240"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden
        >
          <defs>
            <linearGradient id="mapSky" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E8F4FC" />
              <stop offset="100%" stopColor="#D4E8F7" />
            </linearGradient>
            <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="rgba(29,111,232,0.08)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="400" height="240" fill="url(#mapSky)" />
          <rect width="400" height="240" fill="url(#mapGrid)" />
          {/* Green areas / parks */}
          <ellipse cx="80" cy="180" rx="55" ry="35" fill="rgba(16,185,129,0.12)" />
          <ellipse cx="320" cy="60" rx="70" ry="40" fill="rgba(16,185,129,0.1)" />
          {/* Main roads */}
          <path
            d="M 0 120 Q 100 100 200 115 T 400 105"
            fill="none"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M 0 120 Q 100 100 200 115 T 400 105"
            fill="none"
            stroke="#C5D9E8"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 180 0 L 195 240"
            fill="none"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M 180 0 L 195 240"
            fill="none"
            stroke="#C5D9E8"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* River */}
          <path
            d="M 30 200 Q 120 170 220 190 Q 300 210 380 175"
            fill="none"
            stroke="rgba(29,111,232,0.25)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Lines from you to selected facility */}
          {selectedId &&
            selectedId !== "patient" &&
            positioned.find((m) => m.id === selectedId) && (
            <line
              x1={(latLngToPercent(patient, center).left / 100) * 400}
              y1={(latLngToPercent(patient, center).top / 100) * 240}
              x2={((positioned.find((m) => m.id === selectedId)?.pos.left ?? 50) / 100) * 400}
              y2={((positioned.find((m) => m.id === selectedId)?.pos.top ?? 50) / 100) * 240}
              stroke="#1D6FE8"
              strokeWidth="2"
              strokeDasharray="6 4"
              opacity="0.7"
            />
          )}
        </svg>

        {/* Area labels */}
        <div
          className="pointer-events-none absolute left-[8%] top-[12%] text-[10px] font-bold text-[#5A7399]/70"
        >
          Bole
        </div>
        <div
          className="pointer-events-none absolute right-[10%] top-[28%] text-[10px] font-bold text-[#5A7399]/70"
        >
          Kazanchis
        </div>
        <div
          className="pointer-events-none absolute bottom-[18%] left-[22%] text-[10px] font-bold text-[#5A7399]/70"
        >
          Piassa
        </div>
        <div
          className="pointer-events-none absolute bottom-[8%] right-[12%] text-[10px] font-bold text-[#5A7399]/70"
        >
          CMC
        </div>

        {/* Pins */}
        {positioned.map((m) => {
          const isYou = m.kind === "patient";
          const isSelected = selectedId === m.id;
          return (
            <button
              key={m.id}
              type="button"
              title={m.label}
              onClick={() => onSelect?.(m.id)}
              className="absolute z-10 flex -translate-x-1/2 -translate-y-full flex-col items-center border-none bg-transparent p-0 transition-transform"
              style={{
                left: `${m.pos.left}%`,
                top: `${m.pos.top}%`,
                transform: isSelected
                  ? "translate(-50%, -100%) scale(1.15)"
                  : "translate(-50%, -100%)",
              }}
            >
              {!isYou && m.etaLabel && (
                <span
                  className="mb-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white shadow"
                  style={{
                    background: isSelected ? "#0F1B35" : "rgba(15,27,53,0.75)",
                  }}
                >
                  {m.etaLabel}
                </span>
              )}
              <span
                className="flex items-center justify-center rounded-full border-2 border-white shadow-lg"
                style={{
                  width: isYou ? 36 : 30,
                  height: isYou ? 36 : 30,
                  background: isYou
                    ? "#1D6FE8"
                    : m.kind === "hospital"
                      ? "#E53E3E"
                      : "#0FB8C3",
                  boxShadow: isSelected
                    ? "0 0 0 4px rgba(29,111,232,0.45), 0 4px 12px rgba(0,0,0,0.2)"
                    : "0 4px 10px rgba(0,0,0,0.15)",
                }}
              >
                <MapPin size={isYou ? 18 : 14} color="#fff" fill="#fff" />
              </span>
              {(isSelected || isYou) && (
                <span
                  className="mt-1 max-w-[110px] truncate rounded-md px-2 py-0.5 text-[9px] font-bold text-white shadow"
                  style={{ background: "rgba(15,27,53,0.88)" }}
                >
                  {isYou ? "You" : m.label}
                </span>
              )}
            </button>
          );
        })}

        {/* Legend + OpenStreetMap attribution link */}
        <div
          className="absolute bottom-2 left-2 right-2 flex flex-wrap items-center justify-between gap-2 rounded-lg px-2 py-1.5"
          style={{ background: "rgba(15,27,53,0.8)" }}
        >
          <div className="flex flex-wrap gap-2 text-[9px] font-semibold text-white">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#1D6FE8]" /> You
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#0FB8C3]" /> Pharmacy
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#E53E3E]" /> Hospital
            </span>
          </div>
          <span className="text-[8px] text-white/60">Addis Ababa · Aura Care</span>
        </div>
      </div>

      {facilities.length === 0 && (
        <p className="border-t border-[rgba(29,111,232,0.08)] bg-[#FFFBEB] px-3 py-2 text-center text-xs text-[#92400E]">
          Select a medication to load nearby pharmacies on the map
        </p>
      )}

      {showTripCard && selectedMarker && selectedId !== "patient" && selectedMarker.etaLabel && (
        <div className="border-t border-[#E8EEF5] px-3 py-2 text-xs text-[#5A7399]">
          {selectedMarker.label} · {selectedMarker.etaLabel} · {selectedMarker.distanceKm?.toFixed(1)} km
        </div>
      )}
    </div>
  );
}
