import { prisma } from "@/data/prisma";

export async function getReferentiecomponenten(options?: {
  zoek?: string;
  skip?: number;
  take?: number;
}) {
  const { zoek, skip, take } = options || {};
  const where = zoek
    ? { naam: { contains: zoek, mode: "insensitive" as const } }
    : {};

  return prisma.referentiecomponent.findMany({
    where,
    select: {
      id: true,
      naam: true,
      guid: true,
      beschrijving: true,
      _count: { select: { pakketten: true } },
    },
    orderBy: { naam: "asc" },
    ...(skip !== undefined && { skip }),
    ...(take !== undefined && { take }),
  });
}

export async function getReferentiecomponentenCount(options?: { zoek?: string }) {
  const { zoek } = options || {};
  const where = zoek
    ? { naam: { contains: zoek, mode: "insensitive" as const } }
    : {};
  return prisma.referentiecomponent.count({ where });
}

export async function getReferentiecomponentById(id: string) {
  return prisma.referentiecomponent.findUnique({
    where: { id },
    include: {
      _count: { select: { pakketten: true } },
    },
  });
}
