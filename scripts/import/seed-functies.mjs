// Seed applicatiefuncties into the database and link to pakketversies
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { readFileSync } from "fs";

const DATABASE_URL = process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_gNA4LHj7bmxw@ep-empty-cake-aga3xz6i-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require";

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Load scraped functies
  const functies = JSON.parse(readFileSync("/tmp/swc_exports/applicatiefuncties.json", "utf-8"));
  console.log(`Loaded ${functies.length} applicatiefuncties from JSON`);

  // 1. Upsert all applicatiefuncties
  console.log("Upserting applicatiefuncties...");
  const functieMap = new Map();
  for (const f of functies) {
    const naam = f.naam.trim();
    if (!naam) continue;
    const record = await prisma.applicatiefunctie.upsert({
      where: { naam },
      update: {},
      create: { naam },
    });
    functieMap.set(naam, record.id);
  }
  console.log(`  Upserted ${functieMap.size} applicatiefuncties`);

  // 2. Get all pakketversies with their referentiecomponenten
  const pakketversies = await prisma.pakketversie.findMany({
    select: {
      id: true,
      pakket: { select: { naam: true, leverancier: { select: { naam: true } } } },
      referentiecomponenten: { select: { referentiecomponent: { select: { naam: true } } } },
    },
  });
  console.log(`Found ${pakketversies.length} pakketversies`);

  // 3. Build a mapping: referentiecomponent naam -> list of applicatiefuncties
  const refcompToFuncties = new Map();
  for (const f of functies) {
    for (const rc of f.referentiecomponenten) {
      const rcClean = rc.trim();
      if (!rcClean) continue;
      if (!refcompToFuncties.has(rcClean)) refcompToFuncties.set(rcClean, []);
      refcompToFuncties.get(rcClean).push(f.naam.trim());
    }
  }
  console.log(`Mapped ${refcompToFuncties.size} referentiecomponenten to functies`);

  // 4. Link pakketversies to applicatiefuncties based on their referentiecomponenten
  console.log("Linking pakketversies to applicatiefuncties...");
  let linked = 0;
  let skipped = 0;

  for (const pv of pakketversies) {
    const pvRefcomps = pv.referentiecomponenten.map(r => r.referentiecomponent.naam);

    // Collect all functies for this pakketversie's refcomps
    const pvFuncties = new Set();
    for (const rc of pvRefcomps) {
      const funcNames = refcompToFuncties.get(rc) || [];
      for (const fn of funcNames) pvFuncties.add(fn);
    }

    // Create links
    for (const funcNaam of pvFuncties) {
      const funcId = functieMap.get(funcNaam);
      if (!funcId) continue;
      try {
        await prisma.pakketversieApplicatiefunctie.upsert({
          where: {
            pakketversieId_applicatiefunctieId: {
              pakketversieId: pv.id,
              applicatiefunctieId: funcId,
            },
          },
          update: {},
          create: {
            pakketversieId: pv.id,
            applicatiefunctieId: funcId,
            ondersteund: true,
          },
        });
        linked++;
      } catch (e) {
        skipped++;
      }
    }
  }

  console.log(`\nDone! Linked ${linked} pakketversie-applicatiefunctie combinations (${skipped} skipped)`);

  // Stats
  const totalFuncties = await prisma.applicatiefunctie.count();
  const totalLinks = await prisma.pakketversieApplicatiefunctie.count();
  console.log(`\nDatabase stats:`);
  console.log(`  Applicatiefuncties: ${totalFuncties}`);
  console.log(`  Pakketversie-functie links: ${totalLinks}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
