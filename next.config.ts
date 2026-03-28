import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent XSS attacks
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  // Prevent clickjacking
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // Prevent MIME type sniffing
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // Referrer policy
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Permissions policy
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Strict Transport Security (HTTPS only)
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  // Content Security Policy
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://api.qrserver.com https://*.tile.openstreetmap.org",
      "font-src 'self'",
      "connect-src 'self' https://api.anthropic.com https://*.neon.tech",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["gvc"],
  serverExternalPackages: ["@anthropic-ai/sdk"],
  typescript: {
    // TypeScript 5.9 + Prisma 6/7 veroorzaakt "Maximum call stack size exceeded"
    // bij deep nested type resolution. Compilatie werkt wel, alleen tsc --noEmit crasht.
    // TODO: verwijder zodra TS 5.10 of Prisma dit oplost
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
