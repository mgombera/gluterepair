import type { Metadata } from "next";
import Image from "next/image";
import { Card, Container, SectionTitle } from "@/components/ui";
import { routeInfo } from "@/lib/routes";
import { PRACTICE } from "@/lib/site";

// About Dr. Gombera, from the approved sibling-site page. Credentials are
// confirmed with him at the milestone 7 walkthrough.

const r = routeInfo("/about");
export const metadata: Metadata = { title: r.title, description: r.summary, alternates: { canonical: "/about" } };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Physician",
  name: PRACTICE.doctor,
  medicalSpecialty: ["Orthopedic", "SportsMedicine"],
  url: "https://www.gomberamd.com/",
  telephone: "+1-713-794-3457",
  address: { "@type": "PostalAddress", streetAddress: "7401 Main Street", addressLocality: "Houston", addressRegion: "TX", postalCode: "77030", addressCountry: "US" },
};

const ROLES = [
  "Director, Hip Preservation Center",
  "Orthopedic surgery and sports medicine, Fondren Orthopedic Group",
  "Vice Chief of Staff, Texas Orthopedic Hospital",
  "Clinical Assistant Professor, UTMB",
  "Clinical Associate Professor, University of Houston College of Medicine",
];

const TRAINING = [
  "Doctor of Medicine, Baylor College of Medicine",
  "Orthopaedic surgery residency, University of Michigan",
  "Sports medicine fellowship, Northwestern University",
  "Bachelor of Business Administration with High Honors, McCombs School of Business, The University of Texas at Austin",
];

export default function AboutPage() {
  return (
    <Container className="flex max-w-3xl flex-col gap-6 py-6 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <Image
          src="/images/headshot.jpg"
          alt="Dr. Mufaddal Gombera"
          width={1674}
          height={2000}
          sizes="(min-width: 640px) 14rem, 60vw"
          className="h-auto w-3/5 max-w-56 rounded-[14px] sm:w-56"
          priority
        />
        <div className="flex flex-col gap-2">
          <p className="m-0 text-base font-semibold text-muted">Your surgeon</p>
          <h1 className="m-0 text-4xl leading-tight font-bold text-brand-ink">{PRACTICE.doctor}</h1>
          <p className="m-0">{PRACTICE.specialty} · Houston, Texas</p>
        </div>
      </div>
      <Card className="flex flex-col gap-3">
        <SectionTitle>Roles</SectionTitle>
        <ul className="m-0 flex list-disc flex-col gap-1.5 pl-5">
          {ROLES.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </Card>
      <Card className="flex flex-col gap-3">
        <SectionTitle>Training</SectionTitle>
        <ul className="m-0 flex list-disc flex-col gap-1.5 pl-5">
          {TRAINING.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </Card>
      <a href="https://www.gomberamd.com/" className="flex min-h-[52px] items-center justify-center rounded-xl bg-accent font-semibold text-accent-ink no-underline">
        More at gomberamd.com
      </a>
    </Container>
  );
}
