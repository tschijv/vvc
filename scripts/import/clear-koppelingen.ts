import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Deleting existing koppelingen...");
  const deleted = await prisma.koppeling.deleteMany({});
  console.log(`Deleted ${deleted.count} koppelingen.`);

  console.log("Deleting existing externe pakketten...");
  const deletedEp = await prisma.externPakket.deleteMany({});
  console.log(`Deleted ${deletedEp.count} externe pakketten.`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
