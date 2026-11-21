"use client";

import Link from "next/link";
import { addDays } from "date-fns";
import { DATES_ARE_ESTIMATES, HOME_PROGRAM_LINE, PT_OVERRIDE_NOTICE } from "@/content";
import { dashboardModel } from "@/lib/dashboard";
import { useHydrated, useProfile } from "@/lib/profile";
import { protocolHeading } from "@/lib/procedures";
import { formatUS, fromISO } from "@/lib/recovery";

// Recovery dashboard (scope 6.3, approved After screen): day count, phase and
// week, a phase bar sized by each phase's length, four tiles and the next
// dates. No exercise list (decision 11/01/2026). With no date, or a date still
// ahead, a labeled example at day 18.

const EXAMPLE_DAY = 18;

export function AfterDashboard() {
  const hydrated = useHydrated();
  const profile = useProfile();
  if (!hydrated) return <div className="min-h-96" aria-busy="true" />;

  const today = new Date();
  const realDate = profile?.surgeryDate ? fromISO(profile.surgeryDate) : null;
  const realModel = realDate && profile ? dashboardModel(realDate, today, profile.procedure) : null;
  const example = !realModel;
  const procedure = realModel ? profile!.procedure : "standard";
  const surgery = realModel ? realDate! : addDays(today, -EXAMPLE_DAY);
  const m = realModel ?? dashboardModel(surgery, today, "standard")!;
  const why = !profile
    ? { text: "Add your surgery date to see your own day, phase and limits.", href: "/", cta: "Set up your plan" }
    : !realDate
      ? { text: "Add your surgery date to see your own day, phase and limits.", href: "/?setup=1", cta: "Add your date" }
      : { text: `Your surgery is on ${formatUS(realDate)}. Until then, use your checklist.`, href: "/before", cta: "Go to your checklist" };

  return (
    <div className="flex flex-col gap-5">
      {example && (
        <div role="note" className="flex flex-col gap-3 rounded-[14px] border-2 border-accent bg-surface p-4">
          <p className="m-0">
            <strong>Example: this is what your dashboard looks like on day {EXAMPLE_DAY}</strong> (Open Gluteus Tendon Repair). {why.text}
          </p>
          <Link href={why.href} className="inline-flex min-h-12 items-center self-start rounded-xl bg-accent px-5 font-semibold text-accent-ink no-underline">
            {why.cta}
          </Link>
        </div>
      )}

      <section aria-labelledby="day" className="flex flex-col gap-0.5">
        <p className="m-0 text-base text-muted">
          {protocolHeading(procedure)} on {formatUS(surgery)}
        </p>
        <h1 id="day" className="m-0 text-[52px] leading-[1.1] font-bold text-brand-ink">
          {m.daysSince === 0 ? "Surgery day" : `Day ${m.daysSince}`}
        </h1>
        <p className="m-0 text-[19px] font-semibold">
          {m.phase ? `Phase ${m.phase.n}, week ${m.week}: ${m.phase.name.toLowerCase()}` : "You have finished the formal phases"}
        </p>
      </section>

      <section aria-label="Recovery phases" className="flex flex-col gap-1.5">
        <div className="flex h-4 gap-1" aria-hidden="true">
          {m.phases.map((p, i) => (
            <div
              key={p.n}
              style={{ flex: p.weeks }}
              className={`overflow-hidden ${i === 0 ? "rounded-l-lg" : ""} ${i === m.phases.length - 1 ? "rounded-r-lg" : ""} ${
                p.state === "next" ? "bg-border" : "bg-accent/20"
              }`}
            >
              <div
                className="h-full bg-accent"
                style={{ width: p.state === "done" ? "100%" : p.state === "current" ? `${m.phaseProgressPct}%` : "0%" }}
              />
            </div>
          ))}
        </div>
        <ol className="m-0 flex list-none gap-1 p-0 text-sm text-muted">
          {m.phases.map((p) => (
            <li key={p.n} style={{ flex: p.weeks }} className={`min-w-0 ${p.state === "current" ? "font-bold text-accent" : ""}`}>
              <span className="sr-only">
                {p.state === "done" ? "Done: " : p.state === "current" ? `Now, ${m.phaseProgressPct} percent through: ` : "Next: "}
              </span>
              {p.n === 1 ? "Phase 1" : p.n === 4 ? "4, to month 6" : p.n}
            </li>
          ))}
        </ol>
      </section>

      <dl className="m-0 grid grid-cols-2 gap-2.5">
        {m.tiles.map((t) => (
          <div key={t.label} className="flex flex-col gap-0.5 rounded-xl border border-border bg-surface p-3.5">
            <dt className="text-[15px] text-muted">{t.label}</dt>
            <dd className={`m-0 font-bold leading-tight text-brand-ink ${t.value.length > 8 ? "text-[22px] sm:text-3xl" : "text-3xl"}`}>{t.value}</dd>
            <dd className="m-0 text-[15px]">{t.note}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="this-phase" className="flex flex-col gap-2.5 rounded-[14px] border border-border bg-surface p-4">
        <h2 id="this-phase" className="m-0 text-[22px] font-bold text-brand-ink">
          {m.phase ? `This phase: ${m.phase.name}` : "After the formal phases"}
        </h2>
        <p className="m-0 rounded-lg bg-bg px-3 py-2.5 text-base text-muted">{PT_OVERRIDE_NOTICE}</p>
        {m.phase ? (
          <Link href="/after/timeline" className="inline-flex min-h-12 items-center font-semibold underline underline-offset-2">
            See this phase&apos;s goals on your timeline
          </Link>
        ) : (
          <p className="m-0">{m.afterPhases}</p>
        )}
        <Link href="/after/home-program" className="inline-flex min-h-12 items-center font-semibold underline underline-offset-2">
          {HOME_PROGRAM_LINE}
        </Link>
      </section>

      {m.upcoming.length > 0 && (
        <section aria-labelledby="next" className="flex flex-col gap-2">
          <h2 id="next" className="m-0 text-[22px] font-bold text-brand-ink">
            Coming up
          </h2>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {m.upcoming.map((u) => (
              <li key={u.id} className="flex justify-between gap-3 rounded-xl border border-border bg-surface px-3.5 py-3">
                <span>{u.label}</span>
                <span className="font-semibold whitespace-nowrap">{formatUS(u.date)}</span>
              </li>
            ))}
          </ul>
          <p className="m-0 text-[15px] text-muted">{DATES_ARE_ESTIMATES}</p>
        </section>
      )}

      <Link
        href="/after/when-to-call"
        className="flex min-h-14 items-center justify-center rounded-xl border-2 border-accent font-semibold text-accent no-underline"
      >
        When to call us
      </Link>
    </div>
  );
}
