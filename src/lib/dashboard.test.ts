import { describe, expect, it } from "vitest";
import { addDays } from "date-fns";
import { dashboardModel } from "./dashboard";

// Scope 6.3: dashboards for both procedures must match the protocol and the
// decisions of 10/31/2026 at days 1, 18, 30, 45, 70, 100 and 130.
// Running and high impact (6 months) is in Coming up, not a tile.

const surgery = new Date(2026, 9, 13); // 10/13/2026
const at = (day: number, p: "standard" | "max-transfer") => dashboardModel(surgery, addDays(surgery, day), p)!;
const tile = (m: ReturnType<typeof at>, label: string) => m.tiles.find((t) => t.label === label)?.value;

type Row = [day: number, phase: number | null, week: number, crutches: string, brace: string, sittingOrPool: string, driving: string];

// Tiles from the approved After screen: crutches or walker, brace, sitting (Phase I) or pool therapy, driving.
const EXPECTED: Record<"standard" | "max-transfer", Row[]> = {
  standard: [
    [1, 1, 1, "27 days left", "41 days left", "90°", "Not yet"],
    [18, 1, 3, "10 days left", "24 days left", "90°", "Not yet"], // the design example
    [30, 1, 5, "Done", "12 days left", "90°", "When ready"],
    [45, 2, 7, "Done", "Done", "Allowed", "When ready"],
    [70, 3, 11, "Done", "Done", "Allowed", "When ready"],
    [100, 3, 15, "Done", "Done", "Allowed", "When ready"],
    [130, 4, 19, "Done", "Done", "Allowed", "When ready"],
  ],
  "max-transfer": [
    [1, 1, 1, "At least 41 days left", "At least 41 days left", "90°", "Not yet"],
    [18, 1, 3, "At least 24 days left", "At least 24 days left", "90°", "Not yet"],
    [30, 1, 5, "At least 12 days left", "At least 12 days left", "90°", "When ready"],
    [45, 2, 7, "Done", "6 to 8 weeks", "Allowed", "When ready"],
    [70, 3, 11, "Done", "Done", "Allowed", "When ready"],
    [100, 3, 15, "Done", "Done", "Allowed", "When ready"],
    [130, null, 19, "Done", "Done", "Allowed", "When ready"], // no Phase IV after a transfer (11/21/2026)
  ],
};

for (const [proc, rows] of Object.entries(EXPECTED) as [keyof typeof EXPECTED, Row[]][]) {
  describe(`${proc} dashboard`, () => {
    for (const [day, phase, week, crutches, brace, sitting, driving] of rows) {
      it(`day ${day}: phase ${phase}, week ${week}`, () => {
        const m = at(day, proc);
        expect(m.phase?.n ?? null).toBe(phase);
        expect(m.week).toBe(week);
        expect(tile(m, "Crutches or walker")).toBe(crutches);
        expect(tile(m, "Brace")).toBe(brace);
        expect(tile(m, "Sitting") ?? tile(m, "Pool therapy")).toBe(sitting);
        expect(tile(m, "Driving")).toBe(driving);
      });
    }
  });
}

describe("dashboard details", () => {
  it("returns nothing before surgery", () => {
    expect(dashboardModel(surgery, addDays(surgery, -3), "standard")).toBeNull();
  });

  it("words the tiles as on the approved After screen", () => {
    const n = (m: ReturnType<typeof at>, l: string) => m.tiles.find((t) => t.label === l)?.note;
    expect(n(at(18, "standard"), "Crutches or walker")).toBe("20 lb foot flat. Then a cane if you need one.");
    expect(n(at(18, "standard"), "Brace")).toBe("Wear it when walking.");
    expect(n(at(18, "max-transfer"), "Crutches or walker")).toMatch(/^20 lb foot flat\. Weight bearing as tolerated/);
    expect(n(at(18, "max-transfer"), "Brace")).toBe("6 to 8 weeks in all, depending on your comfort and function. Wear it when walking.");
  });

  it("marks phases done, current and next", () => {
    expect(at(45, "standard").phases.map((p) => p.state)).toEqual(["done", "current", "next", "next"]);
  });

  it("switches to the home program after Phase IV", () => {
    const m = at(200, "standard");
    expect(m.phase).toBeNull();
    expect(m.phases.every((p) => p.state === "done")).toBe(true);
  });
});

describe("after the formal phases (decision 11/21/2026)", () => {
  it("tells transfer patients their therapist guides them after Phase III, with the 6-month limit", () => {
    expect(at(130, "max-transfer").afterPhases).toMatch(/^After Phase III, your therapist guides your return to activity\. No running or high-impact activity before 6 months\./);
    expect(at(200, "standard").afterPhases).toBe("Continue your home exercise program through 1 year.");
  });

  it("labels the 6-month dates as the earliest for transfer patients", () => {
    const labels = at(100, "max-transfer").upcoming.map((u) => u.label);
    expect(labels).toContain("Earliest running, high impact, agility and jumping (your therapist decides)");
    expect(at(100, "standard").upcoming.map((u) => u.label)).toContain("Running, high impact, agility and jumping can begin");
  });
});
