import type { Phase, Protocol, ProtocolId } from "./types";

// Encoded from docs/source/2026-10-31-pt-protocol-open-glute.txt plus Dr.
// Gombera's decisions of 10/31/2026 (scope section 11). Where the protocol
// and a decision differ, the decision wins: 4 weeks of protected weight
// bearing (not 6), brace 6 weeks (not 4), Phase III weeks 10 to 16, running
// and high impact at 6 months (not 3). The Gluteus Maximus Transfer shares
// the standard protocol except weight bearing, brace and the cane.
// Phase IV comes from fixmyhips (decision 10/31/2026).

const PHASE_I_WEEK_1 = [
  "hamstring-sets",
  "seated-hamstring-stretch",
  "prone-lying",
  "ankle-pumps",
  "supine-prom",
  "log-rolls",
  "core-isometrics",
];
const PHASE_I_WEEK_2 = [
  "circumduction",
  "upright-bike",
  "cat-camel",
  "rockback",
  "quadruped-hip-extension",
  "soft-tissue-mobilization",
  "scar-massage",
];
const PHASE_I_WEEK_3 = ["aquatic-therapy", "double-leg-bridge", "stool-rotations", "physioball-rollouts"];

const PHASE_IV_STRENGTH = ["balance-squat-rotation", "retro-walk-band", "lunge-trunk-rotation"];
const PHASE_IV_SIX_MONTHS = [
  "running-progression",
  "quick-feet",
  "backpedal",
  "side-shuffle",
  "double-leg-plyometrics",
  "z-w-cuts",
  "carioca",
  "single-leg-plyometrics",
  "sport-specific",
];

type Variant = {
  wbGoal: string;
  braceGoal: string;
  phaseINotes: string[];
  phaseIIWeek7Notes: string[];
  extraSource: Phase["source"];
};

function phases(v: Variant): Phase[] {
  return [
    {
      n: 1,
      name: "Protection and range of motion",
      startWeek: 1,
      endWeek: 6,
      rangeLabel: "Weeks 1 to 6",
      source: ["pt-protocol", "decisions"],
      goals: [
        "Protect the repair",
        "Avoid active hip abduction and passive hip adduction",
        "Avoid hip flexor irritation: no sitting with the hip bent past 90 degrees",
        "Control and decrease pain, inflammation and swelling",
        "Avoid scar tissue with passive motion and soft tissue mobilization",
        v.braceGoal,
        v.wbGoal,
        "Lie on your stomach 2 to 3 hours a day",
      ],
      weeks: [
        { fromWeek: 1, toWeek: 1, exerciseIds: PHASE_I_WEEK_1 },
        { fromWeek: 2, toWeek: 2, exerciseIds: PHASE_I_WEEK_2, notes: ["Continue week 1 exercises"] },
        { fromWeek: 3, toWeek: 6, exerciseIds: PHASE_I_WEEK_3, notes: ["Continue week 2 exercises", ...v.phaseINotes] },
      ],
      criteriaToProgress: [
        "Well-controlled pain after surgery",
        "No hip or pelvis deviations (limp) when walking",
      ],
    },
    {
      n: 2,
      name: "Stability and gait",
      startWeek: 7,
      endWeek: 9,
      rangeLabel: "Weeks 7 to 9",
      source: ["pt-protocol", ...v.extraSource],
      goals: [
        "Protect the repair",
        "Normalize your walking pattern",
        "Begin closed chain and weight shift exercises",
        "Continue Phase I exercises as appropriate",
      ],
      weeks: [
        { fromWeek: 7, toWeek: 7, exerciseIds: ["upright-bike"], notes: v.phaseIIWeek7Notes },
        { fromWeek: 8, toWeek: 8, exerciseIds: ["clamshell", "standing-abduction-isometric"] },
        {
          fromWeek: 9,
          toWeek: 9,
          exerciseIds: ["leg-press", "quad-hamstring-strengthening", "lateral-step-up", "y-balance", "balance-training", "elliptical"],
          notes: ["Leg press: both legs, low weight"],
        },
      ],
      criteriaToProgress: ["No gait deviations", "Minimal pain after activities", "Range of motion equal to the other side"],
    },
    {
      n: 3,
      name: "Strength and muscular endurance",
      startWeek: 10,
      endWeek: 16,
      rangeLabel: "Weeks 10 to 16",
      source: ["pt-protocol", "decisions"],
      goals: [
        "Prevent compensation due to fatigue",
        "Begin resisted biking",
        "Progress strengthening from double leg to single leg",
        "Return to prior activities without pain or irritation",
        "Progress leg strength and endurance",
      ],
      weeks: [
        {
          fromWeek: 10,
          toWeek: 16,
          exerciseIds: ["leg-press", "pillar-bridge", "bodyweight-squat", "single-leg-quarter-squat", "lunges", "glute-it-stretching"],
          notes: ["Continue all appropriate exercises from Phase II", "Leg press: one leg at a time, low weight"],
        },
      ],
      cardio: ["elliptical", "resisted-bike"],
      criteriaToProgress: [],
    },
    {
      n: 4,
      name: "Return to running and activity",
      startWeek: 17,
      endWeek: 26,
      rangeLabel: "Months 4 to 6",
      source: ["fixmyhips", "pt-protocol", "decisions"],
      // Splitting Phase IV at 6 months, so running, agility and jumping wait
      // for the 6-month decision, is an inference for his review.
      derived: true,
      goals: [
        "No complaints of pain or weakness",
        "Functional strengthening",
        "Safe return to your activities",
        "Maintenance of strength, endurance and balance",
        "Education about any possible limitations",
      ],
      weeks: [
        { fromWeek: 17, toWeek: 26, exerciseIds: PHASE_IV_STRENGTH },
        {
          fromWeek: 26,
          toWeek: 26,
          exerciseIds: PHASE_IV_SIX_MONTHS,
          notes: ["Running, agility and jumping: not before 6 months, and only when your therapist clears you"],
        },
      ],
      criteriaToProgress: [],
    },
  ];
}

const COMMON_NOTES = [
  "This protocol is non-linear.",
  "Patients may progress at different rates. Do not push through the pain.",
];

const DRIVING =
  "Avoid driving until you are no longer taking narcotic pain medication, are able to actively lift your leg (around 3 weeks) and have the limb control to perform all driving tasks.";

const THERAPIST_ROM = [
  "Abduction to 45 degrees, passive only",
  "No extension past 0 degrees",
  "No external rotation past 30 degrees",
];

const SHARED = {
  flexionLimitDeg: 90,
  proneLying: true,
  therapistRom: THERAPIST_ROM,
  extraRestrictions: ["No active hip abduction", "No passive hip adduction"],
  aquaTherapyAfterWeek: 3,
  runningAfterMonths: 6,
  agilityNotBeforeWeek: 26,
  driving: DRIVING,
  notes: COMMON_NOTES,
} as const;

export const STANDARD: Protocol = {
  id: "standard",
  title: "Open Gluteus Tendon Repair",
  shortTitle: "Gluteus Tendon Repair",
  source: ["pt-protocol", "decisions"],
  weightBearing: { partialLbs: 20, pattern: "foot flat, with crutches or a walker", weeks: 4, minimum: false },
  afterWeightBearing: "Wean off the crutches or walker. Some patients need a cane after that.",
  braceWeeks: 6,
  ...SHARED,
  therapistRom: [...THERAPIST_ROM],
  extraRestrictions: [...SHARED.extraRestrictions],
  notes: [...COMMON_NOTES],
  phases: phases({
    braceGoal: "Hip brace when walking for 6 weeks",
    wbGoal: "20 lb weight bearing, foot flat, for 4 weeks, then wean off crutches or walker; some patients need a cane",
    phaseINotes: ["After week 4, wean off crutches or walker and normalize your walking pattern"],
    phaseIIWeek7Notes: [],
    extraSource: [],
  }),
};

export const MAX_TRANSFER: Protocol = {
  id: "max-transfer",
  title: "Gluteus Maximus Transfer",
  shortTitle: "Gluteus Maximus Transfer",
  source: ["decisions", "pt-protocol"],
  weightBearing: { partialLbs: 20, pattern: "foot flat, with crutches or a walker", weeks: 6, minimum: true },
  afterWeightBearing: "Weight bearing as tolerated, usually with a cane during the transition.",
  braceWeeks: 6,
  braceWeeksUpTo: 8,
  ...SHARED,
  therapistRom: [...THERAPIST_ROM],
  extraRestrictions: [...SHARED.extraRestrictions],
  notes: [...COMMON_NOTES],
  phases: phases({
    braceGoal: "Hip brace when walking for 6 to 8 weeks",
    wbGoal: "20 lb weight bearing, foot flat, for at least 6 weeks",
    phaseINotes: [],
    phaseIIWeek7Notes: ["After at least 6 weeks, weight bearing as tolerated, with a cane during the transition"],
    extraSource: ["decisions"],
  }),
};

export const PROTOCOLS: Record<ProtocolId, Protocol> = {
  standard: STANDARD,
  "max-transfer": MAX_TRANSFER,
};

export const PROTOCOL_NOTICE =
  "This is the standard protocol. If you were given a different protocol, follow that one instead.";

export const HOME_PROGRAM = "Continue your home exercise program through 1 year.";
