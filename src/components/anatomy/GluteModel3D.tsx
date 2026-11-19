"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import G from "./glute-landmarks.json";
import {
  ANCHOR,
  BARE,
  BONE,
  BURSA,
  ITBAND,
  LAT,
  MED_MUSCLE,
  MIN_MUSCLE,
  SUTURE,
  buildSoftTissue,
  isFootprint,
  v,
} from "./gluteTissue";
import type { PartId, Stage, ViewId } from "./parts";

// Right hip, seen from outside, on CT-derived bone meshes (HuBMAP HRA,
// Visible Human Male, CC BY 4.0). The muscles, tendons, IT band and repair
// are built in gluteTissue.ts. Before: gluteus medius and minimus torn off the
// trochanter and pulled up, bare footprint, irritated bursa. After: bursa
// removed, IT band window, both tendons back on the footprint with a
// double-row repair (2 inner-row and 2 outer-row anchors, sutures crossing
// over both tendons). Picking the minimus fades the medius over it.

const S = 40;
const MODEL_URL = "/models/hip.glb";

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

function Part({
  id,
  selected,
  onSelect,
  color,
  opacity = 1,
  geometry,
  position,
  quaternion,
  scale,
  children,
  roughness = 0.62,
  side,
  renderOrder,
  vertexColors,
  pickAt,
}: PartProps) {
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
        emissiveIntensity={active ? 0.22 : hover ? 0.12 : 0}
      />
    </mesh>
  );
}

function useSoftTissue(nodes: Record<string, THREE.Mesh>) {
  return useMemo(() => buildSoftTissue(nodes.pelvis, nodes.femur), [nodes]);
}

type LabelSpot = { el: HTMLDivElement | null; at: THREE.Vector3 | null };

/** Moves the DOM labels over their 3D points every frame (hidden when behind the camera). */
function LabelTracker({ spots }: { spots: React.RefObject<LabelSpot[]> }) {
  const { camera, size } = useThree();
  const q = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    for (const s of spots.current ?? []) {
      if (!s.el) continue;
      if (!s.at) {
        s.el.style.display = "none";
        continue;
      }
      q.copy(s.at).multiplyScalar(S).project(camera);
      s.el.style.display = q.z < 1 ? "block" : "none";
      s.el.style.transform = `translate(-50%, -50%) translate(${((q.x + 1) / 2) * size.width}px, ${((1 - q.y) / 2) * size.height}px)`;
    }
  });
  return null;
}

function Scene({
  selected,
  onSelect,
  stage,
  view,
  hideItBand,
  spots,
}: {
  selected: PartId | null;
  onSelect: (id: PartId) => void;
  stage: Stage;
  view: ViewId;
  hideItBand: boolean;
  spots: React.RefObject<LabelSpot[]>;
}) {
  const { nodes } = useGLTF(MODEL_URL, false, true) as unknown as {
    nodes: Record<string, THREE.Mesh>;
  };
  const p = { selected, onSelect };
  const torn = stage === "before";
  const geo = useSoftTissue(nodes);
  const st = torn ? geo.before : geo.after;
  const labels = torn ? geo.labels.before : geo.labels.after;
  useEffect(() => {
    const [med, min] = spots.current ?? [];
    if (med) med.at = labels.med;
    // The minimus is hidden behind the hip in the back view.
    if (min) min.at = view === "back" ? null : labels.min;
  }, [labels, view, spots]);
  // Picking the minimus fades the medius over it so it can be seen.
  const medOpacity = selected === "gluteus-minimus" ? 0.2 : 1;

  const femurBare = useMemo(
    () => femurGeometry(nodes.femur, true),
    [nodes.femur],
  );
  const femurCovered = useMemo(
    () => femurGeometry(nodes.femur, false),
    [nodes.femur],
  );
  const bursaQ = useMemo(
    () =>
      new THREE.Quaternion().setFromRotationMatrix(
        new THREE.Matrix4().makeBasis(v(LAT.across), v(LAT.up), v(LAT.normal)),
      ),
    [],
  );

  return (
    <group scale={S}>
      {/* The pelvis is context only: it has no part of its own in the list. */}
      <mesh
        geometry={nodes.pelvis.geometry}
        position={nodes.pelvis.position}
        quaternion={nodes.pelvis.quaternion}
        scale={nodes.pelvis.scale}
      >
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
        pickAt={(q) =>
          torn && isFootprint(q) ? "footprint" : "greater-trochanter"
        }
      />

      <Part
        {...p}
        id="gluteus-minimus"
        color={MIN_MUSCLE}
        vertexColors
        geometry={st.min.geometry}
        roughness={0.5}
        side={THREE.FrontSide}
      />
      {/* Remount when fading so the material switches to transparent. */}
      <Part
        key={medOpacity}
        {...p}
        id="gluteus-medius"
        color={MED_MUSCLE}
        vertexColors
        geometry={st.med.geometry}
        roughness={0.5}
        side={THREE.FrontSide}
        opacity={medOpacity}
        renderOrder={1}
      />

      {torn ? (
        <Part
          {...p}
          id="bursa"
          color={BURSA}
          position={geo.bursa}
          quaternion={bursaQ}
          scale={new THREE.Vector3(0.009, 0.014, 0.005)}
          opacity={0.85}
        >
          <sphereGeometry args={[1, 24, 16]} />
        </Part>
      ) : (
        <>
          {[...geo.knots, ...geo.anchors].map((a, i) => (
            <Part key={i} {...p} id="anchors" color={ANCHOR} position={a}>
              <sphereGeometry args={[0.0017, 16, 12]} />
            </Part>
          ))}
          {geo.sutures.map((g, i) => (
            <Part
              key={`s${i}`}
              {...p}
              id="anchors"
              color={SUTURE}
              geometry={g}
              roughness={0.4}
            />
          ))}
        </>
      )}

      {!hideItBand && (
        <Part
          {...p}
          id="it-band"
          color={ITBAND}
          geometry={torn ? geo.bandWhole : geo.bandWindow}
          opacity={0.4}
          renderOrder={2}
        />
      )}

      <LabelTracker spots={spots} />
    </group>
  );
}

// Camera presets in scaled scene units, aimed at the greater trochanter.
const T = v(G.greater_trochanter_tip).multiplyScalar(S);
const TARGET: [number, number, number] = [T.x, T.y + 0.6, T.z];
const CAMERAS: Record<ViewId, [number, number, number]> = {
  side: [T.x - 14.5, T.y + 1.5, T.z + 6],
  back: [T.x - 3, T.y + 1.5, T.z - 15],
  front: [T.x - 3, T.y + 1.5, T.z + 15],
};

function CameraRig({
  view,
  controls,
}: {
  view: ViewId;
  controls: React.RefObject<OrbitControlsImpl | null>;
}) {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(...CAMERAS[view]);
    controls.current?.target.set(...TARGET);
    controls.current?.update();
  }, [view, camera, controls]);
  return null;
}

const LABELS = ["Gluteus medius", "Gluteus minimus"];

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
  const spots = useRef<LabelSpot[]>([
    { el: null, at: null },
    { el: null, at: null },
  ]);
  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{ position: CAMERAS.side, fov: 34, near: 0.05, far: 200 }}
        dpr={[1, 2]}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        aria-hidden="true"
      >
        <color attach="background" args={["#1d2440"]} />
        <hemisphereLight args={["#ffffff", "#3a4366", 0.8]} />
        <directionalLight position={[-10, 8, 6]} intensity={1.6} />
        <directionalLight position={[6, -2, -8]} intensity={0.45} />
        <Suspense fallback={null}>
          <Scene
            selected={selected}
            onSelect={onSelect}
            stage={stage}
            view={view}
            hideItBand={hideItBand}
            spots={spots}
          />
        </Suspense>
        <OrbitControls
          ref={controls}
          makeDefault
          enablePan={false}
          minDistance={4}
          maxDistance={30}
        />
        <CameraRig view={view} controls={controls} />
      </Canvas>
      {LABELS.map((text, i) => (
        <div
          key={text}
          ref={(el) => {
            spots.current[i].el = el;
          }}
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 hidden whitespace-nowrap rounded-md bg-[#0b1020]/80 px-2 py-0.5 text-[15px] font-semibold text-white"
        >
          {text}
        </div>
      ))}
    </div>
  );
}

useGLTF.preload(MODEL_URL, false, true);
