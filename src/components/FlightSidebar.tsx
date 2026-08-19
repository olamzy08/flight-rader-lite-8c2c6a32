import { formatNumber, formatTime } from "@/lib/normalize";
import { STALE_THRESHOLD_SECONDS, type Flight } from "@/lib/types";

interface FlightSidebarProps {
  flights: Flight[];
  selected: Flight | null;
  selectedId: string | null;
  onSelect: (icao24: string | null) => void;
  fetchedAt: number | null;
  error: string | null;
  staleDropped: number;
  isLoading: boolean;
  isFetching: boolean;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-secondary/40 px-3 py-2">
      <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-mono text-sm text-telemetry">{value}</dd>
    </div>
  );
}

export function FlightSidebar({
  flights,
  selected,
  selectedId,
  onSelect,
  fetchedAt,
  error,
  staleDropped,
  isLoading,
  isFetching,
}: FlightSidebarProps) {
  return (
    <aside className="flex h-full min-h-0 flex-col border-border bg-panel md:w-96 md:border-l">
      <header className="border-b border-border px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="text-lg text-radar" aria-hidden>
            ✈
          </span>
          <h1 className="text-sm font-semibold uppercase tracking-[0.22em] text-foreground">
            Flight Radar Lite
          </h1>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Live traffic over Nigerian airspace</p>

        <dl className="mt-3 grid grid-cols-2 gap-2 font-mono text-xs">
          <div>
            <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Aircraft
            </dt>
            <dd className="text-radar">{flights.length}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Updated
            </dt>
            <dd className="text-telemetry">{fetchedAt ? formatTime(fetchedAt) : "—"}</dd>
          </div>
        </dl>

        <p className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span
            className={`inline-block size-1.5 rounded-full ${isFetching ? "bg-accent" : "bg-telemetry"}`}
            aria-hidden
          />
          {isFetching ? "Polling OpenSky…" : "Refreshes every 10s"}
        </p>
      </header>

      {error ? (
        <p className="mx-4 mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground">
          {error}
          {fetchedAt ? ` · showing data as of ${formatTime(fetchedAt)}` : ""}
        </p>
      ) : null}

      {staleDropped > 0 ? (
        <p className="mx-4 mt-3 text-[11px] text-muted-foreground">
          {staleDropped} contact{staleDropped === 1 ? "" : "s"} ignored as stale (&gt;
          {STALE_THRESHOLD_SECONDS}s old)
        </p>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {selected ? (
          <section>
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="mb-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-radar"
            >
              ← Back to list
            </button>
            <h2 className="font-mono text-2xl text-radar">{selected.callsign}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {selected.originCountry} · {selected.icao24.toUpperCase()}
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-2">
              <Detail label="Altitude" value={formatNumber(selected.altitudeFt, "ft")} />
              <Detail label="Speed" value={formatNumber(selected.speedKts, "kts")} />
              <Detail
                label="Heading"
                value={selected.heading === null ? "—" : `${Math.round(selected.heading)}°`}
              />
              <Detail label="Vertical rate" value={formatNumber(selected.verticalRateFpm, "fpm")} />
              <Detail label="Latitude" value={`${selected.latitude.toFixed(4)}°`} />
              <Detail label="Longitude" value={`${selected.longitude.toFixed(4)}°`} />
              <Detail label="Status" value={selected.onGround ? "On ground" : "Airborne"} />
              <Detail label="Last contact" value={`${selected.ageSeconds}s ago`} />
            </dl>
          </section>
        ) : (
          <section>
            <h2 className="mb-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Active flights
            </h2>
            {isLoading ? (
              <p className="text-xs text-muted-foreground">Acquiring radar contacts…</p>
            ) : flights.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No live flights over Nigeria right now. The radar keeps polling every 10 seconds.
              </p>
            ) : (
              <ul className="space-y-1">
                {flights.map((flight) => (
                  <li key={flight.icao24}>
                    <button
                      type="button"
                      onClick={() => onSelect(flight.icao24)}
                      className={`flex w-full items-baseline justify-between gap-2 rounded-md border px-3 py-2 text-left transition-colors ${
                        flight.icao24 === selectedId
                          ? "border-radar bg-secondary"
                          : "border-border bg-secondary/30 hover:border-radar/60 hover:bg-secondary/60"
                      }`}
                    >
                      <span className="font-mono text-sm text-foreground">{flight.callsign}</span>
                      <span className="font-mono text-[11px] text-telemetry">
                        {flight.altitudeFt === null
                          ? "—"
                          : `${flight.altitudeFt.toLocaleString("en-US")} ft`}
                        {" · "}
                        {flight.speedKts === null ? "—" : `${flight.speedKts} kt`}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>

      <footer className="border-t border-border px-4 py-3 text-[10px] leading-relaxed text-muted-foreground">
        Source: OpenSky Network · bounds 4°N–14°N, 2°E–15°E
      </footer>
    </aside>
  );
}
