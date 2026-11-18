import type { Metadata } from "next";
import { Placeholder } from "@/components/Placeholder";
import { routeInfo } from "@/lib/routes";

const r = routeInfo("/after/when-to-call");
export const metadata: Metadata = { title: r.title, description: r.summary, alternates: { canonical: "/after/when-to-call" } };

export default function WhenToCallPage() {
  return <Placeholder path="/after/when-to-call" />;
}
