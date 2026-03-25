const { chromium } = require("playwright");
const path = require("path");

const BASE = "http://localhost:3000";
const DIR = path.join(__dirname, "..", "docs", "screenshots");

const pages = [
  { name: "01-homepage", url: "/" },
  { name: "02-pakketten", url: "/pakketten" },
  { name: "03-leveranciers", url: "/leveranciers" },
  { name: "04-gemeenten", url: "/gemeenten" },
  { name: "05-gemeente-detail", url: "/gemeenten/1f41e9e0-ac4d-471d-850a-9c083103667d" },
  { name: "06-compliancy", url: "/compliancy" },
  { name: "07-inkoop", url: "/inkoop" },
  { name: "08-standaarden", url: "/standaarden" },
  { name: "09-referentiecomponenten", url: "/referentiecomponenten" },
  { name: "10-begrippen", url: "/begrippen" },
  { name: "11-zoeken-squit", url: "/zoeken?q=squit" },
  { name: "12-addenda", url: "/addenda" },
  { name: "13-pakketversies", url: "/pakketversies" },
  { name: "14-applicatiefuncties", url: "/applicatiefuncties" },
  { name: "15-koppelingen", url: "/koppelingen" },
  { name: "16-admin", url: "/admin" },
  { name: "17-admin-demo", url: "/admin/demo" },
  { name: "18-admin-pve", url: "/admin/pve-analyse" },
  { name: "19-admin-datamodel", url: "/admin/datamodel" },
  { name: "20-admin-linked-data", url: "/admin/linked-data" },
  { name: "21-profiel", url: "/profiel" },
  { name: "22-help", url: "/help" },
];

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    storageState: undefined,
  });

  // Login first
  const loginPage = await context.newPage();
  await loginPage.goto(`${BASE}/auth/login`);
  await loginPage.fill('input[name="email"]', "admin@swc.nl");
  await loginPage.fill('input[name="password"]', "admin123");
  await loginPage.click('button[type="submit"]');
  await loginPage.waitForTimeout(2000);
  await loginPage.close();

  for (const p of pages) {
    const page = await context.newPage();
    try {
      await page.goto(`${BASE}${p.url}`, { waitUntil: "networkidle", timeout: 15000 });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(DIR, `${p.name}.png`), fullPage: false });
      console.log(`✓ ${p.name}`);
    } catch (e) {
      console.log(`✗ ${p.name}: ${e.message}`);
    }
    await page.close();
  }

  await browser.close();
  console.log(`\nKlaar! ${pages.length} screenshots in docs/screenshots/`);
})();
