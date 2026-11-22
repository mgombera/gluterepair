"use client";

import Link from "next/link";
import { useState } from "react";
import { addDays } from "date-fns";
import {
  CALL_NOW,
  CALL_NUMBERS,
  CHECKLIST,
  DATES_ARE_ESTIMATES,
  HOME_CARE,
  HOME_EXERCISE_NOTE,
  MEDICATION_NOTICE,
  MEDICATION_TIPS,
  PROTOCOLS,
  PROTOCOL_NOTICE,
  PT_OVERRIDE_NOTICE,
  STANDARD_MEDICATIONS,
  USUALLY_NORMAL,
  exerciseById,
  pdfFor,
  pdfHref,
  printSheet,
} from "@/content";
import type { InfoSection, PrintSheetId, ProtocolId } from "@/content";
import { useHydrated, useProfile } from "@/lib/profile";
import { procedureLabel } from "@/lib/procedures";
import { afterPhasesText, isLastPhase, keyRules, romLimits } from "@/lib/protocolText";
import { formatUS, fromISO } from "@/lib/recovery";
import { PRACTICE, SITE_NAME, SITE_TITLE } from "@/lib/site";

// One printable sheet (scope 6.10). On screen a toolbar (procedure and Print
// button) sits above the sheet; on paper only the sheet prints: always light,
// US letter, 0.5 in margins (the @page rule in globals.css). The text is the
// same approved content the site pages show. The protocol sheet names the
// protocol's exercises for the therapist (scope section 5); the site itself has
// no exercise list (decision 11/01/2026).

const PROCS: ProtocolId[] = ["standard", "max-transfer"];

function List({ items }: { items: string[] }) {
  return (
    <ul className="m-0 flex list-disc flex-col gap-1 pl-5">
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  );
}

function Block({ title, children, long }: { title: string; children: React.ReactNode; long?: boolean }) {
  return (
    <section className={`flex flex-col gap-1.5 ${long ? "" : "break-inside-avoid"}`}>
      <h2 className="m-0 break-after-avoid border-b border-border pb-1 text-[17px] font-bold text-brand">{title}</h2>
      {children}
    </section>
  );
}

function Section({ s }: { s: InfoSection }) {
  return (
    <Block title={s.title}>
      <List items={s.points} />
    </Block>
  );
}

function SurgeryLine({ surgery }: { surgery: Date | null }) {
  return surgery ? <p className="m-0 font-semibold">Surgery date: {formatUS(surgery)}</p> : null;
}

function Checklist({ surgery }: { surgery: Date | null }) {
  const blocks = [
    { id: "now", title: "Now" },
    { id: "week-before", title: "1 week before" },
    { id: "night-before", title: "Night before" },
  ] as const;
  return (
    <div className="flex flex-col gap-4">
      <SurgeryLine surgery={surgery} />
      {blocks.map((b) => (
        <Block key={b.id} title={b.title} long>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {CHECKLIST.filter((c) => c.block === b.id).map((c) => {
              const due = surgery && c.dueOffsetDays !== undefined ? addDays(surgery, c.dueOffsetDays) : null;
              return (
                <li key={c.id} className="flex break-inside-avoid gap-2.5">
                  <span aria-hidden="true" className="mt-1 inline-block h-4 w-4 shrink-0 rounded-sm border-2 border-text" />
                  <span>
                    <strong>{c.title}</strong>
                    {due ? <strong> (by {formatUS(due)})</strong> : null}. {c.detail}
                  </span>
                </li>
              );
            })}
          </ul>
        </Block>
      ))}
    </div>
  );
}

function ProtocolSheet({ id, surgery }: { id: ProtocolId; surgery: Date | null }) {
  const p = PROTOCOLS[id];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 rounded border border-border p-2.5 text-[15px]">
        <p className="m-0 font-semibold">{PROTOCOL_NOTICE}</p>
        <p className="m-0">{PT_OVERRIDE_NOTICE}</p>
      </div>
      <SurgeryLine surgery={surgery} />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 print:grid-cols-2">
        <Block title="Range of motion limits, Phase I">
          <List items={romLimits(p)} />
        </Block>
        <Block title="Key rules">
          <List items={keyRules(p)} />
        </Block>
      </div>
      {p.phases.map((ph) => {
        const start = surgery ? addDays(surgery, (ph.startWeek - 1) * 7) : null;
        const end = surgery ? addDays(surgery, ph.endWeek * 7 - 1) : null;
        const ex = [...new Set(ph.weeks.flatMap((w) => w.exerciseIds))].map((e) => exerciseById(e).name);
        return (
          <Block
            long
            key={ph.n}
            title={`Phase ${ph.n}: ${ph.name} · ${ph.rangeLabel}${start && end ? ` · ${formatUS(start)} to ${formatUS(end)}` : ""}`}
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 print:grid-cols-2">
              <div>
                <h3 className="m-0 mb-1 text-[15px] font-bold">Goals</h3>
                <List items={ph.goals} />
              </div>
              <div>
                <h3 className="m-0 mb-1 text-[15px] font-bold">Move on when</h3>
                {ph.criteriaToProgress.length ? (
                  <List items={ph.criteriaToProgress} />
                ) : (
                  <p className="m-0">{isLastPhase(p, ph) ? afterPhasesText(p) : "Your therapist decides when you are ready for the next phase."}</p>
                )}
              </div>
            </div>
            {ex.length > 0 && (
              <p className="m-0 text-[15px]">
                <strong>Exercises:</strong> {ex.join(", ")}.
              </p>
            )}
          </Block>
        );
      })}
      <p className="m-0 text-[15px]">
        {DATES_ARE_ESTIMATES} {HOME_EXERCISE_NOTE}
      </p>
    </div>
  );
}

function CareSheet() {
  return (
    <div className="flex flex-col gap-4">
      <div className="columns-1 gap-6 sm:columns-2 print:columns-2 [&>section]:mb-4">
        {HOME_CARE.map((s) => (
          <Section key={s.id} s={s} />
        ))}
      </div>
      {/* The medications notice stays on the same page as the regimen it sits above. */}
      <div className="flex break-inside-avoid flex-col gap-4">
        <p className="m-0 rounded border border-border p-2.5 font-semibold">{MEDICATION_NOTICE}</p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 print:grid-cols-2">
          <Section s={STANDARD_MEDICATIONS} />
          <Section s={MEDICATION_TIPS} />
        </div>
      </div>
    </div>
  );
}

function WhenToCallCard() {
  return (
    <div className="flex flex-col gap-4">
      {/* Orange is kept for the call-now list (CLAUDE.md). */}
      <section className="flex break-inside-avoid flex-col gap-2 rounded-lg border-2 border-alert p-4">
        <h2 className="m-0 text-[19px] font-bold text-alert-text">{CALL_NOW.title}</h2>
        <List items={CALL_NOW.points} />
        <p className="m-0 font-bold">{CALL_NUMBERS.emergency}</p>
      </section>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 print:grid-cols-2">
        <div className="rounded-lg border border-border p-3">
          <p className="m-0 text-[15px] font-semibold">Office, weekdays</p>
          <p className="m-0 text-2xl font-bold">{PRACTICE.office.label}</p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="m-0 text-[15px] font-semibold">Nights and weekends, on call</p>
          <p className="m-0 text-2xl font-bold">{PRACTICE.afterHours.label}</p>
        </div>
      </div>
      <p className="m-0">{CALL_NUMBERS.afterHoursUse}</p>
      <Section s={USUALLY_NORMAL} />
    </div>
  );
}

export function PrintSheetView({ id }: { id: PrintSheetId }) {
  const hydrated = useHydrated();
  const profile = useProfile();
  const [chosen, setChosen] = useState<ProtocolId | null>(null);
  const sheet = printSheet(id)!;
  const saved: ProtocolId = profile?.procedure && profile.procedure !== "different" ? profile.procedure : "standard";
  const proc = chosen ?? saved;
  const surgery = profile?.surgeryDate ? fromISO(profile.surgeryDate) : null;
  const pdf = pdfFor(sheet, proc);
  const perProcedure = id === "protocol";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-[14px] border border-border bg-surface p-4 print:hidden">
        <Link href="/print" className="inline-flex min-h-12 items-center self-start font-semibold underline underline-offset-2">
          Back to the print center
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          {perProcedure && (
            <>
              <label htmlFor="proc" className="font-semibold">
                Procedure
              </label>
              <select
                id="proc"
                value={proc}
                onChange={(e) => setChosen(e.target.value as ProtocolId)}
                className="min-h-12 rounded-[10px] border border-control-border bg-surface px-3 text-text"
              >
                {PROCS.map((p) => (
                  <option key={p} value={p}>
                    {procedureLabel(p)}
                  </option>
                ))}
              </select>
            </>
          )}
          <button type="button" onClick={() => window.print()} className="inline-flex min-h-12 items-center rounded-xl bg-accent px-5 font-semibold text-accent-ink">
            Print this page
          </button>
          {pdf && (
            <a href={pdfHref(pdf)} className="inline-flex min-h-12 items-center font-semibold underline underline-offset-2">
              Open Dr. Gombera&apos;s PDF instead
            </a>
          )}
        </div>
        <p className="m-0 text-base text-muted">
          {surgery
            ? "Your dates are added on this device only. They are not sent anywhere."
            : "Add your surgery date on the home page to print your own dates."}
        </p>
      </div>

      {/* The sheet: always light, letter width. */}
      <article
        aria-label={sheet.title}
        className="theme-light mx-auto w-full max-w-[8.5in] rounded-lg border border-border bg-white p-6 text-[16px] leading-snug text-text sm:p-10 print:max-w-none print:rounded-none print:border-0 print:p-0"
      >
        <header className="mb-5 flex flex-wrap-reverse items-center justify-between gap-4 border-b-2 border-brand pb-3">
          <div>
            <p className="m-0 text-[14px] font-semibold text-muted">
              {SITE_TITLE} · {PRACTICE.doctor}
            </p>
            <h1 className="m-0 text-[30px] font-bold leading-tight text-brand">{sheet.title}</h1>
            {perProcedure && <p className="m-0 font-semibold">{procedureLabel(proc)}</p>}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PRACTICE.logoUrl} alt="Mufaddal Gombera, MD" className="h-12 w-auto" />
        </header>

        {!hydrated ? null : id === "checklist" ? (
          <Checklist surgery={surgery} />
        ) : id === "protocol" ? (
          <ProtocolSheet id={proc} surgery={surgery} />
        ) : id === "care" ? (
          <CareSheet />
        ) : (
          <WhenToCallCard />
        )}

        <footer className="mt-6 flex break-inside-avoid flex-col gap-0.5 border-t border-border pt-2 text-[13px] text-muted">
          <span>
            {PRACTICE.group} · {PRACTICE.address}
          </span>
          <span>
            Office {PRACTICE.office.label} · After hours {PRACTICE.afterHours.label} · {SITE_NAME}
          </span>
          <span>Content reviewed by Dr. Gombera.</span>
        </footer>
      </article>
    </div>
  );
}
