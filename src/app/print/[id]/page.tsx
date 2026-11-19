import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRINT_SHEETS, printSheet } from "@/content";
import { PrintSheetView } from "@/components/print/PrintSheetView";
import { Container } from "@/components/ui";

// One printable sheet: /print/checklist, /print/protocol, /print/care, /print/red-flags.

export const dynamicParams = false;

export function generateStaticParams() {
  return PRINT_SHEETS.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const s = printSheet((await params).id);
  return s ? { title: s.title, description: s.summary, alternates: { canonical: `/print/${s.id}` } } : {};
}

export default async function PrintSheetPage({ params }: { params: Promise<{ id: string }> }) {
  const s = printSheet((await params).id);
  if (!s) notFound();
  return (
    <Container className="flex max-w-4xl flex-col py-6 sm:py-10 print:max-w-none print:p-0">
      <PrintSheetView id={s.id} />
    </Container>
  );
}
