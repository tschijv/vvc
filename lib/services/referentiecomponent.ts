import { prisma } from "@/lib/prisma";

export async function getReferentiecomponenten(options?: { zoek?: string }) {
  const { zoek } = options || {};

  return prisma.referentiecomponent.findMany({
    where: zoek ? { naam: { contains: zoek, mode: "insensitive" } } : {},
    include: {
      _count: { select: { pakketversies: true } },
    },
    orderBy: { naam: "asc" },
  });
}

export async function getReferentiecomponentById(id: string) {
  return prisma.referentiecomponent.findUnique({
    where: { id },
    include: {
      _count: { select: { pakketversies: true } },
    },
  });
}
