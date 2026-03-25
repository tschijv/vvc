import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";
import { parse } from "csv-parse/sync";

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://toineschijvenaars@localhost:5432/softwarecatalogus?schema=public";

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const KOPPELINGEN_CSV =
  process.argv[2] ||
  "/Users/toineschijvenaars/Downloads/Koppelingen_20260315_1806.csv";

function parseDate(s: string | undefined): Date | null {
  if (!s || s.trim() === "") return null;
  const parts = s.trim().split("-");
  if (parts.length === 3) {
    const [d, m, y] = parts;
    const year = y.length === 2 ? "20" + y : y;
    const date = new Date(parseInt(year), parseInt(m) - 1, parseInt(d));
    if (!isNaN(date.getTime())) return date;
  }
  // Try ISO format (YYYY-MM-DD)
  const iso = new Date(s.trim());
  if (!isNaN(iso.getTime())) return iso;
  return null;
}

function readCsv(filePath: string): Record<string, string>[] {
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

async function main() {
  console.log(`Reading koppelingen CSV from ${KOPPELINGEN_CSV}...`);
  const rows = readCsv(KOPPELINGEN_CSV);
  console.log(`Found ${rows.length} koppelingen in CSV.`);

  // Step 1: Ensure all gemeenten from koppelingen exist in DB
  console.log("\nStep 1: Ensuring gemeenten exist...");
  const gemeenteSet = new Map<string, string>();
  for (const row of rows) {
    const id = row["Organisatie ID"]?.trim();
    const naam = row["Organisation"]?.trim();
    if (id && naam) gemeenteSet.set(id, naam);
  }

  let gemeenteCreated = 0;
  for (const [id, naam] of gemeenteSet) {
    const existing = await prisma.organisatie.findUnique({ where: { id } });
    if (!existing) {
      await prisma.organisatie.create({
        data: { id, naam },
      });
      gemeenteCreated++;
    }
  }
  console.log(`  ${gemeenteCreated} nieuwe gemeenten aangemaakt, ${gemeenteSet.size - gemeenteCreated} bestonden al.`);

  // Step 2: Collect existing pakketversie IDs
  console.log("\nStep 2: Loading bestaande pakketversies en externe pakketten...");
  const bestaandePakketversies = new Set(
    (await prisma.pakketversie.findMany({ select: { id: true } })).map(
      (v) => v.id
    )
  );
  console.log(`  ${bestaandePakketversies.size} pakketversies in database.`);

  // Step 3: Import koppelingen
  console.log("\nStep 3: Importing koppelingen...");
  let imported = 0;
  let skipped = 0;
  const externPakketCache = new Map<string, string>(); // naam -> id

  for (const row of rows) {
    const gemeenteId = row["Organisatie ID"]?.trim();
    if (!gemeenteId) {
      skipped++;
      continue;
    }

    // Determine bron (side 1)
    const pakketversieId1 = row["Pakketversie ID 1"]?.trim();
    const pakketNaam1 = row["Pakket Naam 1"]?.trim();
    const versieNaam1 = row["Pakketversie Naam 1"]?.trim();
    const leverancier1 = row["Leverancier 1"]?.trim();

    // Determine doel (side 2)
    const pakketversieId2 = row["Pakketversie ID 2"]?.trim();
    const pakketNaam2 = row["Pakket Naam 2"]?.trim();
    const versieNaam2 = row["Pakketversie Naam 2"]?.trim();
    const leverancier2 = row["Leverancier 2"]?.trim();

    // Determine richting
    const richtingRaw = row["Koppeling richting"]?.trim();
    let richting = "beide";
    if (richtingRaw === "left_to_right") richting = "heen";
    else if (richtingRaw === "right_to_left") richting = "weer";
    else if (richtingRaw === "bidirection") richting = "beide";

    // Status
    const status = row["Status"]?.trim() || null;

    // Standaard
    const standaardVersie = row["Standaardversie"]?.trim() || null;
    const standaardType = row["Standaard of maatwerk"]?.trim();

    // Extra velden
    const datumIngangStatus = parseDate(row["Datum ingang status"]);
    const transportprotocol = row["Transportprotocol"]?.trim() || null;
    const aanvullendeInformatie = row["Aanvullende informatie"]?.trim() || null;
    const intermediairPakketversieId = row["Pakketversie ID Intermediair"]?.trim() || null;

    // Determine if bron is pakketversie or extern
    let bronPakketversieId: string | null = null;
    let bronExternPakketId: string | null = null;

    if (pakketversieId1 && bestaandePakketversies.has(pakketversieId1)) {
      bronPakketversieId = pakketversieId1;
    } else if (pakketNaam1) {
      // Create or find extern pakket
      const externKey = `${pakketNaam1}|${versieNaam1 || ""}|${leverancier1 || ""}`;
      if (!externPakketCache.has(externKey)) {
        const ep = await prisma.externPakket.create({
          data: {
            naam: pakketNaam1,
            versie: versieNaam1 || null,
            leverancierNaam: leverancier1 || null,
          },
        });
        externPakketCache.set(externKey, ep.id);
      }
      bronExternPakketId = externPakketCache.get(externKey)!;
    }

    // Determine if doel is pakketversie or extern
    let doelPakketversieId: string | null = null;
    let doelExternPakketId: string | null = null;

    // Check if side 2 is buitengemeentelijk (extern pakket label)
    const isBuitengemeentelijk =
      versieNaam2?.includes("(Buitengemeentelijk)") ||
      versieNaam2?.includes("(Extern pakket)") ||
      pakketNaam2?.includes("(Buitengemeentelijk)") ||
      (!pakketversieId2 && pakketNaam2);

    if (pakketversieId2 && bestaandePakketversies.has(pakketversieId2)) {
      doelPakketversieId = pakketversieId2;
    } else if (pakketNaam2) {
      const externKey = `${pakketNaam2}|${versieNaam2 || ""}|${leverancier2 || ""}`;
      if (!externPakketCache.has(externKey)) {
        const ep = await prisma.externPakket.create({
          data: {
            naam: pakketNaam2,
            versie: versieNaam2 || null,
            leverancierNaam: leverancier2 || null,
          },
        });
        externPakketCache.set(externKey, ep.id);
      }
      doelExternPakketId = externPakketCache.get(externKey)!;
    }

    // Must have at least bron or doel
    if (!bronPakketversieId && !bronExternPakketId && !doelPakketversieId && !doelExternPakketId) {
      skipped++;
      continue;
    }

    try {
      await prisma.koppeling.create({
        data: {
          organisatieId: gemeenteId,
          bronPakketversieId,
          bronExternPakketId,
          doelPakketversieId,
          doelExternPakketId,
          richting,
          buitengemeentelijk: !!isBuitengemeentelijk,
          status,
          standaard: standaardVersie || (standaardType === "custom" ? "Maatwerk" : null),
          datumIngangStatus,
          transportprotocol,
          aanvullendeInformatie,
          intermediairPakketversieId: intermediairPakketversieId && bestaandePakketversies.has(intermediairPakketversieId) ? intermediairPakketversieId : null,
        },
      });
      imported++;
    } catch (err) {
      skipped++;
    }

    if (imported % 500 === 0 && imported > 0) {
      console.log(`  ... ${imported} koppelingen geïmporteerd`);
    }
  }

  console.log(`\nDone!`);
  console.log(`  Koppelingen imported: ${imported}`);
  console.log(`  Koppelingen skipped: ${skipped}`);
  console.log(`  Externe pakketten created: ${externPakketCache.size}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
