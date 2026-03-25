/**
 * Migration script: Create UserOrganisatie records for existing users.
 *
 * For every User with an organisatieId, creates a UserOrganisatie record
 * so they are automatically part of the multi-org system.
 *
 * Run with: npx tsx scripts/migrate-multi-org.ts
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL || "" }),
});

async function main() {
  console.log("Starting multi-org migration...");

  // Find all users with an organisatieId
  const usersWithOrg = await prisma.user.findMany({
    where: { organisatieId: { not: null } },
    select: {
      id: true,
      email: true,
      organisatieId: true,
      rollen: true,
    },
  });

  console.log(`Found ${usersWithOrg.length} users with an organisatieId.`);

  let created = 0;
  let skipped = 0;

  for (const user of usersWithOrg) {
    if (!user.organisatieId) continue;

    // Determine the rol based on existing rollen
    const rol = user.rollen.includes("GEMEENTE_BEHEERDER") ? "BEHEERDER" : "RAADPLEGER";

    try {
      await prisma.userOrganisatie.upsert({
        where: {
          userId_organisatieId: {
            userId: user.id,
            organisatieId: user.organisatieId,
          },
        },
        create: {
          userId: user.id,
          organisatieId: user.organisatieId,
          rol,
        },
        update: {}, // No update needed if already exists
      });
      created++;
      console.log(`  [OK] ${user.email} -> org ${user.organisatieId} (${rol})`);
    } catch (err) {
      skipped++;
      console.log(`  [SKIP] ${user.email}: ${err instanceof Error ? err.message : "unknown error"}`);
    }
  }

  console.log(`\nDone. Created: ${created}, Skipped: ${skipped}`);
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
