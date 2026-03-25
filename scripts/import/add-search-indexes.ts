/**
 * Add pg_trgm trigram indexes for fast ILIKE/contains searches.
 * Also adds missing B-tree indexes on commonly queried columns.
 *
 * Usage:
 *   npx tsx scripts/import/add-search-indexes.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://toineschijvenaars@localhost:5432/softwarecatalogus?schema=public";
const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const INDEXES = [
  // Enable pg_trgm extension
  `CREATE EXTENSION IF NOT EXISTS pg_trgm`,

  // ─── Trigram GIN indexes for ILIKE/contains searches ───
  // Pakket naam (used on /pakketten, /pakketversies search)
  `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pakket_naam_trgm ON "Pakket" USING GIN (naam gin_trgm_ops)`,

  // Leverancier naam (used on /leveranciers, /pakketten, /pakketversies search)
  `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leverancier_naam_trgm ON "Leverancier" USING GIN (naam gin_trgm_ops)`,

  // Pakketversie naam (used on /pakketversies search)
  `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pakketversie_naam_trgm ON "Pakketversie" USING GIN (naam gin_trgm_ops)`,

  // Gemeente naam (used on /gemeenten search)
  `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gemeente_naam_trgm ON "Gemeente" USING GIN (naam gin_trgm_ops)`,

  // Standaard naam (used on /standaarden search)
  `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_standaard_naam_trgm ON "Standaard" USING GIN (naam gin_trgm_ops)`,

  // Referentiecomponent naam (used on /referentiecomponenten search)
  `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_refcomp_naam_trgm ON "Referentiecomponent" USING GIN (naam gin_trgm_ops)`,

  // Applicatiefunctie naam (used on /applicatiefuncties search)
  `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appfunctie_naam_trgm ON "Applicatiefunctie" USING GIN (naam gin_trgm_ops)`,

  // ─── B-tree indexes on commonly filtered columns ───
  // Pakketversie.status (used in /pakketversies status filter)
  `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pakketversie_status ON "Pakketversie" (status)`,

  // Gemeente.cbsCode (used in kaart matching)
  `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gemeente_cbscode ON "Gemeente" ("cbsCode")`,

  // Gemeente.progress (used in sorting/filtering)
  `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gemeente_progress ON "Gemeente" (progress)`,

  // Pakket.slug (already unique, but explicit index for lookups)
  // Already covered by unique constraint

  // Koppeling.gemeenteId (may be missing)
  `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_koppeling_gemeenteid ON "Koppeling" ("gemeenteId")`,

  // User.gemeenteId
  `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_gemeenteid ON "User" ("gemeenteId")`,

  // User.leverancierId
  `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_leverancierid ON "User" ("leverancierId")`,
];

async function main() {
  console.log("🔧 Database indexes toevoegen...\n");

  for (const sql of INDEXES) {
    const name = sql.match(/idx_\w+/)?.[0] || sql.substring(0, 50);
    process.stdout.write(`  ${name}...`);

    try {
      // CONCURRENTLY can't run inside a transaction, use raw query
      await prisma.$executeRawUnsafe(sql);
      console.log(" ✅");
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.includes("already exists")) {
        console.log(" ⏭️  (bestaat al)");
      } else {
        console.log(` ❌ ${msg}`);
      }
    }
  }

  console.log("\n✅ Klaar!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
