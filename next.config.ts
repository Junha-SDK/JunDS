import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      "@/ds",
      "@/ds/primitives",
      "@/ds/composites",
      "@/ds/patterns",
      "@/ds/layout",
      "@/ds/hooks",
      "@/ds/core",
      "@/ds/tokens",
    ],
  },
};

export default nextConfig;
