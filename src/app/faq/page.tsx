import type { Metadata } from "next";
import { FaqList } from "@/components/FaqList";
import { Container, PageHeader } from "@/components/ui";
import { routeInfo } from "@/lib/routes";

const r = routeInfo("/faq");
export const metadata: Metadata = { title: r.title, description: r.summary, alternates: { canonical: "/faq" } };

export default function FaqPage() {
  return (
    <Container className="flex max-w-2xl flex-col gap-6 py-6 sm:py-10">
      <PageHeader title="Questions and answers" intro={<p className="m-0 text-muted">{r.summary}</p>} />
      <FaqList />
    </Container>
  );
}
