import { NextRequest, NextResponse } from "next/server";

/**
 * In-memory sliding window rate limiter.
 *
 * Each key (IP address) maintains a list of request timestamps.
 * On each check, expired timestamps are pruned and remaining count
 * is compared against the configured limit.
 */

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number; // Unix timestamp (seconds) when the window resets
}

interface RateLimitConfig {
  /** Maximum number of requests allowed within the window. */
  limit: number;
  /** Window duration in seconds. */
  windowSeconds: number;
}

// Store: key -> sorted array of request timestamps (ms)
const store = new Map<string, number[]>();

// Periodic cleanup to prevent memory leaks from stale keys
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
let lastCleanup = Date.now();

function cleanupStaleKeys(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, timestamps] of store) {
    const filtered = timestamps.filter((t) => t > now - windowMs);
    if (filtered.length === 0) {
      store.delete(key);
    } else {
      store.set(key, filtered);
    }
  }
}

/**
 * Check rate limit for a given key.
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const windowStart = now - windowMs;

  cleanupStaleKeys(windowMs);

  // Get existing timestamps, prune expired
  const timestamps = (store.get(key) || []).filter((t) => t > windowStart);

  if (timestamps.length >= config.limit) {
    // Rate limited — find the earliest timestamp that will expire
    const oldestInWindow = timestamps[0];
    const reset = Math.ceil((oldestInWindow + windowMs) / 1000);

    store.set(key, timestamps);

    return {
      success: false,
      remaining: 0,
      reset,
    };
  }

  // Allow request
  timestamps.push(now);
  store.set(key, timestamps);

  const reset = Math.ceil((now + windowMs) / 1000);

  return {
    success: true,
    remaining: config.limit - timestamps.length,
    reset,
  };
}

/**
 * Extract client IP from request headers.
 */
export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

// Pre-configured rate limit profiles
export const RATE_LIMITS = {
  /** Public API endpoints: 100 requests per minute */
  api: { limit: 100, windowSeconds: 60 } satisfies RateLimitConfig,
  /** Auth/login endpoints: 10 requests per minute */
  auth: { limit: 10, windowSeconds: 60 } satisfies RateLimitConfig,
  /** Admin endpoints: 30 requests per minute */
  admin: { limit: 30, windowSeconds: 60 } satisfies RateLimitConfig,
} as const;

/**
 * Helper that checks rate limiting and returns a 429 response if exceeded.
 * Returns null if the request is allowed.
 *
 * Usage in a route handler:
 *   const blocked = withRateLimit(request, RATE_LIMITS.api);
 *   if (blocked) return blocked;
 */
export function withRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): NextResponse | null {
  const ip = getClientIp(request);
  const key = `${ip}:${config.limit}:${config.windowSeconds}`;
  const result = checkRateLimit(key, config);

  if (!result.success) {
    const retryAfter = Math.max(1, result.reset - Math.floor(Date.now() / 1000));

    return NextResponse.json(
      {
        error: "Te veel verzoeken. Probeer het later opnieuw.",
        retryAfter,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(config.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(result.reset),
          "Retry-After": String(retryAfter),
        },
      }
    );
  }

  return null;
}

/**
 * Create rate-limited headers to attach to successful responses.
 */
export function rateLimitHeaders(
  request: NextRequest,
  config: RateLimitConfig
): Record<string, string> {
  const ip = getClientIp(request);
  const key = `${ip}:${config.limit}:${config.windowSeconds}`;
  const timestamps = store.get(key) || [];
  const now = Date.now();
  const windowStart = now - config.windowSeconds * 1000;
  const active = timestamps.filter((t) => t > windowStart);

  return {
    "X-RateLimit-Limit": String(config.limit),
    "X-RateLimit-Remaining": String(Math.max(0, config.limit - active.length)),
    "X-RateLimit-Reset": String(
      Math.ceil((now + config.windowSeconds * 1000) / 1000)
    ),
  };
}
