import { prisma } from "@/data/prisma";

// ─── Lijst & zoek ──────────────────────────────────────────────────────────────

export async function getCloudproviders(options?: {
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

  return prisma.cloudprovider.findMany({
    where,
    select: {
      id: true,
      naam: true,
      slug: true,
      type: true,
      certificeringen: true,
      datacenterLocatie: true,
      contactpersoon: true,
      email: true,
      website: true,
      _count: { select: { pakketten: true } },
    },
    orderBy: { naam: "asc" },
    ...(skip !== undefined && { skip }),
    ...(take !== undefined && { take }),
  });
}

export async function getCloudproviderCount(options?: {
  zoek?: string;
  type?: string;
}) {
  const { zoek, type } = options || {};

  const where = {
    ...(zoek ? { naam: { contains: zoek, mode: "insensitive" as const } } : {}),
    ...(type ? { type } : {}),
  };

  return prisma.cloudprovider.count({ where });
}

// ─── Detail ─────────────────────────────────────────────────────────────────────

export async function getCloudproviderBySlug(slug: string) {
  return prisma.cloudprovider.findUnique({
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
    },
  });
}

// ─── CRUD ───────────────────────────────────────────────────────────────────────

export async function createCloudprovider(data: {
  naam: string;
  slug: string;
  beschrijving?: string;
  type?: string;
  certificeringen?: string;
  datacenterLocatie?: string;
  contactpersoon?: string;
  email?: string;
  telefoon?: string;
  website?: string;
}) {
  return prisma.cloudprovider.create({ data });
}

export async function updateCloudprovider(
  id: string,
  data: {
    naam?: string;
    slug?: string;
    beschrijving?: string;
    type?: string;
    certificeringen?: string;
    datacenterLocatie?: string;
    contactpersoon?: string;
    email?: string;
    telefoon?: string;
    website?: string;
  },
) {
  return prisma.cloudprovider.update({ where: { id }, data });
}

export async function deleteCloudprovider(id: string) {
  return prisma.cloudprovider.delete({ where: { id } });
}
