"use client";

import Link from "next/link";
import { PRINT_LETTERS, PRINT_SHEETS, pdfFor, pdfHref } from "@/content";
import { useHydrated, useProfile } from "@/lib/profile";
import { procedureLabel } from "@/lib/procedures";
import { formatUS, fromISO } from "@/lib/recovery";

// The print center (scope 6.10): his letters as PDFs, then four sheets. Where
// Dr. Gombera has supplied his own PDF (src/content/print.ts), that is offered
// first.

const primary = "inline-flex min-h-12 items-center rounded-xl bg-accent px-5 font-semibold text-accent-ink no-underline";

export function PrintCenter() {
  const hydrated = useHydrated();
  const profile = useProfile();
  const proc = profile?.procedure && profile.procedure !== "different" ? profile.procedure : "standard";
  const surgery = profile?.surgeryDate ? fromISO(profile.surgeryDate) : null;

  return (
    <div className="flex flex-col gap-5">
      {hydrated && (
        <p className="m-0 rounded-[14px] border border-border bg-surface p-4">
          {profile && profile.procedure !== "different" ? (
            <>
              Sheets for <strong>{procedureLabel(proc)}</strong>
              {surgery ? <>, with your dates from your surgery on {formatUS(surgery)}</> : null}. Your dates are added on
              this device only. They are not sent anywhere.
            </>
          ) : (
            <>
              Sheets for the standard protocol.{" "}
              <Link href={profile ? "/?setup=1" : "/"} className="underline underline-offset-2">
                Add your date and procedure
              </Link>{" "}
              to print your own dates.
            </>
          )}
        </p>
      )}
      <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-2">
        {PRINT_LETTERS.map((l) => (
          <li key={l.id} className="flex flex-col gap-3 rounded-[14px] border border-border bg-surface p-5">
            <h2 className="m-0 text-[22px] font-bold text-brand-ink">{l.title}</h2>
            <p className="m-0 text-muted">{l.summary}</p>
            <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2">
              <a href={pdfHref(l.pdf)} className={primary}>
                Open PDF<span className="sr-only">: {l.title}</span>
              </a>
            </div>
          </li>
        ))}
        {PRINT_SHEETS.map((s) => {
          const pdf = pdfFor(s, proc);
          return (
            <li key={s.id} className="flex flex-col gap-3 rounded-[14px] border border-border bg-surface p-5">
              <h2 className="m-0 text-[22px] font-bold text-brand-ink">{s.title}</h2>
              <p className="m-0 text-muted">{s.summary}</p>
              <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2">
                {pdf ? (
                  <>
                    <a href={pdfHref(pdf)} className={primary}>
                      Open PDF<span className="sr-only">: {s.title}</span>
                    </a>
                    <Link href={`/print/${s.id}`} className="inline-flex min-h-12 items-center font-semibold underline underline-offset-2">
                      Print the web version<span className="sr-only">: {s.title}</span>
                    </Link>
                  </>
                ) : (
                  <Link href={`/print/${s.id}`} className={primary}>
                    Open and print<span className="sr-only">: {s.title}</span>
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
