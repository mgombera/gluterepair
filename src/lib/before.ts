import { addDays } from "date-fns";
import { CHECKLIST } from "@/content";
import type { ChecklistItem } from "@/content";
import { formatUS, status } from "./recovery";
import type { BeforeStatus, Procedure } from "./recovery";

// Everything the Before dashboard shows, as plain data (scope 6.2), so it can
// be tested without rendering. Approved Before screen, 10/31/2026.

export type ChecklistBlock = {
  id: ChecklistItem["block"];
  title: string;
  /** "from 11/05/2026" or "11/11/2026"; empty for the Now block. */
  when: string;
  items: (ChecklistItem & { done: boolean; due?: string; mandatory: boolean })[];
};

export type BeforeModel = {
  status: BeforeStatus;
  done: number;
  total: number;
  blocks: ChecklistBlock[];
};

/** PreAdmit is the one mandatory deadline on the checklist (orange). */
const MANDATORY = new Set(["preadmit"]);

export function beforeModel(surgery: Date, today: Date, procedure: Procedure, checked: Record<string, boolean>): BeforeModel | null {
  const s = status(surgery, today, procedure, checked);
  if (s.mode !== "before") return null;
  const block = (id: ChecklistItem["block"], title: string, when: string): ChecklistBlock => ({
    id,
    title,
    when,
    items: CHECKLIST.filter((c) => c.block === id).map((c) => ({
      ...c,
      done: Boolean(checked[c.id]),
      due: s.dueDates[c.id] && c.block !== "night-before" ? formatUS(s.dueDates[c.id]) : undefined,
      mandatory: MANDATORY.has(c.id),
    })),
  });
  return {
    status: s,
    done: CHECKLIST.filter((c) => checked[c.id]).length,
    total: CHECKLIST.length,
    blocks: [
      block("now", "Now", ""),
      block("week-before", "1 week before", `from ${formatUS(addDays(surgery, -7))}`),
      block("night-before", "Night before", formatUS(addDays(surgery, -1))),
    ],
  };
}

/** The PreAdmit card's words (approved Before screen). */
export function preAdmitText(s: BeforeStatus): { heading: string; body: string; strong: boolean } {
  const deadline = formatUS(s.preAdmitDeadline);
  const left = s.daysUntil - 7;
  switch (s.preAdmit) {
    case "not-open":
      return {
        heading: `PreAdmit opens ${formatUS(s.preAdmitOpens)}`,
        body: `Required for anesthesia. Complete it between ${formatUS(s.preAdmitOpens)} and ${deadline}. Walk in 8 a.m. to 5 p.m., Monday to Friday, or call to schedule.`,
        strong: false,
      };
    case "open":
    case "urgent":
      // Orange only inside 10 days of surgery (scope 4), the mandatory deadline.
      return {
        heading: `PreAdmit due by ${deadline}`,
        body: `Required for anesthesia. ${left === 0 ? "Due today." : `${left} ${left === 1 ? "day" : "days"} left.`} Walk in 8 a.m. to 5 p.m., Monday to Friday, or call to schedule.`,
        strong: s.preAdmit === "urgent",
      };
    case "overdue":
      return {
        heading: `PreAdmit was due ${deadline}`,
        body: "Required for anesthesia. Call PreAdmit today.",
        strong: true,
      };
  }
}
