import type { Metadata } from "next";
import Link from "next/link";
import { DIAGNOSIS, OUTCOMES } from "@/content";
import { Container, InfoCards, PageHeader } from "@/components/ui";
import { routeInfo } from "@/lib/routes";

const r = routeInfo("/before/diagnosis");
export const metadata: Metadata = { title: r.title, description: r.summary, alternates: { canonical: "/before/diagnosis" } };

export default function DiagnosisPage() {
  return (
    <Container className="flex max-w-2xl flex-col gap-6 py-6 sm:py-10">
      <PageHeader title={r.title} intro={<p className="m-0 text-muted">{r.summary}</p>} />
      <InfoCards sections={[...DIAGNOSIS, OUTCOMES]} />
      <Link
        href="/anatomy"
        className="flex min-h-[52px] items-center justify-center rounded-xl border-2 border-accent font-semibold text-accent no-underline"
      >
        See the tendons and the repair in 3D
      </Link>
    </Container>
  );
}
