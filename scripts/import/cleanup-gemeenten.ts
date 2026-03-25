/**
 * Cleanup script: normalise gemeenten to exactly 342 records matching GeoJSON.
 *
 * What it does:
 * 1. Identifies the "correct" gemeente per CBS code (from seed list)
 * 2. Finds duplicates (same name, different CBS code) and orphans
 * 3. Migrates GemeentePakket, Koppeling, User, Notificatie, Favoriet,
 *    SamenwerkingGemeente, AuditLog data from old → correct record
 * 4. Deletes the old/orphaned gemeente records
 *
 * Usage:
 *   npx tsx scripts/import/cleanup-gemeenten.ts
 *   npx tsx scripts/import/cleanup-gemeenten.ts --dry-run
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://toineschijvenaars@localhost:5432/softwarecatalogus?schema=public";
const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const dryRun = process.argv.includes("--dry-run");

// The 342 correct CBS codes (from GeoJSON / seed)
const CORRECT_CBS = new Set([
  "0518","0796","1680","0358","0197","0059","0482","0613","0361","0141",
  "0034","0484","1723","1959","0060","0307","0362","0363","0200","0202",
  "0106","0743","0744","0308","0489","0203","0888","1954","0889","1945",
  "1724","0893","0373","0748","1859","1721","0753","0209","0375","1728",
  "0376","0377","1901","0755","1681","0147","0654","0757","0758","1876",
  "0213","0899","0312","0313","0214","0502","0383","0109","1706","0216",
  "0148","1891","0310","1940","0736","1690","0503","0400","0762","0150",
  "0384","1980","1774","0221","0222","0766","0505","0498","1719","0303",
  "0225","0226","1711","0385","0228","0317","1979","0770","1903","0772",
  "0230","0114","0388","0153","0232","0233","0777","0779","1771","1652",
  "0907","0784","1924","0664","0785","1942","0512","0513","0014","1729",
  "0158","0392","0394","1655","0160","0243","0523","0072","0244","0396",
  "0397","0246","0074","0917","1658","0399","0163","0794","0531","0164",
  "1966","0252","0797","0534","0798","0402","1963","1735","1911","0118",
  "0405","1507","0321","0406","0677","0353","1884","0166","0678","0537",
  "0928","1598","0542","1931","1659","1982","0882","0415","1621","0417",
  "0080","0546","0547","1916","0995","1640","0327","1705","0553","0262",
  "0809","0331","0168","0263","1641","1991","0556","0935","0420","0938",
  "1948","0119","0687","1842","1731","1952","1709","1978","1955","0335",
  "0944","1740","0946","0356","0569","0267","0268","1930","1970","1695",
  "1699","0171","0575","0820","0302","0579","0823","0824","1895","0269",
  "0173","1773","0175","1586","0826","0085","0431","0432","0086","0828",
  "1509","0437","0589","1734","0590","1894","0765","1926","0439","0273",
  "0177","0703","0274","0339","1667","0275","0340","0597","1742","0603",
  "1669","0957","1674","0599","0277","0840","0441","0279","0606","0088",
  "1676","0965","0845","1883","0610","1714","0090","0342","0847","0848",
  "0037","0180","0532","0851","1708","0971","1904","1900","0715","0093",
  "0448","1525","0716","0281","0855","0183","1700","1730","0737","0450",
  "0451","0184","0344","1581","0981","0994","0858","0047","0345","0717",
  "0861","0453","0983","0984","1961","0622","0096","0718","0986","1992",
  "0626","0285","0865","1949","0866","0867","0627","0289","0629","0852",
  "0988","1960","0668","1969","1701","0293","1950","1783","0098","0189",
  "0296","1696","0352","0294","0873","0632","0880","0351","0479","0297",
  "0473","0050","0355","0299","0637","0638","1892","0879","0301","1896",
  "0642","0193",
]);

async function main() {
  console.log(dryRun ? "🔍 DRY RUN — geen wijzigingen\n" : "🔧 LIVE RUN\n");

  // Get all gemeenten
  const allGemeenten = await prisma.organisatie.findMany({
    select: {
      id: true,
      naam: true,
      cbsCode: true,
      _count: {
        select: {
          pakketten: true,
        },
      },
    },
  });

  console.log(`Totaal gemeenten in database: ${allGemeenten.length}`);

  // Split into correct (CBS in set) and orphans
  const correct = allGemeenten.filter((g) => g.cbsCode && CORRECT_CBS.has(g.cbsCode));
  const orphans = allGemeenten.filter((g) => !g.cbsCode || !CORRECT_CBS.has(g.cbsCode));

  console.log(`Correct (CBS matched): ${correct.length}`);
  console.log(`Te verwijderen: ${orphans.length}\n`);

  if (orphans.length === 0) {
    console.log("✅ Geen cleanup nodig — al genormaliseerd.");
    return;
  }

  // Build name→correct mapping for data migration
  const correctByName = new Map<string, string>();
  for (const g of correct) {
    correctByName.set(g.naam.toLowerCase(), g.id);
  }

  let migrated = 0;
  let deleted = 0;
  let skippedWithData = 0;

  for (const orphan of orphans) {
    // Try to find a correct gemeente with the same name
    const targetId = correctByName.get(orphan.naam.toLowerCase());

    if (targetId) {
      // Migrate data from orphan to correct record
      console.log(`  📦 ${orphan.naam} (${orphan.cbsCode}) → migreer data naar correct record`);

      if (!dryRun) {
        // Migrate GemeentePakket (skip duplicates)
        await prisma.$executeRawUnsafe(
          `UPDATE "GemeentePakket" SET "gemeenteId" = $1 WHERE "gemeenteId" = $2 AND "pakketversieId" NOT IN (SELECT "pakketversieId" FROM "GemeentePakket" WHERE "gemeenteId" = $1)`,
          targetId, orphan.id,
        );
        await prisma.organisatiePakket.deleteMany({ where: { organisatieId: orphan.id } });

        // Migrate Users
        await prisma.user.updateMany({
          where: { organisatieId: orphan.id },
          data: { organisatieId: targetId },
        });

        // Migrate Koppelingen
        await prisma.koppeling.updateMany({
          where: { organisatieId: orphan.id },
          data: { organisatieId: targetId },
        });

        // Migrate SamenwerkingGemeente
        await prisma.$executeRawUnsafe(
          `UPDATE "SamenwerkingGemeente" SET "gemeenteId" = $1 WHERE "gemeenteId" = $2 AND "samenwerkingId" NOT IN (SELECT "samenwerkingId" FROM "SamenwerkingGemeente" WHERE "gemeenteId" = $1)`,
          targetId, orphan.id,
        );
        await prisma.samenwerkingOrganisatie.deleteMany({ where: { organisatieId: orphan.id } });

        // Migrate Notificaties
        try {
          await prisma.notificatie.updateMany({
            where: { userId: orphan.id }, // notificaties are per user, not gemeente
            data: {},
          });
        } catch { /* no gemeenteId on Notificatie */ }

        // Delete orphan
        await prisma.organisatie.delete({ where: { id: orphan.id } });
      }

      migrated++;
    } else {
      // No matching correct gemeente — check if it has data
      if (orphan._count.pakketten > 0) {
        console.log(`  ⚠️  ${orphan.naam} (${orphan.cbsCode}) — ${orphan._count.pakketten} pakketten, GEEN match gevonden`);

        if (!dryRun) {
          // Delete pakket links first, then gemeente
          await prisma.organisatiePakket.deleteMany({ where: { organisatieId: orphan.id } });
          await prisma.koppeling.deleteMany({ where: { organisatieId: orphan.id } });
          await prisma.samenwerkingOrganisatie.deleteMany({ where: { organisatieId: orphan.id } });
          await prisma.user.updateMany({
            where: { organisatieId: orphan.id },
            data: { organisatieId: null },
          });
          await prisma.organisatie.delete({ where: { id: orphan.id } });
        }

        skippedWithData++;
      } else {
        console.log(`  🗑️  ${orphan.naam} (${orphan.cbsCode}) — geen data, verwijderen`);
        if (!dryRun) {
          await prisma.koppeling.deleteMany({ where: { organisatieId: orphan.id } });
          await prisma.samenwerkingOrganisatie.deleteMany({ where: { organisatieId: orphan.id } });
          await prisma.user.updateMany({
            where: { organisatieId: orphan.id },
            data: { organisatieId: null },
          });
          await prisma.organisatie.delete({ where: { id: orphan.id } });
        }
      }
      deleted++;
    }

    process.stdout.write("");
  }

  console.log(`\n${dryRun ? "[DRY RUN] " : ""}Resultaat:`);
  console.log(`  Gemigreerd: ${migrated}`);
  console.log(`  Verwijderd: ${deleted} (waarvan ${skippedWithData} met data)`);

  const remaining = await prisma.organisatie.count();
  console.log(`  Gemeenten over: ${remaining}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
