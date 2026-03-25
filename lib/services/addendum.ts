import { prisma } from "@/lib/prisma";

// ─── Lijst & zoek ──────────────────────────────────────────────────────────────

export async function getAddenda(options?: {
  zoek?: string;
  type?: string;
  skip?: number;
  take?: number;
}) {
  const { zoek, type, skip, take } = options || {};

  const where: Record<string, unknown> = {};

  if (zoek) {
    where.leverancier = { naam: { contains: zoek, mode: "insensitive" } };
  }

  if (type) {
    where.addendum = { naam: type };
  }

  return prisma.leverancierAddendum.findMany({
    where,
    include: {
      leverancier: { select: { id: true, naam: true, slug: true } },
      addendum: { select: { id: true, naam: true } },
    },
    orderBy: { leverancier: { naam: "asc" } },
    ...(skip !== undefined && { skip }),
    ...(take !== undefined && { take }),
  });
}

export async function getAddendaCount(options?: {
  zoek?: string;
  type?: string;
}) {
  const { zoek, type } = options || {};

  const where: Record<string, unknown> = {};

  if (zoek) {
    where.leverancier = { naam: { contains: zoek, mode: "insensitive" } };
  }

  if (type) {
    where.addendum = { naam: type };
  }

  return prisma.leverancierAddendum.count({ where });
}

// ─── Alle addendum types (voor filter dropdown) ─────────────────────────────────

export async function getAddendumTypes() {
  return prisma.addendum.findMany({
    orderBy: { naam: "asc" },
    select: { id: true, naam: true },
  });
}

// ─── Count per type ─────────────────────────────────────────────────────────────

export async function getAddendaCountPerType() {
  const types = await prisma.addendum.findMany({
    include: {
      _count: { select: { leveranciers: true } },
    },
    orderBy: { naam: "asc" },
  });

  return types.map((t) => ({
    naam: t.naam,
    aantal: t._count.leveranciers,
  }));
}

// ─── Totaal aantal ──────────────────────────────────────────────────────────────

export async function getAddendaTotaal() {
  return prisma.leverancierAddendum.count();
}

// ─── Leveranciers met addenda count (voor sidebar filter) ────────────────────

export async function getLeveranciersMetAddendaCount() {
  const result = await prisma.leverancier.findMany({
    where: { addenda: { some: {} } },
    select: {
      id: true,
      naam: true,
      _count: { select: { addenda: true } },
    },
    orderBy: { naam: "asc" },
  });

  return result.map((l) => ({
    id: l.id,
    naam: l.naam,
    aantal: l._count.addenda,
  }));
}
