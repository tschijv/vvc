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

const CSV_PATH =
  process.argv[2] ||
  "/Users/toineschijvenaars/Downloads/Samenwerkingen_20260315_1806.csv";

async function main() {
  console.log(`Reading CSV from ${CSV_PATH}...`);
  const content = fs.readFileSync(CSV_PATH, "utf-8");
  const rows: Record<string, string>[] = parse(content, {
    delimiter: ";",
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
    trim: true,
  });

  console.log(`Found ${rows.length} samenwerkingen in CSV.`);

  // Get all existing gemeenten for matching
  const gemeenten = await prisma.organisatie.findMany({
    select: { id: true, naam: true },
  });
  const gemeenteById = new Map(gemeenten.map((g) => [g.id, g]));
  const gemeenteByNaam = new Map(
    gemeenten.map((g) => [g.naam.toLowerCase().trim(), g])
  );
  console.log(`${gemeenten.length} gemeenten in database.`);

  let imported = 0;
  let linkedGemeenten = 0;
  let skippedGemeenten = 0;

  for (const row of rows) {
    const id = row["Collaboration ID"]?.trim();
    const naam = row["Collaboration Name"]?.trim();
    if (!id || !naam) continue;

    const type = row["Collaboration type"]?.trim() || null;
    const contactpersoon = row["Contact Name"]?.trim() || null;
    const email = row["Contact Email"]?.trim() || null;

    // Upsert the samenwerking
    await prisma.samenwerking.upsert({
      where: { id },
      update: {
        naam,
        type,
        contactpersoon,
        email,
      },
      create: {
        id,
        naam,
        type,
        contactpersoon,
        email,
      },
    });
    imported++;

    // Parse organisation IDs (comma-separated UUIDs)
    const orgIds = (row["Organisations ID"] || "")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const orgNames = (row["Organisations Name"] || "")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // Delete existing links and re-create
    await prisma.samenwerkingOrganisatie.deleteMany({
      where: { samenwerkingId: id },
    });

    for (let i = 0; i < orgIds.length; i++) {
      const orgId = orgIds[i];
      const orgName = orgNames[i] || "";

      // Try to find gemeente by UUID first, then by name
      let gemeente = gemeenteById.get(orgId);
      if (!gemeente && orgName) {
        gemeente = gemeenteByNaam.get(orgName.toLowerCase().trim());
      }

      if (gemeente) {
        try {
          await prisma.samenwerkingOrganisatie.create({
            data: {
              samenwerkingId: id,
              organisatieId: gemeente.id,
            },
          });
          linkedGemeenten++;
        } catch {
          // Duplicate or FK violation — skip
          skippedGemeenten++;
        }
      } else {
        if (orgName) {
          console.warn(
            `  ⚠ Gemeente not found: "${orgName}" (${orgId}) for samenwerking "${naam}"`
          );
        }
        skippedGemeenten++;
      }
    }
  }

  console.log(`\nDone!`);
  console.log(`  Samenwerkingen imported: ${imported}`);
  console.log(`  Gemeente links created: ${linkedGemeenten}`);
  console.log(`  Gemeente links skipped: ${skippedGemeenten}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
