"use client";

import Link from "next/link";
import { addDays } from "date-fns";
import { beforeModel, preAdmitText } from "@/lib/before";
import type { ChecklistBlock } from "@/lib/before";
import { toggleChecklist, useHydrated, useProfile } from "@/lib/profile";
import { protocolHeading } from "@/lib/procedures";
import { formatUS, fromISO } from "@/lib/recovery";
import { PRACTICE } from "@/lib/site";
import { AlertIcon, PhoneIcon } from "./icons";

// Before Surgery dashboard (scope 6.2, approved Before screen): countdown,
// readiness bar, PreAdmit card and the checklist in three blocks. With no
// date set, a labeled example 12 days out.

const EXAMPLE_DAYS_OUT = 12;

function Block({ b, canTick }: { b: ChecklistBlock; canTick: boolean }) {
  return (
    <section aria-labelledby={`blk-${b.id}`} className="flex flex-col gap-2.5">
      <h2 id={`blk-${b.id}`} className="m-0 text-[22px] font-bold text-brand-ink">
        {b.title} {b.when && <span className="text-base font-medium text-muted">{b.when}</span>}
      </h2>
      <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
        {b.items.map((c) => {
          const id = `chk-${c.id}`;
          return (
            <li key={c.id} className="flex items-start gap-3 rounded-xl border border-border bg-surface p-3.5">
              <input
                id={id}
                type="checkbox"
                checked={c.done}
                disabled={!canTick}
                onChange={(e) => toggleChecklist(c.id, e.target.checked)}
                aria-describedby={c.done ? undefined : `${id}-d`}
                className="mt-0.5 h-[26px] w-[26px] shrink-0 accent-[var(--accent)]"
              />
              <div className="flex min-w-0 flex-col gap-1">
                <label htmlFor={id} className={`font-semibold ${c.done ? "text-muted line-through" : ""}`}>
                  {c.title}
                </label>
                {c.due && !c.done && (
                  <span className={`text-base font-semibold ${c.mandatory ? "text-alert-text" : "text-muted"}`}>Due {c.due}</span>
                )}
                {!c.done && (
                  <p id={`${id}-d`} className="m-0 text-base text-muted">
                    {c.detail}
                  </p>
                )}
                {!c.done && c.link && (
                  <a href={c.link.href} className="inline-flex min-h-12 items-center self-start font-semibold underline underline-offset-2">
                    {c.link.label}
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function BeforeDashboard() {
  const hydrated = useHydrated();
  const profile = useProfile();
  if (!hydrated) return <div className="min-h-96" aria-busy="true" />;

  const today = new Date();
  const realDate = profile?.surgeryDate ? fromISO(profile.surgeryDate) : null;
  const procedure = profile?.procedure ?? "standard";

  if (realDate && !beforeModel(realDate, today, procedure, {})) {
    return (
      <div className="flex flex-col gap-3 rounded-[14px] border-2 border-accent bg-surface p-5">
        <h1 className="m-0 text-2xl font-bold text-brand-ink">Your surgery was on {formatUS(realDate)}.</h1>
        <Link
          href="/after"
          className="inline-flex min-h-12 items-center self-start rounded-xl bg-accent px-5 font-semibold text-accent-ink no-underline"
        >
          Go to your recovery dashboard
        </Link>
      </div>
    );
  }

  const example = !realDate;
  const surgery = realDate ?? addDays(today, EXAMPLE_DAYS_OUT);
  const m = beforeModel(surgery, today, procedure, profile?.checklist ?? {})!;
  const s = m.status;
  const pa = preAdmitText(s);
  const preAdmitDone = Boolean(profile?.checklist.preadmit);

  return (
    <div className="flex flex-col gap-5">
      {example && (
        <div role="note" className="flex flex-col gap-3 rounded-[14px] border-2 border-accent bg-surface p-4">
          <p className="m-0">
            <strong>Example: this is what your checklist looks like {EXAMPLE_DAYS_OUT} days before surgery.</strong>{" "}
            {profile
              ? "You can tick items now. Add your date when surgery is scheduled to see your own deadlines."
              : "Add your surgery date to see your own deadlines and tick items off."}
          </p>
          <Link
            href={profile ? "/?setup=1" : "/"}
            className="inline-flex min-h-12 items-center self-start rounded-xl bg-accent px-5 font-semibold text-accent-ink no-underline"
          >
            {profile ? "Add your date" : "Set up your plan"}
          </Link>
        </div>
      )}

      <section aria-labelledby="countdown" className="flex flex-col gap-1">
        <p className="m-0 text-base text-muted">
          {protocolHeading(procedure)} on {formatUS(surgery)}
        </p>
        <h1 id="countdown" className="m-0 text-5xl leading-[1.1] font-bold text-brand-ink">
          {s.daysUntil} {s.daysUntil === 1 ? "day" : "days"} to go
        </h1>
        <div className="mt-2.5 flex justify-between text-base text-muted">
          <span id="ready-label">Getting ready</span>
          <span>
            {m.done} of {m.total} done
          </span>
        </div>
        <div
          role="progressbar"
          aria-labelledby="ready-label"
          aria-valuemin={0}
          aria-valuemax={m.total}
          aria-valuenow={m.done}
          aria-valuetext={`${m.done} of ${m.total} tasks done`}
          className="h-3.5 overflow-hidden rounded-[7px] bg-accent/15"
        >
          <div className="h-full bg-accent" style={{ width: `${Math.round((m.done / m.total) * 100)}%` }} />
        </div>
      </section>

      {s.nightBefore && (
        <div role="status" className="rounded-[14px] border-2 border-accent bg-surface p-4">
          <strong>Surgery is tomorrow.</strong> Nothing to eat or drink after midnight. Expect a call with your arrival time. No call by 3 p.m.?
          Call{" "}
          <a href={`tel:${PRACTICE.office.tel}`} className="font-semibold underline">
            {PRACTICE.office.label}
          </a>
          .
        </div>
      )}

      {preAdmitDone ? (
        <div role="status" className="rounded-[14px] border border-accent bg-surface p-4">
          <strong>PreAdmit is done.</strong> If PreAdmit asked for more tests or follow-up, finish those before surgery.
        </div>
      ) : (
        <section
          aria-labelledby="preadmit"
          className={`flex flex-col gap-2 rounded-[14px] p-4 ${pa.strong ? "border-2 border-alert bg-alert-surface" : "border border-border bg-surface"}`}
        >
          <h2 id="preadmit" className={`m-0 flex items-center gap-2.5 text-[19px] font-bold ${pa.strong ? "text-alert-text" : "text-brand-ink"}`}>
            <AlertIcon className="shrink-0" />
            {pa.heading}
          </h2>
          <p className="m-0">{pa.body}</p>
          <a
            href={`tel:${PRACTICE.preAdmit.tel}`}
            className={`flex min-h-[52px] items-center justify-center gap-2 rounded-[10px] font-semibold no-underline ${
              pa.strong ? "bg-[#B54708] text-white" : "border-2 border-accent text-accent"
            }`}
          >
            <PhoneIcon /> Call PreAdmit {PRACTICE.preAdmit.label}
          </a>
        </section>
      )}

      {m.blocks.map((b) => (
        <Block key={b.id} b={b} canTick={Boolean(profile)} />
      ))}

      <Link
        href="/before/surgery-day"
        className="flex min-h-[52px] items-center justify-center rounded-xl border-2 border-accent font-semibold text-accent no-underline"
      >
        What happens on surgery day
      </Link>
      <Link href="/print/checklist" className="inline-flex min-h-12 items-center self-start font-semibold underline underline-offset-2">
        Print this checklist
      </Link>
    </div>
  );
}
