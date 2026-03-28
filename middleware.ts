import { NextRequest, NextResponse } from "next/server";

/**
 * Constant-time string comparison to prevent timing attacks.
 * Uses bitwise XOR so the comparison time is always proportional
 * to the string length, regardless of where a mismatch occurs.
 */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * HTTP Basic Authentication middleware.
 * Only active when BASIC_AUTH_USER and BASIC_AUTH_PASS are set (i.e. on Vercel production).
 * Locally these env vars are typically not set, so development runs without auth.
 */
export function middleware(request: NextRequest) {
  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASS;
  // Skip basic auth if credentials are not configured (local development)
  if (!user || !pass) {
    const response = NextResponse.next();
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    response.headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';");
    return response;
  }
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    const [scheme, encoded] = authHeader.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = atob(encoded);
      // Use indexOf to handle passwords containing ':'
      const colonIndex = decoded.indexOf(":");
      if (colonIndex !== -1) {
        const u = decoded.substring(0, colonIndex);
        const p = decoded.substring(colonIndex + 1);
        if (safeEqual(u, user) && safeEqual(p, pass)) {
          const response = NextResponse.next();
          response.headers.set("X-Frame-Options", "DENY");
          response.headers.set("X-Content-Type-Options", "nosniff");
          response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
          response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
          response.headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';");
          return response;
        }
      }
    }
  }
  return new NextResponse("Toegang geweigerd", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${process.env.TENANT === "hwh" ? "HWH Voorzieningencatalogus" : "VNG Voorzieningencatalogus"}"`,
    },
  });
}
// Only match page routes, not _next internals, API routes, or static files
export const config = {
  matcher: [
    "/((?!_next|api|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|ico|webp|woff|woff2|ttf|css|js|map)$).*)",
  ],
};
