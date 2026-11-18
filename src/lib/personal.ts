import type { Profile } from "./profile";
import type { Procedure } from "./recovery";
import { procedureLabel } from "./procedures";
import { formatUS, fromISO, status } from "./recovery";

// What the status line and the home page say about where the patient is.
// Pure functions so they can be tested without a browser.

export function statusLine(profile: Pick<Profile, "surgeryDate" | "procedure" | "checklist">, today: Date): string {
  const d = profile.surgeryDate ? fromISO(profile.surgeryDate) : null;
  if (!d) return "Surgery date not set yet";
  const s = status(d, today, profile.procedure, profile.checklist);
  if (s.mode === "before") return `${s.daysUntil} ${s.daysUntil === 1 ? "day" : "days"} until surgery on ${formatUS(d)}`;
  if (s.daysSince === 0) return "Today is surgery day";
  if (s.phase) return `Day ${s.daysSince} · Phase ${s.phase.n} · Week ${s.week}`;
  return `Day ${s.daysSince} · After the formal phases`;
}

export function procedureLine(profile: Pick<Profile, "procedure">): string {
  return procedureLabel(profile.procedure);
}

/** Where a returning patient belongs: Before until surgery day, After from surgery day on. */
export function landingPath(profile: Pick<Profile, "surgeryDate" | "procedure">, today: Date): "/before" | "/after" {
  const d = profile.surgeryDate ? fromISO(profile.surgeryDate) : null;
  if (!d) return "/before";
  return status(d, today, profile.procedure).mode === "after" ? "/after" : "/before";
}

const START_ALIASES: Record<string, Procedure> = {
  standard: "standard",
  repair: "standard",
  "max-transfer": "max-transfer",
  max: "max-transfer",
  transfer: "max-transfer",
};

/** The procedure a clinic QR code (/start?p=...) preselects. Never a date. */
export function procedureFromStart(p: string | null | undefined): Procedure | null {
  return START_ALIASES[(p ?? "").trim().toLowerCase()] ?? null;
}

/** Page-view URL sent to Vercel Web Analytics: the path only, or nothing for /walkthrough. */
export function pageViewUrl(url: string): string | null {
  if (new URL(url).pathname.startsWith("/walkthrough")) return null;
  return url.split(/[?#]/)[0];
}
