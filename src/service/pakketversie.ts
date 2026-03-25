import { prisma } from "@/data/prisma";

// ─── Shared filter builder ──────────────────────────────────────────────────

interface PakketversieFilters {
  zoek?: string;
  leverancierId?: string;
  status?: string;
  referentiecomponentId?: string;
}

function buildWhere(filters: PakketversieFilters) {
  const { zoek, leverancierId, status, referentiecomponentId } = filters;
  return {
    ...(zoek && {
      OR: [
        { naam: { contains: zoek, mode: "insensitive" as const } },
        {
          pakket: {
            naam: { contains: zoek, mode: "insensitive" as const },
          },
        },
        {
          pakket: {
            leverancier: {
              naam: { contains: zoek, mode: "insensitive" as const },
            },
          },
        },
      ],
    }),
    ...(leverancierId && { pakket: { leverancierId } }),
    ...(status && { status }),
    ...(referentiecomponentId && {
      referentiecomponenten: {
        some: { referentiecomponentId },
      },
    }),
  };
}

// ─── Lijst & zoek ──────────────────────────────────────────────────────────────

export async function getPakketversies(options?: PakketversieFilters & {
  skip?: number;
  take?: number;
}) {
  const { skip, take, ...filters } = options || {};
  const where = buildWhere(filters);

  return prisma.pakketversie.findMany({
    where,
    select: {
      id: true,
      naam: true,
      status: true,
      pakket: {
        select: {
          naam: true,
          slug: true,
          leverancier: { select: { id: true, naam: true, slug: true } },
        },
      },
      _count: { select: { referentiecomponenten: true } },
    },
    orderBy: { naam: "asc" },
    ...(skip !== undefined && { skip }),
    ...(take !== undefined && { take }),
  });
}

export async function getPakketversieCount(options?: PakketversieFilters) {
  const where = buildWhere(options || {});
  return prisma.pakketversie.count({ where });
}

// ─── Filter sidebar helpers ─────────────────────────────────────────────────────

export async function getAlleStatussen() {
  const result = await prisma.pakketversie.findMany({
    select: { status: true },
    distinct: ["status"],
    orderBy: { status: "asc" },
  });
  return result.map((r) => r.status);
}
