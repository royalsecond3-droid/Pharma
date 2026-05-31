import { useEffect, useMemo } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import type { CareMapMarker } from "@/components/map/CareMap";
import { colorForMedication } from "@/lib/medColors";
import { routeArrowPoints } from "@/lib/routeGeometry";
import { DEFAULT_PATIENT_LOCATION } from "@/lib/aura/proximity";
import "leaflet/dist/leaflet.css";
import "@/styles/leaflet-google.css";

const GOOGLE_BLUE = "#4285F4";
const GOOGLE_ROUTE = "#1A73E8";

/** Google-style blue dot — your location */
const youIcon = L.divIcon({
  className: "leaflet-google-pin",
  html: `
    <div style="position:relative;width:22px;height:22px">
      <div style="position:absolute;inset:0;border-radius:50%;background:${GOOGLE_BLUE}33;animation:ping 1.5s ease-out infinite"></div>
      <div style="position:absolute;inset:4px;border-radius:50%;background:${GOOGLE_BLUE};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35)"></div>
    </div>
    <style>@keyframes ping{0%{transform:scale(.8);opacity:1}100%{transform:scale(1.8);opacity:0}}</style>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

/** Google-style red destination pin */
const destinationPin = L.divIcon({
  className: "leaflet-google-pin",
  html: `
    <svg width="32" height="42" viewBox="0 0 32 42" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,.3))">
      <path fill="#EA4335" d="M16 0C7.2 0 0 7.2 0 16c0 12 16 26 16 26s16-14 16-26C32 7.2 24.8 0 16 0z"/>
      <circle fill="#fff" cx="16" cy="16" r="7"/>
    </svg>
  `,
  iconSize: [32, 42],
  iconAnchor: [16, 42],
});

function pharmacyDot(color: string, selected: boolean) {
  const size = selected ? 14 : 11;
  return L.divIcon({
    className: "leaflet-google-pin",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.25)"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function routeArrowIcon(rotation: number) {
  return L.divIcon({
    className: "leaflet-google-pin",
    html: `<div style="transform:rotate(${rotation}deg);color:${GOOGLE_ROUTE};font-size:16px;line-height:1;text-shadow:0 0 2px #fff,-1px 0 2px #fff,1px 0 2px #fff">▲</div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function MapViewController({
  focus,
  zoom,
  fitMarkers,
  showRoute,
}: {
  focus: { lat: number; lng: number };
  zoom: number;
  fitMarkers: CareMapMarker[];
  showRoute: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (showRoute && fitMarkers.length >= 2) {
      const bounds = L.latLngBounds(fitMarkers.map((m) => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15, animate: true });
      return;
    }
    if (!showRoute && fitMarkers.length > 2) {
      const bounds = L.latLngBounds(fitMarkers.map((m) => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: 14, animate: true });
      return;
    }
    map.setView([focus.lat, focus.lng], zoom, { animate: true });
  }, [focus.lat, focus.lng, zoom, fitMarkers, showRoute, map]);

  return null;
}

interface Props {
  markers: CareMapMarker[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  height?: number;
  showRoute?: boolean;
}

export function LeafletCareMap({
  markers,
  selectedId,
  onSelect,
  height = 280,
  showRoute = false,
}: Props) {
  const center = DEFAULT_PATIENT_LOCATION;
  const patient = markers.find((m) => m.kind === "patient") ?? {
    lat: center.lat,
    lng: center.lng,
    id: "patient",
    label: "You",
    kind: "patient" as const,
  };
  const selected = markers.find((m) => m.id === selectedId);
  const focus = selected ?? patient;

  const routeLine: [number, number][] | null =
    showRoute && selected && selected.kind !== "patient"
      ? [
          [patient.lat, patient.lng],
          [selected.lat, selected.lng],
        ]
      : null;

  const arrows = useMemo(() => {
    if (!routeLine || !selected) return [];
    return routeArrowPoints(
      { lat: patient.lat, lng: patient.lng },
      { lat: selected.lat, lng: selected.lng },
      4,
    );
  }, [routeLine, patient.lat, patient.lng, selected?.lat, selected?.lng]);

  const fitMarkers =
    showRoute && selected && selected.kind !== "patient"
      ? [patient, selected]
      : markers;

  const zoom = showRoute && selected?.kind !== "patient" ? 14 : 13;

  const iconFor = (m: CareMapMarker) => {
    if (m.kind === "patient") return youIcon;
    if (showRoute && m.id === selectedId) return destinationPin;
    if (m.kind === "hospital") return pharmacyDot("#EA4335", m.id === selectedId);
    const color = m.medication ? colorForMedication(m.medication) : GOOGLE_BLUE;
    return pharmacyDot(color, m.id === selectedId);
  };

  return (
    <div className="leaflet-google-map" style={{ height, width: "100%" }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
        zoomControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />
        <MapViewController
          focus={focus}
          zoom={zoom}
          fitMarkers={fitMarkers}
          showRoute={!!showRoute}
        />

        {routeLine && (
          <>
            <Polyline
              positions={routeLine}
              pathOptions={{
                color: "#fff",
                weight: 9,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
            <Polyline
              positions={routeLine}
              pathOptions={{
                color: GOOGLE_ROUTE,
                weight: 6,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          </>
        )}

        {arrows.map((a, i) => (
          <Marker
            key={`arrow-${i}`}
            position={[a.lat, a.lng]}
            icon={routeArrowIcon(a.rotation)}
            interactive={false}
          />
        ))}

        {markers.map((m) => (
          <Marker
            key={m.id}
            position={[m.lat, m.lng]}
            icon={iconFor(m)}
            zIndexOffset={m.id === selectedId ? 1000 : m.kind === "patient" ? 900 : 0}
            eventHandlers={{ click: () => onSelect?.(m.id) }}
          >
            <Popup className="text-sm">
              <strong>{m.label}</strong>
              {m.medication && (
                <div style={{ color: colorForMedication(m.medication), fontWeight: 600 }}>
                  {m.medication}
                </div>
              )}
              {m.etaLabel && (
                <div style={{ color: "#5f6368" }}>
                  {m.etaLabel} · {m.distanceKm?.toFixed(1)} km
                </div>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
