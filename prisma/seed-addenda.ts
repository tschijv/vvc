/**
 * Seed script for demo addenda data.
 * Run with: npx tsx prisma/seed-addenda.ts
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://toineschijvenaars@localhost:5432/softwarecatalogus?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: DATABASE_URL }),
});

const ADDENDUM_TYPES = [
  {
    naam: "Anonimiseringssoftware leverancier",
    beschrijving: "Addendum voor leveranciers die anonimiseringssoftware aanbieden aan gemeenten.",
  },
  {
    naam: "Groeipact Common Ground",
    beschrijving: "Overeenkomst waarin leveranciers zich committeren aan de principes van Common Ground.",
  },
  {
    naam: "Handreiking Standaard Verwerkersovereenkomst Gemeenten (VWO)",
    beschrijving: "Standaard verwerkersovereenkomst voor leveranciers die persoonsgegevens verwerken namens gemeenten.",
  },
];

async function main() {
  console.log("Seeding addenda...");

  // Upsert addendum types
  const addenda = [];
  for (const type of ADDENDUM_TYPES) {
    const addendum = await prisma.addendum.upsert({
      where: { naam: type.naam },
      update: {},
      create: type,
    });
    addenda.push(addendum);
    console.log(`  Addendum type: ${addendum.naam} (${addendum.id})`);
  }

  // Get leveranciers to assign addenda to
  const leveranciers = await prisma.leverancier.findMany({
    orderBy: { naam: "asc" },
    take: 60,
    select: { id: true, naam: true },
  });

  if (leveranciers.length === 0) {
    console.log("  No leveranciers found, skipping assignment.");
    return;
  }

  console.log(`  Found ${leveranciers.length} leveranciers`);

  let count = 0;

  // Distribute addenda across leveranciers
  for (let i = 0; i < leveranciers.length && count < 50; i++) {
    const lev = leveranciers[i];

    // Assign different addenda based on index for variety
    const assignments: { addendumId: string; ondertekend: Date | null; deadline: Date | null }[] = [];

    // ~60% get Groeipact Common Ground
    if (i % 5 !== 0 && i % 5 !== 3) {
      assignments.push({
        addendumId: addenda[1].id, // Groeipact Common Ground
        ondertekend: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        deadline: i % 3 === 0 ? new Date(2025, 5, 30) : null,
      });
    }

    // ~40% get VWO
    if (i % 5 < 2) {
      assignments.push({
        addendumId: addenda[2].id, // VWO
        ondertekend: new Date(2024, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1),
        deadline: null,
      });
    }

    // ~25% get Anonimiseringssoftware
    if (i % 4 === 0) {
      assignments.push({
        addendumId: addenda[0].id, // Anonimiseringssoftware
        ondertekend: new Date(2024, 6 + Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1),
        deadline: new Date(2026, 0, 1),
      });
    }

    for (const a of assignments) {
      try {
        await prisma.leverancierAddendum.upsert({
          where: {
            leverancierId_addendumId: {
              leverancierId: lev.id,
              addendumId: a.addendumId,
            },
          },
          update: {
            ondertekend: a.ondertekend,
            deadline: a.deadline,
          },
          create: {
            leverancierId: lev.id,
            addendumId: a.addendumId,
            ondertekend: a.ondertekend,
            deadline: a.deadline,
          },
        });
        count++;
      } catch (e) {
        // Skip duplicates silently
      }
    }
  }

  console.log(`  Created/updated ${count} leverancier-addendum assignments`);
  console.log("Done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
