import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { JSDOM } from "jsdom";

const DATABASE_URL =
  "postgresql://toineschijvenaars@localhost:5432/softwarecatalogus?schema=public";
const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const CHECKED_CHARCODE = 61510; // FontAwesome \f046 = checked
const DELAY_MS = 500; // respectful delay between requests

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchPage(slug: string): Promise<string | null> {
  const url = `https://www.softwarecatalogus.nl/pakket/${slug}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; research bot)" },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function parseFunctionaliteit(html: string): { rc: string; af: string; ondersteund: boolean }[] {
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const tables = doc.querySelectorAll("table");

  for (const table of tables) {
    const headers = Array.from(table.querySelectorAll("th")).map((h) =>
      h.textContent?.trim()
    );
    if (
      headers.includes("Referentiecomponent") &&
      headers.includes("Applicatiefunctie") &&
      headers.includes("Ondersteuning")
    ) {
      const rows = table.querySelectorAll("tbody tr");
      const result: { rc: string; af: string; ondersteund: boolean }[] = [];
      rows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        if (cells.length < 3) return;
        const rc = cells[0]?.textContent?.split("\n")[0].trim() || "";
        const af = cells[1]?.textContent?.split("\n")[0].trim() || "";
        const span = cells[2]?.querySelector("span[data-icon]");
        const icon = span?.getAttribute("data-icon") || "";
        const charCode = icon.charCodeAt(0);
        const ondersteund = charCode === CHECKED_CHARCODE;
        if (rc || af) result.push({ rc, af, ondersteund });
      });
      return result;
    }
  }
  return [];
}

async function main() {
  // Get all pakketversies (we need the versie ID for linking)
  const pakketten = await prisma.pakket.findMany({
    select: { slug: true, versies: { select: { id: true }, take: 1, orderBy: { startDistributie: "desc" } } },
    orderBy: { naam: "asc" },
  });

  console.log(`Scraping ${pakketten.length} pakketten...`);

  // Upsert cache for referentiecomponenten and applicatiefuncties
  const rcCache = new Map<string, string>();
  const afCache = new Map<string, string>();

  let scraped = 0;
  let withData = 0;
  let errors = 0;

  for (const pakket of pakketten) {
    if (pakket.versies.length === 0) continue;
    const versieId = pakket.versies[0].id;

    const html = await fetchPage(pakket.slug);
    scraped++;

    if (!html) {
      errors++;
      if (scraped % 50 === 0) console.log(`  ${scraped}/${pakketten.length} (${errors} errors, ${withData} met data)`);
      await sleep(DELAY_MS);
      continue;
    }

    const functies = parseFunctionaliteit(html);

    if (functies.length > 0) {
      withData++;
      for (const { rc, af, ondersteund } of functies) {
        if (!af) continue;

        // Upsert applicatiefunctie
        let afId = afCache.get(af);
        if (!afId) {
          const afRecord = await prisma.applicatiefunctie.upsert({
            where: { naam: af },
            update: {},
            create: { naam: af },
          });
          afId = afRecord.id;
          afCache.set(af, afId);
        }

        // Upsert pakketversie-applicatiefunctie link
        await prisma.pakketversieApplicatiefunctie.upsert({
          where: { pakketversieId_applicatiefunctieId: { pakketversieId: versieId, applicatiefunctieId: afId } },
          update: { ondersteund },
          create: { pakketversieId: versieId, applicatiefunctieId: afId, ondersteund },
        });
      }
    }

    if (scraped % 50 === 0) {
      console.log(`  ${scraped}/${pakketten.length} — ${withData} met data, ${errors} errors`);
    }

    await sleep(DELAY_MS);
  }

  console.log(`\nKlaar! ${scraped} gescraped, ${withData} met functionaliteitsdata, ${errors} errors`);
  console.log(`Applicatiefuncties: ${afCache.size} uniek`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
