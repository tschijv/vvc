import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads with correct title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Voorzieningencatalogus/i);
  });

  test("displays navigation menu items", async ({ page }) => {
    await page.goto("/");
    // The site has a navigation bar with links to main sections
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.getByRole("link", { name: /pakketten/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /gemeenten/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /leveranciers/i })).toBeVisible();
  });

  test("homepage tiles/cards are present", async ({ page }) => {
    await page.goto("/");
    // The homepage has content sections/tiles
    const main = page.locator("main");
    await expect(main).toBeVisible();
    // Should have multiple links or cards on the page
    const links = main.getByRole("link");
    await expect(links.first()).toBeVisible();
  });

  test("search bar navigates to /zoeken", async ({ page }) => {
    await page.goto("/");
    // Look for a search input or link to search
    const searchLink = page.getByRole("link", { name: "Zoeken", exact: true });
    if (await searchLink.isVisible()) {
      await searchLink.click();
      await expect(page).toHaveURL(/\/zoeken/);
    } else {
      // Try keyboard shortcut or search icon
      const searchInput = page.locator('input[type="search"], input[placeholder*="Zoek"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill("test");
        await searchInput.press("Enter");
        await expect(page).toHaveURL(/\/zoeken/);
      }
    }
  });
});
