import type { NextConfig } from "next";
import { LEGACY_REDIRECTS } from "./src/lib/routes";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "www.gomberamd.com", pathname: "/wp-content/uploads/**" },
    ],
  },
  async redirects() {
    return [
      // www to apex
      {
        source: "/:path*",
        has: [{ type: "host" as const, value: "www.gluterepair.com" }],
        destination: "https://gluterepair.com/:path*",
        permanent: true,
      },
      ...LEGACY_REDIRECTS.map((r) => ({ ...r, permanent: true })),
    ];
  },
};

export default nextConfig;
