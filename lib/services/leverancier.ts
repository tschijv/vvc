import { prisma } from "@/lib/prisma";

// ─── Lijst & zoek ──────────────────────────────────────────────────────────────

export async function getLeveranciers(options?: {
  zoek?: string;
  skip?: number;
  take?: number;
}) {
  const { zoek, skip, take } = options || {};

  const where = zoek
    ? { naam: { contains: zoek, mode: "insensitive" as const } }
    : {};

  return prisma.leverancier.findMany({
    where,
    include: {
      addenda: { include: { addendum: true } },
      _count: { select: { pakketten: true } },
    },
    orderBy: { naam: "asc" },
    ...(skip !== undefined && { skip }),
    ...(take !== undefined && { take }),
  });
}

export async function getLeverancierCount(options?: { zoek?: string }) {
  const { zoek } = options || {};

  const where = zoek
    ? { naam: { contains: zoek, mode: "insensitive" as const } }
    : {};

  return prisma.leverancier.count({ where });
}

// ─── Admin helper ────────────────────────────────────────────────────────────────

export async function getLeveranciersForAdmin() {
  return prisma.leverancier.findMany({
    select: { id: true, naam: true },
    orderBy: { naam: "asc" },
  });
}

// ─── Detail ─────────────────────────────────────────────────────────────────────

export async function getLeverancierById(id: string) {
  return prisma.leverancier.findUnique({
    where: { id },
    include: {
      addenda: { include: { addendum: true } },
      pakketten: {
        include: {
          versies: {
            orderBy: { startDistributie: "desc" },
            take: 1,
            select: { status: true, naam: true },
          },
        },
        orderBy: { naam: "asc" },
      },
    },
  });
}

export async function getLeverancierBySlug(slug: string) {
  return prisma.leverancier.findUnique({
    where: { slug },
    include: {
      addenda: { include: { addendum: true } },
      pakketten: {
        include: {
          versies: {
            orderBy: { startDistributie: "desc" },
            take: 1,
            select: { status: true, naam: true },
          },
        },
        orderBy: { naam: "asc" },
      },
    },
  });
}

// ─── Pakketten van leverancier ──────────────────────────────────────────────────

export async function getLeverancierPakketten(leverancierId: string) {
  return prisma.pakket.findMany({
    where: { leverancierId },
    include: {
      leverancier: { select: { naam: true, slug: true } },
      versies: {
        orderBy: { startDistributie: "desc" },
        take: 1,
        select: { status: true, naam: true },
      },
    },
    orderBy: { naam: "asc" },
  });
}
