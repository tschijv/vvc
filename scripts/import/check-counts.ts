import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Gemeenten:", await prisma.organisatie.count());
  console.log("Pakketten:", await prisma.pakket.count());
  console.log("Pakketversies:", await prisma.pakketversie.count());
  console.log("GemeentePakket:", await prisma.organisatiePakket.count());
  console.log("Koppelingen:", await prisma.koppeling.count());
  console.log("Samenwerkingen:", await prisma.samenwerking.count());
  console.log("Leveranciers:", await prisma.leverancier.count());

  // Find gemeenten with both pakketten and koppelingen
  const gemeentenMetBeide = await prisma.organisatie.findMany({
    where: {
      AND: [
        { pakketten: { some: {} } },
        { koppelingen: { some: {} } },
      ],
    },
    include: {
      _count: { select: { pakketten: true, koppelingen: true } },
    },
    orderBy: { naam: "asc" },
    take: 10,
  });

  console.log("\nGemeenten met zowel pakketten als koppelingen:");
  for (const g of gemeentenMetBeide) {
    console.log(`  ${g.naam}: ${g._count.pakketten} pakketten, ${g._count.koppelingen} koppelingen`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
