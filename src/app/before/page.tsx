import type { Metadata } from "next";
import { Placeholder } from "@/components/Placeholder";
import { routeInfo } from "@/lib/routes";

const r = routeInfo("/before");
export const metadata: Metadata = { title: r.title, description: r.summary, alternates: { canonical: "/before" } };

export default function BeforePage() {
  return <Placeholder path="/before" />;
}
