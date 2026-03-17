import { prisma } from "@/lib/prisma";

export async function getStandaarden(options?: { zoek?: string }) {
  const { zoek } = options || {};

  return prisma.standaard.findMany({
    where: zoek ? { naam: { contains: zoek, mode: "insensitive" } } : {},
    include: {
      versies: {
        include: {
          _count: { select: { pakketversies: true } },
        },
        orderBy: { naam: "asc" },
      },
    },
    orderBy: { naam: "asc" },
  });
}

export async function getStandaardById(id: string) {
  return prisma.standaard.findUnique({
    where: { id },
    include: {
      versies: {
        include: {
          _count: { select: { pakketversies: true } },
        },
        orderBy: { naam: "asc" },
      },
    },
  });
}
