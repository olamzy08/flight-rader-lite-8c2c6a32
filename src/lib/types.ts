export interface Flight {
  icao24: string;
  callsign: string;
  originCountry: string;
  latitude: number;
  longitude: number;
  /** feet */
  altitudeFt: number | null;
  /** knots */
  speedKts: number | null;
  /** degrees, 0 = north */
  heading: number | null;
  /** feet per minute */
  verticalRateFpm: number | null;
  onGround: boolean;
  lastContact: number;
  /** seconds since last contact at fetch time */
  ageSeconds: number;
}

export interface FlightsResponse {
  flights: Flight[];
  fetchedAt: number;
  /** number of raw records dropped because their last_contact was too old */
  staleDropped: number;
  error: string | null;
}

export const NIGERIA_BOUNDS = {
  latMin: 4,
  latMax: 14,
  lonMin: 2,
  lonMax: 15,
} as const;

export const NIGERIA_CENTER: [number, number] = [9.082, 8.6753];

/** flights older than this are considered stale and ignored */
export const STALE_THRESHOLD_SECONDS = 60;
