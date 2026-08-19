# Flight Radar Lite

Live flights over Nigerian airspace on an OpenStreetMap/Leaflet map, with a sidebar detail panel showing callsign, altitude (ft), and speed (knots).

Note on the requested output format: this project is a React + TanStack Start app, so the deliverable is one page route (map + sidebar) rather than a standalone index.html with inline CSS/JS. Same features, same spec, built to fit the app.

## What gets built

Single page at `/` (replacing the placeholder):

- Full-height layout: Leaflet map on the left/main area, detail sidebar on the right (stacked on mobile).
- Map centered on Nigeria (9.0820, 8.6753), view constrained to lat 4-14 N, lon 2-15 E.
- Plane markers using a rotated plane glyph oriented to each flight's true track.
- Polling every 10 seconds; flights with `last_contact` older than 60 seconds are dropped as stale.
- Only flights inside the Nigeria bounding box are shown.
- Click a plane -> sidebar shows callsign (or "Unknown"), altitude in feet, speed in knots, plus origin country, heading, vertical rate, and coordinates.
- Sidebar default state: flight count, last-updated timestamp, and a scrollable list of active flights that can also be clicked to select.
- Status banner for "no flights currently", loading, and fetch-error/stale-data states (last good data stays on screen with an "as of" time).

## Design direction

Aviation-radar look: deep navy background, amber/green radar accents, monospaced numerals for telemetry, thin panel borders. All colors added as tokens in `src/styles.css` (dark-first), no hardcoded color utilities.

## Technical notes

- `leaflet` + `react-leaflet` installed; the map component is dynamically imported behind `<ClientOnly>` so SSR never evaluates Leaflet. Leaflet CSS loaded via a `<link>` in `src/routes/__root.tsx`.
- Data fetching goes through a server function (`src/lib/flights.functions.ts`) calling `https://opensky-network.org/api/states/all?lamin=4&lomin=2&lamax=14&lomax=15`. Server-side keeps us safe from browser CORS/rate-limit surprises and lets us normalize the raw state-vector arrays into typed objects.
- Client uses TanStack Query with `refetchInterval: 10000`, `placeholderData` to keep prior flights visible during refetch.
- Unit conversion in the normalizer: meters -> feet (x3.28084), m/s -> knots (x1.94384).
- Route `head()` gets a Flight Radar Lite title/description plus og/twitter tags.
