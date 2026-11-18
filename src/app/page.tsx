import type { Metadata } from "next";
import { Suspense } from "react";
import { HomeSetup } from "@/components/HomeSetup";
import { Container } from "@/components/ui";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function HomePage() {
  return (
    <Container className="flex max-w-2xl flex-col gap-5 py-6 sm:py-10">
      <div className="flex flex-col gap-2">
        <h1 className="m-0 text-[30px] leading-tight font-bold text-brand-ink sm:text-4xl">Your guide to gluteus tendon surgery</h1>
        <p className="m-0 text-muted">Tell us two things and we will show you what to do today, from now until one year after surgery.</p>
      </div>
      <Suspense fallback={<div className="min-h-64 rounded-[14px] border border-border bg-surface" aria-busy="true" />}>
        <HomeSetup />
      </Suspense>
    </Container>
  );
}
