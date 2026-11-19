// Builds the gluteus soft tissue in Node and prints its bounds (a quick check
// while tuning src/components/anatomy/gluteTissue.ts).
// Usage: npx vite-node docs/3d/scripts/glute-tissue-check.ts
import { readFileSync } from "node:fs";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { buildSoftTissue } from "../../../src/components/anatomy/gluteTissue";
const buf = readFileSync("public/models/hip.glb");
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const gltf: any = await new Promise((res, rej) => loader.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), "", res, rej));
const nodes: Record<string, THREE.Mesh> = {};
gltf.scene.traverse((o: any) => o.isMesh && (nodes[o.name] = o));
const t0 = Date.now();
const T = buildSoftTissue(nodes.pelvis, nodes.femur);
console.log("built in", Date.now() - t0, "ms");
const box = (g: THREE.BufferGeometry) => { g.computeBoundingBox(); const b = g.boundingBox!; const P = g.attributes.position; let nan = 0; for (let i = 0; i < P.array.length; i++) if (!Number.isFinite(P.array[i])) nan++; return { min: b.min.toArray().map(x=>+x.toFixed(3)), max: b.max.toArray().map(x=>+x.toFixed(3)), nan }; };
for (const st of ["before", "after"] as const) { console.log(st, "med", box(T[st].med.geometry), "min", box(T[st].min.geometry)); }
console.log("labels", JSON.stringify(T.labels));
console.log("knots", T.knots.map(p=>p.toArray().map(x=>+x.toFixed(4))), "anchors", T.anchors.map(p=>p.toArray().map(x=>+x.toFixed(4))));
