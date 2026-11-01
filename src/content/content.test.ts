import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import * as C from "./index";

const exerciseIds = new Set(C.EXERCISES.map((e) => e.id));
const videoIds = new Set(C.VIDEOS.map((v) => v.id));

describe("protocols", () => {
  for (const p of Object.values(C.PROTOCOLS)) {
    describe(p.id, () => {
      it("has four phases in order with no gaps or overlaps", () => {
        expect(p.phases.map((ph) => ph.n)).toEqual([1, 2, 3, 4]);
        for (let i = 1; i < p.phases.length; i++) {
          expect(p.phases[i].startWeek).toBe(p.phases[i - 1].endWeek + 1);
        }
      });

      it("keeps every week block inside its phase", () => {
        for (const ph of p.phases) {
          for (const w of ph.weeks) {
            expect(w.fromWeek).toBeGreaterThanOrEqual(ph.startWeek);
            expect(w.toWeek).toBeLessThanOrEqual(ph.endWeek);
            expect(w.fromWeek).toBeLessThanOrEqual(w.toWeek);
          }
        }
      });

      it("only references exercises that exist", () => {
        for (const ph of p.phases) {
          for (const id of [...ph.weeks.flatMap((w) => w.exerciseIds), ...(ph.cardio ?? [])]) {
            expect(exerciseIds.has(id), `${p.id}: ${id}`).toBe(true);
          }
        }
      });
    });
  }

  it("matches Dr. Gombera's decisions of 10/31/2026 (scope section 11)", () => {
    const { standard, "max-transfer": max } = C.PROTOCOLS;
    expect([standard.weightBearing.weeks, max.weightBearing.weeks]).toEqual([4, 6]);
    expect([standard.weightBearing.minimum, max.weightBearing.minimum]).toEqual([false, true]);
    expect([standard.braceWeeks, standard.braceWeeksUpTo]).toEqual([6, undefined]);
    expect([max.braceWeeks, max.braceWeeksUpTo]).toEqual([6, 8]);
    for (const p of [standard, max]) {
      expect(p.flexionLimitDeg).toBe(90);
      expect(p.runningAfterMonths).toBe(6);
      expect(p.phases.map((ph) => [ph.startWeek, ph.endWeek])).toEqual([[1, 6], [7, 9], [10, 16], [17, 26]]);
    }
    expect(standard.afterWeightBearing).toMatch(/cane/);
    expect(max.afterWeightBearing).toMatch(/cane/);
  });

  it("shares every exercise between the two procedures", () => {
    const ids = (p: C.Protocol) => p.phases.flatMap((ph) => ph.weeks.flatMap((w) => w.exerciseIds));
    expect(ids(C.PROTOCOLS["max-transfer"])).toEqual(ids(C.PROTOCOLS.standard));
  });

  it("keeps running, agility and jumping at 6 months or later", () => {
    const six = ["running-progression", "quick-feet", "backpedal", "side-shuffle", "double-leg-plyometrics", "z-w-cuts", "carioca", "single-leg-plyometrics"];
    for (const p of Object.values(C.PROTOCOLS)) {
      for (const ph of p.phases) for (const w of ph.weeks) for (const id of w.exerciseIds) if (six.includes(id)) expect(w.fromWeek, id).toBeGreaterThanOrEqual(26);
    }
  });
});

describe("exercises and videos", () => {
  it("has unique exercise ids", () => {
    expect(exerciseIds.size).toBe(C.EXERCISES.length);
  });

  it("has unique video ids and YouTube ids, and only his own videos", () => {
    for (const v of C.VIDEOS) expect(v.source).toBe("dr-gombera");
    expect(videoIds.size).toBe(C.VIDEOS.length);
    expect(new Set(C.VIDEOS.map((v) => v.youtubeId)).size).toBe(C.VIDEOS.length);
  });

  it("links no exercise to a video (educational only, 11/01/2026)", () => {
    for (const e of C.EXERCISES) expect(Object.keys(e), e.id).not.toContain("videoIds");
    expect(C.VIDEOS).toHaveLength(0); // he has no gluteus repair video yet
  });

  it("uses every exercise in at least one protocol", () => {
    const used = new Set(
      Object.values(C.PROTOCOLS).flatMap((p) => p.phases.flatMap((ph) => [...ph.weeks.flatMap((w) => w.exerciseIds), ...(ph.cardio ?? [])])),
    );
    for (const e of C.EXERCISES) expect(used.has(e.id), e.id).toBe(true);
  });

  it("has no sets or reps invented in the cues", () => {
    // The only repetition count in the protocols is "30 repetitions" for passive ROM.
    for (const e of C.EXERCISES) {
      const cues = e.cues.join(" ");
      expect(cues, e.id).not.toMatch(/\b\d+\s*x\s*\d+\b|\bsets?\b|\breps?\b/i);
      if (/repetitions/i.test(cues)) expect(e.id).toBe("supine-prom");
    }
  });

  it("has an MM/DD/YYYY approval date on every approved video", () => {
    for (const v of C.approvedVideos()) expect(v.approvedOn).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });
});

describe("all content", () => {
  // The myHealthTrack pathway names are the app's own words (decision 11/01/2026).
  const pathways = C.HOME_PROGRAM_PATHWAYS.flatMap((p) => (p.pathway ? [p.pathway] : []));
  const everything = pathways.reduce((s, p) => s.split(p).join(""), JSON.stringify(C));

  it("contains no em dashes", () => {
    expect(everything).not.toMatch(/—/);
  });

  it("uses MM/DD/YYYY for dates", () => {
    expect(everything).not.toMatch(/\b\d{4}-\d{2}-\d{2}\b/);
  });

  it("has a valid review date or none yet", () => {
    if (C.CONTENT_REVIEWED_ON !== null) expect(C.CONTENT_REVIEWED_ON).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  it("names a source for every item unless it is marked derived", () => {
    const items = [
      ...C.CHECKLIST,
      ...C.SURGERY_DAY,
      ...C.HOME_CARE,
      ...C.DIAGNOSIS,
      ...C.ANATOMY,
      ...C.FAQ,
      ...C.EXERCISES,
      C.BIOLOGICS,
      C.STANDARD_MEDICATIONS,
      C.MEDICATION_TIPS,
      C.USUALLY_NORMAL,
      C.CALL_NOW,
      C.OUTCOMES,
    ];
    for (const it of items) {
      expect(it.source.length > 0 || it.derived === true, JSON.stringify(it).slice(0, 80)).toBe(true);
    }
  });
});

describe("gluteus content", () => {
  // The myHealthTrack pathway names are the app's own words (decision 11/01/2026).
  const pathways = C.HOME_PROGRAM_PATHWAYS.flatMap((p) => (p.pathway ? [p.pathway] : []));
  const everything = pathways.reduce((s, p) => s.split(p).join(""), JSON.stringify(C));

  it("carries no hip arthroscopy content over from fixmyhips", () => {
    expect(everything).not.toMatch(/arthroscop|labral|labrum|impingement|osteoplasty|steri-strip|outpatient|portal incision/i);
  });

  it("uses the corrected numbers, not the old printed ones", () => {
    expect(everything).not.toMatch(/794-3525/); // PreAdmit is (713) 395-6607
    expect(everything).toMatch(/\(713\) 395-6607/);
    expect(everything).not.toMatch(/every 3-4 hours|every 3 to 4 hours/); // Norco every 6 hours
    expect(everything).not.toMatch(/4 to 7 days|4-7 days/); // desk work 1 to 2 weeks
  });

  it("keeps range-of-motion angles out of patient cues", () => {
    for (const e of C.EXERCISES) expect(e.cues.join(" "), e.id).not.toMatch(/\d+\s*degrees/);
  });


  it("uses the scope section 8 notices word for word", () => {
    expect(C.PROTOCOL_NOTICE).toBe("This is the standard protocol. If you were given a different protocol, follow that one instead.");
    expect(C.PT_OVERRIDE_NOTICE).toBe(
      "Your physical therapist has the final say. These are general suggestions from the standard protocol. If your therapist gives you different exercises, limits or timing, follow your therapist's plan. Stop any exercise that causes sharp pain.",
    );
    expect(C.MEDICATION_NOTICE).toBe("Your prescriptions may differ. Always take your medications as directed on your own prescription labels.");
    expect(C.DATES_ARE_ESTIMATES).toBe("Dates are estimates. You move on when your therapist confirms you meet the phase criteria.");
    expect(C.VIDEO_NOTICE).toBe("These videos are only a suggestion and are not formal medical advice.");
  });

  it("lists the scope 6.8 red flags from the discharge sheet", () => {
    expect(C.CALL_NOW.points).toHaveLength(7);
    expect(C.CALL_NOW.points).toContain("Calf pain");
  });

  it("orders the week-before checklist as decided on 11/01/2026, with no anesthesia item", () => {
    const week = C.CHECKLIST.filter((c) => c.block === "week-before").map((c) => c.id);
    expect(week).toEqual(["driver", "time-off", "cold-therapy", "biologics", "home-setup", "home-program"]);
    expect(C.CHECKLIST.map((c) => c.id)).not.toContain("anesthesia-history");
  });

  it("marks the five items he answered on 11/01/2026 as approved", () => {
    const approved = [...C.DIAGNOSIS, ...C.ANATOMY, ...C.PROTOCOLS.standard.phases].filter((x) => x.approvedOn);
    expect(approved).toHaveLength(6); // max transfer text, 4 anatomy parts, Phase IV split
    for (const x of approved) expect(x.approvedOn).toBe("11/01/2026");
  });

  it("waits for Dr. Gombera's sign-off", () => {
    expect(C.CONTENT_REVIEWED_ON).toBeNull();
  });
});

describe("home program (myHealthTrack, scope 6.5)", () => {
  it("uses the app's pathway names exactly", () => {
    const by = Object.fromEntries(C.HOME_PROGRAM_PATHWAYS.map((p) => [p.procedure, p]));
    expect(by.standard.pathway).toBe("Hip Arthroscopy w/Gluteus Medius Repair");
    expect(by["max-transfer"].pathway).toBeNull();
    expect(by["max-transfer"].note).toBe("Ask our office which pathway to use.");
  });

  it("says the app's weeks may differ until he confirms the pathway matches", () => {
    expect(C.HOME_PROGRAM_CHOOSE.points.join(" ")).toMatch(/weeks may differ/);
  });

  it("links to his practice link and a navy QR code", () => {
    expect(C.HOME_PROGRAM_URL).toBe("https://mht.link/fondren2");
    const svg = readFileSync(join(process.cwd(), "public", C.HOME_PROGRAM_QR), "utf8");
    expect(svg).toMatch(/#313E6B/);
  });

  it("is optional and puts the therapist first", () => {
    expect(C.HOME_PROGRAM_NOTICE).toMatch(/optional/);
    expect(C.HOME_PROGRAM_NOTICE).toMatch(/therapist's program takes precedence/);
  });

  it("leaves the flyer's savings claims off the site", () => {
    const shown = JSON.stringify([C.HOME_PROGRAM_TIERS, C.HOME_PROGRAM_INTRO, C.HOME_PROGRAM_START, C.HOME_PROGRAM_CHOOSE]);
    expect(shown).not.toMatch(/\$|save|eliminate/i);
    expect(C.HOME_PROGRAM_TIERS.find((t) => !t.free)?.points).toContain(
      "Ask our office about cost and whether it can replace any in-person therapy visits.",
    );
  });
});
