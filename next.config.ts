import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // bcryptjs must not be bundled by Next.js — run it directly from node_modules
  serverExternalPackages: ['bcryptjs'],
};

export default nextConfig;
