import { describe, expect, it } from "vitest";
import { addDays } from "date-fns";
import { landingPath, pageViewUrl, procedureFromStart, statusLine } from "./personal";
import { validate } from "./profile";
import { formatUS, parseUS, status, surgeryDateInRange, toISO } from "./recovery";
import { procedureLabel } from "./procedures";

// Milestone 3 (scope section 4): setup, the saved profile, the status line,
// QR presets and analytics. Surgery on 10/13/2026, as in the design.

const surgery = new Date(2026, 9, 13);
const profile = (day: number | null, procedure: "standard" | "max-transfer" | "different" = "standard") => ({
  surgeryDate: day === null ? null : toISO(surgery),
  procedure,
  checklist: {},
  today: day === null ? surgery : addDays(surgery, day),
});
const line = (day: number | null, p?: "standard" | "max-transfer" | "different") => {
  const x = profile(day, p);
  return statusLine(x, x.today);
};

describe("typed surgery date", () => {
  it("reads MM/DD/YYYY and forgiving variants", () => {
    for (const s of ["10/13/2026", "10/13/2026 ", "10-13-2026", "10.13.2026"]) expect(formatUS(parseUS(s)!), s).toBe("10/13/2026");
    expect(formatUS(parseUS("1/5/2027")!)).toBe("01/05/2027");
  });

  it("rejects impossible or incomplete dates", () => {
    for (const s of ["", "13/01/2026", "02/30/2027", "10/13/26", "2026-10-13", "next week"]) expect(parseUS(s), s).toBeNull();
  });

  it("catches a mistyped year", () => {
    const today = new Date(2026, 10, 18);
    expect(surgeryDateInRange(parseUS("12/01/2026")!, today)).toBe(true);
    expect(surgeryDateInRange(parseUS("12/01/2062")!, today)).toBe(false);
    expect(surgeryDateInRange(parseUS("12/01/2016")!, today)).toBe(false);
  });
});

describe("status line", () => {
  it("counts down before surgery", () => {
    expect(line(-12)).toBe("12 days until surgery on 10/13/2026");
    expect(line(-1)).toBe("1 day until surgery on 10/13/2026");
  });

  it("says surgery day on day 0, never -0", () => {
    expect(line(0)).toBe("Today is surgery day");
    expect(Object.is((status(surgery, surgery, "standard") as { daysSince: number }).daysSince, -0)).toBe(false);
  });

  it("shows day, phase and week after surgery", () => {
    expect(line(18)).toBe("Day 18 · Phase 1 · Week 3");
    expect(line(42, "max-transfer")).toBe("Day 42 · Phase 2 · Week 7");
    expect(line(200)).toBe("Day 200 · After the formal phases");
  });

  it("handles a date not set yet", () => {
    expect(line(null)).toBe("Surgery date not set yet");
  });
});

describe("landing", () => {
  it("sends returning patients to Before until surgery day, then After", () => {
    const at = (day: number | null) => {
      const x = profile(day);
      return landingPath(x, x.today);
    };
    expect(at(null)).toBe("/before");
    expect(at(-1)).toBe("/before");
    expect(at(0)).toBe("/after");
    expect(at(18)).toBe("/after");
  });
});

describe("saved profile", () => {
  it("loads a valid profile", () => {
    expect(validate({ v: 1, surgeryDate: "2026-10-13", procedure: "max-transfer", checklist: { preadmit: true } })).toEqual({
      v: 1,
      surgeryDate: "2026-10-13",
      procedure: "max-transfer",
      checklist: { preadmit: true },
    });
  });

  it("still loads a profile saved with the removed exercise ticks, and drops them", () => {
    const p = validate({ v: 1, surgeryDate: null, procedure: "standard", checklist: {}, exercises: { "week-3": ["ankle-pumps"] } });
    expect(p).not.toBeNull();
    expect(p).not.toHaveProperty("exercises");
  });

  it("rejects anything else", () => {
    for (const x of [null, "x", { v: 2, surgeryDate: null, procedure: "standard" }, { v: 1, surgeryDate: null, procedure: "hip" }, { v: 1, surgeryDate: "10/13/2026", procedure: "standard" }]) {
      expect(validate(x), JSON.stringify(x)).toBeNull();
    }
  });
});

describe("QR presets and analytics", () => {
  it("preselects the procedure only, from the clinic QR codes", () => {
    expect(procedureFromStart("standard")).toBe("standard");
    expect(procedureFromStart("Max-Transfer")).toBe("max-transfer");
    expect(procedureFromStart("transfer")).toBe("max-transfer");
    expect(procedureFromStart("10/13/2026")).toBeNull();
    expect(procedureFromStart(null)).toBeNull();
  });

  it("sends only the page path to analytics, and nothing for /walkthrough", () => {
    expect(pageViewUrl("https://gluterepair.com/start?p=max-transfer")).toBe("https://gluterepair.com/start");
    expect(pageViewUrl("https://gluterepair.com/after#tiles")).toBe("https://gluterepair.com/after");
    expect(pageViewUrl("https://gluterepair.com/walkthrough")).toBeNull();
  });

  it("names the procedures in Title Case", () => {
    expect(procedureLabel("standard")).toBe("Open Gluteus Tendon Repair");
    expect(procedureLabel("max-transfer")).toBe("Gluteus Maximus Transfer");
  });
});
