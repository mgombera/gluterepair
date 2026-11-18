import type { Metadata } from "next";
import { InternalPlaceholder } from "@/components/InternalPlaceholder";

// Clinic QR codes will link here: gluterepair.com/start?p=standard | max-transfer.
// The code preselects the procedure only. No date or name ever goes in a URL.
export const metadata: Metadata = {
  title: "Get started",
  robots: { index: false, follow: true },
};

export default function StartPage() {
  return (
    <InternalPlaceholder
      title="Get started"
      milestone={3}
      summary="Clinic QR codes open this page to preselect your procedure."
    />
  );
}
