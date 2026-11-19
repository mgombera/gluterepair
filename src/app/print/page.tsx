import type { Metadata } from "next";
import { PrintCenter } from "@/components/print/PrintCenter";
import { Container, PageHeader } from "@/components/ui";
import { routeInfo } from "@/lib/routes";

const r = routeInfo("/print");
export const metadata: Metadata = { title: r.title, description: r.summary, alternates: { canonical: "/print" } };

export default function PrintPage() {
  return (
    <Container className="flex max-w-3xl flex-col gap-6 py-6 sm:py-10">
      <PageHeader title={r.title} intro={<p className="m-0 text-muted">{r.summary}</p>} />
      <PrintCenter />
    </Container>
  );
}
