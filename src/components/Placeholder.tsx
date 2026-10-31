import { routeInfo } from "@/lib/routes";
import { PageHeader, Container } from "./ui";

// Temporary page body until the milestone that builds the real page.
export function Placeholder({ path }: { path: string }) {
  const r = routeInfo(path);
  return (
    <Container className="py-10">
      <PageHeader eyebrow={`Coming in milestone ${r.milestone}`} title={r.title} intro={<p className="m-0 text-muted">{r.summary}</p>} />
    </Container>
  );
}
