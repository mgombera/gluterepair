import { describe, expect, it } from "vitest";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { ANATOMY } from "@/content";
import G from "./glute-landmarks.json";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { LAT, buildSoftTissue } from "./gluteTissue";
import { PARTS, STAGE_NOTE } from "./parts";
import { hull } from "./softTissue";

// Scope 6.7: the gluteus model on CT-derived bones, with a part list that
// matches the approved anatomy text.

const root = join(__dirname, "..", "..", "..");

describe("anatomy model", () => {
  it("lists exactly the approved anatomy parts, with a note for each stage", () => {
    expect([...PARTS].sort()).toEqual(ANATOMY.map((a) => a.id).sort());
    for (const stage of ["before", "after"] as const) for (const p of PARTS) expect(STAGE_NOTE[stage][p], `${stage} ${p}`).toBeTruthy();
  });

  it("measures the trochanter facets from the CT femur", () => {
    for (const f of [G.lateral_facet, G.superoposterior_facet, G.anterior_facet, G.posterior_facet]) {
      expect(f.vertices).toBeGreaterThan(50);
      expect(Math.hypot(...f.normal)).toBeCloseTo(1, 2);
      // Every facet is on the outside (-X) of this right hip.
      expect(f.normal[0]).toBeLessThan(0);
    }
    // The lateral facet faces out; the anterior facet faces forward; the posterior one faces back.
    expect(G.lateral_facet.normal[0]).toBeLessThan(-0.8);
    expect(G.anterior_facet.normal[2]).toBeGreaterThan(0.5);
    expect(G.posterior_facet.normal[2]).toBeLessThan(-0.5);
    expect(G._source).toMatch(/CC BY 4\.0/);
  });

  it("keeps the model file at 3 MB or less and credits HuBMAP under the model", () => {
    expect(statSync(join(root, "public", "models", "hip.glb")).size).toBeLessThanOrEqual(3 * 1024 * 1024);
    const page = readFileSync(join(root, "src", "app", "anatomy", "page.tsx"), "utf8");
    expect(page).toMatch(/HuBMAP Human Reference Atlas/);
    expect(page).toMatch(/CC BY 4\.0/);
  });

  it("loads the model only on the anatomy page", () => {
    const layout = readFileSync(join(root, "src", "app", "layout.tsx"), "utf8");
    expect(layout).not.toMatch(/anatomy|GluteModel/);
  });

  it("pulls a muscle taut over bumps (upper hull)", () => {
    expect(hull([0, 0.5, 1], [1, 0, 1])).toEqual([1, 1, 1]);
    expect(hull([0, 0.5, 1], [0, 2, 0])).toEqual([0, 2, 0]);
  });

  it("builds the medius over the minimus, both repaired onto the footprint, torn ones pulled up", async () => {
    const buf = readFileSync(join(root, "public", "models", "hip.glb"));
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    const gltf = await new Promise<{ scene: THREE.Object3D }>((res, rej) =>
      loader.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer, "", res, rej),
    );
    const nodes: Record<string, THREE.Mesh> = {};
    gltf.scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) nodes[o.name] = o as THREE.Mesh;
    });
    const T = buildSoftTissue(nodes.pelvis, nodes.femur);
    const box = (g: THREE.BufferGeometry) => {
      expect(Array.from(g.attributes.position.array).every(Number.isFinite)).toBe(true);
      g.computeBoundingBox();
      return g.boundingBox!;
    };
    for (const st of [T.before, T.after]) {
      // The medius has more bulk than the minimus.
      const med = box(st.med.geometry), min = box(st.min.geometry);
      expect(med.max.y - med.min.y).toBeGreaterThan(min.max.y - min.min.y);
    }
    // After repair both tendons reach down onto the lateral facet level.
    expect(box(T.after.med.geometry).min.y).toBeLessThan(LAT.center[1]);
    expect(box(T.after.min.geometry).min.y).toBeLessThan(LAT.center[1]);
    // Before surgery the torn ends sit at least 2 cm higher.
    expect(box(T.before.med.geometry).min.y - box(T.after.med.geometry).min.y).toBeGreaterThan(0.02);
    expect(box(T.before.min.geometry).min.y - box(T.after.min.geometry).min.y).toBeGreaterThan(0.02);
    // Two inner-row and two outer-row anchors, four crossing sutures.
    expect(T.knots).toHaveLength(2);
    expect(T.anchors).toHaveLength(2);
    expect(T.sutures).toHaveLength(4);
    // The inner row is higher than the outer row.
    for (const k of T.knots) for (const a of T.anchors) expect(k.y).toBeGreaterThan(a.y);
  });
});
