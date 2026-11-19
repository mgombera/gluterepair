import type { Metadata } from "next";
import Link from "next/link";
import { Card, Container, PageHeader } from "@/components/ui";
import { PhoneIcon } from "@/components/icons";
import { routeInfo } from "@/lib/routes";
import { PRACTICE } from "@/lib/site";

// Contact, from the approved sibling-site page. Every number comes from site.ts.

const r = routeInfo("/contact");
export const metadata: Metadata = { title: r.title, description: r.summary, alternates: { canonical: "/contact" } };

const LINES = [
  { name: "Office, weekdays", sub: "Questions, scheduling, rescheduling, refills before 5 p.m.", phone: PRACTICE.office },
  { name: "After hours and weekends", sub: "On-call physician, for urgent problems", phone: PRACTICE.afterHours },
  { name: "PreAdmit testing", sub: "Texas Orthopedic Hospital, 3rd floor. 8 a.m. to 5 p.m., Monday to Friday", phone: PRACTICE.preAdmit },
];

export default function ContactPage() {
  return (
    <Container className="flex max-w-3xl flex-col gap-5 py-6 sm:py-10">
      <PageHeader title="Contact" intro={<p className="m-0 text-muted">Call for anything that cannot wait. Use the patient portal for non-urgent messages.</p>} />
      {LINES.map((l) => (
        <a
          key={l.phone.tel}
          href={`tel:${l.phone.tel}`}
          className="flex flex-col gap-1 rounded-[14px] border border-border bg-surface p-5 text-text no-underline hover:border-accent"
        >
          <span className="flex items-center gap-2 font-semibold text-muted">
            <PhoneIcon className="shrink-0" /> {l.name}
          </span>
          <span className="text-3xl font-bold text-brand-ink">{l.phone.label}</span>
          <span className="text-base text-muted">{l.sub}</span>
        </a>
      ))}
      <Card className="flex flex-col gap-2">
        <h2 className="m-0 text-[21px] font-bold text-brand-ink">Patient portal</h2>
        <p className="m-0">Non-urgent messages through athenahealth. Not for urgent problems.</p>
        <a href={PRACTICE.portalUrl} className="inline-flex min-h-12 items-center self-start rounded-xl bg-accent px-5 font-semibold text-accent-ink no-underline">
          Open the patient portal
        </a>
      </Card>
      <Card className="flex flex-col gap-2">
        <h2 className="m-0 text-[21px] font-bold text-brand-ink">Email</h2>
        <a href={`mailto:${PRACTICE.email}`} className="inline-flex min-h-12 items-center self-start text-lg font-semibold">
          {PRACTICE.email}
        </a>
        <p className="m-0 text-base text-muted">Please do not email medical details or urgent problems.</p>
      </Card>
      <Card className="flex flex-col gap-2">
        <h2 className="m-0 text-[21px] font-bold text-brand-ink">Office</h2>
        <p className="m-0 font-semibold">{PRACTICE.group}</p>
        <p className="m-0">{PRACTICE.address}</p>
        <a href={PRACTICE.mapUrl} className="inline-flex min-h-12 items-center self-start font-semibold">
          Open in maps
        </a>
      </Card>
      <p className="m-0">
        Emergency? Go to the nearest emergency room. Worried about a symptom after surgery?{" "}
        <Link href="/after/when-to-call" className="underline underline-offset-2">
          See when to call
        </Link>
        .
      </p>
    </Container>
  );
}
