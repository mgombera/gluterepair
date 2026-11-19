import * as THREE from "three";
import G from "./glute-landmarks.json";
import { Frame, cloudOf, fiberColor, heightMap, hull, lens, muscle, onSurface } from "./softTissue";
import type { Surf } from "./softTissue";

// Soft tissue of the gluteus model on the CT bones (HuBMAP HRA, Visible Human
// Male, CC BY 4.0), fitted to the trochanter facets measured by
// docs/3d/scripts/glute-landmarks.mjs. Frame (meters): +Y superior, +Z
// anterior, lateral of this right hip is -X. No React here, so scripts can
// build and check it.

export const BONE = "#ddd2ba";
export const TENDON = "#fbf8f2";
export const TEAR = "#ff4d4d";
export const BARE = "#ff9b57";
export const BURSA = "#f28db2";
export const ITBAND = "#dfe8f2";
export const ANCHOR = "#ffffff";
export const SUTURE = "#3aa7f0";

export type Facet = { center: number[]; normal: number[]; up: number[]; across: number[]; height: number; width: number };
export const v = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);
export const at = (f: Facet, u: number, w: number, lift = 0) =>
  v(f.center)
    .addScaledVector(v(f.up), u * f.height)
    .addScaledVector(v(f.across), w * f.width)
    .addScaledVector(v(f.normal), lift);

export const LAT = G.lateral_facet as Facet;
export const SUP = G.superoposterior_facet as Facet;
export const ANT = G.anterior_facet as Facet;

/** True when a point (femur frame, meters) lies on the tendon footprint of a facet. */
export function onFootprint(q: THREE.Vector3, f: Facet, su: number, sw: number) {
  const d = q.clone().sub(v(f.center));
  if (Math.abs(d.dot(v(f.normal))) > 0.007) return false;
  const a = d.dot(v(f.up)) / (su * f.height * 0.5);
  const b = d.dot(v(f.across)) / (sw * f.width * 0.5);
  return a * a + b * b <= 1;
}
export const FOOTPRINTS: [Facet, number, number][] = [
  [LAT, 1.0, 1.0],
  [SUP, 0.6, 0.7],
  [ANT, 0.65, 0.7],
];
export const isFootprint = (q: THREE.Vector3) => FOOTPRINTS.some(([f, a, b]) => onFootprint(q, f, a, b));

export const MED_MUSCLE = "#b4514a";
export const MIN_MUSCLE = "#8f3f5e";
export const MIN_TENDON = "#f3e4ea";

/** How far the torn tendons have pulled up (retracted), in meters. */
export const RETRACT = 0.03;
export const up = (p: THREE.Vector3) => p.clone().add(new THREE.Vector3(0, RETRACT, 0));
export const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Thickness along the fibers (t) and across (s): a full belly that thins to a flat tendon.
// The tendon end thins out where it meets the bone.
const endTaper = (t: number) => 1 - 0.4 * smooth(0.94, 1, t);
export const medThick = (k: number) => (t: number, s: number) =>
  endTaper(t) * (0.0034 + k * 0.022 * Math.sin(Math.PI * Math.min(1, t / 0.9)) ** 0.9) * lens(s, t < 0.82 ? 0.45 : 0.22);
export const minThick = (k: number) => (t: number, s: number) =>
  endTaper(t) * (0.0028 + k * 0.012 * Math.sin(Math.PI * Math.min(1, t / 0.88)) ** 0.9) * lens(s, t < 0.8 ? 0.45 : 0.22);
// A torn end is rolled up a little and lifted off the bone.
export const tornThick = (f: (t: number, s: number) => number) => (t: number, s: number) => f(t, s) + 0.003 * smooth(0.86, 1, t) * lens(s, 0.3);
export const tornLift = (t: number) => 0.004 * smooth(0.82, 1, t);

/** Builds both stages from the pelvis and femur mesh nodes. */
export function buildSoftTissue(pelvis: THREE.Mesh, femur: THREE.Mesh) {
  const bones = [cloudOf(pelvis), cloudOf(femur)];
  const F0 = new Frame(0), FMED = new Frame(20), FMIN = new Frame(-15);
  const lat = heightMap(bones, F0);
  const onBone = (y: number, z: number) => onSurface(new THREE.Vector3(0, y, z), F0, lat, 0);

  // Gluteus minimus: deep, from the lower outer ilium to the anterior facet.
  const minOrigin = [onBone(0.075, -0.035), onBone(0.1, -0.005), onBone(0.08, 0.05)];
  const minInsert = [at(ANT, -0.4, 0.35), at(ANT, -0.45, 0.02), at(ANT, -0.4, -0.3)];
  // Gluteus medius: over it, from the upper outer ilium to the superoposterior and lateral facets.
  const medOrigin = [onBone(0.11, -0.066), onBone(0.143, -0.036), onBone(0.138, 0.0), onBone(0.105, 0.036)];
  const medInsert = [at(SUP, -0.35, 0.55), at(LAT, -0.05, 0.5), at(LAT, -0.5, -0.32)];

  const build = (torn: boolean) => {
    const minSurf = heightMap(bones, FMIN);
    const min = muscle({
      frame: FMIN,
      surf: minSurf,
      origin: minOrigin,
      insertion: torn ? minInsert.map(up) : minInsert,
      attach: 0.3,
      converge: 1.5,
      thick: torn ? tornThick(minThick(1.12)) : minThick(1),
      lift: torn ? tornLift : undefined,
      color: fiberColor(MIN_MUSCLE, MIN_TENDON, 0.76, torn ? TEAR : undefined),
      gap: 0.0014,
      cols: 28,
      rows: 40,
    });
    // The medius lies over the minimus: its surface includes the minimus.
    const medSurf = heightMap([...bones, min.outer], FMED);
    const med = muscle({
      frame: FMED,
      surf: medSurf,
      origin: medOrigin,
      insertion: torn ? medInsert.map(up) : medInsert,
      attach: 0.3,
      converge: 1.7,
      thick: torn ? tornThick(medThick(1.12)) : medThick(1),
      lift: torn ? tornLift : undefined,
      color: fiberColor(MED_MUSCLE, TENDON, 0.8, torn ? TEAR : undefined),
    });
    // Everything that covers the bone, seen from the side (for the IT band).
    const skinLat = heightMap([...bones, min.outer, med.outer], F0);
    return { min, med, skinLat };
  };
  const before = build(true);
  const after = build(false);

  // Double-row repair: inner row (proximal) under the medius and minimus
  // tendons, outer row (distal) on the bone below them, sutures crossing over both.
  // Each point is placed on the surface as seen from its own side: the
  // lateral facet from the side, the anterior facet from the front.
  const views = [-12, -35, -58].map((deg) => {
    const f = new Frame(deg);
    return { deg, f, surf: heightMap([...bones, after.min.outer, after.med.outer], f) };
  });
  const onSkin = (p: THREE.Vector3, deg: number, lift: number) => {
    const view = views.reduce((best, x) => (Math.abs(x.deg - deg) < Math.abs(best.deg - deg) ? x : best));
    return onSurface(p, view.f, view.surf, lift);
  };
  const innerRow: [THREE.Vector3, number][] = [
    [at(LAT, 0.35, 0.25), -12],
    [at(ANT, 0.15, 0.1), -58],
  ];
  const outerRow: [THREE.Vector3, number][] = [
    [at(LAT, -0.85, 0.3), -12],
    [at(LAT, -0.85, -0.55), -30],
  ];
  const knots = innerRow.map(([p, deg]) => onSkin(p, deg, 0.0014));
  const anchors = outerRow.map(([p, deg]) => onSkin(p, deg, 0.0012));
  const suture = ([a, da]: [THREE.Vector3, number], [b, db]: [THREE.Vector3, number]) => {
    const pts = Array.from({ length: 25 }, (_, i) => onSkin(a.clone().lerp(b, i / 24), da + ((db - da) * i) / 24, 0.0009));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.0007, 6, false);
  };
  const sutures = innerRow.flatMap((a) => outerRow.map((b) => suture(a, b)));

  // IT band: a taut sheet over the outside of the hip, over the muscles.
  const band = (skin: Surf, window: boolean) => {
    const cols = 12, rows = 30;
    const y0 = G.greater_trochanter_tip[1] + 0.055, y1 = G.greater_trochanter_tip[1] - 0.13;
    const z0 = LAT.center[2] + 0.004;
    const ts = Array.from({ length: rows + 1 }, (_, r) => r / rows);
    const Lc: number[][] = [];
    for (let c = 0; c <= cols; c++) {
      const z = z0 + (c / cols - 0.5) * 0.05;
      const raw = ts.map((t) => {
        const x = skin(y0 + (y1 - y0) * t, z);
        return x === null ? null : -(x - 0.0065);
      });
      Lc.push(hull(ts, raw).map((L) => (Number.isNaN(L) ? 0.06 : L)));
    }
    const pos: number[] = [];
    for (let r = 0; r <= rows; r++)
      for (let c = 0; c <= cols; c++) {
        const nb = [Lc[Math.max(0, c - 1)][r], Lc[c][r], Lc[Math.min(cols, c + 1)][r]];
        pos.push(-Math.max(Lc[c][r], (nb[0] + nb[1] + nb[2]) / 3), y0 + (y1 - y0) * ts[r], z0 + (c / cols - 0.5) * 0.05);
      }
    const idx: number[] = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        // The fasciotomy: a small window over the trochanter.
        const y = y0 + ((y1 - y0) * (r + 0.5)) / rows;
        if (window && Math.abs(y - LAT.center[1] - 0.004) < 0.018 && c >= 4 && c < 8) continue;
        const a = r * (cols + 1) + c, b = a + cols + 1;
        idx.push(a, b, a + 1, b, b + 1, a + 1);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  };

  return {
    before,
    after,
    knots,
    anchors,
    sutures,
    bandWhole: band(before.skinLat, false),
    bandWindow: band(after.skinLat, true),
    bursa: onSurface(at(LAT, 0.0, 0).add(new THREE.Vector3(0, 0, -0.004)), F0, lat, 0.0075),
    labels: {
      before: { med: before.med.point(0.35, 0.5), min: before.min.point(0.62, 0.9) },
      after: { med: after.med.point(0.35, 0.5), min: after.min.point(0.62, 0.9) },
    },
  };
}
