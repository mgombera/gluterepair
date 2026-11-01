import type { HomeProgramPathway, HomeProgramTier, InfoSection } from "./types";

// Optional myHealthTrack home program (scope 6.5, decisions of 11/01/2026).
// Source: docs/source/2026-11-01-myhealthtrack-flyer.pdf. Pathway names are
// the app's own, word for word. The flyer's savings and "eliminate in-person
// PT" claims are left out until Dr. Gombera approves them.

export const HOME_PROGRAM_URL = "https://mht.link/fondren2";
/** Navy QR code to HOME_PROGRAM_URL, made by scripts/make-home-program-qr.mjs. */
export const HOME_PROGRAM_QR = "/brand/myhealthtrack-qr.svg";

export const HOME_PROGRAM_NOTICE =
  "The home program is optional. It does not replace your physical therapist. Your therapist's program takes precedence.";

/** One line on the After dashboard and the Timeline. */
export const HOME_PROGRAM_LINE = "Prefer a guided home program? See myHealthTrack.";

export const HOME_PROGRAM_INTRO: InfoSection = {
  id: "what",
  title: "What myHealthTrack is",
  points: [
    "An app with daily rehabilitation guidance for your recovery. Use it on your phone or in a web browser.",
    "Dr. Gombera offers it as an option alongside your in-person physical therapy.",
  ],
  source: ["myhealthtrack", "decisions"],
  derived: true,
};

export const HOME_PROGRAM_PATHWAYS: HomeProgramPathway[] = [
  {
    procedure: "standard",
    pathway: "Hip Arthroscopy w/Gluteus Medius Repair",
    source: ["decisions", "myhealthtrack"],
  },
  {
    procedure: "max-transfer",
    pathway: null,
    note: "Ask our office which pathway to use.",
    source: ["decisions"],
  },
];

export const HOME_PROGRAM_CHOOSE: InfoSection = {
  id: "choose",
  title: "Choose your pathway",
  points: [
    'In the app, choose "I\'m having / I\'ve had surgery," then Hip, then the pathway for your surgery below.',
    "The app does not have a pathway written for this exact surgery. Its weeks may differ from your protocol. Always follow your protocol and your therapist.",
  ],
  source: ["myhealthtrack", "decisions"],
  derived: true,
};

export const HOME_PROGRAM_TIERS: HomeProgramTier[] = [
  {
    id: "educate",
    label: "Educate",
    free: true,
    points: [
      "Educational videos on your condition",
      "A phase-by-phase recovery timeline: what to expect",
      "Clear answers to common questions",
    ],
    source: ["myhealthtrack"],
  },
  {
    id: "resources",
    label: "Resources for success",
    free: true,
    points: [
      "A care plan overview with milestones and goals",
      "Guided habit coaching: nutrition and hydration, sleep, mindset and self-improvement micro skills",
      "Weekly doctor's notes to help keep you on track",
    ],
    source: ["myhealthtrack"],
  },
  {
    id: "premium",
    label: "Premium: rehab anywhere, anytime",
    free: false,
    points: [
      "A tailored rehab program built to match your clinician's protocol and restrictions",
      "At-home therapy you can do anytime, anywhere",
      "Video-guided exercises with clear reps and progressions",
      "Ask our office about cost and whether it can replace any in-person therapy visits.",
    ],
    source: ["myhealthtrack", "decisions"],
  },
];

export const HOME_PROGRAM_START: InfoSection = {
  id: "start",
  title: "Get started",
  points: [
    "Tap Open myHealthTrack, or scan the code with your phone or tablet camera. Do not use a separate QR reader app.",
  ],
  source: ["myhealthtrack", "decisions"],
};

export const HOME_PROGRAM_PRIVACY =
  "If you choose myHealthTrack, you sign up in the app, under the app's own privacy terms. This site sends nothing to myHealthTrack.";

/** Flyer claims left off the site until Dr. Gombera approves them (shown on /proof). */
export const HOME_PROGRAM_OMITTED_CLAIMS = [
  "Save $500 to $1,000 in out-of-pocket expenses.",
  "Control, or in some cases eliminate, the cost of in-person PT sessions (condition-dependent).",
  "Get back to the things you love, faster and easier.",
];
