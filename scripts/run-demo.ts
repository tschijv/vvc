#!/usr/bin/env npx tsx
/**
 * Geautomatiseerde demo met spraak
 *
 * Gebruik:
 *   npx tsx scripts/run-demo.ts                  # volledige demo
 *   npx tsx scripts/run-demo.ts --start=5        # start bij sectie 5
 *   npx tsx scripts/run-demo.ts --speed=slow     # langzamer tempo
 *   npx tsx scripts/run-demo.ts --speed=fast     # sneller tempo
 *   npx tsx scripts/run-demo.ts --record         # neem video op
 *   npx tsx scripts/run-demo.ts --no-voice       # zonder spraak
 *   npx tsx scripts/run-demo.ts --sections=1,5,8 # alleen specifieke secties
 */

import { chromium, type Page, type BrowserContext } from "playwright";
import { demoSections as sections, type DemoSection } from "../lib/demo-sections";

// ─── Config ──────────────────────────────────────────────────────────────────

const BASE = "http://localhost:3000";

const SPEED_MULTIPLIERS: Record<string, number> = {
  slow: 1.5,
  normal: 1.0,
  fast: 0.6,
};

function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    start: 1,
    speed: "normal" as string,
    record: false,
    voice: true,
    sections: null as number[] | null,
  };

  for (const arg of args) {
    if (arg.startsWith("--start=")) config.start = parseInt(arg.split("=")[1]);
    if (arg.startsWith("--speed=")) config.speed = arg.split("=")[1];
    if (arg === "--record") config.record = true;
    if (arg === "--no-voice") config.voice = false;
    if (arg.startsWith("--sections=")) {
      config.sections = arg.split("=")[1].split(",").map(Number);
    }
  }

  return config;
}

// ─── Narrator (Browser Speech Synthesis) ─────────────────────────────────────

async function speak(page: Page, text: string, speed: number): Promise<void> {
  // Use the browser's built-in speech synthesis
  await page.evaluate(
    ({ text, rate }) => {
      return new Promise<void>((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "nl-NL";
        utterance.rate = rate;
        utterance.pitch = 1.0;

        // Try to find a Dutch voice
        const voices = speechSynthesis.getVoices();
        const nlVoice = voices.find(
          (v) => v.lang === "nl-NL" || v.lang === "nl_NL" || v.lang.startsWith("nl")
        );
        if (nlVoice) utterance.voice = nlVoice;

        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        speechSynthesis.speak(utterance);
      });
    },
    { text, rate: speed === 1.5 ? 0.85 : speed === 0.6 ? 1.2 : 1.0 }
  );
}

async function announceSection(
  page: Page,
  section: DemoSection,
  speed: number,
  useVoice: boolean
): Promise<void> {
  const intro = `Onderdeel ${section.nr}: ${section.titel}.`;
  const full = `${intro} ${section.toelichting}`;

  console.log(`\n${"═".repeat(60)}`);
  console.log(`  ${section.nr}. ${section.titel} (${section.duur})`);
  console.log(`  ${section.link}`);
  console.log(`${"═".repeat(60)}`);

  if (useVoice) {
    await speak(page, full, speed);
  }
}

// ─── Section overlay (shown during narration) ────────────────────────────────

async function showOverlay(page: Page, section: DemoSection): Promise<void> {
  await page.evaluate(
    ({ nr, titel, toelichting }) => {
      // Remove existing overlays
      document.getElementById("demo-overlay")?.remove();
      document.getElementById("demo-subtitle")?.remove();

      // Add animation keyframes
      if (!document.getElementById("demo-styles")) {
        const style = document.createElement("style");
        style.id = "demo-styles";
        style.textContent = `
          @keyframes demo-fade-in {
            from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
          }
          @keyframes demo-fade-in-up {
            from { opacity: 0; transform: translateX(-50%) translateY(10px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
          }
        `;
        document.head.appendChild(style);
      }

      // Top bar: section title
      const overlay = document.createElement("div");
      overlay.id = "demo-overlay";
      overlay.style.cssText = `
        position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
        background: rgba(26, 108, 168, 0.95); color: white;
        padding: 12px 28px; border-radius: 8px; z-index: 99999;
        font-family: system-ui, sans-serif; font-size: 16px; font-weight: 600;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3); pointer-events: none;
        animation: demo-fade-in 0.3s ease;
      `;
      overlay.textContent = `${nr}. ${titel}`;
      document.body.appendChild(overlay);

      // Bottom bar: subtitle with toelichting
      const subtitle = document.createElement("div");
      subtitle.id = "demo-subtitle";
      subtitle.style.cssText = `
        position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8); color: white;
        padding: 14px 32px; border-radius: 8px; z-index: 99999;
        font-family: system-ui, sans-serif; font-size: 15px; line-height: 1.5;
        max-width: 80vw; text-align: center;
        box-shadow: 0 4px 20px rgba(0,0,0,0.4); pointer-events: none;
        animation: demo-fade-in-up 0.3s ease;
      `;
      subtitle.textContent = toelichting;
      document.body.appendChild(subtitle);
    },
    { nr: section.nr, titel: section.titel, toelichting: section.toelichting }
  );
}

async function hideOverlay(page: Page): Promise<void> {
  await page.evaluate(() => {
    document.getElementById("demo-overlay")?.remove();
    document.getElementById("demo-subtitle")?.remove();
  });
}

// ─── Demo actions per section ────────────────────────────────────────────────

async function wait(ms: number, multiplier: number) {
  await new Promise((r) => setTimeout(r, ms * multiplier));
}

async function smoothScroll(page: Page, y: number): Promise<void> {
  await page.evaluate((scrollY) => {
    window.scrollTo({ top: scrollY, behavior: "smooth" });
  }, y);
  await new Promise((r) => setTimeout(r, 800));
}

async function runSectionActions(
  page: Page,
  section: DemoSection,
  context: BrowserContext,
  multiplier: number
): Promise<void> {
  const s = section.nr;

  // Page is already loaded by the main loop — only do interactions here
  await wait(1000, multiplier);

  switch (s) {
    case 1: // Homepage
      await smoothScroll(page, 400);
      await wait(2000, multiplier);
      await smoothScroll(page, 800);
      await wait(2000, multiplier);
      await smoothScroll(page, 0);
      break;

    case 2: // Pakketten
      // Type in search
      await page.fill('input[placeholder*="Zoek"]', "squit").catch(() => {});
      await wait(2000, multiplier);
      await page.fill('input[placeholder*="Zoek"]', "").catch(() => {});
      await wait(1000, multiplier);
      await smoothScroll(page, 300);
      break;

    case 3: // Leveranciers
      await smoothScroll(page, 300);
      await wait(2000, multiplier);
      // Click first leverancier link
      await page.click("table tbody tr:first-child td a").catch(() => {});
      await wait(2000, multiplier);
      break;

    case 4: // Gemeenten
      await wait(1500, multiplier);
      // Click on a gemeente
      await page.click('a[href*="/gemeenten/"]').catch(() => {});
      await wait(3000, multiplier);
      await smoothScroll(page, 400);
      await wait(2000, multiplier);
      break;

    case 5: // AI-adviseur — navigate to a gemeente AI tab
      await page.click('a[href*="/gemeenten/"]').catch(() => {});
      await wait(2000, multiplier);
      // Click AI-adviseur tab
      await page.click('a[href*="tab=ai-adviseur"]').catch(() => {});
      await wait(3000, multiplier);
      await smoothScroll(page, 400);
      break;

    case 6: // Vergelijken
      await wait(2000, multiplier);
      await smoothScroll(page, 400);
      break;

    case 7: // Dashboard
      await wait(2000, multiplier);
      await smoothScroll(page, 400);
      await wait(2000, multiplier);
      // Click through tabs
      await page.click('a[href*="tab=pakketten"]').catch(() => {});
      await wait(2000, multiplier);
      await page.click('a[href*="tab=koppelingen"]').catch(() => {});
      await wait(2000, multiplier);
      await page.click('a[href*="tab=suggesties"]').catch(() => {});
      await wait(2000, multiplier);
      break;

    case 8: // Compliancy
      await smoothScroll(page, 300);
      await wait(2000, multiplier);
      break;

    case 9: // Inkoop
      await wait(2000, multiplier);
      await smoothScroll(page, 300);
      break;

    case 10: // Koppelingen
      await smoothScroll(page, 300);
      await wait(2000, multiplier);
      break;

    case 11: // Standaarden
      await wait(2000, multiplier);
      await smoothScroll(page, 300);
      await wait(1500, multiplier);
      // Navigate to referentiecomponenten
      if (section.extraLinks?.[0]) {
        await page.goto(`${BASE}${section.extraLinks[0].href}`, {
          waitUntil: "domcontentloaded",
          timeout: 15000,
        }).catch(() => {});
        await wait(2000, multiplier);
      }
      break;

    case 12: // Zoeken
      await page.fill('input[placeholder*="Zoek"], input[name="q"]', "bugt").catch(() => {});
      await wait(2000, multiplier);
      break;

    case 13: // Begrippen
      await wait(1500, multiplier);
      await smoothScroll(page, 300);
      break;

    case 14: // Kaart
      await wait(3000, multiplier);
      break;

    case 15: // API docs
      await wait(2000, multiplier);
      await smoothScroll(page, 400);
      break;

    case 16: // Admin
      await smoothScroll(page, 300);
      await wait(2000, multiplier);
      await smoothScroll(page, 600);
      await wait(2000, multiplier);
      break;

    case 17: // Linked Data
      await wait(2000, multiplier);
      await smoothScroll(page, 400);
      break;

    case 18: // Pakketversies
      await wait(2000, multiplier);
      await smoothScroll(page, 300);
      break;

    case 19: // Addenda
      await wait(2000, multiplier);
      if (section.extraLinks?.[0]) {
        await page.goto(`${BASE}${section.extraLinks[0].href}`, {
          waitUntil: "domcontentloaded",
          timeout: 15000,
        }).catch(() => {});
        await wait(2000, multiplier);
      }
      break;

    case 20: // Notificaties
      // Click bell icon
      await page.click('button[aria-label*="Notificatie"], button:has(> svg)').catch(() => {});
      await wait(2000, multiplier);
      break;

    case 21: // Favorieten
      await wait(2000, multiplier);
      break;

    case 22: // Dark mode
      // Toggle dark mode
      await page.click('button[aria-label*="Donker"], button:has-text("Donker")').catch(() => {});
      await wait(3000, multiplier);
      // Toggle back
      await page.click('button[aria-label*="Licht"], button:has-text("Licht")').catch(() => {});
      await wait(1500, multiplier);
      break;

    default:
      await wait(3000, multiplier);
  }
}

// ─── Pause/resume handler ────────────────────────────────────────────────────

let paused = false;

function setupPauseHandler() {
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("data", (key) => {
      // Space to pause/resume, q to quit
      if (key.toString() === " ") {
        paused = !paused;
        console.log(paused ? "\n⏸  Gepauzeerd (druk spatie om verder te gaan)" : "\n▶  Verder...");
      }
      if (key.toString() === "q" || key.toString() === "\u0003") {
        console.log("\n🛑 Demo gestopt.");
        process.exit(0);
      }
    });
  }
}

async function waitWhilePaused() {
  while (paused) {
    await new Promise((r) => setTimeout(r, 200));
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const config = parseArgs();
  const multiplier = SPEED_MULTIPLIERS[config.speed] ?? 1.0;

  console.log("┌──────────────────────────────────────────────┐");
  console.log("│   VNG Voorzieningencatalogus — Demo          │");
  console.log("│                                              │");
  console.log(`│   Snelheid: ${config.speed.padEnd(10)}                      │`);
  console.log(`│   Spraak:   ${config.voice ? "aan" : "uit"}                           │`);
  console.log(`│   Start:    sectie ${String(config.start).padEnd(5)}                    │`);
  if (config.record) {
    console.log("│   Video:    opname aan                       │");
  }
  console.log("│                                              │");
  console.log("│   Spatie = pauze/hervat, Q = stop             │");
  console.log("└──────────────────────────────────────────────┘");

  setupPauseHandler();

  const browser = await chromium.launch({
    headless: false,
    args: ["--start-maximized"],
  });

  const contextOptions: Record<string, unknown> = {
    viewport: { width: 1440, height: 900 },
    locale: "nl-NL",
  };

  if (config.record) {
    contextOptions.recordVideo = {
      dir: "./docs/demo-video/",
      size: { width: 1440, height: 900 },
    };
  }

  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();

  // ─── Login ───────────────────────────────────────────────────────────
  console.log("\n🔐 Inloggen als admin...");
  await page.goto(`${BASE}/auth/login`);
  await page.fill('input[name="email"]', "admin@swc.nl");
  await page.fill('input[name="password"]', "admin2026");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  console.log("✓  Ingelogd\n");

  // ─── Ensure voices are loaded (for speech synthesis) ─────────────────
  if (config.voice) {
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) return resolve();
        speechSynthesis.onvoiceschanged = () => resolve();
        setTimeout(resolve, 2000); // fallback
      });
    });

    const voiceInfo = await page.evaluate(() => {
      const voices = speechSynthesis.getVoices();
      const nl = voices.find((v) => v.lang.startsWith("nl"));
      return nl ? `${nl.name} (${nl.lang})` : "geen Nederlandse stem gevonden";
    });
    console.log(`🔊 Stem: ${voiceInfo}`);
  }

  // ─── Run sections ────────────────────────────────────────────────────
  const activeSections = config.sections
    ? sections.filter((s) => config.sections!.includes(s.nr))
    : sections.filter((s) => s.nr >= config.start);

  const totalSections = activeSections.length;

  for (let i = 0; i < activeSections.length; i++) {
    const section = activeSections[i];

    await waitWhilePaused();

    console.log(`\n[${i + 1}/${totalSections}] Sectie ${section.nr}: ${section.titel}`);

    // First navigate to the section page
    await page.goto(`${BASE}${section.link}`, {
      waitUntil: "networkidle",
      timeout: 15000,
    }).catch(() => {
      console.log("  (page load timeout, continuing...)");
    });
    await wait(500, 1);

    // Show overlay and narrate on the loaded page (before any navigation actions)
    await showOverlay(page, section);

    if (config.voice) {
      await announceSection(page, section, multiplier, config.voice);
    }

    await hideOverlay(page);

    // Then run the interactive actions (which may navigate away)
    await runSectionActions(page, section, context, multiplier);

    // Brief pause between sections
    await wait(1500, multiplier);
  }

  // ─── Closing ─────────────────────────────────────────────────────────
  console.log("\n┌──────────────────────────────────────────────┐");
  console.log("│   Demo voltooid!                             │");
  console.log("└──────────────────────────────────────────────┘");

  if (config.voice) {
    try {
      await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 10000 });
      await speak(
        page,
        "Dit was de demo van de VNG Voorzieningencatalogus. Bedankt voor uw aandacht!",
        multiplier
      );
    } catch { /* browser may already be closing */ }
  }

  if (config.record) {
    await page.close();
    console.log("📹 Video opgeslagen in docs/demo-video/");
  }

  await wait(3000, 1);
  await browser.close();

  if (process.stdin.isTTY) {
    process.stdin.setRawMode(false);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error("Fout:", e.message);
  process.exit(1);
});
