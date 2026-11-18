import type { Metadata } from "next";
import { InternalPlaceholder } from "@/components/InternalPlaceholder";

// Gate 2 review tool for Dr. Gombera. Not linked, not in the sitemap, not
// indexed and not counted in analytics. Remove at launch (milestone 8).
export const metadata: Metadata = {
  title: "Walkthrough",
  robots: { index: false, follow: false },
};

export default function WalkthroughPage() {
  return (
    <InternalPlaceholder
      title="Walkthrough"
      milestone={7}
      summary="Checkpoint states for both procedures, for the final review."
    />
  );
}
