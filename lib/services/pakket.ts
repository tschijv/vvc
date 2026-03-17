import { prisma } from "@/lib/prisma";

// ─── Lijst & zoek ──────────────────────────────────────────────────────────────

export async function getPakketten(options?: {
  zoek?: string;
  leverancierId?: string;
  referentiecomponentId?: string;
  skip?: number;
  take?: number;
}) {
  const { zoek, leverancierId, referentiecomponentId, skip, take } =
    options || {};

  const where = {
    ...(zoek && {
      OR: [
        { naam: { contains: zoek, mode: "insensitive" as const } },
        {
          leverancier: {
            naam: { contains: zoek, mode: "insensitive" as const },
          },
        },
      ],
    }),
    ...(leverancierId && { leverancierId }),
    ...(referentiecomponentId && {
      versies: {
        some: {
          referentiecomponenten: {
            some: { referentiecomponentId },
          },
        },
      },
    }),
  };

  return prisma.pakket.findMany({
    where,
    include: { leverancier: { select: { naam: true, slug: true } } },
    orderBy: { naam: "asc" },
    ...(skip !== undefined && { skip }),
    ...(take !== undefined && { take }),
  });
}

export async function getPakketCount(options?: {
  zoek?: string;
  leverancierId?: string;
  referentiecomponentId?: string;
}) {
  const { zoek, leverancierId, referentiecomponentId } = options || {};

  const where = {
    ...(zoek && {
      OR: [
        { naam: { contains: zoek, mode: "insensitive" as const } },
        {
          leverancier: {
            naam: { contains: zoek, mode: "insensitive" as const },
          },
        },
      ],
    }),
    ...(leverancierId && { leverancierId }),
    ...(referentiecomponentId && {
      versies: {
        some: {
          referentiecomponenten: {
            some: { referentiecomponentId },
          },
        },
      },
    }),
  };

  return prisma.pakket.count({ where });
}

// ─── Detail ─────────────────────────────────────────────────────────────────────

export async function getPakketBySlug(slug: string) {
  return prisma.pakket.findUnique({
    where: { slug },
    include: {
      leverancier: {
        include: { addenda: { include: { addendum: true } } },
      },
      contactpersonen: {
        orderBy: { createdAt: "asc" as const },
      },
      versies: {
        orderBy: { startDistributie: "desc" },
        include: {
          referentiecomponenten: {
            include: { referentiecomponent: true },
          },
          standaarden: {
            include: { standaardversie: { include: { standaard: true } } },
          },
          applicatiefuncties: {
            include: { applicatiefunctie: true },
          },
          technologieen: true,
        },
      },
    },
  });
}

// ─── Filter sidebar helpers ─────────────────────────────────────────────────────

export async function getAlleLeveranciers() {
  return prisma.leverancier.findMany({
    select: { id: true, naam: true },
    orderBy: { naam: "asc" },
  });
}

export async function getAlleReferentiecomponenten() {
  return prisma.referentiecomponent.findMany({
    select: { id: true, naam: true },
    orderBy: { naam: "asc" },
  });
}
