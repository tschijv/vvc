/**
 * Genereer demo-audio MP3's via OpenAI TTS API.
 *
 * Gebruik:
 *   OPENAI_API_KEY=sk-... npx tsx scripts/generate-demo-audio.ts
 *
 * Opties:
 *   --voice=alloy|echo|fable|onyx|nova|shimmer   (default: onyx)
 *   --model=tts-1|tts-1-hd                        (default: tts-1-hd)
 *   --speed=0.8-1.2                               (default: 1.0)
 *   --sections=1,5,8                              (alleen specifieke secties)
 *   --force                                       (overschrijf bestaande bestanden)
 *
 * Kosten: ~$0.03/min spraak bij tts-1-hd.
 * Totaal voor 22 secties: ±$0.30-$0.60 eenmalig.
 */

import fs from "fs";
import path from "path";
import { demoSections } from "../lib/demo-sections";

const API_URL = "https://api.openai.com/v1/audio/speech";
const OUTPUT_DIR = path.resolve(__dirname, "../public/audio/demo");

// Parse CLI args
const args = process.argv.slice(2);
function getArg(name: string, fallback: string): string {
  const match = args.find((a) => a.startsWith(`--${name}=`));
  return match ? match.split("=")[1] : fallback;
}
const voice = getArg("voice", "onyx");
const model = getArg("model", "tts-1-hd");
const speed = parseFloat(getArg("speed", "1.0"));
const force = args.includes("--force");
const sectionsFilter = getArg("sections", "");
const selectedSections = sectionsFilter
  ? sectionsFilter.split(",").map(Number)
  : [];

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error(
    "❌ OPENAI_API_KEY ontbreekt. Gebruik:\n" +
      "   OPENAI_API_KEY=sk-... npx tsx scripts/generate-demo-audio.ts",
  );
  process.exit(1);
}

// Ensure output dir exists
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

async function generateAudio(
  text: string,
  outputPath: string,
): Promise<void> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      voice,
      input: text,
      speed,
      response_format: "mp3",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI TTS fout (${response.status}): ${error}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
}

async function main() {
  const sections =
    selectedSections.length > 0
      ? demoSections.filter((s) => selectedSections.includes(s.nr))
      : demoSections;

  console.log(`🎙️  Demo-audio genereren`);
  console.log(`   Model: ${model} | Stem: ${voice} | Snelheid: ${speed}`);
  console.log(`   Secties: ${sections.length} van ${demoSections.length}`);
  console.log(`   Output: ${OUTPUT_DIR}\n`);

  let generated = 0;
  let skipped = 0;

  for (const section of sections) {
    const filename = `section-${String(section.nr).padStart(2, "0")}.mp3`;
    const outputPath = path.join(OUTPUT_DIR, filename);

    if (fs.existsSync(outputPath) && !force) {
      console.log(`  ⏭️  ${filename} bestaat al (gebruik --force om te overschrijven)`);
      skipped++;
      continue;
    }

    const text = `Onderdeel ${section.nr}: ${section.titel}. ${section.toelichting}`;

    process.stdout.write(`  🔊 ${filename} — "${section.titel}"...`);

    try {
      await generateAudio(text, outputPath);
      const size = (fs.statSync(outputPath).size / 1024).toFixed(0);
      console.log(` ✅ (${size} KB)`);
      generated++;
    } catch (err) {
      console.log(` ❌ ${(err as Error).message}`);
    }

    // Rate limit: kleine pauze tussen requests
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(
    `\n✅ Klaar! ${generated} gegenereerd, ${skipped} overgeslagen.`,
  );

  // Generate manifest
  const manifest = demoSections.map((s) => ({
    nr: s.nr,
    titel: s.titel,
    file: `section-${String(s.nr).padStart(2, "0")}.mp3`,
    exists: fs.existsSync(
      path.join(OUTPUT_DIR, `section-${String(s.nr).padStart(2, "0")}.mp3`),
    ),
  }));
  const manifestPath = path.join(OUTPUT_DIR, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`📄 Manifest geschreven: ${manifestPath}`);
}

main().catch((err) => {
  console.error("Onverwachte fout:", err);
  process.exit(1);
});
