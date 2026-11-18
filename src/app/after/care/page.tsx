import type { Metadata } from "next";
import { HOME_CARE, MEDICATION_NOTICE, MEDICATION_TIPS, STANDARD_MEDICATIONS } from "@/content";
import { Container, InfoCards, PageHeader, SectionTitle } from "@/components/ui";
import { routeInfo } from "@/lib/routes";

const r = routeInfo("/after/care");
export const metadata: Metadata = { title: r.title, description: r.summary, alternates: { canonical: "/after/care" } };

export default function HomeCarePage() {
  return (
    <Container className="flex max-w-2xl flex-col gap-6 py-6 sm:py-10">
      <PageHeader title={r.title} intro={<p className="m-0 text-muted">{r.summary}</p>} />
      <InfoCards sections={HOME_CARE} />
      <section aria-labelledby="medications" className="flex flex-col gap-4">
        <SectionTitle id="medications">Medications</SectionTitle>
        <p role="note" className="m-0 rounded-[14px] border-2 border-accent bg-surface p-4 font-semibold">
          {MEDICATION_NOTICE}
        </p>
        <InfoCards sections={[STANDARD_MEDICATIONS, MEDICATION_TIPS]} headingLevel={3} />
      </section>
    </Container>
  );
}
