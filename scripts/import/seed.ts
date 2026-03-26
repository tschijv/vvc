import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { parse } from "csv-parse/sync";

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://toineschijvenaars@localhost:5432/softwarecatalogus?schema=public";

function createPrisma() {
  const adapter = new PrismaPg({ connectionString: DATABASE_URL });
  return new PrismaClient({ adapter });
}

let prisma = createPrisma();

async function reconnect() {
  try { await prisma.$disconnect(); } catch {}
  prisma = createPrisma();
}

async function withRetry<T>(fn: () => Promise<T>, retries = 5): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const isRetryable =
        msg.includes("connection") ||
        msg.includes("Can't reach") ||
        msg.includes("DatabaseNotReachable") ||
        msg.includes("P1001") ||
        msg.includes("ECONNRESET") ||
        msg.includes("timeout");
      if (isRetryable && i < retries - 1) {
        const delay = (i + 1) * 3000; // 3s, 6s, 9s, 12s
        console.log(`  Connection error, waiting ${delay/1000}s then reconnecting (attempt ${i + 2}/${retries})...`);
        await new Promise(r => setTimeout(r, delay));
        await reconnect();
      } else {
        throw err;
      }
    }
  }
  throw new Error("Unreachable");
}

const CSV_DIR = "/tmp/swc_exports";

function readCsv(filename: string): Record<string, string>[] {
  const filePath = path.join(CSV_DIR, filename);
  const content = fs.readFileSync(filePath, "utf-8");
  return parse(content, {
    delimiter: ";",
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
    trim: true,
  });
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function uniqueSlug(base: string, existing: Set<string>): string {
  let slug = slugify(base);
  let i = 1;
  while (existing.has(slug)) {
    slug = `${slugify(base)}-${i++}`;
  }
  existing.add(slug);
  return slug;
}

function parseDate(s: string | undefined): Date | undefined {
  if (!s || s.trim() === "") return undefined;
  // formats: DD-MM-YYYY, D-M-YYYY, DD-M-YYYY
  const parts = s.trim().split("-");
  if (parts.length !== 3) return undefined;
  const [d, m, y] = parts;
  const year = y.length === 2 ? `20${y}` : y;
  const date = new Date(`${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
  return isNaN(date.getTime()) ? undefined : date;
}

function splitField(s: string | undefined): string[] {
  if (!s || s.trim() === "") return [];
  return s.split(",").map((v) => v.trim()).filter(Boolean);
}

async function importLeveranciers() {
  console.log("Importing leveranciers...");
  const rows = readCsv("leveranciers.csv");
  const slugs = new Set<string>();

  for (const row of rows) {
    const naam = row["Supplier Name"]?.trim();
    if (!naam) continue;
    const slug = uniqueSlug(naam, slugs);
    const signed = row["Signed Addenda"]?.trim() || "";
    const addenumNamen = splitField(signed);

    await prisma.leverancier.upsert({
      where: { id: row["Leverancier id"] },
      update: {},
      create: {
        id: row["Leverancier id"],
        naam,
        slug,
        website: row["Supplier Url"] || null,
        contactpersoon: row["Supplier Contact"] || null,
        email: row["Supplier E-mailadres"] || null,
        telefoon: row["Supplier Telefoon"] || null,
        aanmaakdatum: parseDate(row["Aanmaakdatum"]) || null,
        lastActivity: parseDate(row["Supplier Last activity"]) || null,
      },
    });

    // Addenda
    for (const addendumNaam of addenumNamen) {
      if (!addendumNaam) continue;
      const addendum = await prisma.addendum.upsert({
        where: { naam: addendumNaam },
        update: {},
        create: { naam: addendumNaam },
      });
      await prisma.leverancierAddendum.upsert({
        where: {
          leverancierId_addendumId: {
            leverancierId: row["Leverancier id"],
            addendumId: addendum.id,
          },
        },
        update: {},
        create: {
          leverancierId: row["Leverancier id"],
          addendumId: addendum.id,
        },
      });
    }
  }
  console.log(`Imported ${rows.length} leveranciers.`);
}

async function importPakketten() {
  console.log("Importing pakketten from Pakketten.csv...");

  // Step 0: Build pakketversie UUID lookup from portfolio CSV and leveranciers_pakketten.csv
  const realVersieIdMap = new Map<string, string>(); // "pakketId|||versieNaam" -> real UUID
  const portfolioCsvPath = "/Users/toineschijvenaars/Downloads/Gemeenten_applicatieportfolio_20260304_2008.csv";
  if (fs.existsSync(portfolioCsvPath)) {
    console.log("  Building pakketversie UUID lookup from portfolio CSV...");
    const portContent = fs.readFileSync(portfolioCsvPath, "utf-8");
    const portRows: Record<string, string>[] = parse(portContent, {
      delimiter: ";",
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
      relax_column_count: true,
      trim: true,
    });
    for (const r of portRows) {
      const pvId = r["Pakketversie ID"]?.trim();
      const pvNaam = r["Pakketversie Naam"]?.trim();
      const pId = r["Pakket ID"]?.trim();
      if (pvId && pId && pvNaam) {
        const key = `${pId}|||${pvNaam}`;
        if (!realVersieIdMap.has(key)) realVersieIdMap.set(key, pvId);
      }
    }
    console.log(`  Found ${realVersieIdMap.size} pakketversie UUIDs from portfolio.`);
  }

  // Step 1: collect referentiecomponenten + standaarden from leveranciers_pakketten.csv
  const detailRows = readCsv("leveranciers_pakketten.csv");
  const refCompNames = new Set<string>();
  const standaardNamen = new Set<string>();
  for (const row of detailRows) {
    splitField(row["Referentiecomponenten leverancier"]).forEach((n) => refCompNames.add(n));
    splitField(row["Referentiecomponenten gemeente"]).forEach((n) => refCompNames.add(n));
    splitField(row["Ondersteuning standaardversies"]).forEach((n) => standaardNamen.add(n));
  }

  // Upsert referentiecomponenten
  const refCompMap = new Map<string, string>();
  for (const naam of refCompNames) {
    const id = `rc-${slugify(naam)}`;
    await prisma.referentiecomponent.upsert({
      where: { id },
      update: {},
      create: { id, naam },
    });
    refCompMap.set(naam, id);
  }
  console.log(`  Upserted ${refCompMap.size} referentiecomponenten`);

  // Upsert standaarden + standaardversies
  const standaardversieMap = new Map<string, string>();
  for (const fullNaam of standaardNamen) {
    const parts = fullNaam.split(" ");
    let versieIndex = -1;
    for (let i = parts.length - 1; i >= 0; i--) {
      if (/^\d+[\.\d]*$/.test(parts[i])) { versieIndex = i; break; }
    }
    const standaardNaam = versieIndex > 0 ? parts.slice(0, versieIndex).join(" ") : fullNaam;
    const versieNaam = versieIndex > 0 ? parts.slice(versieIndex).join(" ") : "1.0";
    const stdId = `std-${slugify(standaardNaam)}`;
    await prisma.standaard.upsert({
      where: { id: stdId },
      update: {},
      create: { id: stdId, naam: standaardNaam },
    });
    const svId = `sv-${slugify(fullNaam)}`;
    await prisma.standaardversie.upsert({
      where: { id: svId },
      update: {},
      create: { id: svId, naam: versieNaam, standaardId: stdId },
    });
    standaardversieMap.set(fullNaam, svId);
  }
  console.log(`  Upserted ${standaardversieMap.size} standaardversies`);

  // Also collect pakketversie UUIDs from leveranciers_pakketten.csv
  for (const row of detailRows) {
    const pvId = row["Pakketversie ID"]?.trim();
    const pvNaam = row["Pakketversie Naam"]?.trim();
    const pId = row["Pakket ID"]?.trim();
    if (pvId && pId && pvNaam) {
      const key = `${pId}|||${pvNaam}`;
      if (!realVersieIdMap.has(key)) realVersieIdMap.set(key, pvId);
    }
  }
  console.log(`  Total pakketversie UUID mappings: ${realVersieIdMap.size}`);

  // Step 2: build lookup from leveranciers_pakketten.csv keyed by pakket naam + leverancier naam
  // (for rows that DO have IDs, we'll use those for detail enrichment)
  const detailByPakketId = new Map<string, (typeof detailRows)[0]>();
  const detailByNaamLev = new Map<string, (typeof detailRows)[0]>();
  for (const row of detailRows) {
    const pid = row["Pakket ID"]?.trim();
    if (pid) detailByPakketId.set(pid, row);
    const key = `${row["Pakket Naam"]?.trim()}|||${row["Leverancier Naam"]?.trim()}`;
    if (!detailByNaamLev.has(key)) detailByNaamLev.set(key, row);
  }

  // Step 3: import all pakketten from Pakketten.csv
  const pakketRows = readCsv("Pakketten.csv");
  const pakketSlugs = new Set<string>();
  let imported = 0;

  // Build leverancier name lookup
  const leveranciers = await prisma.leverancier.findMany({ select: { id: true, naam: true } });
  const leverancierById = new Map(leveranciers.map((l) => [l.id, l.naam]));

  for (const row of pakketRows) {
    const pakketId = row["Software ID"]?.replace(/"/g, "").trim();
    const pakketNaam = row["Software Name"]?.replace(/"/g, "").trim();
    const leverancierId = row["Leverancier id"]?.replace(/"/g, "").trim();
    if (!pakketId || !pakketNaam || !leverancierId) continue;

    // Skip if leverancier doesn't exist
    if (!leverancierById.has(leverancierId)) continue;

    const leverancierNaam = leverancierById.get(leverancierId)!;
    const slug = uniqueSlug(pakketNaam, pakketSlugs);

    // Get extra details from leveranciers_pakketten if available
    const detail = detailByPakketId.get(pakketId) ||
      detailByNaamLev.get(`${pakketNaam}|||${leverancierNaam}`);

    await withRetry(() => prisma.pakket.upsert({
      where: { id: pakketId },
      update: {},
      create: {
        id: pakketId,
        naam: pakketNaam,
        slug,
        beschrijving: row["Software Description"]?.replace(/"/g, "").trim() || null,
        urlProductpagina: row["Software Url"]?.replace(/"/g, "").trim() || null,
        aantalOrganisaties: detail ? parseInt(detail["Pakket aantal gemeenten"] || "0") || 0 : 0,
        mutatiedatum: detail ? parseDate(detail["Mutatiedatum pakket"]) || null : null,
        leverancierId,
      },
    }));

    // Create versies from "Software Version" field (comma-separated list)
    const versies = splitField(row["Software Version"]?.replace(/"/g, ""));
    for (const versieNaam of versies) {
      if (!versieNaam || versieNaam === "xxx") continue;
      // Use real UUID from portfolio/leveranciers_pakketten if available, otherwise generate one
      const realIdKey = `${pakketId}|||${versieNaam}`;
      const versieId = realVersieIdMap.get(realIdKey) || crypto.randomUUID();
      await withRetry(() => prisma.pakketversie.upsert({
        where: { id: versieId },
        update: {},
        create: {
          id: versieId,
          naam: versieNaam,
          status: detail?.["Pakketversie Status"] || "Onbekend",
          startDistributie: detail ? parseDate(detail["Start distributie"]) || null : null,
          aantalOrganisaties: detail ? parseInt(detail["Pakketversie aantal gemeenten"] || "0") || 0 : 0,
          pakketId,
        },
      }));

      // Link referentiecomponenten
      if (detail) {
        for (const rcNaam of splitField(detail["Referentiecomponenten leverancier"])) {
          const rcId = refCompMap.get(rcNaam);
          if (!rcId) continue;
          await withRetry(() => prisma.pakketversieReferentiecomponent.upsert({
            where: { pakketversieId_referentiecomponentId_type: { pakketversieId: versieId, referentiecomponentId: rcId, type: "leverancier" } },
            update: {},
            create: { pakketversieId: versieId, referentiecomponentId: rcId, type: "leverancier" },
          }));
        }
        for (const rcNaam of splitField(detail["Referentiecomponenten gemeente"])) {
          const rcId = refCompMap.get(rcNaam);
          if (!rcId) continue;
          await withRetry(() => prisma.pakketversieReferentiecomponent.upsert({
            where: { pakketversieId_referentiecomponentId_type: { pakketversieId: versieId, referentiecomponentId: rcId, type: "gemeente" } },
            update: {},
            create: { pakketversieId: versieId, referentiecomponentId: rcId, type: "gemeente" },
          }));
        }
        for (const stdNaam of splitField(detail["Ondersteuning standaardversies"])) {
          const svId = standaardversieMap.get(stdNaam);
          if (!svId) continue;
          await withRetry(() => prisma.pakketversieStandaard.upsert({
            where: { pakketversieId_standaardversieId: { pakketversieId: versieId, standaardversieId: svId } },
            update: {},
            create: { pakketversieId: versieId, standaardversieId: svId },
          }));
        }
        for (const tech of splitField(detail["Pakketversie Ondersteunde technologieën"])) {
          await withRetry(() => prisma.pakketversieTechnologie.upsert({
            where: { pakketversieId_technologie: { pakketversieId: versieId, technologie: tech } },
            update: {},
            create: { pakketversieId: versieId, technologie: tech },
          }));
        }
      }
    }
    imported++;
    if (imported % 100 === 0) {
      console.log(`  ...${imported}/${pakketRows.length} pakketten`);
    }
  }
  console.log(`Imported ${imported} pakketten from Pakketten.csv.`);
}

async function importGemeenten() {
  console.log("Importing gemeenten...");
  const rows = readCsv("all_gemeenten.csv");

  for (const row of rows) {
    const id = row["SWC ID"]?.trim();
    const naam = row["Gemeente naam"]?.trim();
    if (!id || !naam) continue;

    await prisma.organisatie.upsert({
      where: { id },
      update: {},
      create: {
        id,
        naam,
        cbsCode: row["Gemeente CBS"] || null,
        contactpersoon: row["Gemeente contact"] || null,
        email: row["Gemeente Contact email"] || null,
        progress: parseInt(row["Voortgang"] || "0") || 0,
        lastActivity: parseDate(row["Laatste activiteit"]) || null,
      },
    });
  }
  console.log(`Imported ${rows.length} gemeenten.`);
}

async function importSamenwerkingen() {
  console.log("Importing samenwerkingen...");
  const rows = readCsv("Samenwerkingen.csv");

  for (const row of rows) {
    const id = row["Collaboration ID"]?.trim();
    const naam = row["Collaboration Name"]?.trim();
    if (!id || !naam) continue;

    await prisma.samenwerking.upsert({
      where: { id },
      update: {},
      create: {
        id,
        naam,
        type: row["Collaboration type"] || null,
        contactpersoon: row["Contact Name"] || null,
        email: row["Contact Email"] || null,
      },
    });
  }
  console.log(`Imported ${rows.length} samenwerkingen.`);
}

async function importApplicatiePortfolio() {
  console.log("Importing applicatieportfolio & samenwerkingen...");
  const portfolioCsvPath = "/Users/toineschijvenaars/Downloads/Gemeenten_applicatieportfolio_20260304_2008.csv";
  const portContent = fs.readFileSync(portfolioCsvPath, "utf-8");
  const rows: Record<string, string>[] = parse(portContent, {
    delimiter: ";",
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
    trim: true,
  });

  // Collect all existing pakketversie IDs to avoid FK violations
  const bestaandeVersies = new Set(
    (await prisma.pakketversie.findMany({ select: { id: true } })).map((v) => v.id)
  );
  const bestaandeGemeenten = new Set(
    (await prisma.organisatie.findMany({ select: { id: true } })).map((g) => g.id)
  );

  let portfolioCount = 0;
  let samenwerkingCount = 0;
  let skipped = 0;

  let newGemeenten = 0;
  console.log(`  ${rows.length} rows, ${bestaandeVersies.size} pakketversies in DB, ${bestaandeGemeenten.size} gemeenten in DB`);
  for (const row of rows) {
    const gemeenteId = row["Gemeente ID"]?.trim();
    if (!gemeenteId) continue;

    // Create gemeente if not exists
    if (!bestaandeGemeenten.has(gemeenteId)) {
      const naam = row["Gemeente naam"]?.trim();
      if (naam) {
        try {
          await prisma.organisatie.create({
            data: {
              id: gemeenteId,
              naam,
              cbsCode: row["Gemeente CBS"] || null,
            },
          });
          bestaandeGemeenten.add(gemeenteId);
          newGemeenten++;
        } catch {
          bestaandeGemeenten.add(gemeenteId);
        }
      } else {
        continue;
      }
    }

    // GemeentePakket koppeling
    const pakketversieId = row["Pakketversie ID"]?.trim();
    if (pakketversieId && bestaandeVersies.has(pakketversieId)) {
      try {
        await prisma.organisatiePakket.upsert({
          where: { organisatieId_pakketversieId: { organisatieId: gemeenteId, pakketversieId } },
          update: {},
          create: {
            organisatieId: gemeenteId,
            pakketversieId,
            status: row["Gebruik Status"] || null,
            datumIngangStatus: parseDate(row["Gebruik Datum ingang status"]) || null,
            technologie: row["Pakketversie gebruik technologie"] || null,
            mutatiedatum: parseDate(row["Mutatiedatum applicatieportfolio"]) || null,
          },
        });
        portfolioCount++;
      } catch {
        skipped++;
      }
    } else {
      skipped++;
    }

    // SamenwerkingGemeente koppeling
    const samenwerkingId = row["Samenwerking ID"]?.trim();
    if (samenwerkingId) {
      // Upsert samenwerking if not exists
      try {
        await prisma.samenwerking.upsert({
          where: { id: samenwerkingId },
          update: {},
          create: {
            id: samenwerkingId,
            naam: row["Samenwerking"]?.trim() || samenwerkingId,
          },
        });
        await prisma.samenwerkingOrganisatie.upsert({
          where: { samenwerkingId_organisatieId: { samenwerkingId, organisatieId: gemeenteId } },
          update: {},
          create: { samenwerkingId, organisatieId: gemeenteId },
        });
        samenwerkingCount++;
      } catch {
        // ignore
      }
    }

    const processed = portfolioCount + skipped;
    if (processed % 2000 === 0 && processed > 0) {
      console.log(`  ...${processed}/${rows.length} processed (${portfolioCount} linked, ${skipped} skipped)`);
    }
  }

  console.log(`  Created ${newGemeenten} new gemeenten`);
  console.log(`  Linked ${portfolioCount} pakketversies to gemeenten (${skipped} skipped)`);
  console.log(`  Linked ${samenwerkingCount} samenwerkingen to gemeenten`);
}

async function main() {
  const skipPortfolio = process.argv.includes("--skip-portfolio");
  console.log("Starting data import...");
  await importLeveranciers();
  await importPakketten();
  await importGemeenten();
  await importSamenwerkingen();
  if (!skipPortfolio) {
    await importApplicatiePortfolio();
  } else {
    console.log("Skipping portfolio import (--skip-portfolio).");
  }
  console.log("Import complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
