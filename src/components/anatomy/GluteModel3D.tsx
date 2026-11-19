"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import G from "./glute-landmarks.json";
import type { PartId, Stage, ViewId } from "./parts";

// Right hip, seen from outside, on CT-derived bone meshes (HuBMAP HRA,
// Visible Human Male, CC BY 4.0). Soft tissues are generated from landmarks
// measured on the trochanter by docs/3d/scripts/glute-landmarks.mjs.
// Frame (meters): +Y superior, +Z anterior, lateral of this right hip is -X.
// Before: gluteus medius and minimus torn off the trochanter and pulled up,
// bare footprint, irritated bursa. After: bursa removed, IT band window, and a
// double-row repair (2 inner-row and 2 outer-row anchors, crossing sutures).

const S = 40;
const MODEL_URL = "/models/hip.glb";

const BONE = "#e8e0cf";
const MUSCLE = "#b8574f";
const TENDON = "#f1e6d2";
const TEAR = "#ff4d4d";
const BARE = "#ff9b57";
const BURSA = "#f28db2";
const ITBAND = "#dfe8f2";
const ANCHOR = "#ffffff";
const SUTURE = "#3aa7f0";

type Facet = { center: number[]; normal: number[]; up: number[]; across: number[]; height: number; width: number };
const v = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);
const at = (f: Facet, u: number, w: number, lift = 0) =>
  v(f.center)
    .addScaledVector(v(f.up), u * f.height)
    .addScaledVector(v(f.across), w * f.width)
    .addScaledVector(v(f.normal), lift);

const LAT = G.lateral_facet as Facet;
const SUP = G.superoposterior_facet as Facet;
const ANT = G.anterior_facet as Facet;
const POST = G.posterior_facet as Facet;
const ORIGIN = v(G.gluteus_medius_origin);

/**
 * A muscle or tendon body between a top edge (Tp to Ta) and a bottom edge
 * (Bp to Ba), from t0 to t1 along the fibers. The cross-section is a lens:
 * thick in the middle, thin at the edges, bulging outward (away from the bone).
 */
function belly(surface: Surface, Tp: THREE.Vector3, Ta: THREE.Vector3, Bp: THREE.Vector3, Ba: THREE.Vector3, t0: number, t1: number, thick: (t: number) => number, bulge: number, arc: number, cols = 20, rows = 22) {
  const base = (t: number, s: number) => {
    // The origin edge arcs upward like a fan; the insertion edge stays straight.
    const top = Tp.clone().lerp(Ta, s).add(new THREE.Vector3(0, arc * Math.sin(s * Math.PI), 0));
    const q = top.lerp(Bp.clone().lerp(Ba, s), t ** 0.85);
    q.x -= Math.sin(t * Math.PI) * bulge * (1 - Math.abs(2 * s - 1) * 0.5);
    return q;
  };
  const out = (t: number, s: number) => {
    const e = 1e-3;
    const dt = base(Math.min(1, t + e), s).sub(base(Math.max(0, t - e), s));
    const ds = base(t, Math.min(1, s + e)).sub(base(t, Math.max(0, s - e)));
    const n = dt.cross(ds).normalize();
    return n.x > 0 ? n.negate() : n; // point laterally (-X), away from the bone
  };
  const pos: number[] = [];
  const grid = (sign: number, k: number) => {
    for (let r = 0; r <= rows; r++) {
      const t = t0 + ((t1 - t0) * r) / rows;
      for (let c = 0; c <= cols; c++) {
        const s = c / cols;
        const lens = Math.sqrt(Math.max(0, 1 - (2 * s - 1) ** 2));
        const q = base(t, s).addScaledVector(out(t, s), sign * k * thick(t) * lens);
        // Never inside the bone; toward the insertion, lie on it (the tendon drapes over the trochanter).
        const xs = surface(q.y, q.z);
        if (xs !== null) {
          const onBone = xs - 0.0007 - (sign > 0 ? thick(t) * lens : 0);
          // Drape only where the bone is close; over the gap above the joint, just stay outside it.
          const near = Math.abs(onBone - q.x) < 0.009;
          const w = near ? Math.min(1, Math.max(0, (t - 0.78) / 0.15)) : 0;
          q.x = (1 - w) * Math.min(q.x, onBone) + w * onBone;
        }
        pos.push(q.x, q.y, q.z);
      }
    }
  };
  grid(1, 1); // outer face
  grid(-1, 0.35); // inner face, flatter, against the bone
  const n = (rows + 1) * (cols + 1);
  const idx: number[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const a = r * (cols + 1) + c;
      const b = a + cols + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
      idx.push(n + a, n + a + 1, n + b, n + b, n + a + 1, n + b + 1);
    }
  // Close the end at t1 (the tendon end or the torn edge).
  for (let c = 0; c < cols; c++) {
    const a = rows * (cols + 1) + c;
    idx.push(a, n + a, a + 1, a + 1, n + a, n + a + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Lateral (-X) bone surface: x of the outermost bone at (y, z), or null off the bone. */
type Surface = (y: number, z: number) => number | null;

/** A height map of the outermost bone, binned from the mesh vertices (2.5 mm cells). */
function lateralSurface(nodes: THREE.Mesh[]): Surface {
  const CELL = 0.0025;
  const Y0 = -0.12, Z0 = -0.1, NY = 120, NZ = 80;
  const grid = new Float32Array(NY * NZ).fill(Infinity);
  const q = new THREE.Vector3();
  for (const node of nodes) {
    node.updateMatrix();
    const P = node.geometry.attributes.position;
    for (let i = 0; i < P.count; i++) {
      q.fromBufferAttribute(P, i).applyMatrix4(node.matrix);
      const iy = Math.floor((q.y - Y0) / CELL), iz = Math.floor((q.z - Z0) / CELL);
      if (iy < 0 || iy >= NY || iz < 0 || iz >= NZ) continue;
      const k = iy * NZ + iz;
      if (q.x < grid[k]) grid[k] = q.x;
    }
  }
  // Fill small gaps between vertices with the most lateral neighbor.
  const filled = grid.slice();
  for (let iy = 1; iy < NY - 1; iy++)
    for (let iz = 1; iz < NZ - 1; iz++) {
      const k = iy * NZ + iz;
      if (filled[k] !== Infinity) continue;
      let best = Infinity, n = 0;
      for (const d of [-NZ, NZ, -1, 1]) if (grid[k + d] !== Infinity) {
        best = Math.min(best, grid[k + d]);
        n++;
      }
      if (n >= 2) filled[k] = best;
    }
  // Smooth twice (3 x 3 mean over cells that have bone) so the tendons do not show steps.
  let cur = filled;
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
  // Bilinear lookup; null where any corner has no bone.
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

/** True when a point (femur frame, meters) lies on the tendon footprint of a facet. */
function onFootprint(q: THREE.Vector3, f: Facet, su: number, sw: number) {
  const d = q.clone().sub(v(f.center));
  if (Math.abs(d.dot(v(f.normal))) > 0.007) return false;
  const a = d.dot(v(f.up)) / (su * f.height * 0.5);
  const b = d.dot(v(f.across)) / (sw * f.width * 0.5);
  return a * a + b * b <= 1;
}
const FOOTPRINTS: [Facet, number, number][] = [
  [LAT, 1.0, 1.0],
  [SUP, 0.6, 0.7],
  [ANT, 0.65, 0.7],
];
const isFootprint = (q: THREE.Vector3) => FOOTPRINTS.some(([f, a, b]) => onFootprint(q, f, a, b));

/**
 * The femur with the footprint painted on: vertex colors, bone everywhere
 * except the bare footprint (orange) before surgery.
 */
function femurGeometry(node: THREE.Mesh, bare: boolean) {
  const g = node.geometry.clone();
  const P = g.attributes.position;
  node.updateMatrix();
  const colors = new Float32Array(P.count * 3);
  const bone = new THREE.Color(BONE);
  const orange = new THREE.Color(BARE);
  const q = new THREE.Vector3();
  for (let i = 0; i < P.count; i++) {
    q.fromBufferAttribute(P, i).applyMatrix4(node.matrix);
    (bare && isFootprint(q) ? orange : bone).toArray(colors, i * 3);
  }
  g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return g;
}

type PartProps = {
  id: PartId;
  selected: PartId | null;
  onSelect: (id: PartId) => void;
  color: string;
  opacity?: number;
  geometry?: THREE.BufferGeometry;
  position?: THREE.Vector3;
  quaternion?: THREE.Quaternion;
  scale?: THREE.Vector3;
  children?: React.ReactNode;
  roughness?: number;
  side?: THREE.Side;
  renderOrder?: number;
  vertexColors?: boolean;
  /** Pick a different part from where the click landed (scene frame, meters). */
  pickAt?: (q: THREE.Vector3) => PartId;
};

function Part({ id, selected, onSelect, color, opacity = 1, geometry, position, quaternion, scale, children, roughness = 0.62, side, renderOrder, vertexColors, pickAt }: PartProps) {
  const active = selected === id;
  const [hover, setHover] = useState(false);
  return (
    <mesh
      geometry={geometry}
      position={position}
      quaternion={quaternion}
      scale={scale}
      renderOrder={renderOrder}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(pickAt ? pickAt(e.point.clone().divideScalar(S)) : id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHover(false);
        document.body.style.cursor = "";
      }}
    >
      {children}
      <meshStandardMaterial
        color={vertexColors ? "#ffffff" : color}
        vertexColors={vertexColors}
        roughness={roughness}
        metalness={0.02}
        transparent={opacity < 1}
        opacity={opacity}
        depthWrite={opacity >= 1}
        side={side ?? THREE.DoubleSide}
        emissive={color}
        emissiveIntensity={active ? 0.38 : hover ? 0.18 : 0}
      />
    </mesh>
  );
}

function Scene({ selected, onSelect, stage, hideItBand }: { selected: PartId | null; onSelect: (id: PartId) => void; stage: Stage; hideItBand: boolean }) {
  const { nodes } = useGLTF(MODEL_URL, false, true) as unknown as { nodes: Record<string, THREE.Mesh> };
  const p = { selected, onSelect };
  const torn = stage === "before";

  const geo = useMemo(() => {
    const surface = lateralSurface([nodes.pelvis, nodes.femur]);
    const snap = (q: THREE.Vector3, lift: number) => {
      const xs = surface(q.y, q.z);
      return xs === null ? q : new THREE.Vector3(xs - lift, q.y, q.z);
    };
    // How far the torn tendons have pulled up (retracted), in meters.
    const RETRACT = 0.02;
    const pull = (q: THREE.Vector3) => q.clone().add(new THREE.Vector3(-0.004, RETRACT, 0));

    // Gluteus medius: broad origin on the outer ilium, inserting on the
    // superoposterior facet (back fibers) and the lateral facet (front fibers).
    const medTp = ORIGIN.clone().add(new THREE.Vector3(-0.006, 0.03, -0.06));
    const medTa = ORIGIN.clone().add(new THREE.Vector3(-0.012, -0.004, 0.05));
    const medBp = v(SUP.center).add(new THREE.Vector3(-0.002, 0.002, -0.012));
    const medBa = v(LAT.center).add(new THREE.Vector3(-0.004, 0.004, 0.016));
    // Repaired: the tendon is pressed down over the whole footprint, past the outer-row anchors.
    const medBpFixed = v(SUP.center).add(new THREE.Vector3(-0.004, -0.01, -0.012));
    const medBaFixed = v(LAT.center).add(new THREE.Vector3(-0.004, -0.016, 0.014));
    const medThick = (t: number) => 0.0012 + 0.0075 * Math.sin(Math.min(1, t * 1.25) * Math.PI) ** 0.8 * (1 - t * 0.6);

    // Gluteus minimus: deeper and more forward, from lower on the ilium to the anterior facet.
    const minTp = ORIGIN.clone().add(new THREE.Vector3(-0.003, -0.016, -0.012));
    const minTa = ORIGIN.clone().add(new THREE.Vector3(-0.004, -0.03, 0.04));
    const minBp = v(ANT.center).add(new THREE.Vector3(-0.003, 0.004, -0.01));
    const minBa = v(ANT.center).add(new THREE.Vector3(-0.001, -0.002, 0.012));
    const minThick = (t: number) => 0.001 + 0.004 * Math.sin(Math.min(1, t * 1.2) * Math.PI) * (1 - t * 0.6);

    const MUSCLE_END = 0.7; // where muscle becomes tendon along the fibers

    // IT band: a vertical sheet over the outside of the hip, lateral to the tendons.
    const bandX = Math.min(LAT.center[0], POST.center[0]) - 0.014;
    const bandZ = LAT.center[2] + 0.004;
    const band = (window: boolean) => {
      const cols = 10;
      const rows = 24;
      const y0 = G.greater_trochanter_tip[1] + 0.07;
      const y1 = G.greater_trochanter_tip[1] - 0.13;
      const pos: number[] = [];
      for (let r = 0; r <= rows; r++)
        for (let c = 0; c <= cols; c++) {
          const y = y0 + ((y1 - y0) * r) / rows;
          const s = c / cols - 0.5;
          const z = bandZ + s * 0.05;
          const x = bandX - Math.cos(s * Math.PI) * 0.004 + Math.max(0, 1 - Math.abs(y - LAT.center[1]) / 0.06) * -0.004;
          pos.push(x, y, z);
        }
      const idx: number[] = [];
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          // The fasciotomy: a small window over the trochanter.
          const y = y0 + ((y1 - y0) * (r + 0.5)) / rows;
          if (window && Math.abs(y - LAT.center[1] - 0.006) < 0.017 && c >= 3 && c < 7) continue;
          const a = r * (cols + 1) + c;
          const b = a + cols + 1;
          idx.push(a, b, a + 1, b, b + 1, a + 1);
        }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.setIndex(idx);
      g.computeVertexNormals();
      return g;
    };

    // Anchors: inner row near the top of the footprint, outer row lower down.
    const anchors = [at(LAT, 0.32, -0.22), at(LAT, 0.32, 0.26), at(LAT, -0.42, -0.26), at(LAT, -0.42, 0.24)].map((a) => snap(a, 0.0032));
    const suture = (a: THREE.Vector3, b: THREE.Vector3) => {
      const mid = snap(a.clone().lerp(b, 0.5), 0.0036);
      return new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, mid, b), 16, 0.0006, 6, false);
    };
    const sutures = [suture(anchors[0], anchors[3]), suture(anchors[1], anchors[2]), suture(anchors[0], anchors[2]), suture(anchors[1], anchors[3])];

    const torn = (a: THREE.Vector3) => pull(a);
    const med = (b0: THREE.Vector3, b1: THREE.Vector3, t0: number, t1: number) => belly(surface, medTp, medTa, b0, b1, t0, t1, medThick, 0.011, 0.022);
    const min = (b0: THREE.Vector3, b1: THREE.Vector3, t0: number, t1: number) => belly(surface, minTp, minTa, b0, b1, t0, t1, minThick, 0.005, 0.01, 14, 16);

    return {
      medMuscle: med(medBpFixed, medBaFixed, 0, MUSCLE_END),
      medTendon: med(medBpFixed, medBaFixed, MUSCLE_END, 1),
      medMuscleTorn: med(torn(medBp), torn(medBa), 0, MUSCLE_END),
      medTendonTorn: med(torn(medBp), torn(medBa), MUSCLE_END, 0.96),
      medEdge: med(torn(medBp), torn(medBa), 0.96, 1),
      minMuscle: min(minBp, minBa, 0, MUSCLE_END),
      minTendon: min(minBp, minBa, MUSCLE_END, 1),
      minMuscleTorn: min(torn(minBp), torn(minBa), 0, MUSCLE_END),
      minTendonTorn: min(torn(minBp), torn(minBa), MUSCLE_END, 0.95),
      minEdge: min(torn(minBp), torn(minBa), 0.95, 1),
      bandWhole: band(false),
      bandWindow: band(true),
      anchors,
      sutures,
      bursa: snap(at(LAT, 0.0, 0).add(new THREE.Vector3(0, 0, -0.004)), 0.0075),
    };
  }, [nodes]);

  const femurBare = useMemo(() => femurGeometry(nodes.femur, true), [nodes.femur]);
  const femurCovered = useMemo(() => femurGeometry(nodes.femur, false), [nodes.femur]);
  const bursaQ = useMemo(() => new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(v(LAT.across), v(LAT.up), v(LAT.normal))), []);

  return (
    <group scale={S}>
      {/* The pelvis is context only: it has no part of its own in the list. */}
      <mesh geometry={nodes.pelvis.geometry} position={nodes.pelvis.position} quaternion={nodes.pelvis.quaternion} scale={nodes.pelvis.scale}>
        <meshStandardMaterial color={BONE} roughness={0.75} metalness={0.02} />
      </mesh>
      <Part
        {...p}
        id="greater-trochanter"
        color={BONE}
        vertexColors
        geometry={torn ? femurBare : femurCovered}
        position={nodes.femur.position}
        quaternion={nodes.femur.quaternion}
        scale={nodes.femur.scale}
        roughness={0.75}
        side={THREE.FrontSide}
        pickAt={(q) => (torn && isFootprint(q) ? "footprint" : "greater-trochanter")}
      />

      {torn ? (
        <>
          <Part {...p} id="gluteus-minimus" color={MUSCLE} geometry={geo.minMuscleTorn} opacity={0.95} />
          <Part {...p} id="gluteus-minimus" color={TENDON} geometry={geo.minTendonTorn} />
          <Part {...p} id="gluteus-minimus" color={TEAR} geometry={geo.minEdge} />
          <Part {...p} id="gluteus-medius" color={MUSCLE} geometry={geo.medMuscleTorn} opacity={0.95} />
          <Part {...p} id="gluteus-medius" color={TENDON} geometry={geo.medTendonTorn} />
          <Part {...p} id="gluteus-medius" color={TEAR} geometry={geo.medEdge} />
          <Part {...p} id="bursa" color={BURSA} position={geo.bursa} quaternion={bursaQ} scale={new THREE.Vector3(0.009, 0.014, 0.005)} opacity={0.85}>
            <sphereGeometry args={[1, 24, 16]} />
          </Part>
        </>
      ) : (
        <>
          <Part {...p} id="gluteus-minimus" color={MUSCLE} geometry={geo.minMuscle} opacity={0.95} />
          <Part {...p} id="gluteus-minimus" color={TENDON} geometry={geo.minTendon} />
          <Part {...p} id="gluteus-medius" color={MUSCLE} geometry={geo.medMuscle} opacity={0.95} />
          <Part {...p} id="gluteus-medius" color={TENDON} geometry={geo.medTendon} />
          {geo.anchors.map((a, i) => (
            <Part key={i} {...p} id="anchors" color={ANCHOR} position={a}>
              <sphereGeometry args={[0.0016, 16, 12]} />
            </Part>
          ))}
          {geo.sutures.map((g, i) => (
            <Part key={`s${i}`} {...p} id="anchors" color={SUTURE} geometry={g} roughness={0.4} />
          ))}
        </>
      )}

      {!hideItBand && <Part {...p} id="it-band" color={ITBAND} geometry={torn ? geo.bandWhole : geo.bandWindow} opacity={0.4} renderOrder={2} />}
    </group>
  );
}

// Camera presets in scaled scene units, aimed at the greater trochanter.
const T = v(G.greater_trochanter_tip).multiplyScalar(S);
const TARGET: [number, number, number] = [T.x, T.y + 0.6, T.z];
const CAMERAS: Record<ViewId, [number, number, number]> = {
  side: [T.x - 15, T.y + 1.5, T.z + 2],
  back: [T.x - 3, T.y + 1.5, T.z - 15],
  front: [T.x - 3, T.y + 1.5, T.z + 15],
};

function CameraRig({ view, controls }: { view: ViewId; controls: React.RefObject<OrbitControlsImpl | null> }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(...CAMERAS[view]);
    controls.current?.target.set(...TARGET);
    controls.current?.update();
  }, [view, camera, controls]);
  return null;
}

export default function GluteModel3D({
  selected,
  onSelect,
  stage,
  view,
  hideItBand,
}: {
  selected: PartId | null;
  onSelect: (id: PartId) => void;
  stage: Stage;
  view: ViewId;
  hideItBand: boolean;
}) {
  const controls = useRef<OrbitControlsImpl | null>(null);
  return (
    <Canvas camera={{ position: CAMERAS.side, fov: 34, near: 0.05, far: 200 }} dpr={[1, 2]} gl={{ antialias: true, preserveDrawingBuffer: true }} aria-hidden="true">
      <color attach="background" args={["#1d2440"]} />
      <hemisphereLight args={["#ffffff", "#3a4366", 0.8]} />
      <directionalLight position={[-10, 8, 6]} intensity={1.6} />
      <directionalLight position={[6, -2, -8]} intensity={0.45} />
      <Suspense fallback={null}>
        <Scene selected={selected} onSelect={onSelect} stage={stage} hideItBand={hideItBand} />
      </Suspense>
      <OrbitControls ref={controls} makeDefault enablePan={false} minDistance={4} maxDistance={30} />
      <CameraRig view={view} controls={controls} />
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL, false, true);
