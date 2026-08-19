import { createServerFn } from "@tanstack/react-start";
import { normalizeFlights } from "./normalize";
import { NIGERIA_BOUNDS, type FlightsResponse } from "./types";

const OPENSKY_URL =
  `https://opensky-network.org/api/states/all` +
  `?lamin=${NIGERIA_BOUNDS.latMin}&lomin=${NIGERIA_BOUNDS.lonMin}` +
  `&lamax=${NIGERIA_BOUNDS.latMax}&lomax=${NIGERIA_BOUNDS.lonMax}`;

export const getNigeriaFlights = createServerFn({ method: "GET" }).handler(
  async (): Promise<FlightsResponse> => {
    const now = Math.floor(Date.now() / 1000);
    try {
      const res = await fetch(OPENSKY_URL, {
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        const reason =
          res.status === 429
            ? "OpenSky rate limit reached — retrying shortly"
            : `OpenSky returned ${res.status}`;
        return { flights: [], fetchedAt: now * 1000, staleDropped: 0, error: reason };
      }

      const json = (await res.json()) as {
        time?: number;
        states?: (number | string | boolean | null)[][] | null;
      };

      const normalized = normalizeFlights(json.states, json.time ?? now);
      return { ...normalized, error: null };
    } catch (err) {
      console.error("OpenSky fetch failed", err);
      return {
        flights: [],
        fetchedAt: now * 1000,
        staleDropped: 0,
        error: "Could not reach the OpenSky Network",
      };
    }
  },
);
