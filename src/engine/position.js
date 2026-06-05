import turf from "@turf/turf";
import { getTrain } from "./state.js";
import { snapTipLoc } from "../spatial/snap.js";

export function getPosition(trainId) {
  const train = getTrain(trainId);
  if (!train || !train.lastNode || !train.nextNode) return null;

  const a = snapTipLoc(train.lastNode);
  const b = snapTipLoc(train.nextNode);

  const line = turf.lineString([
    a.point.geometry.coordinates,
    b.point.geometry.coordinates,
  ]);

  const total = turf.length(line, { units: "kilometers" });

  const elapsed = (Date.now() - train.lastEventTime) / 1000;
  const expected = train.expectedTravelSeconds || 600;

  const ratio = Math.min(elapsed / expected, 1);

  const pt = turf.along(line, total * ratio, { units: "kilometers" });

  return {
    lat: pt.geometry.coordinates[1],
    lon: pt.geometry.coordinates[0],
    confidence: 1 - Math.abs(0.5 - ratio),
  };
}
