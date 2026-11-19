// Derive greater trochanter landmarks for the gluteus model from the CT femur
// in public/models/hip.glb (HuBMAP HRA, Visible Human Male, CC BY 4.0).
// Frame (meters): +Y superior, +Z anterior, lateral of this right hip is -X.
// Usage: node docs/3d/scripts/glute-landmarks.mjs > src/components/anatomy/glute-landmarks.json

import { readFileSync } from "node:fs";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

const root = new URL("../../../", import.meta.url);
const L = JSON.parse(readFileSync(new URL("src/components/anatomy/hip-landmarks.json", root)));
const buf = readFileSync(new URL("public/models/hip.glb", root));
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const gltf = await new Promise((res, rej) => loader.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), "", res, rej));

let femur;
gltf.scene.traverse((o) => {
  if (o.isMesh && o.name === "femur") femur = o;
});
femur.updateWorldMatrix(true, false);
// Positions are quantized (meshopt, normalized Int16): expand to floats before transforming.
const q = femur.geometry.attributes.position;
const f = new Float32Array(q.count * 3);
for (let i = 0; i < q.count; i++) new THREE.Vector3().fromBufferAttribute(q, i).toArray(f, i * 3);
const g = new THREE.BufferGeometry();
g.setAttribute("position", new THREE.BufferAttribute(f, 3));
g.setIndex(femur.geometry.index);
g.applyMatrix4(femur.matrixWorld);
g.computeVertexNormals();
const P = g.attributes.position, N = g.attributes.normal;
const tip = new THREE.Vector3(...L.greater_trochanter_tip);

// Vertices on the trochanter: within 45 mm below and 8 mm above the tip, lateral to the neck.
const pts = [];
for (let i = 0; i < P.count; i++) {
  const p = new THREE.Vector3().fromBufferAttribute(P, i);
  const n = new THREE.Vector3().fromBufferAttribute(N, i);
  if (p.y < tip.y - 0.045 || p.y > tip.y + 0.008) continue;
  if (p.x > tip.x + 0.016) continue;
  pts.push({ p, n });
}

// A facet is the trochanter surface whose normal points along `dir`.
function facet(dir, minDot, yMin = -Infinity, yMax = Infinity) {
  const d = new THREE.Vector3(...dir).normalize();
  const sel = pts.filter(({ p, n }) => n.dot(d) > minDot && p.y >= tip.y + yMin && p.y <= tip.y + yMax);
  const c = new THREE.Vector3();
  const nm = new THREE.Vector3();
  sel.forEach(({ p, n }) => {
    c.add(p);
    nm.add(n);
  });
  c.divideScalar(sel.length);
  nm.normalize();
  // Spread: extent along the two in-plane axes.
  const u = new THREE.Vector3(0, 1, 0).projectOnPlane(nm).normalize();
  const w = nm.clone().cross(u).normalize();
  const su = sel.map(({ p }) => p.clone().sub(c).dot(u));
  const sw = sel.map(({ p }) => p.clone().sub(c).dot(w));
  const r = (a) => +a.toFixed(5);
  return {
    center: c.toArray().map(r),
    normal: nm.toArray().map(r),
    up: u.toArray().map(r),
    across: w.toArray().map(r),
    height: r(Math.max(...su) - Math.min(...su)),
    width: r(Math.max(...sw) - Math.min(...sw)),
    vertices: sel.length,
  };
}

const out = {
  // Gluteus medius main insertion: the lateral facet, facing laterally.
  lateral_facet: facet([-1, -0.1, 0], 0.8, -0.035, -0.004),
  // Gluteus medius posterior insertion: the superoposterior facet, near the tip, facing up and back.
  superoposterior_facet: facet([-0.45, 0.65, -0.6], 0.6, -0.012, 0.008),
  // Gluteus minimus insertion: the anterior facet, facing forward and out.
  anterior_facet: facet([-0.55, 0, 0.83], 0.75, -0.035, -0.002),
  // Trochanteric bursa: over the posterior facet and back of the lateral facet.
  posterior_facet: facet([-0.5, 0, -0.86], 0.75, -0.035, 0),
  greater_trochanter_tip: L.greater_trochanter_tip,
  gluteus_medius_origin: L.gluteus_medius_origin,
  iliac_crest_top: L.iliac_crest_top,
  anterior_superior_iliac_spine: L.anterior_superior_iliac_spine,
  femoral_shaft_axis: L.femoral_shaft_axis,
  _source:
    "Derived by docs/3d/scripts/glute-landmarks.mjs from public/models/hip.glb (HuBMAP HRA CCF 3D Reference Object Library v1.4, Visible Human Male, CC BY 4.0). Units: meters. +Y superior, +Z anterior, lateral of this right hip is -X. Origin at the femoral head center.",
};
console.log(JSON.stringify(out, null, 1));
