import { describe, expect, it } from "vitest";
import { addDays } from "date-fns";
import { beforeModel, preAdmitText } from "./before";

// Scope 6.2 and the approved Before screen: surgery 11/12/2026.
const surgery = new Date(2026, 10, 12);
const at = (daysOut: number, checked: Record<string, boolean> = {}) => beforeModel(surgery, addDays(surgery, -daysOut), "standard", checked)!;

describe("Before dashboard", () => {
  it("matches the design example 12 days out", () => {
    const m = at(12, { "pre-register": true, driver: true });
    expect(m.status.daysUntil).toBe(12);
    expect(m.done).toBe(2);
    expect(m.blocks.map((b) => [b.title, b.when])).toEqual([
      ["Now", ""],
      ["1 week before", "from 11/05/2026"],
      ["Night before", "11/11/2026"],
    ]);
    const pa = preAdmitText(m.status);
    expect(pa.heading).toBe("PreAdmit due by 11/05/2026");
    expect(pa.body).toMatch(/5 days left/);
    expect(pa.strong).toBe(false); // orange from 10 days out (scope 4)
    expect(preAdmitText(at(10).status).strong).toBe(true);
  });

  it("dates PreAdmit and pre-registration 7 days before, and marks only PreAdmit mandatory", () => {
    const now = at(12).blocks[0].items;
    expect(now.map((i) => [i.id, i.due, i.mandatory])).toEqual([
      ["pre-register", "11/05/2026", false],
      ["preadmit", "11/05/2026", true],
    ]);
  });

  it("moves the PreAdmit card through its states", () => {
    expect(preAdmitText(at(40).status)).toMatchObject({ heading: "PreAdmit opens 10/13/2026", strong: false });
    expect(preAdmitText(at(20).status)).toMatchObject({ heading: "PreAdmit due by 11/05/2026", strong: false });
    expect(preAdmitText(at(7).status).body).toMatch(/Due today/);
    expect(preAdmitText(at(6).status)).toMatchObject({ heading: "PreAdmit was due 11/05/2026", strong: true });
  });

  it("counts checklist ticks and returns nothing from surgery day on", () => {
    expect(at(3, { preadmit: true, fasting: true }).done).toBe(2);
    expect(at(1).status.nightBefore).toBe(true);
    expect(beforeModel(surgery, surgery, "standard", {})).toBeNull();
  });

  it("keeps the 11/01/2026 week-before order, ending with the optional home program", () => {
    expect(at(12).blocks[1].items.map((i) => i.id)).toEqual(["driver", "time-off", "cold-therapy", "biologics", "home-setup", "home-program"]);
  });
});
