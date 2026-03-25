import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["gvc"],
  typescript: {
    // TypeScript 5.9 + Prisma 6/7 veroorzaakt "Maximum call stack size exceeded"
    // bij deep nested type resolution. Compilatie werkt wel, alleen tsc --noEmit crasht.
    // TODO: verwijder zodra TS 5.10 of Prisma dit oplost
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
