"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { firstLandingThisSession, useHydrated, useProfile } from "@/lib/profile";
import { landingPath, procedureLine, statusLine } from "@/lib/personal";
import { ClearMyInformation } from "./ClearMyInformation";
import { SetupForm } from "./SetupForm";

// The home page. New visitors set up their plan. A returning patient who opens
// the site goes straight to their dashboard (once per visit); tapping Home
// later shows a welcome card. /?setup=1 opens the form to change settings.
export function HomeSetup() {
  const hydrated = useHydrated();
  const profile = useProfile();
  const params = useSearchParams();
  const router = useRouter();
  const editing = params.get("setup") === "1";
  const [cleared, setCleared] = useState(false);
  const [landing, setLanding] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    if (profile && !editing && firstLandingThisSession()) router.replace(landingPath(profile, new Date()));
    else setLanding(false);
    // Only on arrival: later profile changes must not redirect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  if (!hydrated || (landing && profile && !editing)) {
    return <div className="min-h-64 rounded-[14px] border border-border bg-surface" aria-busy="true" />;
  }

  const notice = cleared && (
    <p role="status" className="m-0 rounded-[10px] border border-border bg-surface p-3 font-semibold">
      Your information was removed from this device.
    </p>
  );

  if (!profile || editing) {
    return (
      <div className="flex flex-col gap-5">
        {notice}
        <SetupForm key={profile ? "edit" : "new"} existing={profile} onCleared={() => setCleared(true)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-[14px] border-2 border-accent bg-surface px-4 py-5 sm:px-6">
      <p className="m-0 text-base font-semibold text-muted">Welcome back</p>
      <p className="m-0 text-3xl font-bold leading-tight text-brand-ink">{statusLine(profile, new Date())}</p>
      <p className="m-0 text-muted">{procedureLine(profile)}</p>
      <div className="flex flex-wrap gap-3">
        <Link
          href={landingPath(profile, new Date())}
          className="inline-flex min-h-12 items-center rounded-xl bg-accent px-5 text-lg font-semibold text-accent-ink no-underline"
        >
          Go to my {landingPath(profile, new Date()) === "/after" ? "recovery dashboard" : "checklist"}
        </Link>
        <Link
          href="/?setup=1"
          className="inline-flex min-h-12 items-center rounded-xl border border-control-border px-5 font-semibold text-text no-underline"
        >
          Change date or procedure
        </Link>
      </div>
      <ClearMyInformation onCleared={() => setCleared(true)} />
    </div>
  );
}
