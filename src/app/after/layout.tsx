import { SectionNav } from "@/components/SectionNav";

const ITEMS = [
  { href: "/after", label: "Dashboard" },
  { href: "/after/care", label: "Home Care" },
  { href: "/after/timeline", label: "Timeline" },
  { href: "/after/home-program", label: "Home Program" },
  { href: "/after/when-to-call", label: "When to Call" },
];

export default function AfterLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SectionNav label="After surgery" items={ITEMS} />
      {children}
    </>
  );
}
