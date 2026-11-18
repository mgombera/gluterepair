import type { Protocol } from "@/content";

// Plain-language rule lists shared by the timeline page and the printed protocol.
// Range-of-motion angles stay with the therapist (decision 10/31/2026): patients
// see only the flexion limit.

export function romLimits(p: Protocol): string[] {
  return [`No sitting with the hip bent past ${p.flexionLimitDeg} degrees`, ...p.extraRestrictions];
}

export function braceText(p: Protocol): string {
  return p.braceWeeksUpTo ? `${p.braceWeeks} to ${p.braceWeeksUpTo} weeks` : `${p.braceWeeks} weeks`;
}

export function keyRules(p: Protocol): string[] {
  const wb = p.weightBearing;
  return [
    `${wb.partialLbs} lb weight bearing, ${wb.pattern}, for ${wb.minimum ? "at least " : ""}${wb.weeks} weeks`,
    p.afterWeightBearing,
    `Brace when walking for ${braceText(p)}`,
    ...(p.proneLying ? ["Lie on your stomach 2 to 3 hours a day in Phase I"] : []),
    `Aqua therapy after week ${p.aquaTherapyAfterWeek}, once the incision is healed`,
    `Running and high impact activity after ${p.runningAfterMonths} months`,
    ...p.notes,
  ];
}
