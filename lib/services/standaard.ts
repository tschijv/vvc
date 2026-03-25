import { prisma } from "@/lib/prisma";

export async function getStandaarden(options?: {
  zoek?: string;
  skip?: number;
  take?: number;
}) {
  const { zoek, skip, take } = options || {};
  const where = zoek
    ? { naam: { contains: zoek, mode: "insensitive" as const } }
    : {};

  return prisma.standaard.findMany({
    where,
    include: {
      versies: {
        select: {
          id: true,
          naam: true,
          standaardId: true,
          _count: { select: { pakketten: true } },
        },
        orderBy: { naam: "asc" },
      },
    },
    orderBy: { naam: "asc" },
    ...(skip !== undefined && { skip }),
    ...(take !== undefined && { take }),
  });
}

export async function getStandaardenCount(options?: { zoek?: string }) {
  const { zoek } = options || {};
  const where = zoek
    ? { naam: { contains: zoek, mode: "insensitive" as const } }
    : {};
  return prisma.standaard.count({ where });
}

export async function getStandaardById(id: string) {
  return prisma.standaard.findUnique({
    where: { id },
    include: {
      versies: {
        include: {
          _count: { select: { pakketten: true } },
        },
        orderBy: { naam: "asc" },
      },
    },
  });
}
