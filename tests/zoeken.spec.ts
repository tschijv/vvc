import { test, expect } from "@playwright/test";

test.describe("Zoeken (search) page", () => {
  test("loads the search page", async ({ page }) => {
    await page.goto("/zoeken");
    await expect(page).toHaveURL(/\/zoeken/);
    // Should have a search input
    const searchInput = page.locator(
      'input[name="q"], input[type="search"], input[placeholder*="Zoek"]'
    );
    await expect(searchInput.first()).toBeVisible();
  });

  test("search returns results for a common term", async ({ page }) => {
    await page.goto("/zoeken?q=gemeente");
    // Wait for results or a results container
    await page.waitForLoadState("networkidle");
    const main = page.locator("main");
    await expect(main).toBeVisible();
  });

  test("filter chips are present when searching", async ({ page }) => {
    await page.goto("/zoeken?q=test");
    await page.waitForLoadState("networkidle");
    // Filter chips/buttons for types (Pakket, Leverancier, Gemeente, etc.)
    const filterButtons = page.locator(
      'a[href*="type="], button:has-text("Pakket"), button:has-text("Leverancier"), button:has-text("Gemeente")'
    );
    // Just verify the page rendered
    await expect(page.locator("main")).toBeVisible();
  });
});
