import { HOME_EXERCISE_NOTE } from "@/content";
import type { Phase, Protocol } from "@/content";

// Plain-language rule lists shared by the timeline page and the printed protocol.
// Range-of-motion angles stay with the therapist (decision 10/31/2026): patients
// see only the flexion limit.

export function romLimits(p: Protocol): string[] {
  return [`No sitting with the hip bent past ${p.flexionLimitDeg} degrees`, ...p.extraRestrictions];
}

export function braceText(p: Protocol): string {
  return p.braceWeeksUpTo ? `${p.braceWeeks} to ${p.braceWeeksUpTo} weeks` : `${p.braceWeeks} weeks`;
}

/** The brace time with what decides it, e.g. "6 to 8 weeks, depending on your comfort and function". */
export function braceFull(p: Protocol): string {
  return p.braceDepends ? `${braceText(p)}, ${p.braceDepends}` : braceText(p);
}

export function isLastPhase(p: Protocol, ph: Phase): boolean {
  return ph.n === p.phases[p.phases.length - 1].n;
}

/** What follows the last phase: the transfer's own note, then the home program. */
export function afterPhasesText(p: Protocol): string {
  return p.afterPhasesNote ? `${p.afterPhasesNote} ${HOME_EXERCISE_NOTE}` : HOME_EXERCISE_NOTE;
}

export function keyRules(p: Protocol): string[] {
  const wb = p.weightBearing;
  return [
    `${wb.partialLbs} lb weight bearing, ${wb.pattern}, for ${wb.minimum ? "at least " : ""}${wb.weeks} weeks`,
    p.afterWeightBearing,
    `Brace when walking for ${braceFull(p)}`,
    ...(p.proneLying ? ["Lie on your stomach 2 to 3 hours a day in Phase I"] : []),
    `Aqua therapy after week ${p.aquaTherapyAfterWeek}, once the incision is healed`,
    `Running and high impact activity after ${p.runningAfterMonths} months`,
    ...p.notes,
  ];
}
