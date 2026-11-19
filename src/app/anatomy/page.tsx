import type { Metadata } from "next";
import { GluteExplorer } from "@/components/anatomy/GluteExplorer";
import { Container, PageHeader } from "@/components/ui";
import { routeInfo } from "@/lib/routes";

// Anatomy model (scope 6.7). Gate: Dr. Gombera approves the model on a preview.

const r = routeInfo("/anatomy");
export const metadata: Metadata = { title: r.title, description: r.summary, alternates: { canonical: "/anatomy" } };

export default function AnatomyPage() {
  return (
    <Container className="flex max-w-3xl flex-col gap-5 py-6 sm:py-10">
      <PageHeader title={r.title} intro={<p className="m-0 text-muted">The outside of a right hip. Switch between before surgery and after the repair.</p>} />
      <GluteExplorer />
      <p className="m-0 text-base text-muted">
        The model shows the Open Gluteus Tendon Repair. Bones are from the{" "}
        <a href="https://humanatlas.io/3d-reference-library" className="underline underline-offset-2">
          HuBMAP Human Reference Atlas
        </a>{" "}
        (Visible Human Male), used under{" "}
        <a href="https://creativecommons.org/licenses/by/4.0/" className="underline underline-offset-2">
          CC BY 4.0
        </a>
        ; the tendons, bursa, IT band and repair were added for this site.
      </p>
    </Container>
  );
}
