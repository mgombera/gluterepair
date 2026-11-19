import * as THREE from "three";

// Soft tissue for the gluteus model, built on the CT bones (meters, +Y
// superior, +Z anterior, lateral of this right hip is -X). Each muscle is a
// fan from its origin on the ilium to its footprint on the greater
// trochanter. Its deep face lies on the bone where it attaches and is pulled
// taut where it leaves the bone (a string over the bumps); its outer face is
// offset by the muscle's thickness, so the belly has real bulk.

/** A view direction: local -X looks along `deg` degrees from lateral (+ is posterior, - anterior). */
export class Frame {
  readonly toLocalM: THREE.Matrix4;
  readonly toWorldM: THREE.Matrix4;
  constructor(deg: number) {
    this.toLocalM = new THREE.Matrix4().makeRotationY((deg * Math.PI) / 180);
    this.toWorldM = this.toLocalM.clone().invert();
  }
  local(p: THREE.Vector3) {
    return p.clone().applyMatrix4(this.toLocalM);
  }
  world(p: THREE.Vector3) {
    return p.clone().applyMatrix4(this.toWorldM);
  }
}

/** x (local) of the outermost surface at local (y, z), or null where there is nothing. */
export type Surf = (y: number, z: number) => number | null;

const CELL = 0.0025;
const Y0 = -0.14, Z0 = -0.12, NY = 136, NZ = 96;

/** A smoothed height map of point clouds (world positions) seen from a frame. */
export function heightMap(clouds: Float32Array[], frame: Frame): Surf {
  const grid = new Float32Array(NY * NZ).fill(Infinity);
  const q = new THREE.Vector3();
  const m = frame.toLocalM;
  for (const c of clouds)
    for (let i = 0; i < c.length; i += 3) {
      q.set(c[i], c[i + 1], c[i + 2]).applyMatrix4(m);
      const iy = Math.floor((q.y - Y0) / CELL), iz = Math.floor((q.z - Z0) / CELL);
      if (iy < 0 || iy >= NY || iz < 0 || iz >= NZ) continue;
      const k = iy * NZ + iz;
      if (q.x < grid[k]) grid[k] = q.x;
    }
  // Fill small gaps between vertices with the most lateral neighbor (twice).
  let cur = grid;
  for (let pass = 0; pass < 2; pass++) {
    const next = cur.slice();
    for (let iy = 1; iy < NY - 1; iy++)
      for (let iz = 1; iz < NZ - 1; iz++) {
        const k = iy * NZ + iz;
        if (cur[k] !== Infinity) continue;
        let best = Infinity, n = 0;
        for (const d of [-NZ, NZ, -1, 1])
          if (cur[k + d] !== Infinity) {
            best = Math.min(best, cur[k + d]);
            n++;
          }
        if (n >= 2) next[k] = best;
      }
    cur = next;
  }
  // Smooth (3 x 3 mean over filled cells) so surfaces lying on it show no steps.
  for (let pass = 0; pass < 2; pass++) {
    const next = cur.slice();
    for (let iy = 1; iy < NY - 1; iy++)
      for (let iz = 1; iz < NZ - 1; iz++) {
        const k = iy * NZ + iz;
        if (cur[k] === Infinity) continue;
        let sum = 0, n = 0;
        for (let dy = -1; dy <= 1; dy++)
          for (let dz = -1; dz <= 1; dz++) {
            const x = cur[k + dy * NZ + dz];
            if (x !== Infinity) {
              sum += x;
              n++;
            }
          }
        next[k] = sum / n;
      }
    cur = next;
  }
  return (y, z) => {
    const fy = (y - Y0) / CELL - 0.5, fz = (z - Z0) / CELL - 0.5;
    const iy = Math.floor(fy), iz = Math.floor(fz);
    if (iy < 0 || iy >= NY - 1 || iz < 0 || iz >= NZ - 1) return null;
    const a = cur[iy * NZ + iz], b = cur[iy * NZ + iz + 1], c = cur[(iy + 1) * NZ + iz], d = cur[(iy + 1) * NZ + iz + 1];
    if (![a, b, c, d].every(Number.isFinite)) return null;
    const ty = fy - iy, tz = fz - iz;
    return (a * (1 - tz) + b * tz) * (1 - ty) + (c * (1 - tz) + d * tz) * ty;
  };
}

/** World positions of a mesh node's vertices (its own transform applied). */
export function cloudOf(node: THREE.Mesh): Float32Array {
  node.updateMatrix();
  const P = node.geometry.attributes.position;
  const out = new Float32Array(P.count * 3);
  const q = new THREE.Vector3();
  for (let i = 0; i < P.count; i++) q.fromBufferAttribute(P, i).applyMatrix4(node.matrix).toArray(out, i * 3);
  return out;
}

/** A point on the outermost surface below world (y, z) as seen from the frame. */
export function onSurface(p: THREE.Vector3, frame: Frame, surf: Surf, lift: number) {
  const l = frame.local(p);
  const x = surf(l.y, l.z);
  if (x !== null) l.x = x - lift;
  return frame.world(l);
}

/** Upper convex hull of (t, L) points, sampled back at each t (a taut string over the bumps). */
export function hull(ts: number[], Ls: (number | null)[]): number[] {
  const pts: [number, number][] = [];
  ts.forEach((t, i) => Ls[i] !== null && pts.push([t, Ls[i] as number]));
  if (pts.length === 0) return ts.map(() => NaN);
  const h: [number, number][] = [];
  for (const p of pts) {
    while (h.length >= 2) {
      const [a, b] = [h[h.length - 2], h[h.length - 1]];
      // Drop b when it lies below the line a to p.
      if ((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]) >= 0) h.pop();
      else break;
    }
    h.push(p);
  }
  return ts.map((t) => {
    if (t <= h[0][0]) return h[0][1];
    for (let i = 1; i < h.length; i++)
      if (t <= h[i][0]) {
        const [a, b] = [h[i - 1], h[i]];
        return a[1] + ((b[1] - a[1]) * (t - a[0])) / (b[0] - a[0] || 1);
      }
    return h[h.length - 1][1];
  });
}

export type MuscleSpec = {
  frame: Frame;
  surf: Surf;
  /** Origin edge on the ilium, posterior to anterior (world). */
  origin: THREE.Vector3[];
  /** Insertion edge on the trochanter, posterior to anterior (world). */
  insertion: THREE.Vector3[];
  /** Fraction along the fibers where the muscle leaves the bone. */
  attach: number;
  /** Thickness (meters) at (t along the fibers, s across). Zero at s = 0 and 1. */
  thick: (t: number, s: number) => number;
  /** Extra lift off the surface (meters) at t, for a torn end that has pulled away. */
  lift?: (t: number) => number;
  color: (t: number, s: number, out: THREE.Color) => void;
  gap?: number;
  cols?: number;
  rows?: number;
  /** Above 1, the fan stays wide longer and narrows late, near the tendon. */
  converge?: number;
  /** Passes of smoothing of the deep face (more is smoother, less tight to the bone). */
  smoothing?: number;
};

export type Muscle = {
  geometry: THREE.BufferGeometry;
  /** Dense outer-face world positions (to layer the next muscle over it). */
  outer: Float32Array;
  /** A point on the outer face (world). */
  point: (t: number, s: number) => THREE.Vector3;
};

export function muscle(spec: MuscleSpec): Muscle {
  const { frame, surf, attach, thick, color, gap = 0.0008, cols = 40, rows = 56, smoothing = 14, converge = 1 } = spec;
  const lift = spec.lift ?? (() => 0);
  const O = new THREE.CatmullRomCurve3(spec.origin.map((p) => frame.local(p)));
  const I = new THREE.CatmullRomCurve3(spec.insertion.map((p) => frame.local(p)));
  const ts = Array.from({ length: rows + 1 }, (_, r) => r / rows);
  const W = cols + 1;

  // Deep face: on the bone up to `attach`, then taut to the insertion.
  const L = new Float32Array((rows + 1) * W);
  const B = new Float32Array((rows + 1) * W).fill(-Infinity);
  const Y = new Float32Array((rows + 1) * W), Z = new Float32Array((rows + 1) * W);
  for (let c = 0; c <= cols; c++) {
    const s = c / cols;
    const o = O.getPoint(s), e = I.getPoint(s);
    const Lb: (number | null)[] = ts.map((t, r) => {
      const y = o.y + (e.y - o.y) * t, z = o.z + (e.z - o.z) * t ** converge;
      Y[r * W + c] = y;
      Z[r * W + c] = z;
      const x = surf(y, z);
      if (x === null) return null;
      B[r * W + c] = -(x - gap);
      return -(x - gap);
    });
    const ia = Math.round(attach * rows);
    const tail = hull(ts.slice(ia), Lb.slice(ia));
    // Where the bone is missing near the origin, run straight from the origin to the hull.
    const fallback = (t: number) => -o.x + (-e.x + o.x) * t;
    for (let r = 0; r <= rows; r++) {
      let val = r >= ia ? tail[r - ia] : Lb[r];
      if (val === null || Number.isNaN(val)) val = Number.isNaN(tail[0]) ? fallback(ts[r]) : r < ia ? (tail[0] as number) : fallback(ts[r]);
      L[r * W + c] = (val as number) + lift(ts[r]);
    }
  }
  // The deep face follows the bone only broadly: smooth it well, then keep it outside the bone.
  const blur = (src: Float32Array, passes: number) => {
    let cur = src.slice();
    for (let pass = 0; pass < passes; pass++) {
      const next = cur.slice();
      for (let r = 0; r <= rows; r++)
        for (let c = 0; c <= cols; c++) {
          let sum = 0, n = 0;
          for (let dr = -1; dr <= 1; dr++)
            for (let dc = -1; dc <= 1; dc++) {
              const rr = r + dr, cc = c + dc;
              if (rr < 0 || rr > rows || cc < 0 || cc > cols) continue;
              sum += cur[rr * W + cc];
              n++;
            }
          next[r * W + c] = sum / n;
        }
      cur = next;
    }
    return cur;
  };
  const Ls = blur(L, smoothing);
  const deep = Ls.map((x, i) => Math.max(x, B[i] + lift(ts[Math.floor(i / W)])));
  // The outer face: the smoothed deep face plus the thickness (toward local lateral), smoothed again.
  const T = new Float32Array(L.length);
  for (let r = 0; r <= rows; r++) for (let c = 0; c <= cols; c++) T[r * W + c] = Ls[r * W + c] + thick(ts[r], c / cols);
  const outerL = blur(T, 2).map((x, i) => Math.max(x, deep[i] + 0.0004));

  const at = (Lgrid: Float32Array, r: number, c: number) => new THREE.Vector3(-Lgrid[r * W + c], Y[r * W + c], Z[r * W + c]);
  const pos: number[] = [];
  const col: number[] = [];
  const k = new THREE.Color();
  for (const face of [1, 0])
    for (let r = 0; r <= rows; r++)
      for (let c = 0; c <= cols; c++) {
        const t = ts[r], s = c / cols;
        const w = frame.world(at(face ? outerL : deep, r, c));
        pos.push(w.x, w.y, w.z);
        color(t, s, k);
        col.push(k.r, k.g, k.b);
      }
  const n = (rows + 1) * W;
  const idx: number[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const a = r * W + c, b = a + W;
      idx.push(a, a + 1, b, b, a + 1, b + 1);
      idx.push(n + a, n + b, n + a + 1, n + b, n + b + 1, n + a + 1);
    }
  // Close both ends (the thin origin edge and the tendon end or torn edge).
  for (const r of [0, rows])
    for (let c = 0; c < cols; c++) {
      const a = r * W + c;
      idx.push(a, n + a, a + 1, a + 1, n + a, n + a + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  // The outer face must face outward for lighting; flip every triangle if it does not.
  const N = g.attributes.normal;
  const mid = Math.floor(rows / 2) * W + Math.floor(cols / 2);
  const nw = new THREE.Vector3().fromBufferAttribute(N, mid);
  const out = new THREE.Vector3(-1, 0, 0).applyMatrix4(new THREE.Matrix4().extractRotation(frame.toWorldM));
  if (nw.dot(out) < 0) {
    for (let i = 0; i < idx.length; i += 3) [idx[i + 1], idx[i + 2]] = [idx[i + 2], idx[i + 1]];
    g.setIndex(idx);
    g.computeVertexNormals();
  }

  const point = (t: number, s: number) => {
    const r = Math.round(t * rows), c = Math.round(s * cols);
    return frame.world(at(outerL, r, c));
  };
  // A dense sample of the outer face (4 per cell each way), so a height map built from it has no holes.
  const dense: number[] = [];
  const D = 4;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      for (let i = 0; i < D; i++)
        for (let j = 0; j < D; j++) {
          const a = i / D, b = j / D;
          const p00 = at(outerL, r, c), p10 = at(outerL, r + 1, c), p01 = at(outerL, r, c + 1), p11 = at(outerL, r + 1, c + 1);
          const q = p00.multiplyScalar((1 - a) * (1 - b)).addScaledVector(p10, a * (1 - b)).addScaledVector(p01, (1 - a) * b).addScaledVector(p11, a * b);
          const w = frame.world(q);
          dense.push(w.x, w.y, w.z);
        }
  return { geometry: g, outer: new Float32Array(dense), point };
}

/** Rounded cross-section: 1 in the middle, 0 at both edges. `p` below 1 makes it fuller. */
export const lens = (s: number, p: number) => Math.sin(Math.PI * Math.min(1, Math.max(0, s))) ** p;

/** Muscle and tendon colors with fiber stripes, a musculotendinous junction and an optional torn edge. */
export function fiberColor(muscleHex: string, tendonHex: string, junction: number, tornHex?: string) {
  const m = new THREE.Color(muscleHex), tn = new THREE.Color(tendonHex), red = tornHex ? new THREE.Color(tornHex) : null;
  return (t: number, s: number, out: THREE.Color) => {
    // The junction is ragged: the tendon starts a little later at the edges.
    const j = junction + 0.05 * Math.abs(2 * s - 1) + 0.012 * Math.sin(s * 29);
    const w = Math.min(1, Math.max(0, (t - j) / 0.05));
    out.copy(m).lerp(tn, w);
    const stripe = 1 + (1 - w * 0.6) * (0.07 * Math.sin(s * 150 + 2.5 * Math.sin(t * 9)) + 0.035 * Math.sin(s * 410 + t * 30));
    const edge = 0.82 + 0.18 * lens(s, 0.4);
    out.multiplyScalar(stripe * edge);
    if (red && t > 0.93) out.copy(red).lerp(tn, Math.max(0, 0.965 - t) * 20);
  };
}
