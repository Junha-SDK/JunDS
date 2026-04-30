import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["@junds/ui"],
  },
};

export default nextConfig;
