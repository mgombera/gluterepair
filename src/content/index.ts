import type { SourceId } from "./types";

export * from "./types";
export * from "./protocols";
export * from "./exercises";
export * from "./videos";
export * from "./before";
export * from "./after";
export * from "./safety";
export * from "./learn";
export * from "./print";
export * from "./homeProgram";

/**
 * Date Dr. Gombera signed off the clinical content (MM/DD/YYYY), or null until
 * he does (Gate 1, scope section 10). Update it whenever clinical content
 * changes and is re-approved.
 */
export const CONTENT_REVIEWED_ON: string | null = null;

export const SOURCES: Record<SourceId, string> = {
  "pt-protocol": "PT protocol: Hip Open Gluteus Tendon Repair with/without Bursectomy",
  discharge: "Post-operative instruction checklist: Hip Gluteus Tendon Repair (Open) (discharge sheet)",
  "preop-letter": "What to Expect from your Surgery for Hip Gluteus Tendon Repair (pre-op letter)",
  decisions: "Dr. Gombera's decisions, 10/31/2026 and 11/01/2026 (scope section 11)",
  fixmyhips: "fixmyhips.com content he approved on 10/30/2026 (logistics, Phase IV, shared pages)",
  myhealthtrack: "myHealthTrack flyer for Dr. Gombera, supplied 11/01/2026 (tiers, pathways, practice link)",
};

/** Order of sections on the content proof. */
export const SOURCE_ORDER: SourceId[] = ["pt-protocol", "discharge", "preop-letter", "decisions", "fixmyhips", "myhealthtrack"];
