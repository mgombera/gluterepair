import type { Metadata } from "next";
import { Walkthrough } from "@/components/Walkthrough";
import { Container, PageHeader } from "@/components/ui";

// Gate 2 review tool for Dr. Gombera. Not linked, not in the sitemap, not
// indexed and not counted in analytics. Remove at launch (milestone 8).
export const metadata: Metadata = {
  title: "Walkthrough",
  robots: { index: false, follow: false },
};

export default function WalkthroughPage() {
  return (
    <Container className="flex max-w-3xl flex-col gap-6 py-6 sm:py-10">
      <PageHeader
        title="Walkthrough"
        intro={<p className="m-0 text-muted">Checkpoints for both procedures, for your final review. This page is removed at launch.</p>}
      />
      <Walkthrough />
    </Container>
  );
}
