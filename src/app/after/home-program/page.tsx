import type { Metadata } from "next";
import { Placeholder } from "@/components/Placeholder";
import { routeInfo } from "@/lib/routes";

const r = routeInfo("/after/home-program");
export const metadata: Metadata = { title: r.title, description: r.summary, alternates: { canonical: "/after/home-program" } };

export default function HomeProgramPage() {
  return <Placeholder path="/after/home-program" />;
}
