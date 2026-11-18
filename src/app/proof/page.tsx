import type { Metadata } from "next";
import { InternalPlaceholder } from "@/components/InternalPlaceholder";

// Gate 1 review tool for Dr. Gombera. Not linked, not in the sitemap, not indexed.
export const metadata: Metadata = {
  title: "Content proof",
  robots: { index: false, follow: false },
};

export default function ProofPage() {
  return (
    <InternalPlaceholder
      title="Content proof"
      milestone={2}
      summary="Every instruction on the site, grouped by source document, for clinical sign-off."
    />
  );
}
