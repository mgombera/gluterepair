import type { Metadata } from "next";
import { BIOLOGICS } from "@/content";
import { PhoneIcon } from "@/components/icons";
import { Container, InfoCards, PageHeader } from "@/components/ui";
import { routeInfo } from "@/lib/routes";
import { PRACTICE } from "@/lib/site";

const r = routeInfo("/before/add-ons");
export const metadata: Metadata = { title: r.title, description: r.summary, alternates: { canonical: "/before/add-ons" } };

export default function AddOnsPage() {
  return (
    <Container className="flex max-w-2xl flex-col gap-6 py-6 sm:py-10">
      <PageHeader title={r.title} intro={<p className="m-0 text-muted">{r.summary}</p>} />
      <InfoCards sections={[BIOLOGICS]} />
      <a
        href={`tel:${PRACTICE.office.tel}`}
        className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-accent font-semibold text-accent-ink no-underline"
      >
        <PhoneIcon /> Call for pricing {PRACTICE.office.label}
      </a>
    </Container>
  );
}
