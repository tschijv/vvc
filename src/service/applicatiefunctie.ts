import { prisma } from "@/data/prisma";

export async function getApplicatiefuncties(options?: {
  zoek?: string;
  skip?: number;
  take?: number;
}) {
  const { zoek, skip, take } = options || {};

  const where = zoek
    ? { naam: { contains: zoek, mode: "insensitive" as const } }
    : {};

  return prisma.applicatiefunctie.findMany({
    where,
    select: {
      id: true,
      naam: true,
      beschrijving: true,
      _count: { select: { pakketten: true } },
    },
    orderBy: { naam: "asc" },
    ...(skip !== undefined && { skip }),
    ...(take !== undefined && { take }),
  });
}

export async function getApplicatiefunctieCount(options?: { zoek?: string }) {
  const { zoek } = options || {};
  const where = zoek
    ? { naam: { contains: zoek, mode: "insensitive" as const } }
    : {};
  return prisma.applicatiefunctie.count({ where });
}

export async function getApplicatiefunctieById(id: string) {
  return prisma.applicatiefunctie.findUnique({
    where: { id },
    include: {
      _count: { select: { pakketten: true } },
    },
  });
}
