/**
 * Migration script: Simplify domain-specific role names to generic ones.
 *
 * Replaces:
 *   GEMEENTE_BEHEERDER  -> BEHEERDER
 *   GEMEENTE_RAADPLEGER -> RAADPLEGER
 *   WATERSCHAP_BEHEERDER  -> BEHEERDER
 *   WATERSCHAP_RAADPLEGER -> RAADPLEGER
 *
 * Run with: npx tsx scripts/migrate-roles.ts
 * Dry run:  npx tsx scripts/migrate-roles.ts --dry-run
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL || "" }),
});

const isDryRun = process.argv.includes("--dry-run");

const ROLE_MAPPING: Record<string, string> = {
  GEMEENTE_BEHEERDER: "BEHEERDER",
  GEMEENTE_RAADPLEGER: "RAADPLEGER",
  WATERSCHAP_BEHEERDER: "BEHEERDER",
  WATERSCHAP_RAADPLEGER: "RAADPLEGER",
};

async function main() {
  console.log(`Starting role migration${isDryRun ? " (DRY RUN)" : ""}...`);

  // Find all users with old role names
  const oldRoles = Object.keys(ROLE_MAPPING);
  const users = await prisma.user.findMany({
    where: {
      rollen: { hasSome: oldRoles },
    },
    select: {
      id: true,
      email: true,
      rollen: true,
    },
  });

  console.log(`Found ${users.length} users with old role names.`);

  let updated = 0;
  for (const user of users) {
    const newRollen = user.rollen.map((r) => ROLE_MAPPING[r] || r);
    // Deduplicate (e.g., if user somehow had both GEMEENTE_BEHEERDER and WATERSCHAP_BEHEERDER)
    const uniqueRollen = [...new Set(newRollen)];

    console.log(`  ${user.email}: [${user.rollen.join(", ")}] -> [${uniqueRollen.join(", ")}]`);

    if (!isDryRun) {
      await prisma.user.update({
        where: { id: user.id },
        data: { rollen: uniqueRollen },
      });
    }
    updated++;
  }

  // Also update UserOrganisatie.rol if it uses old role names
  const userOrgs = await prisma.userOrganisatie.findMany({
    where: {
      rol: { in: oldRoles },
    },
    select: {
      userId: true,
      organisatieId: true,
      rol: true,
    },
  });

  console.log(`Found ${userOrgs.length} UserOrganisatie records with old role names.`);

  for (const uo of userOrgs) {
    const newRol = ROLE_MAPPING[uo.rol] || uo.rol;
    console.log(`  UserOrganisatie(${uo.userId}, ${uo.organisatieId}): ${uo.rol} -> ${newRol}`);

    if (!isDryRun) {
      await prisma.userOrganisatie.update({
        where: {
          userId_organisatieId: {
            userId: uo.userId,
            organisatieId: uo.organisatieId,
          },
        },
        data: { rol: newRol },
      });
    }
  }

  console.log(`\n${isDryRun ? "Would update" : "Updated"} ${updated} users and ${userOrgs.length} UserOrganisatie records.`);
  if (isDryRun) {
    console.log("Run without --dry-run to apply changes.");
  }
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
