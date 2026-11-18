import type { Metadata } from "next";
import { Suspense } from "react";
import { StartRedirect } from "@/components/StartRedirect";
import { Container } from "@/components/ui";

// Clinic QR codes link here: gluterepair.com/start?p=standard | max-transfer.
// The code preselects the procedure only. No date or name ever goes in a URL.
export const metadata: Metadata = {
  title: "Get started",
  robots: { index: false, follow: true },
};

export default function StartPage() {
  return (
    <Container className="py-10">
      <p className="m-0" aria-live="polite">
        Opening your surgery guide…
      </p>
      <Suspense>
        <StartRedirect />
      </Suspense>
    </Container>
  );
}
