// Content model (scope section 5). Every clinical item records where it came from.

export type SourceId =
  | "pt-protocol" // Postoperative Rehabilitation Protocol: Hip Open Gluteus Tendon Repair
  | "discharge" // Hip Gluteus Tendon Repair (Open): Post-Operative Instruction Checklist
  | "preop-letter" // What to Expect from your Surgery for Hip Gluteus Tendon Repair
  | "decisions" // Dr. Gombera's decisions, 10/31/2026 and 11/01/2026 (scope section 11)
  | "fixmyhips" // Approved fixmyhips content: logistics, Phase IV and shared pages
  | "myhealthtrack"; // myHealthTrack flyer for Dr. Gombera, supplied 11/01/2026

export type Sourced = {
  /** The first source is the main one; the content proof groups items by it. */
  source: SourceId[];
  /**
   * True when the item is a reasonable inference or plain-language summary
   * rather than a statement found in a source document. Shown highlighted on
   * the content proof so Dr. Gombera can approve, edit or remove it.
   */
  derived?: boolean;
  /** MM/DD/YYYY when Dr. Gombera approved a derived item as written. */
  approvedOn?: string;
};

export type ProtocolId = "standard" | "max-transfer";

export type WeekBlock = {
  fromWeek: number;
  toWeek: number;
  exerciseIds: string[];
  notes?: string[];
};

export type Phase = Sourced & {
  n: 1 | 2 | 3 | 4;
  name: string;
  startWeek: number;
  endWeek: number;
  rangeLabel: string; // as the protocol states it, e.g. "Weeks 1 to 6", "Months 4 to 6"
  goals: string[];
  weeks: WeekBlock[];
  cardio?: string[]; // exercise ids
  criteriaToProgress: string[];
};

export type Protocol = {
  id: ProtocolId;
  title: string;
  shortTitle: string;
  source: SourceId[];
  /** `minimum`: the weeks are a floor, not a fixed length (Gluteus Maximus Transfer). */
  weightBearing: { partialLbs: 20; pattern: string; weeks: number; minimum: boolean };
  /** What comes after protected weight bearing, in plain words. */
  afterWeightBearing: string;
  braceWeeks: number;
  /** Upper end when the brace time is a range, e.g. 6 to 8 weeks. */
  braceWeeksUpTo?: number;
  flexionLimitDeg: number;
  proneLying: boolean;
  /** Range-of-motion angles for the therapist only. Patients see only the flexion limit (decision 10/31/2026). */
  therapistRom: string[];
  extraRestrictions: string[];
  aquaTherapyAfterWeek: number;
  runningAfterMonths: number;
  agilityNotBeforeWeek: number;
  driving: string;
  notes: string[];
  phases: Phase[];
};

export type Exercise = Sourced & {
  id: string;
  name: string;
  cues: string[];
  /** Angles and positions from the protocol, for the therapist; not shown to patients. */
  therapistCues?: string[];
  caution?: string;
  therapistOnly?: boolean;
};

export type Video = {
  id: string;
  youtubeId: string;
  /** Filled automatically from YouTube oEmbed by scripts/fetch-video-titles.mjs. */
  title?: string;
  channel?: string;
  /** His own videos only (decision 11/01/2026). */
  source: "dr-gombera";
  topics: ("overview" | "surgery" | "recovery" | "testimonial")[];
  /** MM/DD/YYYY. A video with no approval date never renders on the site. */
  approvedOn?: string;
};

export type ChecklistItem = Sourced & {
  id: string;
  block: "now" | "week-before" | "night-before";
  title: string;
  detail: string;
  /** Days relative to surgery (negative = before). Used for deadlines. */
  dueOffsetDays?: number;
  link?: { label: string; href: string };
};

export type InfoSection = Sourced & {
  id: string;
  title: string;
  points: string[];
};

export type FaqItem = Sourced & {
  id: string;
  group: "before" | "after";
  q: string;
  a: string;
};

/** A myHealthTrack pathway for one procedure, named exactly as in the app. */
export type HomeProgramPathway = Sourced & {
  procedure: ProtocolId;
  /** The app's pathway name, or null when the patient should ask the office. */
  pathway: string | null;
  note?: string;
};

export type HomeProgramTier = Sourced & {
  id: string;
  label: string;
  free: boolean;
  points: string[];
};
