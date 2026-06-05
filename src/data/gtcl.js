import Database from "better-sqlite3";
import wkx from "wkx";

let tracks = [];

export function loadGTCL(path) {
  const db = new Database(path);

  const rows = db
    .prepare(
      `
    select fid, geom
    from NWR_GTCL
  `,
    )
    .all();

  tracks = rows.map((r) => {
    const geom = wkx.Geometry.parse(Buffer.from(r.geom, "hex"));

    return {
      id: r.fid,
      line: geom.toGeoJSON(),
    };
  });

  return tracks;
}

export function getTracks() {
  return tracks;
}
