import turf from "@turf/turf";
import { getIndex } from "./index.js";

export function snapTipLoc(tiploc) {
  const index = getIndex();

  const candidates = index.search({
    minX: tiploc.lon - 0.1,
    minY: tiploc.lat - 0.1,
    maxX: tiploc.lon + 0.1,
    maxY: tiploc.lat + 0.1,
  });

  let best = null;
  let bestDist = Infinity;

  for (const c of candidates) {
    const pt = turf.point([tiploc.lon, tiploc.lat]);

    const snapped = turf.nearestPointOnLine(c.track.line, pt);

    if (snapped.properties.dist < bestDist) {
      bestDist = snapped.properties.dist;

      best = {
        trackId: c.track.id,
        point: snapped,
      };
    }
  }

  return best;
}
