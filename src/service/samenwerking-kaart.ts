import { prisma } from "@/data/prisma";

/**
 * Data needed for the samenwerkingen map page.
 * Returns all samenwerkingen with their member organisatie identifiers.
 */

export interface SamenwerkingKaartOrganisatie {
  naam: string;
  cbsCode: string | null;
}

export interface SamenwerkingKaartItem {
  id: string;
  naam: string;
  type: string | null;
  organisaties: SamenwerkingKaartOrganisatie[];
}

/**
 * Fetch all samenwerkingen with their member organisaties (naam + cbsCode).
 * @returns Array of samenwerkingen ready for the map component
 */
export async function getSamenwerkingenForKaart(): Promise<
  SamenwerkingKaartItem[]
> {
  const samenwerkingen = await prisma.samenwerking.findMany({
    select: {
      id: true,
      naam: true,
      type: true,
      organisaties: {
        select: {
          organisatie: {
            select: {
              naam: true,
              cbsCode: true,
            },
          },
        },
        orderBy: { organisatie: { naam: "asc" } },
      },
    },
    orderBy: { naam: "asc" },
  });

  return samenwerkingen.map((s) => ({
    id: s.id,
    naam: s.naam,
    type: s.type,
    organisaties: s.organisaties.map((o) => ({
      naam: o.organisatie.naam,
      cbsCode: o.organisatie.cbsCode,
    })),
  }));
}
