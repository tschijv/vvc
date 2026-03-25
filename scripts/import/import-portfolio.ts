import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";
import { parse } from "csv-parse/sync";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const CSV_PATH = "/tmp/swc_exports/Gemeenten_applicatieportfolio.csv";

function parseDate(s: string | undefined): Date | undefined {
  if (!s || s.trim() === "") return undefined;
  const parts = s.trim().split("-");
  if (parts.length === 3) {
    const [d, m, y] = parts;
    const year = y.length === 2 ? "20" + y : y;
    const date = new Date(parseInt(year), parseInt(m) - 1, parseInt(d));
    if (!isNaN(date.getTime())) return date;
  }
  return undefined;
}

async function main() {
  console.log("Importing applicatieportfolio...");
  const content = fs.readFileSync(CSV_PATH, "utf-8");
  const rows: Record<string, string>[] = parse(content, {
    delimiter: ";",
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
    trim: true,
  });
  console.log(`Rows: ${rows.length}`);

  const bestaandeVersies = new Set(
    (await prisma.pakketversie.findMany({ select: { id: true } })).map(
      (v) => v.id
    )
  );
  const bestaandeGemeenten = new Set(
    (await prisma.organisatie.findMany({ select: { id: true } })).map(
      (g) => g.id
    )
  );
  console.log(
    `Pakketversies: ${bestaandeVersies.size}, Gemeenten: ${bestaandeGemeenten.size}`
  );

  let portfolioCount = 0;
  let skipped = 0;
  let newGemeenten = 0;

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

    const pakketversieId = row["Pakketversie ID"]?.trim();
    if (pakketversieId && bestaandeVersies.has(pakketversieId)) {
      try {
        await prisma.organisatiePakket.upsert({
          where: {
            organisatieId_pakketversieId: { organisatieId: gemeenteId, pakketversieId },
          },
          update: {},
          create: {
            organisatieId: gemeenteId,
            pakketversieId,
            status: row["Gebruik Status"] || null,
            datumIngangStatus:
              parseDate(row["Gebruik Datum ingang status"]) || null,
            technologie: row["Pakketversie gebruik technologie"] || null,
            mutatiedatum:
              parseDate(row["Mutatiedatum applicatieportfolio"]) || null,
          },
        });
        portfolioCount++;
      } catch {
        skipped++;
      }
    } else {
      skipped++;
    }

    if (portfolioCount % 2000 === 0 && portfolioCount > 0) {
      console.log(`  ...${portfolioCount} portfolio links`);
    }
  }

  console.log(
    `Done! Portfolio links: ${portfolioCount}, Skipped: ${skipped}, New gemeenten: ${newGemeenten}`
  );
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
