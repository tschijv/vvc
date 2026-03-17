import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashSync } from "bcryptjs";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Get 3 gemeenten and 3 leveranciers to link to
  const gemeenten = await prisma.gemeente.findMany({
    orderBy: { naam: "asc" },
    take: 3,
    select: { id: true, naam: true },
  });

  const leveranciers = await prisma.leverancier.findMany({
    orderBy: { naam: "asc" },
    take: 3,
    select: { id: true, naam: true },
  });

  console.log("Gemeenten for test accounts:");
  gemeenten.forEach((g, i) => console.log(`  ${i + 1}. ${g.naam}`));
  console.log("Leveranciers for test accounts:");
  leveranciers.forEach((l, i) => console.log(`  ${i + 1}. ${l.naam}`));

  const users = [
    {
      email: "admin@swc.nl",
      naam: "Admin VC",
      passwordHash: hashSync("admin2026", 10),
      role: "ADMIN",
      gemeenteId: null,
      leverancierId: null,
    },
    ...gemeenten.map((g, i) => ({
      email: `gemeente${i + 1}@swc.nl`,
      naam: `Testgebruiker ${g.naam}`,
      passwordHash: hashSync("test2026", 10),
      role: "GEMEENTE",
      gemeenteId: g.id,
      leverancierId: null,
    })),
    ...leveranciers.map((l, i) => ({
      email: `leverancier${i + 1}@swc.nl`,
      naam: `Testgebruiker ${l.naam}`,
      passwordHash: hashSync("test2026", 10),
      role: "LEVERANCIER",
      gemeenteId: null,
      leverancierId: l.id,
    })),
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        naam: user.naam,
        passwordHash: user.passwordHash,
        role: user.role,
        gemeenteId: user.gemeenteId,
        leverancierId: user.leverancierId,
      },
      create: user,
    });
    console.log(`  ✓ ${user.email} (${user.role})`);
  }

  console.log(`\nDone! Created ${users.length} test accounts.`);
  console.log("\nTest credentials:");
  console.log("  admin@swc.nl / admin2026");
  console.log("  gemeente1@swc.nl / test2026");
  console.log("  leverancier1@swc.nl / test2026");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
