"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { addDays } from "date-fns";
import { clearProfile, saveSetup } from "@/lib/profile";
import { procedureLabel } from "@/lib/procedures";
import type { Procedure } from "@/lib/recovery";
import { toISO } from "@/lib/recovery";

// Gate 2 review tool (scope section 10). One tap saves an example surgery date
// and procedure on this device, then opens the page a patient would see at that
// point. Nothing leaves the browser. Removed at launch (milestone 8).

type Checkpoint = { label: string; offset: number | null; to: string };

const BEFORE: Checkpoint[] = [
  { label: "Not scheduled yet", offset: null, to: "/before" },
  { label: "12 days before", offset: 12, to: "/before" },
  { label: "5 days before (PreAdmit overdue)", offset: 5, to: "/before" },
  { label: "Night before", offset: 1, to: "/before" },
];

const AFTER: Checkpoint[] = [
  { label: "Surgery day", offset: 0, to: "/after" },
  ...[1, 18, 30, 45, 70, 100, 130, 200].map((d) => ({ label: `Day ${d}`, offset: -d, to: "/after" })),
];

const PROCS: Procedure[] = ["standard", "max-transfer", "different"];

const btn =
  "inline-flex min-h-12 items-center rounded-[10px] border border-control-border bg-surface px-3.5 font-semibold text-text hover:border-accent";
const link = "inline-flex min-h-12 items-center font-semibold underline underline-offset-2";

const OTHER_PAGES = [
  { href: "/start?p=standard", label: `Clinic QR code: ${procedureLabel("standard")}` },
  { href: "/start?p=max-transfer", label: `Clinic QR code: ${procedureLabel("max-transfer")}` },
  { href: "/anatomy", label: "Your Hip Tendons (3D model)" },
  { href: "/print", label: "Print Center" },
  { href: "/videos", label: "Videos" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About Dr. Gombera" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/proof", label: "Content proof" },
];

function Row({ title, items, onPick }: { title: string; items: Checkpoint[]; onPick: (c: Checkpoint) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="m-0 text-base font-semibold text-muted">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((c) => (
          <button key={c.label} type="button" className={btn} onClick={() => onPick(c)}>
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Walkthrough() {
  const router = useRouter();
  const load = (proc: Procedure, c: Checkpoint) => {
    clearProfile(); // start each checkpoint with nothing ticked
    saveSetup(c.offset === null ? null : toISO(addDays(new Date(), c.offset)), proc);
    router.push(c.to);
  };

  return (
    <div className="flex flex-col gap-6">
      <p className="m-0 rounded-[14px] border-2 border-accent bg-surface p-4">
        Each button replaces the date and procedure saved in this browser with an example, then opens the page. Use your
        browser&apos;s Back button to return here. When you finish, tap the button at the bottom to clear the example.
      </p>

      {PROCS.map((p) => (
        <section key={p} aria-labelledby={`wt-${p}`} className="flex flex-col gap-4 rounded-[14px] border border-border bg-surface p-5">
          <h2 id={`wt-${p}`} className="m-0 text-[22px] font-bold text-brand-ink">
            {procedureLabel(p)}
          </h2>
          {p === "different" ? (
            <Row title="After surgery" items={AFTER.filter((c) => c.label === "Day 18")} onPick={(c) => load(p, c)} />
          ) : (
            <>
              <Row title="Before surgery" items={BEFORE} onPick={(c) => load(p, c)} />
              <Row title="After surgery" items={AFTER} onPick={(c) => load(p, c)} />
            </>
          )}
        </section>
      ))}

      <section aria-labelledby="wt-other" className="flex flex-col gap-2 rounded-[14px] border border-border bg-surface p-5">
        <h2 id="wt-other" className="m-0 text-[22px] font-bold text-brand-ink">
          Other pages
        </h2>
        <ul className="m-0 grid list-none gap-x-6 p-0 sm:grid-cols-2">
          {OTHER_PAGES.map((o) => (
            <li key={o.href}>
              <Link href={o.href} className={link}>
                {o.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <button
        type="button"
        onClick={() => {
          clearProfile();
          router.push("/");
        }}
        className="inline-flex min-h-12 items-center self-start rounded-xl bg-accent px-5 font-semibold text-accent-ink"
      >
        Done: clear the example from this browser
      </button>
    </div>
  );
}
