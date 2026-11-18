import type { Procedure } from "./recovery";

// Procedure names are set here only (Title Case) and used everywhere.
// Details follow the approved Main screen (10/31/2026).
export const PROCEDURE_OPTIONS: { value: Procedure; label: string; detail?: string }[] = [
  {
    value: "standard",
    label: "Open Gluteus Tendon Repair",
    detail: "Most patients. With or without bursa removal.",
  },
  {
    value: "max-transfer",
    label: "Gluteus Maximus Transfer",
  },
  {
    value: "different",
    label: "My protocol is different",
    detail: "Follow the paper protocol you were given.",
  },
];

export function procedureLabel(p: Procedure): string {
  return PROCEDURE_OPTIONS.find((o) => o.value === p)!.label;
}

/** The name to show above a dashboard: "different" shows the standard protocol as a guide. */
export function protocolHeading(p: Procedure): string {
  return p === "different" ? "Standard protocol, as a guide" : procedureLabel(p);
}
