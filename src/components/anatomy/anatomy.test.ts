import { describe, expect, it } from "vitest";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { ANATOMY } from "@/content";
import G from "./glute-landmarks.json";
import { PARTS, STAGE_NOTE } from "./parts";

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
});
