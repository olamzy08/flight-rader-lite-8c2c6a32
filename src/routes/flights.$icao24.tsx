import { Link, createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { formatNumber, formatTime } from "@/lib/normalize";
import type { Flight } from "@/lib/types";

export const Route = createFileRoute("/flights/$icao24")({
  head: () => ({ meta: [{ title: "Flight details — Flight Radar Lite" }] }),
  component: FlightDetailsPage,
});

function FlightDetailsPage() {
  const { icao24 } = Route.useParams();
  const queryClient = useQueryClient();
  const response = queryClient.getQueryData<{ flights: Flight[] }>(["nigeria-flights"]);
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
  const flight =
    icao24 === demoFlight.icao24
      ? demoFlight
      : (response?.flights.find((item) => item.icao24 === icao24) ?? null);

  if (!flight) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <section className="w-full max-w-lg border border-border bg-panel p-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            No contact
          </p>
          <h1 className="mt-2 font-mono text-2xl text-radar">Flight unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This contact may have left the live feed or the page was refreshed.
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex text-xs uppercase tracking-[0.18em] text-telemetry hover:text-radar"
          >
            ← Return to radar
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground md:px-10">
      <section className="mx-auto max-w-3xl">
        <Link
          to="/"
          className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-radar"
        >
          ← Back to radar
        </Link>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              OpenSky contact
            </p>
            <h1 className="mt-2 font-mono text-4xl text-radar">{flight.callsign}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {flight.originCountry} · {flight.icao24.toUpperCase()}
            </p>
          </div>
          <p className="font-mono text-xs text-telemetry">
            last contact {formatTime(flight.lastContact * 1000)}
          </p>
        </div>
        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            ["Altitude", formatNumber(flight.altitudeFt, "ft")],
            ["Speed", formatNumber(flight.speedKts, "kts")],
            ["Heading", flight.heading === null ? "—" : `${Math.round(flight.heading)}°`],
            ["Vertical rate", formatNumber(flight.verticalRateFpm, "fpm")],
            ["Latitude", `${flight.latitude.toFixed(6)}°`],
            ["Longitude", `${flight.longitude.toFixed(6)}°`],
            ["Ground state", flight.onGround ? "On ground" : "Airborne"],
            ["Contact age", `${flight.ageSeconds}s`],
          ].map(([label, value]) => (
            <div key={label} className="border border-border bg-panel px-4 py-4">
              <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {label}
              </dt>
              <dd className="mt-2 font-mono text-lg text-telemetry">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
