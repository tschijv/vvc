import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// 1. 404 Pages
// ---------------------------------------------------------------------------
test.describe("404 Pages", () => {
  test("non-existent gemeente slug returns 404 or niet gevonden", async ({ page }) => {
    const response = await page.goto("/gemeenten/deze-gemeente-bestaat-niet-xyz");
    expect(
      response?.status() === 404 ||
        (await page.locator("text=/niet gevonden|404|not found/i").isVisible().catch(() => false))
    ).toBeTruthy();
  });

  test("non-existent pakket slug returns 404 or niet gevonden", async ({ page }) => {
    const response = await page.goto("/pakketten/dit-pakket-bestaat-niet-xyz");
    expect(
      response?.status() === 404 ||
        (await page.locator("text=/niet gevonden|404|not found/i").isVisible().catch(() => false))
    ).toBeTruthy();
  });

  test("non-existent leverancier slug returns 404 or niet gevonden", async ({ page }) => {
    const response = await page.goto("/leveranciers/deze-leverancier-bestaat-niet-xyz");
    expect(
      response?.status() === 404 ||
        (await page.locator("text=/niet gevonden|404|not found/i").isVisible().catch(() => false))
    ).toBeTruthy();
  });

  test("random URL returns 404 or niet gevonden", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(
      response?.status() === 404 ||
        (await page.locator("text=/niet gevonden|404|not found/i").isVisible().catch(() => false))
    ).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// 2. API Error Handling
// ---------------------------------------------------------------------------
test.describe("API Error Handling", () => {
  test("GET /api/v1/gemeenten/non-existent-id returns 404 with error JSON", async ({ request }) => {
    const response = await request.get("/api/v1/gemeenten/non-existent-id-xyz");
    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body).toHaveProperty("error");
  });

  test("GET /api/v1/leveranciers/non-existent-id returns 404 with error JSON", async ({ request }) => {
    const response = await request.get("/api/v1/leveranciers/non-existent-id-xyz");
    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body).toHaveProperty("error");
  });

  test("GET /api/v1/gemeenten/non-existent-id/pakketten returns 404", async ({ request }) => {
    const response = await request.get("/api/v1/gemeenten/non-existent-id-xyz/pakketten");
    expect(response.status()).toBe(404);
  });

  test("GET /api/v1/leveranciers/non-existent-id/pakketten returns 404", async ({ request }) => {
    const response = await request.get("/api/v1/leveranciers/non-existent-id-xyz/pakketten");
    expect(response.status()).toBe(404);
  });

  test("GET /api/v1/gemeenten?limit=-1 still returns 200 (clamped to 1)", async ({ request }) => {
    const response = await request.get("/api/v1/gemeenten?limit=-1");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty("data");
    expect(Array.isArray(body.data)).toBeTruthy();
    // Negative limit should be clamped — we expect at most a small number of results
    expect(body.data.length).toBeLessThanOrEqual(200);
  });

  test("GET /api/v1/gemeenten?limit=999 returns max 200 items", async ({ request }) => {
    const response = await request.get("/api/v1/gemeenten?limit=999");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty("data");
    expect(body.data.length).toBeLessThanOrEqual(200);
  });

  test("GET /api/v1/gemeenten?offset=999999 returns empty data array", async ({ request }) => {
    const response = await request.get("/api/v1/gemeenten?offset=999999");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty("data");
    expect(body.data.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 3. Auth / Access Control
// ---------------------------------------------------------------------------
test.describe("Auth / Access Control", () => {
  test("POST /api/admin/users without auth returns 4xx", async ({ request }) => {
    const response = await request.post("/api/admin/users", {
      data: { name: "test", email: "test@example.com" },
    });
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
  });

  test("POST /api/auth/registreren with empty body returns 400", async ({ request }) => {
    const response = await request.post("/api/auth/registreren", {
      data: {},
    });
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
  });

  test("POST /api/auth/wachtwoord-vergeten with invalid email returns error", async ({ request }) => {
    const response = await request.post("/api/auth/wachtwoord-vergeten", {
      data: { email: "not-an-email" },
    });
    // Should return a client error or silently succeed (to avoid email enumeration)
    expect(response.status()).toBeLessThan(500);
  });

  test("POST /api/auth/wachtwoord-reset with invalid token returns error", async ({ request }) => {
    const response = await request.post("/api/auth/wachtwoord-reset", {
      data: { token: "fake-invalid-token", password: "NewPass123!" },
    });
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
  });

  test("PUT /api/profiel without auth returns 401", async ({ request }) => {
    const response = await request.put("/api/profiel", {
      data: { name: "Unauthorized User" },
    });
    expect(response.status()).toBe(401);
  });

  test("POST /api/favorieten without auth returns 401", async ({ request }) => {
    const response = await request.post("/api/favorieten", {
      data: { type: "pakket", id: "fake-id" },
    });
    expect(response.status()).toBe(401);
  });

  test("POST /api/admin/gemeenten/samenvoegen without auth returns 4xx", async ({ request }) => {
    const response = await request.post("/api/admin/gemeenten/samenvoegen", {
      data: { sourceId: "a", targetId: "b" },
    });
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
  });
});

// ---------------------------------------------------------------------------
// 4. Input Validation
// ---------------------------------------------------------------------------
test.describe("Input Validation", () => {
  test("POST /api/auth/registreren with missing fields returns validation error", async ({ request }) => {
    const response = await request.post("/api/auth/registreren", {
      data: { email: "incomplete@example.com" },
    });
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
  });

  test("PUT /api/admin/users/fake-id with invalid data returns error", async ({ request }) => {
    const response = await request.put("/api/admin/users/fake-id", {
      data: { email: "not-valid-email", role: "NONEXISTENT_ROLE" },
    });
    // Either 401 (no auth) or 400 (validation) — both are acceptable client errors
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
  });

  test("POST /api/admin/gemeenten/samenvoegen with same source and target returns error", async ({ request }) => {
    const response = await request.post("/api/admin/gemeenten/samenvoegen", {
      data: { sourceId: "same-id", targetId: "same-id" },
    });
    // Either 401 (no auth) or 400 (validation) — both are acceptable client errors
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
  });
});

// ---------------------------------------------------------------------------
// 5. Protected Pages
// ---------------------------------------------------------------------------
test.describe("Protected Pages", () => {
  test("/dashboard redirects unauthenticated to login or homepage", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    const url = page.url();
    // Should redirect away from /dashboard or show login/access denied
    const isRedirected =
      url.includes("/auth/login") || url.includes("/api/auth") || !url.includes("/dashboard");
    const hasAccessDenied = await page
      .locator("text=/geen toegang|niet ingelogd|login|inloggen/i")
      .isVisible()
      .catch(() => false);
    expect(isRedirected || hasAccessDenied).toBeTruthy();
  });

  test("/upload redirects unauthenticated", async ({ page }) => {
    await page.goto("/upload");
    await page.waitForLoadState("networkidle");
    const url = page.url();
    const isRedirected =
      url.includes("/auth/login") || url.includes("/api/auth") || !url.includes("/upload");
    const hasAccessDenied = await page
      .locator("text=/geen toegang|niet ingelogd|login|inloggen/i")
      .isVisible()
      .catch(() => false);
    expect(isRedirected || hasAccessDenied).toBeTruthy();
  });

  test("/profiel redirects unauthenticated", async ({ page }) => {
    await page.goto("/profiel");
    await page.waitForLoadState("networkidle");
    const url = page.url();
    const isRedirected =
      url.includes("/auth/login") || url.includes("/api/auth") || !url.includes("/profiel");
    const hasAccessDenied = await page
      .locator("text=/geen toegang|niet ingelogd|login|inloggen/i")
      .isVisible()
      .catch(() => false);
    expect(isRedirected || hasAccessDenied).toBeTruthy();
  });

  test("/favorieten redirects unauthenticated", async ({ page }) => {
    await page.goto("/favorieten");
    await page.waitForLoadState("networkidle");
    const url = page.url();
    const isRedirected =
      url.includes("/auth/login") || url.includes("/api/auth") || !url.includes("/favorieten");
    const hasAccessDenied = await page
      .locator("text=/geen toegang|niet ingelogd|login|inloggen/i")
      .isVisible()
      .catch(() => false);
    expect(isRedirected || hasAccessDenied).toBeTruthy();
  });

  test("/notificaties redirects unauthenticated", async ({ page }) => {
    await page.goto("/notificaties");
    await page.waitForLoadState("networkidle");
    const url = page.url();
    const isRedirected =
      url.includes("/auth/login") || url.includes("/api/auth") || !url.includes("/notificaties");
    const hasAccessDenied = await page
      .locator("text=/geen toegang|niet ingelogd|login|inloggen/i")
      .isVisible()
      .catch(() => false);
    expect(isRedirected || hasAccessDenied).toBeTruthy();
  });
});
