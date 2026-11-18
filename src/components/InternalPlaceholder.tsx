import { Container, PageHeader } from "./ui";

// Body for the internal pages (/start, /proof, /walkthrough) until their
// milestone builds them. They are not linked, not in the sitemap and not indexed.
export function InternalPlaceholder({ title, milestone, summary }: { title: string; milestone: number; summary: string }) {
  return (
    <Container className="py-10">
      <PageHeader eyebrow={`Coming in milestone ${milestone}`} title={title} intro={<p className="m-0 text-muted">{summary}</p>} />
    </Container>
  );
}
