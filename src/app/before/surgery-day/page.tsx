import type { Metadata } from "next";
import { SURGERY_DAY } from "@/content";
import { Container, InfoCards, PageHeader } from "@/components/ui";
import { routeInfo } from "@/lib/routes";

const r = routeInfo("/before/surgery-day");
export const metadata: Metadata = { title: r.title, description: r.summary, alternates: { canonical: "/before/surgery-day" } };

export default function SurgeryDayPage() {
  return (
    <Container className="flex max-w-2xl flex-col gap-6 py-6 sm:py-10">
      <PageHeader title={r.title} intro={<p className="m-0 text-muted">{r.summary}</p>} />
      <InfoCards sections={SURGERY_DAY} />
    </Container>
  );
}
