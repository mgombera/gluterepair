import type { Procedure } from "./recovery";

export const PROCEDURE_OPTIONS: { value: Procedure; label: string; detail: string }[] = [
  {
    value: "standard",
    label: "Open Gluteus Tendon Repair",
    detail: "The standard procedure. Choose this if you are not sure.",
  },
  {
    value: "max-transfer",
    label: "Gluteus Maximus Transfer",
    detail: "Part of the gluteus maximus is moved over when the torn tendons cannot be repaired.",
  },
  {
    value: "different",
    label: "My protocol is different",
    detail: "You will see the standard protocol as a guide. Follow the paper protocol you were given.",
  },
];

export function procedureLabel(p: Procedure): string {
  return PROCEDURE_OPTIONS.find((o) => o.value === p)!.label;
}
