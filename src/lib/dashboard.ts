import { addDays, differenceInCalendarDays } from "date-fns";
import { protocolFor, status } from "./recovery";
import { braceText } from "./protocolText";
import type { AfterStatus, Milestone, Procedure } from "./recovery";
import type { Phase } from "@/content";

// Everything the recovery dashboard shows, as plain data, so it can be tested
// against the protocols without rendering (scope 6.2 snapshot tests).

export type Tile = { label: string; value: string; note: string };

export type DashboardModel = {
  daysSince: number;
  week: number;
  phase: Phase | null;
  phases: { n: number; name: string; weeks: number; state: "done" | "current" | "next" }[];
  phaseProgressPct: number;
  tiles: Tile[];
  upcoming: Milestone[];
};

export function dashboardModel(surgery: Date, today: Date, procedure: Procedure): DashboardModel | null {
  const s = status(surgery, today, procedure);
  if (s.mode !== "after") return null;
  const a = s as AfterStatus;
  const p = protocolFor(procedure);

  const daysUntil = (weeks: number) => differenceInCalendarDays(addDays(surgery, weeks * 7), today);
  const days = (n: number) => `${n} ${n === 1 ? "day" : "days"}`;
  const wb = p.weightBearing;
  const braceLeft = daysUntil(p.braceWeeks);
  const braceMaxLeft = p.braceWeeksUpTo ? daysUntil(p.braceWeeksUpTo) : braceLeft;
  const drivingDay = 21; // "around 3 weeks" (PT protocol criteria, decision 10/31/2026)

  // Tiles from the approved After screen (scope 6.3).
  const tiles: Tile[] = [
    a.partialWeightBearing
      ? {
          label: "Crutches or walker",
          value: `${wb.minimum ? "At least " : ""}${days(daysUntil(wb.weeks))} left`,
          note: `${wb.partialLbs} lb foot flat. ${wb.minimum ? p.afterWeightBearing : "Then a cane if you need one."}`,
        }
      : { label: "Crutches or walker", value: "Done", note: p.afterWeightBearing },
    braceLeft > 0
      ? {
          label: "Brace",
          value: `${p.braceWeeksUpTo ? "At least " : ""}${days(braceLeft)} left`,
          note: p.braceWeeksUpTo ? `${braceText(p)} in all. Wear it when walking.` : "Wear it when walking.",
        }
      : braceMaxLeft > 0
        ? { label: "Brace", value: braceText(p), note: "in all. Wear it when walking." }
        : { label: "Brace", value: "Done", note: "No longer needed when walking" },
    a.phase?.n === 1
      ? { label: "Sitting", value: `${p.flexionLimitDeg}°`, note: "Do not bend the hip past a right angle." }
      : { label: "Pool therapy", value: "Allowed", note: "Once the incision is fully healed" },
    a.daysSince < drivingDay
      ? { label: "Driving", value: "Not yet", note: "Off pain pills and able to lift your leg." }
      : { label: "Driving", value: "When ready", note: "Off narcotic pain medication, able to lift your leg, and in full control of it." },
  ];

  const current = a.phase?.n ?? 5;

  return {
    daysSince: a.daysSince,
    week: a.week,
    phase: a.phase,
    phases: p.phases.map((ph) => ({
      n: ph.n,
      name: ph.name,
      weeks: ph.endWeek - ph.startWeek + 1,
      state: ph.n < current ? "done" : ph.n === current ? "current" : "next",
    })),
    phaseProgressPct: a.phase ? Math.round(((a.phaseDay + 1) / a.phaseLength) * 100) : 100,
    tiles,
    upcoming: a.upcoming,
  };
}
