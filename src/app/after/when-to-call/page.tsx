import type { Metadata } from "next";
import Link from "next/link";
import { CALL_NOW, CALL_NUMBERS, USUALLY_NORMAL } from "@/content";
import { PhoneIcon } from "@/components/icons";
import { Bullets, Container, PageHeader } from "@/components/ui";
import { routeInfo } from "@/lib/routes";
import { PRACTICE } from "@/lib/site";

// When to call (scope 6.8, decision 11/01/2026): calm plain cards under After
// surgery. Orange only for the call-now list.

const r = routeInfo("/after/when-to-call");
export const metadata: Metadata = { title: r.title, description: r.summary, alternates: { canonical: "/after/when-to-call" } };

const card = "flex flex-col gap-3 rounded-[14px] px-4 py-5 sm:px-6";
const call = "flex min-h-[52px] items-center justify-center gap-2 rounded-[10px] font-semibold no-underline";

export default function WhenToCallPage() {
  return (
    <Container className="flex max-w-2xl flex-col gap-5 py-6 sm:py-10">
      <PageHeader title={r.title} intro={<p className="m-0 text-muted">{r.summary}</p>} />

      <section aria-labelledby="call-now" className={`${card} border-2 border-alert bg-alert-surface`}>
        <h2 id="call-now" className="m-0 text-[21px] font-bold text-alert-text">
          {CALL_NOW.title}
        </h2>
        <Bullets items={CALL_NOW.points} />
        <a href={`tel:${PRACTICE.office.tel}`} className={`${call} bg-[#B54708] text-white`}>
          <PhoneIcon /> Call the office {PRACTICE.office.label}
        </a>
        <p className="m-0">{CALL_NUMBERS.emergency}</p>
      </section>

      <section aria-labelledby="call-office" className={`${card} border border-border bg-surface`}>
        <h2 id="call-office" className="m-0 text-[21px] font-bold text-brand-ink">
          Calling the office
        </h2>
        <p className="m-0">{CALL_NUMBERS.office}</p>
        <p className="m-0">{CALL_NUMBERS.afterHours}</p>
        <p className="m-0 text-muted">{CALL_NUMBERS.afterHoursUse}</p>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <a href={`tel:${PRACTICE.office.tel}`} className={`${call} flex-1 border-2 border-accent text-accent`}>
            <PhoneIcon /> Office {PRACTICE.office.label}
          </a>
          <a href={`tel:${PRACTICE.afterHours.tel}`} className={`${call} flex-1 border-2 border-accent text-accent`}>
            <PhoneIcon /> After hours {PRACTICE.afterHours.label}
          </a>
        </div>
      </section>

      <section aria-labelledby="normal" className={`${card} border border-border bg-surface`}>
        <h2 id="normal" className="m-0 text-[21px] font-bold text-brand-ink">
          {USUALLY_NORMAL.title}
        </h2>
        <Bullets items={USUALLY_NORMAL.points} />
      </section>
      <Link href="/print/red-flags" className="inline-flex min-h-12 items-center self-start font-semibold underline underline-offset-2">
        Print the when to call card for your fridge
      </Link>
    </Container>
  );
}
