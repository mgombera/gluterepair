import type { Metadata } from "next";
import { Placeholder } from "@/components/Placeholder";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function HomePage() {
  return <Placeholder path="/" />;
}
