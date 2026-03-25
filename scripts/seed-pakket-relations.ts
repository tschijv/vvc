import { prisma } from "../src/data/prisma";

async function main() {
  const allPakketten = await prisma.pakket.findMany({ select: { id: true } });
  const refcomps = await prisma.referentiecomponent.findMany({ select: { id: true } });
  const standaardversies = await prisma.standaardversie.findMany({ select: { id: true } });

  console.log(`Pakketten: ${allPakketten.length}, Refcomps: ${refcomps.length}, Standaardversies: ${standaardversies.length}`);

  let rcCount = 0, svCount = 0;

  for (const pak of allPakketten) {
    const numRc = Math.floor(Math.random() * 3) + 1;
    const numSv = Math.floor(Math.random() * 2) + 1;

    for (let i = 0; i < numRc && i < refcomps.length; i++) {
      const rcIdx = Math.floor(Math.random() * refcomps.length);
      try {
        await prisma.pakketReferentiecomponent.create({
          data: { pakketId: pak.id, referentiecomponentId: refcomps[rcIdx].id },
        });
        rcCount++;
      } catch {}
    }

    for (let i = 0; i < numSv && i < standaardversies.length; i++) {
      const svIdx = Math.floor(Math.random() * standaardversies.length);
      try {
        await prisma.pakketStandaard.create({
          data: { pakketId: pak.id, standaardversieId: standaardversies[svIdx].id },
        });
        svCount++;
      } catch {}
    }
  }

  console.log(`Created: ${rcCount} PakketReferentiecomponent, ${svCount} PakketStandaard`);
  await prisma.$disconnect();
}

main().catch(console.error);
