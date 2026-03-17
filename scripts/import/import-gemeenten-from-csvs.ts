/**
 * Extract gemeenten from Samenwerkingen and Koppelingen CSVs and upsert them into the database.
 * This is needed because the original all_gemeenten.csv only had 2 test records.
 */
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

const SAMENWERKINGEN_CSV =
  "/Users/toineschijvenaars/Downloads/Samenwerkingen_20260315_1806.csv";
const KOPPELINGEN_CSV =
  "/Users/toineschijvenaars/Downloads/Koppelingen_20260315_1806.csv";

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
  const gemeenten = new Map<string, string>(); // id -> naam

  // 1. From samenwerkingen CSV — extract organisation IDs and names
  console.log("Extracting gemeenten from samenwerkingen CSV...");
  const swRows = readCsv(SAMENWERKINGEN_CSV);
  for (const row of swRows) {
    const orgIds = (row["Organisations ID"] || "")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const orgNames = (row["Organisations Name"] || "")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (let i = 0; i < orgIds.length; i++) {
      if (orgIds[i] && orgNames[i]) {
        gemeenten.set(orgIds[i], orgNames[i]);
      }
    }
  }
  console.log(`  ${gemeenten.size} unieke gemeenten uit samenwerkingen.`);

  // 2. From koppelingen CSV — extract organisation IDs and names
  console.log("Extracting gemeenten from koppelingen CSV...");
  const kopRows = readCsv(KOPPELINGEN_CSV);
  for (const row of kopRows) {
    const id = row["Organisatie ID"]?.trim();
    const naam = row["Organisation"]?.trim();
    if (id && naam) gemeenten.set(id, naam);
  }
  console.log(`  ${gemeenten.size} unieke gemeenten totaal (samenwerkingen + koppelingen).`);

  // 3. Upsert all
  console.log("\nUpserting gemeenten...");
  let created = 0;
  let existed = 0;
  for (const [id, naam] of gemeenten) {
    const existing = await prisma.gemeente.findUnique({
      where: { id },
      select: { id: true },
    });
    if (existing) {
      existed++;
    } else {
      await prisma.gemeente.create({
        data: { id, naam },
      });
      created++;
    }
  }

  console.log(`\nDone!`);
  console.log(`  Gemeenten created: ${created}`);
  console.log(`  Gemeenten already existed: ${existed}`);
  console.log(`  Total in database: ${await prisma.gemeente.count()}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
