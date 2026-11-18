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
    [1, 1, 1, "27 days", "41 days", "90°", "Not yet"],
    [18, 1, 3, "10 days", "24 days", "90°", "Not yet"], // the design example
    [30, 1, 5, "Done", "12 days", "90°", "When ready"],
    [45, 2, 7, "Done", "Done", "Allowed", "When ready"],
    [70, 3, 11, "Done", "Done", "Allowed", "When ready"],
    [100, 3, 15, "Done", "Done", "Allowed", "When ready"],
    [130, 4, 19, "Done", "Done", "Allowed", "When ready"],
  ],
  "max-transfer": [
    [1, 1, 1, "41 days", "41 days", "90°", "Not yet"],
    [18, 1, 3, "24 days", "24 days", "90°", "Not yet"],
    [30, 1, 5, "12 days", "12 days", "90°", "When ready"],
    [45, 2, 7, "Done", "6 to 8 weeks", "Allowed", "When ready"],
    [70, 3, 11, "Done", "Done", "Allowed", "When ready"],
    [100, 3, 15, "Done", "Done", "Allowed", "When ready"],
    [130, 4, 19, "Done", "Done", "Allowed", "When ready"],
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
    expect(n(at(18, "standard"), "Crutches or walker")).toBe("left, 20 lb foot flat. Then a cane if you need one.");
    expect(n(at(18, "standard"), "Brace")).toBe("left. Wear it when walking.");
    expect(n(at(18, "max-transfer"), "Crutches or walker")).toMatch(/^left at least, 20 lb foot flat\. Weight bearing as tolerated/);
    expect(n(at(18, "max-transfer"), "Brace")).toBe("left at least (6 to 8 weeks in all). Wear it when walking.");
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
