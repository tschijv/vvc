import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkRateLimit, RATE_LIMITS } from "./rate-limit";

// We need to clear the in-memory store between tests
// Since the store is module-level, we re-import or use unique keys
let testCounter = 0;
function uniqueKey() {
  return `test-key-${Date.now()}-${testCounter++}`;
}

describe("checkRateLimit", () => {
  it("allows requests within the limit", () => {
    const key = uniqueKey();
    const config = { limit: 5, windowSeconds: 60 };
    const result = checkRateLimit(key, config);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("tracks remaining count correctly", () => {
    const key = uniqueKey();
    const config = { limit: 3, windowSeconds: 60 };

    const r1 = checkRateLimit(key, config);
    expect(r1.remaining).toBe(2);

    const r2 = checkRateLimit(key, config);
    expect(r2.remaining).toBe(1);

    const r3 = checkRateLimit(key, config);
    expect(r3.remaining).toBe(0);
  });

  it("blocks requests when limit is exceeded", () => {
    const key = uniqueKey();
    const config = { limit: 2, windowSeconds: 60 };

    checkRateLimit(key, config);
    checkRateLimit(key, config);
    const r3 = checkRateLimit(key, config);

    expect(r3.success).toBe(false);
    expect(r3.remaining).toBe(0);
  });

  it("uses separate counters for different keys", () => {
    const key1 = uniqueKey();
    const key2 = uniqueKey();
    const config = { limit: 1, windowSeconds: 60 };

    const r1 = checkRateLimit(key1, config);
    const r2 = checkRateLimit(key2, config);

    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
  });

  it("returns a reset timestamp in the future", () => {
    const key = uniqueKey();
    const config = { limit: 5, windowSeconds: 60 };
    const now = Math.floor(Date.now() / 1000);

    const result = checkRateLimit(key, config);
    expect(result.reset).toBeGreaterThan(now);
    expect(result.reset).toBeLessThanOrEqual(now + 61);
  });

  it("provides reset timestamp when rate limited", () => {
    const key = uniqueKey();
    const config = { limit: 1, windowSeconds: 60 };

    checkRateLimit(key, config);
    const blocked = checkRateLimit(key, config);

    expect(blocked.success).toBe(false);
    expect(blocked.reset).toBeGreaterThan(0);
  });

  it("handles limit of 1 correctly", () => {
    const key = uniqueKey();
    const config = { limit: 1, windowSeconds: 60 };

    const r1 = checkRateLimit(key, config);
    expect(r1.success).toBe(true);
    expect(r1.remaining).toBe(0);

    const r2 = checkRateLimit(key, config);
    expect(r2.success).toBe(false);
  });

  it("handles very large limits", () => {
    const key = uniqueKey();
    const config = { limit: 10000, windowSeconds: 60 };

    const result = checkRateLimit(key, config);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(9999);
  });
});

describe("RATE_LIMITS presets", () => {
  it("has api preset with 100 requests per minute", () => {
    expect(RATE_LIMITS.api.limit).toBe(100);
    expect(RATE_LIMITS.api.windowSeconds).toBe(60);
  });

  it("has auth preset with 10 requests per minute", () => {
    expect(RATE_LIMITS.auth.limit).toBe(10);
    expect(RATE_LIMITS.auth.windowSeconds).toBe(60);
  });

  it("has admin preset with 30 requests per minute", () => {
    expect(RATE_LIMITS.admin.limit).toBe(30);
    expect(RATE_LIMITS.admin.windowSeconds).toBe(60);
  });
});
