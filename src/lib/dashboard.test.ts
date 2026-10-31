import { describe, expect, it } from "vitest";
import { addDays } from "date-fns";
import { dashboardModel } from "./dashboard";

// Scope 6.3: dashboards for both procedures must match the protocol and the
// decisions of 10/31/2026 at days 1, 18, 30, 45, 70, 100 and 130.

const surgery = new Date(2026, 9, 13); // 10/13/2026
const at = (day: number, p: "standard" | "max-transfer") => dashboardModel(surgery, addDays(surgery, day), p)!;
const tile = (m: ReturnType<typeof at>, label: string) => m.tiles.find((t) => t.label === label)?.value;

type Row = [day: number, phase: number | null, week: number, wb: string, brace: string, flexOrAqua: string, newEx?: string];

const EXPECTED: Record<"standard" | "max-transfer", Row[]> = {
  standard: [
    [1, 1, 1, "20 lb", "41 days", "90°", "prone-lying"],
    [18, 1, 3, "20 lb", "24 days", "90°", "double-leg-bridge"],
    [30, 1, 5, "As tolerated", "12 days", "90°"],
    [45, 2, 7, "As tolerated", "Done", "Allowed", "upright-bike"],
    [70, 3, 11, "As tolerated", "Done", "Allowed"],
    [100, 3, 15, "As tolerated", "Done", "Allowed"],
    [130, 4, 19, "As tolerated", "Done", "Allowed"],
  ],
  "max-transfer": [
    [1, 1, 1, "20 lb", "41 days", "90°", "prone-lying"],
    [18, 1, 3, "20 lb", "24 days", "90°", "double-leg-bridge"],
    [30, 1, 5, "20 lb", "12 days", "90°"],
    [45, 2, 7, "As tolerated", "Done", "Allowed", "upright-bike"],
    [70, 3, 11, "As tolerated", "Done", "Allowed"],
    [100, 3, 15, "As tolerated", "Done", "Allowed"],
    [130, 4, 19, "As tolerated", "Done", "Allowed"],
  ],
};

for (const [proc, rows] of Object.entries(EXPECTED) as [keyof typeof EXPECTED, Row[]][]) {
  describe(`${proc} dashboard`, () => {
    for (const [day, phase, week, wb, brace, flex, newEx] of rows) {
      it(`day ${day}: phase ${phase}, week ${week}`, () => {
        const m = at(day, proc);
        expect(m.phase?.n ?? null).toBe(phase);
        expect(m.week).toBe(week);
        expect(tile(m, "Weight bearing")).toBe(wb);
        expect(tile(m, "Brace")).toBe(brace);
        expect(tile(m, "Hip flexion limit") ?? tile(m, "Aqua therapy")).toBe(flex);
        if (newEx) expect(m.newThisWeek).toContain(newEx);
      });
    }
  });
}

describe("dashboard details", () => {
  it("returns nothing before surgery", () => {
    expect(dashboardModel(surgery, addDays(surgery, -3), "standard")).toBeNull();
  });

  it("dates running at 6 months for both procedures", () => {
    expect(tile(at(18, "standard"), "Running")).toBe("04/13/2027");
    expect(tile(at(18, "max-transfer"), "Running")).toBe("04/13/2027");
    expect(tile(at(182, "standard"), "Running")).toBe("Allowed");
  });

  it("marks phases done, current and next", () => {
    expect(at(45, "standard").phases.map((p) => p.state)).toEqual(["done", "current", "next", "next"]);
  });

  it("switches to the home program after Phase IV", () => {
    const m = at(200, "standard");
    expect(m.phase).toBeNull();
    expect(m.phases.every((p) => p.state === "done")).toBe(true);
    expect(m.newThisWeek).toEqual([]);
  });
});
