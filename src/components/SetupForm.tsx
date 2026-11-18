"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { readPreset, saveSetup, storageAvailable } from "@/lib/profile";
import type { Profile } from "@/lib/profile";
import { landingPath } from "@/lib/personal";
import { PROCEDURE_OPTIONS } from "@/lib/procedures";
import { formatUS, fromISO, parseUS, surgeryDateInRange, toISO } from "@/lib/recovery";
import type { Procedure } from "@/lib/recovery";
import { ClearMyInformation } from "./ClearMyInformation";

// Home page setup (scope 6.1, approved Main screen): the surgery date typed as
// MM/DD/YYYY or "not scheduled yet", then the procedure. Saved on this device only.

const card = "flex flex-col gap-4 rounded-[14px] border border-border bg-surface px-4 py-5 sm:px-6";

export function SetupForm({ existing, onCleared }: { existing: Profile | null; onCleared?: () => void }) {
  const router = useRouter();
  const saved = existing?.surgeryDate ? fromISO(existing.surgeryDate) : null;
  const [date, setDate] = useState(saved ? formatUS(saved) : "");
  const [notScheduled, setNotScheduled] = useState(existing ? existing.surgeryDate === null : false);
  const [procedure, setProcedure] = useState<Procedure>(() => existing?.procedure ?? readPreset() ?? "standard");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    let iso: string | null = null;
    if (!notScheduled) {
      const d = parseUS(date);
      if (!d) {
        setError('Enter your surgery date as MM/DD/YYYY, for example 01/05/2027, or choose "My surgery is not scheduled yet."');
        return;
      }
      if (!surgeryDateInRange(d, new Date())) {
        setError("Please check the year. The date should be within two years of today.");
        return;
      }
      iso = toISO(d);
    }
    saveSetup(iso, procedure);
    router.push(landingPath({ surgeryDate: iso, procedure }, new Date()));
  }

  const parsed = notScheduled ? null : parseUS(date);

  return (
    <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
      <section aria-labelledby="date-heading" className={card}>
        <h2 id="date-heading" className="m-0 text-[21px] font-bold text-brand-ink">
          1. Your surgery date
        </h2>
        <label htmlFor="surgery-date" className="text-[17px] font-semibold">
          Date of surgery (MM/DD/YYYY)
        </label>
        <input
          id="surgery-date"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={date}
          disabled={notScheduled}
          onChange={(e) => {
            setDate(e.target.value);
            setError(null);
          }}
          aria-describedby="date-help"
          aria-invalid={error && !notScheduled ? true : undefined}
          className="min-h-14 w-full max-w-sm rounded-[10px] border-2 border-control-border bg-surface px-3.5 text-xl text-text disabled:opacity-50"
        />
        <p id="date-help" className="m-0 text-base text-muted">
          {parsed ? `Surgery on ${formatUS(parsed)}.` : "Use the date on your surgery confirmation."}
        </p>
        <label className="flex min-h-12 items-center gap-3">
          <input
            type="checkbox"
            checked={notScheduled}
            onChange={(e) => {
              setNotScheduled(e.target.checked);
              setError(null);
            }}
            className="h-6 w-6 shrink-0 accent-[var(--accent)]"
          />
          <span>My surgery is not scheduled yet</span>
        </label>
      </section>

      <fieldset className={`${card} m-0 gap-3`}>
        <legend className="float-left mb-1 w-full p-0 text-[21px] font-bold text-brand-ink">2. Your surgery</legend>
        {PROCEDURE_OPTIONS.map((o) => (
          <label
            key={o.value}
            className={`flex cursor-pointer items-start gap-3 rounded-[10px] p-3.5 ${
              procedure === o.value ? "border-2 border-accent bg-accent/10" : "border border-control-border"
            }`}
          >
            <input
              type="radio"
              name="procedure"
              value={o.value}
              checked={procedure === o.value}
              onChange={() => setProcedure(o.value)}
              className="mt-0.5 h-6 w-6 shrink-0 accent-[var(--accent)]"
            />
            <span className="flex flex-col">
              <span className="font-semibold">{o.label}</span>
              {o.detail && <span className="text-base text-muted">{o.detail}</span>}
            </span>
          </label>
        ))}
      </fieldset>

      {error && (
        <p role="alert" className="m-0 rounded-[10px] border border-alert bg-alert-surface p-3 font-semibold text-alert-text">
          {error}
        </p>
      )}

      <button type="submit" className="min-h-14 rounded-xl bg-accent px-6 text-xl font-semibold text-accent-ink">
        {existing ? "Save changes" : "Show my plan"}
      </button>
      <p className="m-0 text-base text-muted">
        {storageAvailable()
          ? "Your date stays on this device only. Nothing is sent to us or anyone else."
          : "Your browser is blocking storage (private browsing?), so this will be forgotten when you close the page."}
      </p>
      {existing && <ClearMyInformation onCleared={onCleared} />}
    </form>
  );
}
