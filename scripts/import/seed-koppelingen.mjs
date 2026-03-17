import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_gNA4LHj7bmxw@ep-empty-cake-aga3xz6i-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require";

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const STANDAARDEN = [
  "Maatwerk",
  "Onbekend",
  "StUF tax (actueel)",
  "DigiD SAML koppelvlak (actueel)",
  "iWmo voor gemeenten 2.3",
  "iJw voor gemeenten 2.3",
  "BAG LV koppelvlak 1.3",
  "BRK Levering 2.1",
  "CMIS 1.0",
  "Betalen en invorderen services 1.0",
];

const RICHTINGEN = ["heen", "weer", "beide"];
const STATUSSEN = ["In productie", "In productie", "In productie", "Gepland", "Uitgefaseerd"];

async function main() {
  // Get some gemeenten that have packages
  const gemeenten = await prisma.gemeente.findMany({
    where: { pakketten: { some: {} } },
    include: {
      pakketten: {
        include: { pakketversie: { include: { pakket: true } } },
        take: 10,
      },
    },
    take: 30,
  });

  console.log(`Found ${gemeenten.length} gemeenten with packages`);

  // Create some extern pakketten
  const externePakketten = [
    { naam: "Office365", versie: null },
    { naam: "3CX", versie: "18.0" },
    { naam: "3D-Monitor", versie: null },
    { naam: "GGK - Gemeentelijk Gegevensknooppunt", versie: null },
    { naam: "[EXTERN: ROG +] Rondom", versie: null },
    { naam: "SAP SuccessFactors", versie: "3.1" },
    { naam: "Microsoft Teams", versie: null },
    { naam: "Genesys Cloud", versie: "2.0" },
  ];

  const createdExtern = [];
  for (const ep of externePakketten) {
    const ext = await prisma.externPakket.upsert({
      where: { id: ep.naam.substring(0, 36).replace(/[^a-zA-Z0-9]/g, "-") },
      update: {},
      create: { naam: ep.naam, versie: ep.versie },
    });
    createdExtern.push(ext);
  }
  console.log(`Created/found ${createdExtern.length} extern pakketten`);

  // Generate koppelingen
  let count = 0;
  for (const gemeente of gemeenten) {
    if (gemeente.pakketten.length < 2) continue;

    // Create 3-8 koppelingen per gemeente
    const numKoppelingen = 3 + Math.floor(Math.random() * 6);

    for (let i = 0; i < numKoppelingen && i < gemeente.pakketten.length - 1; i++) {
      const bron = gemeente.pakketten[i];
      const richting = RICHTINGEN[Math.floor(Math.random() * RICHTINGEN.length)];
      const standaard = STANDAARDEN[Math.floor(Math.random() * STANDAARDEN.length)];
      const status = STATUSSEN[Math.floor(Math.random() * STATUSSEN.length)];

      // 50% chance of koppeling with another pakketversie, 50% with extern pakket
      const useExtern = Math.random() > 0.5;
      const buitengemeentelijk = Math.random() > 0.7;

      if (useExtern) {
        const externPakket = createdExtern[Math.floor(Math.random() * createdExtern.length)];
        await prisma.koppeling.create({
          data: {
            gemeenteId: gemeente.id,
            bronPakketversieId: bron.pakketversieId,
            richting,
            doelExternPakketId: externPakket.id,
            buitengemeentelijk,
            status,
            standaard,
          },
        });
      } else {
        // Pick a different pakketversie from same gemeente
        const doel = gemeente.pakketten[(i + 1) % gemeente.pakketten.length];
        if (doel.pakketversieId !== bron.pakketversieId) {
          await prisma.koppeling.create({
            data: {
              gemeenteId: gemeente.id,
              bronPakketversieId: bron.pakketversieId,
              richting,
              doelPakketversieId: doel.pakketversieId,
              buitengemeentelijk: false,
              status,
              standaard,
            },
          });
        }
      }
      count++;
    }
  }

  console.log(`Created ${count} koppelingen`);

  // Also create some with extern as bron
  for (let i = 0; i < 15; i++) {
    const gemeente = gemeenten[Math.floor(Math.random() * gemeenten.length)];
    if (gemeente.pakketten.length === 0) continue;

    const externPakket = createdExtern[Math.floor(Math.random() * createdExtern.length)];
    const doel = gemeente.pakketten[Math.floor(Math.random() * gemeente.pakketten.length)];

    await prisma.koppeling.create({
      data: {
        gemeenteId: gemeente.id,
        bronExternPakketId: externPakket.id,
        richting: RICHTINGEN[Math.floor(Math.random() * RICHTINGEN.length)],
        doelPakketversieId: doel.pakketversieId,
        buitengemeentelijk: Math.random() > 0.5,
        status: STATUSSEN[Math.floor(Math.random() * STATUSSEN.length)],
        standaard: STANDAARDEN[Math.floor(Math.random() * STANDAARDEN.length)],
      },
    });
    count++;
  }

  console.log(`Total koppelingen created: ${count}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
