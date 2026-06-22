import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import type { RouteStop, TruckLocation } from "@/types/truckngo";
import "leaflet/dist/leaflet.css";
import "@/styles/leaflet-google.css";

const ROUTE_GREEN = "#1B5E20";

const truckIcon = L.divIcon({
  className: "truckngo-truck-pin",
  html: `
    <div style="width:44px;height:44px;display:flex;align-items:center;justify-content:center">
      <div style="width:38px;height:38px;border-radius:50%;background:#1B5E20;border:3px solid #fff;box-shadow:0 4px 14px rgba(27,94,32,.45);display:flex;align-items:center;justify-content:center;font-size:20px">🚛</div>
    </div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
});

function stopIcon(completed: boolean) {
  const color = completed ? "#94A3B8" : "#22C55E";
  return L.divIcon({
    className: "truckngo-stop-pin",
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.25)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

const homeIcon = L.divIcon({
  className: "truckngo-home-pin",
  html: `
    <svg width="28" height="36" viewBox="0 0 28 36" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,.3))">
      <path fill="#1B5E20" d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.3 21.7 0 14 0z"/>
      <circle fill="#fff" cx="14" cy="14" r="6"/>
    </svg>
  `,
  iconSize: [28, 36],
  iconAnchor: [14, 36],
});

function MapReady({ onReady }: { onReady: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    onReady(map);
  }, [map, onReady]);
  return null;
}

function FitRouteBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length < 2) return;
    const fit = () => {
      map.invalidateSize();
      map.fitBounds(L.latLngBounds(points), { padding: [64, 64], maxZoom: 16 });
    };
    fit();
    const t1 = window.setTimeout(fit, 150);
    const t2 = window.setTimeout(fit, 600);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [map, points]);
  return null;
}

function RecenterControl({ truck }: { truck: TruckLocation }) {
  const map = useMap();
  useEffect(() => {
    const control = new L.Control({ position: "bottomright" });
    control.onAdd = () => {
      const wrap = L.DomUtil.create("div", "leaflet-bar leaflet-control");
      wrap.style.marginBottom = "210px";
      const btn = L.DomUtil.create("a", "", wrap) as HTMLAnchorElement;
      btn.href = "#";
      btn.title = "Center on truck";
      btn.innerHTML = "◎";
      btn.style.width = "36px";
      btn.style.height = "36px";
      btn.style.lineHeight = "36px";
      btn.style.textAlign = "center";
      btn.style.fontSize = "18px";
      btn.style.color = "#1B5E20";
      L.DomEvent.disableClickPropagation(btn);
      L.DomEvent.on(btn, "click", (e) => {
        L.DomEvent.preventDefault(e);
        map.setView([truck.lat, truck.lng], 16, { animate: true });
      });
      return wrap;
    };
    control.addTo(map);
    return () => {
      control.remove();
    };
  }, [map, truck.lat, truck.lng]);
  return null;
}

interface TruckTrackingMapProps {
  truck: TruckLocation;
  stops: RouteStop[];
  homeStopId?: string;
  height?: number;
  onMapReady?: (map: L.Map) => void;
}

export function TruckTrackingMap({
  truck,
  stops,
  homeStopId,
  height = 520,
  onMapReady,
}: TruckTrackingMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const routeLine = useMemo(
    () => stops.map((s) => [s.lat, s.lng] as [number, number]),
    [stops],
  );

  const truckLine = useMemo(() => {
    const completed = stops.filter((s) => s.completed);
    const last = completed[completed.length - 1];
    if (!last) return [[truck.lat, truck.lng] as [number, number]];
    return [
      [last.lat, last.lng],
      [truck.lat, truck.lng],
    ] as [number, number][];
  }, [stops, truck.lat, truck.lng]);

  const allPoints = useMemo(
    () => [...routeLine, [truck.lat, truck.lng] as [number, number]],
    [routeLine, truck.lat, truck.lng],
  );

  if (!mounted) {
    return (
      <div
        className="flex w-full items-center justify-center bg-[#E8F0E8] text-sm text-muted-foreground"
        style={{ height }}
      >
        Loading map...
      </div>
    );
  }

  return (
    <div className="leaflet-google-map w-full" style={{ height }}>
      <MapContainer
        center={[truck.lat, truck.lng]}
        zoom={15}
        style={{ height: "100%", width: "100%", minHeight: height }}
        scrollWheelZoom
        zoomControl
        className="z-0 h-full w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />

        {onMapReady && <MapReady onReady={onMapReady} />}

        <FitRouteBounds points={allPoints} />
        <RecenterControl truck={truck} />

        {routeLine.length > 1 && (
          <>
            <Polyline
              positions={routeLine}
              pathOptions={{ color: "#fff", weight: 10, lineCap: "round", lineJoin: "round" }}
            />
            <Polyline
              positions={routeLine}
              pathOptions={{ color: ROUTE_GREEN, weight: 6, lineCap: "round", lineJoin: "round" }}
            />
          </>
        )}

        {truckLine.length > 1 && (
          <Polyline
            positions={truckLine}
            pathOptions={{
              color: ROUTE_GREEN,
              weight: 5,
              dashArray: "8 8",
              lineCap: "round",
            }}
          />
        )}

        {stops.map((stop) => {
          const isHome = stop.id === homeStopId;
          return (
            <Marker
              key={stop.id}
              position={[stop.lat, stop.lng]}
              icon={isHome ? homeIcon : stopIcon(stop.completed)}
              zIndexOffset={isHome ? 500 : stop.completed ? 0 : 200}
            >
              <Popup>
                <strong>{stop.address}</strong>
                <div className="text-xs text-muted-foreground">{stop.residentName}</div>
                <div
                  className="mt-1 text-xs font-semibold"
                  style={{ color: stop.completed ? "#94A3B8" : "#1B5E20" }}
                >
                  {stop.completed ? `Done · ${stop.completedAt}` : "Upcoming stop"}
                </div>
              </Popup>
            </Marker>
          );
        })}

        <Marker position={[truck.lat, truck.lng]} icon={truckIcon} zIndexOffset={1000}>
          <Popup>
            <strong>Collection truck</strong>
            <div className="text-xs">Speed: {truck.speed} km/h</div>
            <div className="text-xs text-muted-foreground">Live GPS · Addis Ababa</div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
