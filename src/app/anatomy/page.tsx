import type { Metadata } from "next";
import { Placeholder } from "@/components/Placeholder";
import { routeInfo } from "@/lib/routes";

const r = routeInfo("/anatomy");
export const metadata: Metadata = { title: r.title, description: r.summary, alternates: { canonical: "/anatomy" } };

export default function AnatomyPage() {
  return <Placeholder path="/anatomy" />;
}
