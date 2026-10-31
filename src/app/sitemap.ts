import type { MetadataRoute } from "next";
import { ROUTES } from "@/lib/routes";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((r) => ({ url: `${SITE_URL}${r.path === "/" ? "" : r.path}` }));
}
