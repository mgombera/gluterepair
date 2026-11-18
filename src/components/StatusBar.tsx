"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { firstLandingThisSession, useProfile } from "@/lib/profile";
import { procedureLine, statusLine } from "@/lib/personal";
import { PROTOCOL_NOTICE } from "@/content";

// One line under the header telling the patient where they are, with a link
// to change or clear their information. Renders nothing until the browser has
// read the saved profile, and nothing on the home page (it has its own card)
// or the internal pages.
const HIDDEN = ["/", "/start", "/proof", "/walkthrough"];

export function StatusBar() {
  const profile = useProfile();
  const pathname = usePathname() ?? "/";

  // Any page other than home counts as the visit's arrival, so tapping Home
  // later shows the welcome card instead of jumping to the dashboard.
  useEffect(() => {
    if (pathname !== "/") firstLandingThisSession();
  }, [pathname]);

  if (!profile || HIDDEN.includes(pathname)) return null;

  return (
    <section aria-label="Your plan" className="border-b border-border bg-surface print:hidden">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2">
        <p className="m-0 flex flex-col sm:flex-row sm:gap-2">
          <strong className="font-semibold">{statusLine(profile, new Date())}</strong>
          <span className="text-muted">
            <span className="hidden sm:inline" aria-hidden="true">
              ·{" "}
            </span>
            {procedureLine(profile)}
          </span>
        </p>
        <Link href="/?setup=1" className="inline-flex min-h-12 items-center font-semibold underline underline-offset-2">
          Change or clear
        </Link>
      </div>
      {profile.procedure === "different" && (
        <p className="m-0 border-t border-border px-4 py-2 text-center text-base text-muted">{PROTOCOL_NOTICE}</p>
      )}
    </section>
  );
}
