import { prisma } from "@/data/prisma";

// ─── Color palette for samenwerkingsverbanden ────────────────────────────────

const COLORS = [
  "#1a6ca8", // blauw
  "#e35b10", // oranje
  "#16a34a", // groen
  "#dc2626", // rood
  "#7c3aed", // paars
  "#0891b2", // cyan
  "#ca8a04", // goud
  "#be185d", // roze
  "#4f46e5", // indigo
  "#059669", // emerald
  "#d97706", // amber
  "#6366f1", // violet
];

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SamenwerkingKaartLid {
  id: string;
  naam: string;
  cbsCode: string | null;
}

export interface SamenwerkingKaartStats {
  aantalLeden: number;
  totaalPakketten: number;
  totaalKoppelingen: number;
  gemiddeldeVoortgang: number; // 0-100
}

export interface SamenwerkingKaartData {
  id: string;
  naam: string;
  type: string | null;
  kleur: string;
  leden: SamenwerkingKaartLid[];
  stats: SamenwerkingKaartStats;
}

// ─── Keep the old interface for backward compatibility ────────────────────────

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

// ─── Old function (kept for compatibility) ───────────────────────────────────

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

// ─── New function: all samenwerkingen with aggregated stats ───────────────────

/**
 * Fetch all samenwerkingen with member details and aggregated statistics.
 * Each samenwerking gets a unique color from the palette.
 */
export async function getSamenwerkingenMetStats(): Promise<
  SamenwerkingKaartData[]
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
              id: true,
              naam: true,
              cbsCode: true,
              progress: true,
              _count: {
                select: {
                  pakketten: true,
                  koppelingen: true,
                },
              },
            },
          },
        },
        orderBy: { organisatie: { naam: "asc" } },
      },
    },
    orderBy: { naam: "asc" },
  });

  return samenwerkingen.map((s, index) => {
    const leden = s.organisaties.map((o) => ({
      id: o.organisatie.id,
      naam: o.organisatie.naam,
      cbsCode: o.organisatie.cbsCode,
    }));

    const totaalPakketten = s.organisaties.reduce(
      (sum, o) => sum + o.organisatie._count.pakketten,
      0
    );

    const totaalKoppelingen = s.organisaties.reduce(
      (sum, o) => sum + o.organisatie._count.koppelingen,
      0
    );

    const gemiddeldeVoortgang =
      s.organisaties.length > 0
        ? Math.round(
            s.organisaties.reduce(
              (sum, o) => sum + o.organisatie.progress,
              0
            ) / s.organisaties.length
          )
        : 0;

    return {
      id: s.id,
      naam: s.naam,
      type: s.type,
      kleur: COLORS[index % COLORS.length],
      leden,
      stats: {
        aantalLeden: leden.length,
        totaalPakketten,
        totaalKoppelingen,
        gemiddeldeVoortgang,
      },
    };
  });
}
