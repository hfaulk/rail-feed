import RBush from "rbush";
import { getTracks } from "../data/gtcl.js";
import turf from "@turf/turf";

const tree = new RBush();

export function buildIndex() {
  const tracks = getTracks();

  for (const t of tracks) {
    const bbox = turf.bbox(t.line);

    tree.insert({
      minX: bbox[0],
      minY: bbox[1],
      maxX: bbox[2],
      maxY: bbox[3],
      track: t,
    });
  }

  return tree;
}

export function getIndex() {
  return tree;
}
