import {
  NIGERIA_BOUNDS,
  STALE_THRESHOLD_SECONDS,
  type Flight,
  type FlightsResponse,
} from "./types";

const M_TO_FT = 3.28084;
const MS_TO_KTS = 1.94384;
const MS_TO_FPM = 196.85;

type StateVector = (number | string | boolean | null)[];

function num(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/**
 * OpenSky /states/all returns positional arrays:
 * 0 icao24, 1 callsign, 2 origin_country, 3 time_position, 4 last_contact,
 * 5 longitude, 6 latitude, 7 baro_altitude, 8 on_ground, 9 velocity,
 * 10 true_track, 11 vertical_rate, ... 13 geo_altitude
 */
export function normalizeFlights(
  states: StateVector[] | null | undefined,
  serverTime: number,
): Omit<FlightsResponse, "error"> {
  const fetchedAt = serverTime * 1000;
  const flights: Flight[] = [];
  let staleDropped = 0;
  let boundsDropped = 0;
  let nullPositionDropped = 0;

  for (const s of states ?? []) {
    const lon = num(s[5]);
    const lat = num(s[6]);
    if (lat === null || lon === null) {
      nullPositionDropped += 1;
      continue;
    }

    if (
      lat < NIGERIA_BOUNDS.latMin ||
      lat > NIGERIA_BOUNDS.latMax ||
      lon < NIGERIA_BOUNDS.lonMin ||
      lon > NIGERIA_BOUNDS.lonMax
    ) {
      boundsDropped += 1;
      continue;
    }

    const lastContact = num(s[4]) ?? 0;
    const ageSeconds = Math.max(0, Math.round(serverTime - lastContact));
    if (ageSeconds > STALE_THRESHOLD_SECONDS) {
      staleDropped += 1;
      continue;
    }

    const altitude = num(s[7]) ?? num(s[13]);
    const velocity = num(s[9]);
    const verticalRate = num(s[11]);
    const callsign = typeof s[1] === "string" ? s[1].trim() : "";

    flights.push({
      icao24: typeof s[0] === "string" ? s[0] : `unknown-${flights.length}`,
      callsign: callsign.length > 0 ? callsign : "UNKNOWN",
      originCountry: typeof s[2] === "string" ? s[2] : "Unknown",
      latitude: lat,
      longitude: lon,
      altitudeFt: altitude === null ? null : Math.round(altitude * M_TO_FT),
      speedKts: velocity === null ? null : Math.round(velocity * MS_TO_KTS),
      heading: num(s[10]),
      verticalRateFpm: verticalRate === null ? null : Math.round(verticalRate * MS_TO_FPM),
      onGround: s[8] === true,
      lastContact,
      ageSeconds,
    });
  }

  flights.sort((a, b) => a.callsign.localeCompare(b.callsign));

  console.info("[OpenSky] filter counts", {
    raw: states?.length ?? 0,
    boundsDropped,
    staleDropped,
    nullPositionDropped,
    visible: flights.length,
  });

  return { flights, fetchedAt, staleDropped };
}

export function formatNumber(value: number | null, unit: string): string {
  if (value === null) return "—";
  return `${value.toLocaleString("en-US")} ${unit}`;
}

export function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
