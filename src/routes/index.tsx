import { lazy, Suspense, useMemo, useState } from "react";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getNigeriaFlights } from "@/lib/flights.functions";
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

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["nigeria-flights"],
    queryFn: () => fetchFlights(),
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
    placeholderData: (previous) => previous,
  });

  const flights = data?.flights ?? [];
  const selected = useMemo(
    () => flights.find((f) => f.icao24 === selectedId) ?? null,
    [flights, selectedId],
  );

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-background md:flex-row">
      <div className="relative h-[55vh] min-h-0 flex-1 md:h-full">
        <ClientOnly fallback={<MapSkeleton />}>
          <Suspense fallback={<MapSkeleton />}>
            <FlightMap flights={flights} selectedId={selectedId} onSelect={setSelectedId} />
          </Suspense>
        </ClientOnly>
      </div>
      <div className="min-h-0 flex-1 md:h-full md:flex-none">
        <FlightSidebar
          flights={flights}
          selected={selected}
          selectedId={selectedId}
          onSelect={setSelectedId}
          fetchedAt={data?.fetchedAt ?? null}
          error={data?.error ?? null}
          staleDropped={data?.staleDropped ?? 0}
          isLoading={isLoading}
          isFetching={isFetching}
        />
      </div>
    </main>
  );
}
