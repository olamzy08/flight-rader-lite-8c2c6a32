import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getNigeriaFlights } from "@/lib/flights.functions";
import { formatTime } from "@/lib/normalize";
import { type Flight, type FlightSnapshot } from "@/lib/types";
import { FlightSidebar } from "@/components/FlightSidebar";

const FlightMap = lazy(() => import("@/components/FlightMap"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Flight Radar Lite — Live Flights Over Nigeria" },
      {
        name: "description",
        content:
          "Track live aircraft over Nigerian airspace on a map. Click a plane for its flight number, altitude, and speed, refreshed every 10 seconds from OpenSky Network.",
      },
      { property: "og:title", content: "Flight Radar Lite — Live Flights Over Nigeria" },
      {
        property: "og:description",
        content:
          "Live map of aircraft over Nigeria with callsign, altitude, and speed details from the OpenSky Network.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FlightRadarPage,
});

function MapSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-background">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
        Initialising radar…
      </p>
    </div>
  );
}

function FlightRadarPage() {
  const fetchFlights = useServerFn(getNigeriaFlights);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [demoEnabled, setDemoEnabled] = useState(false);
  const [history, setHistory] = useState<FlightSnapshot[]>([]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["nigeria-flights"],
    queryFn: () => fetchFlights(),
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
    placeholderData: (previous) => previous,
  });

  const flights = useMemo(() => data?.flights ?? [], [data?.flights]);
  const visibleFlights = useMemo(() => {
    if (!demoEnabled) return flights;
    const demoFlight: Flight = {
      icao24: "demo-ng001",
      callsign: "NGTEST01",
      originCountry: "Nigeria",
      latitude: 9.0765,
      longitude: 7.3986,
      altitudeFt: 24000,
      speedKts: 420,
      heading: 315,
      verticalRateFpm: 0,
      onGround: false,
      lastContact: Math.floor(Date.now() / 1000),
      ageSeconds: 0,
    };
    return [...flights.filter((flight) => flight.icao24 !== demoFlight.icao24), demoFlight].sort(
      (a, b) => a.callsign.localeCompare(b.callsign),
    );
  }, [demoEnabled, flights]);

  useEffect(() => {
    const recordedAt = data?.fetchedAt ?? Date.now();
    if (!visibleFlights.length) return;
    setHistory((current) => {
      const next = visibleFlights.map((flight) => ({
        icao24: flight.icao24,
        callsign: flight.callsign,
        altitudeFt: flight.altitudeFt,
        speedKts: flight.speedKts,
        recordedAt,
      }));
      const combined = [...next, ...current];
      const seen = new Set<string>();
      return combined
        .filter((snapshot) => {
          const key = `${snapshot.icao24}-${snapshot.recordedAt}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .slice(0, 500);
    });
  }, [data?.fetchedAt, visibleFlights]);

  const selected = useMemo(
    () => visibleFlights.find((f) => f.icao24 === selectedId) ?? null,
    [selectedId, visibleFlights],
  );
  const feedAgeSeconds = data?.fetchedAt
    ? Math.max(0, Math.floor((Date.now() - data.fetchedAt) / 1000))
    : null;
  const feedIsStale = feedAgeSeconds !== null && feedAgeSeconds > 60;

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-background md:flex-row">
      <div className="relative h-[55vh] min-h-0 flex-1 md:h-full">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] flex flex-wrap items-center justify-between gap-3 border-b border-border bg-panel/95 px-4 py-3 backdrop-blur-sm">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xl text-radar">{visibleFlights.length}</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              live aircraft
            </span>
            <span className="font-mono text-[11px] text-telemetry">
              {data?.fetchedAt ? `contact ${formatTime(data.fetchedAt)}` : "awaiting contact"}
            </span>
            {feedIsStale ? (
              <span className="font-mono text-[11px] text-destructive-foreground">
                stale ({feedAgeSeconds}s)
              </span>
            ) : null}
          </div>
          <label className="pointer-events-auto flex cursor-pointer items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            <input
              type="checkbox"
              checked={demoEnabled}
              onChange={(event) => setDemoEnabled(event.target.checked)}
              className="accent-[var(--color-radar)]"
            />
            Demo Nigeria flight
          </label>
        </div>
        {data?.error ? (
          <div className="absolute inset-x-4 top-16 z-[500] rounded-md border border-destructive/50 bg-destructive/90 px-3 py-2 text-xs text-destructive-foreground shadow-lg">
            {data.error}
          </div>
        ) : null}
        <ClientOnly fallback={<MapSkeleton />}>
          <Suspense fallback={<MapSkeleton />}>
            <FlightMap flights={visibleFlights} selectedId={selectedId} onSelect={setSelectedId} />
          </Suspense>
        </ClientOnly>
      </div>
      <div className="min-h-0 flex-1 md:h-full md:flex-none">
        <FlightSidebar
          flights={visibleFlights}
          selected={selected}
          selectedId={selectedId}
          onSelect={setSelectedId}
          fetchedAt={data?.fetchedAt ?? null}
          error={data?.error ?? null}
          staleDropped={data?.staleDropped ?? 0}
          isLoading={isLoading}
          isFetching={isFetching}
          historyCount={history.length}
        />
      </div>
    </main>
  );
}
