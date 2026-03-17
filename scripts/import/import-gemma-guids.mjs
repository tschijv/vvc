/**
 * Import GUIDs van GEMMA Online (gemmaonline.nl) voor:
 * - Referentiecomponenten
 * - Applicatiefuncties
 * - Standaarden
 *
 * Gebruikt de Semantic MediaWiki ASK API om Object_ID (GUID) en Label op te halen.
 * Matcht op naam (case-insensitive) met records in de database.
 */

import pg from "pg";

const DATABASE_URL =
  "postgresql://neondb_owner:npg_gNA4LHj7bmxw@ep-empty-cake-aga3xz6i-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require";

const pool = new pg.Pool({ connectionString: DATABASE_URL });

const GEMMA_API = "https://www.gemmaonline.nl/api.php";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function smwQuery(query, limit = 500) {
  const allResults = {};
  let offset = 0;

  while (true) {
    const params = new URLSearchParams({
      action: "ask",
      query: `${query}|limit=${limit}|offset=${offset}`,
      format: "json",
    });

    const url = `${GEMMA_API}?${params}`;
    console.log(`  Fetching offset=${offset}...`);

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`API fout: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const results = data?.query?.results || {};

    for (const [key, value] of Object.entries(results)) {
      allResults[key] = value;
    }

    const continueOffset = data?.["query-continue-offset"];
    if (continueOffset && Object.keys(results).length > 0) {
      offset = continueOffset;
    } else {
      break;
    }
  }

  return allResults;
}

function extractFromResults(results) {
  const items = [];
  for (const [pageName, data] of Object.entries(results)) {
    const printouts = data.printouts || {};

    const label =
      printouts.Label?.[0] || data.displaytitle || pageName.split("/").pop();
    const objectId = printouts["Object ID"]?.[0] || null;
    const documentation = printouts.Documentation?.[0] || null;

    if (label && objectId) {
      items.push({
        label: typeof label === "string" ? label : label.toString(),
        guid: objectId,
        beschrijving:
          typeof documentation === "string" ? documentation : null,
        pageName,
      });
    }
  }
  return items;
}

function normalize(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9àáâãäåæçèéêëìíîïðñòóôõöùúûüýþÿ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Database matching ────────────────────────────────────────────────────────

async function getDbRecords(table) {
  const result = await pool.query(
    `SELECT id, naam, guid, beschrijving FROM "${table}"`
  );
  return result.rows;
}

async function updateGuid(table, id, guid, beschrijving) {
  const updates = ['guid = $1'];
  const values = [guid];

  if (beschrijving) {
    updates.push(`beschrijving = $2`);
    values.push(beschrijving);
  }

  values.push(id);
  await pool.query(
    `UPDATE "${table}" SET ${updates.join(', ')}, "updatedAt" = NOW() WHERE id = $${values.length}`,
    values
  );
}

async function matchAndUpdate(table, gemmaItems, label) {
  const dbRecords = await getDbRecords(table);
  console.log(`\n═══ ${label} ═══`);
  console.log(`  Database: ${dbRecords.length} records`);
  console.log(`  GEMMA Online: ${gemmaItems.length} items met GUID`);

  // Build normalized lookup from GEMMA items
  const gemmaByNorm = new Map();
  for (const item of gemmaItems) {
    gemmaByNorm.set(normalize(item.label), item);
  }

  let matched = 0;
  let alreadyHadGuid = 0;
  const unmatched = [];

  for (const dbRec of dbRecords) {
    if (dbRec.guid) {
      alreadyHadGuid++;
      continue;
    }

    const normName = normalize(dbRec.naam);
    const gemmaItem = gemmaByNorm.get(normName);

    if (gemmaItem) {
      await updateGuid(table, dbRec.id, gemmaItem.guid, gemmaItem.beschrijving);
      matched++;
      console.log(`  ✓ ${dbRec.naam} → ${gemmaItem.guid}`);
    } else {
      unmatched.push(dbRec.naam);
    }
  }

  console.log(`\n  Resultaat: ${matched} gematcht, ${alreadyHadGuid} had al GUID, ${unmatched.length} niet gevonden`);

  if (unmatched.length > 0) {
    console.log(`  Niet gematcht:`);
    for (const name of unmatched) {
      console.log(`    ✗ ${name}`);
    }
  }

  return { matched, unmatched: unmatched.length };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║  GEMMA Online GUIDs importeren                              ║");
  console.log("╚══════════════════════════════════════════════════════════════╝\n");

  // 1. Referentiecomponenten
  console.log("→ Ophalen referentiecomponenten van GEMMA Online...");
  const rcResults = await smwQuery(
    "[[Categorie:Referentiecomponenten]]|?Label|?Object_ID|?Documentation"
  );
  const rcItems = extractFromResults(rcResults);
  const rcStats = await matchAndUpdate("Referentiecomponent", rcItems, "Referentiecomponenten");

  // 2. Applicatiefuncties (mapped to both ApplicationFunctions + ApplicationServices in GEMMA)
  console.log("\n→ Ophalen applicatiefuncties + services van GEMMA Online...");
  const afResults = await smwQuery(
    "[[Categorie:ApplicationFunctions]]|?Label|?Object_ID|?Documentation"
  );
  const asResults = await smwQuery(
    "[[Categorie:ApplicationServices]]|?Label|?Object_ID|?Documentation"
  );
  const afItems = extractFromResults(afResults);
  const asItems = extractFromResults(asResults);
  const seenGuids = new Set(afItems.map((i) => i.guid));
  for (const item of asItems) {
    if (!seenGuids.has(item.guid)) {
      afItems.push(item);
      seenGuids.add(item.guid);
    }
  }
  const afStats = await matchAndUpdate("Applicatiefunctie", afItems, "Applicatiefuncties");

  // 3. Standaarden
  console.log("\n→ Ophalen standaarden van GEMMA Online...");
  const stResults = await smwQuery(
    "[[Categorie:Standaarden]]|?Label|?Object_ID|?Documentation"
  );
  const stItems = extractFromResults(stResults);
  const stStats = await matchAndUpdate("Standaard", stItems, "Standaarden");

  // Summary
  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║  Samenvatting                                               ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log(`  Referentiecomponenten: ${rcStats.matched} gematcht, ${rcStats.unmatched} niet gevonden`);
  console.log(`  Applicatiefuncties:    ${afStats.matched} gematcht, ${afStats.unmatched} niet gevonden`);
  console.log(`  Standaarden:          ${stStats.matched} gematcht, ${stStats.unmatched} niet gevonden`);

  await pool.end();
  console.log("\nKlaar!");
}

main().catch((err) => {
  console.error("Fout:", err);
  pool.end();
  process.exit(1);
});
