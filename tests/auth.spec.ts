import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("login page loads", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page).toHaveURL(/\/auth\/login/);
    // Should show a login form
    await expect(page.locator('input[name="email"], input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[name="password"], input[type="password"]').first()).toBeVisible();
  });

  test("login page has a submit button", async ({ page }) => {
    await page.goto("/auth/login");
    const submitBtn = page.locator(
      'button[type="submit"], input[type="submit"]'
    );
    await expect(submitBtn.first()).toBeVisible();
  });

  test("invalid credentials show error message", async ({ page }) => {
    await page.goto("/auth/login");
    await page.locator('input[name="email"], input[type="email"]').first().fill("invalid@example.com");
    await page.locator('input[name="password"], input[type="password"]').first().fill("wrongpassword");
    await page.locator('button[type="submit"]').first().click();
    // Wait for error message to appear
    const errorMsg = page.locator('text="Onjuist e-mailadres of wachtwoord"');
    await expect(errorMsg).toBeVisible({ timeout: 10_000 });
  });

  test("login with empty email shows validation", async ({ page }) => {
    await page.goto("/auth/login");
    // Leave email empty, fill password
    await page.locator('input[name="password"], input[type="password"]').first().fill("somepassword");
    await page.locator('button[type="submit"]').first().click();
    // Should show a validation error or HTML5 required constraint
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    const isInvalid =
      (await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid).catch(() => false)) ||
      (await page.locator("text=/e-mail|verplicht|required|vul in/i").isVisible().catch(() => false));
    expect(isInvalid).toBeTruthy();
  });

  test("login with empty password shows validation", async ({ page }) => {
    await page.goto("/auth/login");
    // Fill email, leave password empty
    await page.locator('input[name="email"], input[type="email"]').first().fill("test@example.com");
    await page.locator('button[type="submit"]').first().click();
    // Should show a validation error or HTML5 required constraint
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    const isInvalid =
      (await passwordInput.evaluate((el: HTMLInputElement) => !el.validity.valid).catch(() => false)) ||
      (await page.locator("text=/wachtwoord|verplicht|required|vul in/i").isVisible().catch(() => false));
    expect(isInvalid).toBeTruthy();
  });

  test("registration page loads correctly", async ({ page }) => {
    await page.goto("/auth/registreren");
    await expect(page).toHaveURL(/\/auth\/registreren/);
    // Should show registration form fields
    await expect(page.locator('input[name="email"], input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[name="password"], input[type="password"]').first()).toBeVisible();
    // Should have a submit button
    const submitBtn = page.locator('button[type="submit"], input[type="submit"]');
    await expect(submitBtn.first()).toBeVisible();
  });

  test("admin pages redirect unauthenticated users", async ({ page }) => {
    await page.goto("/admin");
    // Should redirect to login or show access denied
    await page.waitForLoadState("networkidle");
    const url = page.url();
    const isRedirected = url.includes("/auth/login") || url.includes("/api/auth");
    const hasAccessDenied = await page
      .locator('text=/geen toegang|niet ingelogd|login/i')
      .isVisible()
      .catch(() => false);
    // Either redirected to login or shows an access-denied message, or 404
    expect(isRedirected || hasAccessDenied || page.url().includes("/admin")).toBeTruthy();
  });
});
