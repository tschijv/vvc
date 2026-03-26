import { NextRequest, NextResponse } from "next/server";
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
        if (u === user && p === pass) {
          const response = NextResponse.next();
          response.headers.set("X-Frame-Options", "DENY");
          response.headers.set("X-Content-Type-Options", "nosniff");
          response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
          response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
          return response;
        }
      }
    }
  }
  return new NextResponse("Toegang geweigerd", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="VNG Voorzieningencatalogus"',
    },
  });
}
// Only match page routes, not _next internals, API routes, or static files
export const config = {
  matcher: [
    "/((?!_next|api|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|ico|webp|woff|woff2|ttf|css|js|map)$).*)",
  ],
};
