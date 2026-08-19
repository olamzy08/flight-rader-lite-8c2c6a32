import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { MapContainer, Marker, Rectangle, TileLayer, useMap } from "react-leaflet";
import { NIGERIA_BOUNDS, NIGERIA_CENTER, type Flight } from "@/lib/types";

const bounds = L.latLngBounds(
  [NIGERIA_BOUNDS.latMin, NIGERIA_BOUNDS.lonMin],
  [NIGERIA_BOUNDS.latMax, NIGERIA_BOUNDS.lonMax],
);

function planeIcon(heading: number | null, selected: boolean) {
  const rotation = heading ?? 0;
  const size = selected ? 32 : 26;
  return L.divIcon({
    className: "",
    html: `<div class="plane-marker${selected ? " plane-marker--selected" : ""}" style="transform: rotate(${rotation}deg); width:${size}px; height:${size}px;">✈</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function FitNigeria() {
  const map = useMap();
  useEffect(() => {
    map.setMaxBounds(bounds.pad(0.15));
    map.fitBounds(bounds);
  }, [map]);
  return null;
}

function FlyToSelected({ flight }: { flight: Flight | null }) {
  const map = useMap();
  const lastId = useRef<string | null>(null);
  useEffect(() => {
    if (!flight) {
      lastId.current = null;
      return;
    }
    if (lastId.current === flight.icao24) return;
    lastId.current = flight.icao24;
    map.flyTo([flight.latitude, flight.longitude], Math.max(map.getZoom(), 7), {
      duration: 0.8,
    });
  }, [flight, map]);
  return null;
}

interface FlightMapProps {
  flights: Flight[];
  selectedId: string | null;
  onSelect: (icao24: string) => void;
}

export default function FlightMap({ flights, selectedId, onSelect }: FlightMapProps) {
  const selected = useMemo(
    () => flights.find((f) => f.icao24 === selectedId) ?? null,
    [flights, selectedId],
  );

  return (
    <MapContainer
      center={NIGERIA_CENTER}
      zoom={6}
      minZoom={5}
      maxZoom={11}
      className="h-full w-full"
      worldCopyJump={false}
      attributionControl
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &middot; data <a href="https://opensky-network.org">OpenSky Network</a>'
      />
      <FitNigeria />
      <FlyToSelected flight={selected} />
      <Rectangle
        bounds={bounds}
        pathOptions={{
          color: "var(--color-radar)",
          weight: 1,
          dashArray: "6 6",
          fillOpacity: 0.03,
        }}
      />
      {flights.map((flight) => (
        <Marker
          key={flight.icao24}
          position={[flight.latitude, flight.longitude]}
          icon={planeIcon(flight.heading, flight.icao24 === selectedId)}
          title={flight.callsign}
          alt={flight.callsign}
          zIndexOffset={1000}
          riseOnHover
          eventHandlers={{ click: () => onSelect(flight.icao24) }}
        />
      ))}
    </MapContainer>
  );
}
