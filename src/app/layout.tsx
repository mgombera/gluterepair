import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PageViews } from "@/components/PageViews";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import { PRACTICE, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Glute Repair | Gluteus Tendon Surgery Guide | Dr. Mufaddal Gombera",
    template: "%s | Glute Repair",
  },
  description:
    "Your personal guide before and after Open Gluteus Tendon Repair or Gluteus Maximus Transfer with Dr. Mufaddal Gombera: what to do today, your recovery timeline, exercises and when to call.",
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#313E6B",
  width: "device-width",
  initialScale: 1,
};

// Search markup (scope section 9): a medical web page about the surgery,
// written for patients, linked to Dr. Gombera's practice site.
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "MedicalWebPage",
  url: SITE_URL,
  name: "gluterepair.com",
  audience: { "@type": "Patient" },
  about: [
    { "@type": "MedicalProcedure", name: "Open Gluteus Tendon Repair" },
    { "@type": "MedicalProcedure", name: "Gluteus Maximus Transfer" },
  ],
  author: {
    "@type": "Physician",
    name: PRACTICE.doctor,
    url: "https://www.gomberamd.com/",
    telephone: PRACTICE.office.label,
    address: {
      "@type": "PostalAddress",
      streetAddress: "7401 Main Street",
      addressLocality: "Houston",
      addressRegion: "TX",
      postalCode: "77030",
      addressCountry: "US",
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      </head>
      <body className="flex min-h-screen flex-col bg-bg text-text antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-accent focus:px-4 focus:py-3 focus:text-accent-ink print:hidden"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <PageViews />
      </body>
    </html>
  );
}
