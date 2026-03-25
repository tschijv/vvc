import { prisma } from "@/data/prisma";

// ─── Lijst & zoek ──────────────────────────────────────────────────────────────

export async function getDienstverleners(options?: {
  zoek?: string;
  type?: string;
  skip?: number;
  take?: number;
}) {
  const { zoek, type, skip, take } = options || {};

  const where = {
    ...(zoek ? { naam: { contains: zoek, mode: "insensitive" as const } } : {}),
    ...(type ? { type } : {}),
  };

  return prisma.dienstverlener.findMany({
    where,
    select: {
      id: true,
      naam: true,
      slug: true,
      type: true,
      specialisaties: true,
      regio: true,
      contactpersoon: true,
      email: true,
      website: true,
      _count: { select: { pakketten: true, organisaties: true } },
    },
    orderBy: { naam: "asc" },
    ...(skip !== undefined && { skip }),
    ...(take !== undefined && { take }),
  });
}

export async function getDienstverlenerCount(options?: {
  zoek?: string;
  type?: string;
}) {
  const { zoek, type } = options || {};

  const where = {
    ...(zoek ? { naam: { contains: zoek, mode: "insensitive" as const } } : {}),
    ...(type ? { type } : {}),
  };

  return prisma.dienstverlener.count({ where });
}

// ─── Detail ─────────────────────────────────────────────────────────────────────

export async function getDienstverlenerBySlug(slug: string) {
  return prisma.dienstverlener.findUnique({
    where: { slug },
    include: {
      pakketten: {
        include: {
          pakket: {
            select: {
              id: true,
              naam: true,
              slug: true,
              leverancier: { select: { naam: true, slug: true } },
            },
          },
        },
      },
      organisaties: {
        include: {
          organisatie: {
            select: { id: true, naam: true },
          },
        },
      },
    },
  });
}

// ─── CRUD ───────────────────────────────────────────────────────────────────────

export async function createDienstverlener(data: {
  naam: string;
  slug: string;
  beschrijving?: string;
  type?: string;
  specialisaties?: string;
  contactpersoon?: string;
  email?: string;
  telefoon?: string;
  website?: string;
  regio?: string;
}) {
  return prisma.dienstverlener.create({ data });
}

export async function updateDienstverlener(
  id: string,
  data: {
    naam?: string;
    slug?: string;
    beschrijving?: string;
    type?: string;
    specialisaties?: string;
    contactpersoon?: string;
    email?: string;
    telefoon?: string;
    website?: string;
    regio?: string;
  },
) {
  return prisma.dienstverlener.update({ where: { id }, data });
}

export async function deleteDienstverlener(id: string) {
  return prisma.dienstverlener.delete({ where: { id } });
}
