import fs from "fs";
import { parse } from "csv-parse/sync";

function readCsv(filePath: string): Record<string, string>[] {
  return parse(fs.readFileSync(filePath, "utf-8"), {
    delimiter: ";",
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
    trim: true,
  });
}

const pakRows = readCsv("/tmp/swc_exports/Pakketten.csv");
const pakketIds = new Set(
  pakRows.map((r) => (r["Software ID"] || "").replace(/"/g, "").trim()).filter(Boolean)
);
console.log("Pakket IDs in Pakketten.csv:", pakketIds.size);

const portRows = readCsv(
  "/Users/toineschijvenaars/Downloads/Gemeenten_applicatieportfolio_20260304_2008.csv"
);
const versieMap = new Map<string, string>(); // (pakketId|||versieNaam) -> pvId
for (const r of portRows) {
  const pvId = (r["Pakketversie ID"] || "").trim();
  const pvNaam = (r["Pakketversie Naam"] || "").trim();
  const pId = (r["Pakket ID"] || "").trim();
  if (pvId && pId && pvNaam) {
    const key = `${pId}|||${pvNaam}`;
    if (!versieMap.has(key)) versieMap.set(key, pvId);
  }
}
console.log("Unique (pakketId, versieNaam) combos in portfolio:", versieMap.size);

// Check how many versies from Pakketten.csv match
let matched = 0;
let unmatched = 0;
for (const r of pakRows) {
  const pId = (r["Software ID"] || "").replace(/"/g, "").trim();
  const versions = (r["Software Version"] || "")
    .replace(/"/g, "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const v of versions) {
    if (v === "xxx") continue;
    const key = `${pId}|||${v}`;
    if (versieMap.has(key)) {
      matched++;
    } else {
      unmatched++;
    }
  }
}
console.log("Versies from Pakketten.csv matched in portfolio:", matched);
console.log("Versies from Pakketten.csv NOT matched:", unmatched);

// Also check leveranciers_pakketten.csv for additional IDs
const lpRows = readCsv("/tmp/swc_exports/leveranciers_pakketten.csv");
const lpVersieMap = new Map<string, string>();
for (const r of lpRows) {
  const pvId = (r["Pakketversie ID"] || "").trim();
  const pvNaam = (r["Pakketversie Naam"] || "").trim();
  const pId = (r["Pakket ID"] || "").trim();
  if (pvId && pId && pvNaam) {
    const key = `${pId}|||${pvNaam}`;
    if (!lpVersieMap.has(key)) lpVersieMap.set(key, pvId);
  }
}
console.log("\nPakketversie IDs from leveranciers_pakketten.csv:", lpVersieMap.size);

// Combine both sources
const combinedMap = new Map([...versieMap, ...lpVersieMap]);
console.log("Combined unique versie IDs:", combinedMap.size);

// Re-check match rate
matched = 0;
unmatched = 0;
const unmatchedExamples: string[] = [];
for (const r of pakRows) {
  const pId = (r["Software ID"] || "").replace(/"/g, "").trim();
  const pNaam = (r["Software Name"] || "").replace(/"/g, "").trim();
  const versions = (r["Software Version"] || "")
    .replace(/"/g, "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const v of versions) {
    if (v === "xxx") continue;
    const key = `${pId}|||${v}`;
    if (combinedMap.has(key)) {
      matched++;
    } else {
      unmatched++;
      if (unmatchedExamples.length < 5) {
        unmatchedExamples.push(`${pNaam} v${v} (${pId})`);
      }
    }
  }
}
console.log("\nWith combined sources:");
console.log("  Matched:", matched);
console.log("  Unmatched:", unmatched);
console.log("  Unmatched examples:", unmatchedExamples);
