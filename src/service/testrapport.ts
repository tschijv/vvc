import { prisma } from "@/data/prisma";

export async function getTestrapportenByPakketId(pakketId: string) {
  return prisma.testrapport.findMany({
    where: {
      pakketversie: { pakketId },
    },
    include: {
      standaard: true,
      pakketversie: { select: { id: true, naam: true } },
    },
    orderBy: [
      { pakketversie: { naam: "desc" } },
      { standaard: { naam: "asc" } },
    ],
  });
}

export async function getTestrapportenByPakketversieId(pakketversieId: string) {
  return prisma.testrapport.findMany({
    where: { pakketversieId },
    include: {
      standaard: true,
    },
    orderBy: { standaard: { naam: "asc" } },
  });
}
