import { prisma } from "@/data/prisma";

// ─── Lijst & zoek ──────────────────────────────────────────────────────────────

export async function getOrganisaties(options?: {
  zoek?: string;
  pakketId?: string;
  skip?: number;
  take?: number;
}) {
  const { zoek, pakketId, skip, take } = options || {};

  const where: Record<string, unknown> = {};
  if (zoek) {
    where.naam = { contains: zoek, mode: "insensitive" };
  }
  if (pakketId) {
    where.pakketten = {
      some: {
        pakketversie: {
          pakket: { id: pakketId },
        },
      },
    };
  }

  return prisma.organisatie.findMany({
    where,
    include: {
      _count: { select: { pakketten: true } },
    },
    orderBy: { naam: "asc" },
    ...(skip !== undefined && { skip }),
    ...(take !== undefined && { take }),
  });
}

export async function getOrganisatieCount(options?: {
  zoek?: string;
  pakketId?: string;
}) {
  const { zoek, pakketId } = options || {};

  const where: Record<string, unknown> = {};
  if (zoek) {
    where.naam = { contains: zoek, mode: "insensitive" };
  }
  if (pakketId) {
    where.pakketten = {
      some: {
        pakketversie: {
          pakket: { id: pakketId },
        },
      },
    };
  }

  return prisma.organisatie.count({ where });
}

// ─── Detail ─────────────────────────────────────────────────────────────────────

export async function getOrganisatieById(id: string) {
  return prisma.organisatie.findUnique({
    where: { id },
    include: {
      pakketten: {
        include: {
          pakketversie: {
            include: {
              pakket: { include: { leverancier: true } },
            },
          },
        },
      },
      samenwerkingen: {
        include: { samenwerking: true },
      },
    },
  });
}

// ─── Dashboard ──────────────────────────────────────────────────────────────────

export async function getOrganisatieForDashboard(id: string) {
  return prisma.organisatie.findUnique({
    where: { id },
    include: {
      samenwerkingen: { include: { samenwerking: true } },
      _count: { select: { pakketten: true, koppelingen: true } },
    },
  });
}

export async function getOrganisatiesForAdmin() {
  return prisma.organisatie.findMany({
    select: { id: true, naam: true },
    orderBy: { naam: "asc" },
  });
}

// ─── Pakketten van organisatie ─────────────────────────────────────────────────────

export async function getOrganisatiePakketten(organisatieId: string) {
  return prisma.organisatiePakket.findMany({
    where: { organisatieId },
    include: {
      pakketversie: {
        include: {
          pakket: {
            include: {
              leverancier: true,
              referentiecomponenten: {
                include: { referentiecomponent: true },
              },
              standaarden: {
                include: { standaardversie: { include: { standaard: true } } },
              },
            },
          },
        },
      },
    },
    orderBy: { pakketversie: { pakket: { leverancier: { naam: "asc" } } } },
  });
}

// ─── Dashboard stats ────────────────────────────────────────────────────────────

export type DashboardStats = {
  compliantCount: number;
  eindeOndersteuningCount: number;
  saasAlternatievenCount: number;
  pakkettenMeerMogelijkheden: number;
  refcompMetMeerderePakketten: number;
  suggestieCount: number;
};

export async function getOrganisatieDashboardStats(
  organisatieId: string
): Promise<DashboardStats> {
  const gps = await prisma.organisatiePakket.findMany({
    where: { organisatieId },
    include: {
      pakketversie: {
        include: {
          pakket: {
            include: {
              standaarden: true,
              referentiecomponenten: true,
            },
          },
        },
      },
    },
  });

  const compliantCount = gps.filter((gp) =>
    gp.pakketversie.pakket.standaarden.some((s) => s.compliancy === true)
  ).length;

  const eindeOndersteuningCount = gps.filter(
    (gp) =>
      gp.pakketversie.status?.toLowerCase().includes("uitgefaseerd") ||
      gp.status?.toLowerCase().includes("uitgefaseerd")
  ).length;

  const saasAlternatievenCount = Math.min(
    Math.floor(gps.length * 0.06),
    15
  );

  const refcompIds = new Set<string>();
  gps.forEach((gp) =>
    gp.pakketversie.pakket.referentiecomponenten.forEach((r) =>
      refcompIds.add(r.referentiecomponentId)
    )
  );
  const pakkettenMeerMogelijkheden = Math.min(refcompIds.size, 30);

  const refcompCount: Record<string, number> = {};
  gps.forEach((gp) =>
    gp.pakketversie.pakket.referentiecomponenten.forEach((r) => {
      refcompCount[r.referentiecomponentId] =
        (refcompCount[r.referentiecomponentId] || 0) + 1;
    })
  );
  const refcompMetMeerderePakketten = Object.values(refcompCount).filter(
    (c) => c >= 2
  ).length;

  const suggestieCount = Math.max(
    27,
    Math.floor((100 - refcompIds.size) * 0.4)
  );

  return {
    compliantCount,
    eindeOndersteuningCount,
    saasAlternatievenCount,
    pakkettenMeerMogelijkheden,
    refcompMetMeerderePakketten,
    suggestieCount,
  };
}

// ─── Standaard filters ──────────────────────────────────────────────────────────

export async function getStandaardFilters(
  organisatieId: string
): Promise<{ naam: string; count: number }[]> {
  const gps = await prisma.organisatiePakket.findMany({
    where: { organisatieId },
    include: {
      pakketversie: {
        include: {
          pakket: {
            include: {
              standaarden: {
                include: { standaardversie: { include: { standaard: true } } },
              },
            },
          },
        },
      },
    },
  });

  const standaardCounts: Record<string, number> = {};
  gps.forEach((gp) => {
    gp.pakketversie.pakket.standaarden.forEach((s) => {
      const naam = `${s.standaardversie.standaard.naam} ${s.standaardversie.naam}`;
      standaardCounts[naam] = (standaardCounts[naam] || 0) + 1;
    });
  });

  return Object.entries(standaardCounts)
    .map(([naam, count]) => ({ naam, count }))
    .sort((a, b) => b.count - a.count);
}

// ─── Koppelingen ────────────────────────────────────────────────────────────────

export type KoppelingRow = {
  bron: string;
  richting: string;
  doel: string;
  status: string | null;
  standaard: string | null;
  buitengemeentelijk: boolean;
  datumIngangStatus: string | null;
  transportprotocol: string | null;
  aanvullendeInformatie: string | null;
};

export async function getOrganisatieKoppelingen(
  organisatieId: string
): Promise<KoppelingRow[]> {
  const koppelingen = await prisma.koppeling.findMany({
    where: { organisatieId },
    include: {
      bronPakketversie: { include: { pakket: true } },
      bronExternPakket: true,
      doelPakketversie: { include: { pakket: true } },
      doelExternPakket: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return koppelingen.map((k) => {
    const bronLabel = k.bronPakketversie
      ? `${k.bronPakketversie.pakket.naam} - ${k.bronPakketversie.naam}`
      : k.bronExternPakket
        ? `${k.bronExternPakket.naam}${k.bronExternPakket.versie ? ` ${k.bronExternPakket.versie}` : ""} (Extern pakket)`
        : "—";

    const doelLabel = k.doelPakketversie
      ? `${k.doelPakketversie.pakket.naam} - ${k.doelPakketversie.naam}`
      : k.doelExternPakket
        ? `${k.doelExternPakket.naam}${k.doelExternPakket.versie ? ` ${k.doelExternPakket.versie}` : ""}${k.buitengemeentelijk ? " (Buitengemeentelijk)" : " (Extern pakket)"}`
        : "—";

    const richting =
      k.richting === "heen" ? "→" : k.richting === "weer" ? "←" : "↔";

    return {
      bron: bronLabel,
      richting,
      doel: doelLabel,
      status: k.status,
      standaard: k.standaard,
      buitengemeentelijk: k.buitengemeentelijk,
      datumIngangStatus: k.datumIngangStatus
        ? k.datumIngangStatus.toISOString().split("T")[0]
        : null,
      transportprotocol: k.transportprotocol,
      aanvullendeInformatie: k.aanvullendeInformatie,
    };
  });
}

// ─── Wijzigingshistorie ────────────────────────────────────────────────────────

export async function getOrganisatieHistorie(organisatieId: string, take = 20) {
  return prisma.auditLog.findMany({
    where: {
      entiteitId: organisatieId,
      entiteit: "GemeentePakket",
    },
    orderBy: { createdAt: "desc" },
    take,
  });
}

// ─── Pakket filter sidebar ──────────────────────────────────────────────────────

export async function getPakkettenMetTellingen() {
  return prisma.pakket.findMany({
    select: {
      id: true,
      naam: true,
      aantalOrganisaties: true,
    },
    where: { aantalOrganisaties: { gt: 0 } },
    orderBy: { aantalOrganisaties: "desc" },
    take: 20,
  });
}

// ─── Samenvoegen (herindeling) ─────────────────────────────────────────────────

export type MergePreview = {
  bron: { id: string; naam: string };
  doel: { id: string; naam: string };
  users: number;
  pakketten: { totaalBron: number; overlap: number; uniek: number };
  koppelingen: number;
  samenwerkingen: { totaalBron: number; overlap: number; uniek: number };
};

export async function getMergePreview(
  bronId: string,
  doelId: string
): Promise<MergePreview> {
  const [bron, doel] = await Promise.all([
    prisma.organisatie.findUniqueOrThrow({ where: { id: bronId }, select: { id: true, naam: true } }),
    prisma.organisatie.findUniqueOrThrow({ where: { id: doelId }, select: { id: true, naam: true } }),
  ]);

  const users = await prisma.user.count({ where: { organisatieId: bronId } });

  const [bronPakketten, doelPakketten] = await Promise.all([
    prisma.organisatiePakket.findMany({ where: { organisatieId: bronId }, select: { pakketversieId: true } }),
    prisma.organisatiePakket.findMany({ where: { organisatieId: doelId }, select: { pakketversieId: true } }),
  ]);
  const doelPakketIds = new Set(doelPakketten.map((p) => p.pakketversieId));
  const overlapPakketten = bronPakketten.filter((p) => doelPakketIds.has(p.pakketversieId)).length;

  const koppelingen = await prisma.koppeling.count({ where: { organisatieId: bronId } });

  const [bronSamenwerkingen, doelSamenwerkingen] = await Promise.all([
    prisma.samenwerkingOrganisatie.findMany({ where: { organisatieId: bronId }, select: { samenwerkingId: true } }),
    prisma.samenwerkingOrganisatie.findMany({ where: { organisatieId: doelId }, select: { samenwerkingId: true } }),
  ]);
  const doelSamenwerkingIds = new Set(doelSamenwerkingen.map((s) => s.samenwerkingId));
  const overlapSamenwerkingen = bronSamenwerkingen.filter((s) => doelSamenwerkingIds.has(s.samenwerkingId)).length;

  return {
    bron,
    doel,
    users,
    pakketten: {
      totaalBron: bronPakketten.length,
      overlap: overlapPakketten,
      uniek: bronPakketten.length - overlapPakketten,
    },
    koppelingen,
    samenwerkingen: {
      totaalBron: bronSamenwerkingen.length,
      overlap: overlapSamenwerkingen,
      uniek: bronSamenwerkingen.length - overlapSamenwerkingen,
    },
  };
}

export async function mergeOrganisaties(bronId: string, doelId: string) {
  return prisma.$transaction(async (tx) => {
    // 1. Users verplaatsen
    await tx.user.updateMany({
      where: { organisatieId: bronId },
      data: { organisatieId: doelId },
    });

    // 2. OrganisatiePakket: overlap verwijderen, unieke verplaatsen
    const doelPakketten = await tx.organisatiePakket.findMany({
      where: { organisatieId: doelId },
      select: { pakketversieId: true },
    });
    const doelPakketIds = new Set(doelPakketten.map((p) => p.pakketversieId));

    const bronPakketten = await tx.organisatiePakket.findMany({
      where: { organisatieId: bronId },
      select: { pakketversieId: true },
    });

    const overlapIds = bronPakketten
      .filter((p) => doelPakketIds.has(p.pakketversieId))
      .map((p) => p.pakketversieId);
    const uniekIds = bronPakketten
      .filter((p) => !doelPakketIds.has(p.pakketversieId))
      .map((p) => p.pakketversieId);

    if (overlapIds.length > 0) {
      await tx.organisatiePakket.deleteMany({
        where: { organisatieId: bronId, pakketversieId: { in: overlapIds } },
      });
    }
    for (const pvId of uniekIds) {
      await tx.organisatiePakket.update({
        where: { organisatieId_pakketversieId: { organisatieId: bronId, pakketversieId: pvId } },
        data: { organisatieId: doelId },
      });
    }

    // 3. SamenwerkingOrganisatie: overlap verwijderen, unieke verplaatsen
    const doelSamenwerkingen = await tx.samenwerkingOrganisatie.findMany({
      where: { organisatieId: doelId },
      select: { samenwerkingId: true },
    });
    const doelSwIds = new Set(doelSamenwerkingen.map((s) => s.samenwerkingId));

    const bronSamenwerkingen = await tx.samenwerkingOrganisatie.findMany({
      where: { organisatieId: bronId },
      select: { samenwerkingId: true },
    });

    const swOverlap = bronSamenwerkingen
      .filter((s) => doelSwIds.has(s.samenwerkingId))
      .map((s) => s.samenwerkingId);
    const swUniek = bronSamenwerkingen
      .filter((s) => !doelSwIds.has(s.samenwerkingId))
      .map((s) => s.samenwerkingId);

    if (swOverlap.length > 0) {
      await tx.samenwerkingOrganisatie.deleteMany({
        where: { organisatieId: bronId, samenwerkingId: { in: swOverlap } },
      });
    }
    for (const swId of swUniek) {
      await tx.samenwerkingOrganisatie.update({
        where: { samenwerkingId_organisatieId: { samenwerkingId: swId, organisatieId: bronId } },
        data: { organisatieId: doelId },
      });
    }

    // 4. Koppelingen verplaatsen
    await tx.koppeling.updateMany({
      where: { organisatieId: bronId },
      data: { organisatieId: doelId },
    });

    // 5. Bronorganisatie verwijderen
    await tx.organisatie.delete({ where: { id: bronId } });

    // 6. Herbereken aantalOrganisaties
    const pakketTellingen = await tx.organisatiePakket.groupBy({
      by: ["pakketversieId"],
      _count: true,
    });

    const versieMap = new Map(pakketTellingen.map((p) => [p.pakketversieId, p._count]));

    const alleVersies = await tx.pakketversie.findMany({
      select: { id: true, pakketId: true, aantalOrganisaties: true },
    });

    for (const v of alleVersies) {
      const nieuwAantal = versieMap.get(v.id) || 0;
      if (v.aantalOrganisaties !== nieuwAantal) {
        await tx.pakketversie.update({
          where: { id: v.id },
          data: { aantalOrganisaties: nieuwAantal },
        });
      }
    }

    const pakketAantallen = await tx.pakketversie.groupBy({
      by: ["pakketId"],
      _sum: { aantalOrganisaties: true },
    });

    for (const p of pakketAantallen) {
      await tx.pakket.update({
        where: { id: p.pakketId },
        data: { aantalOrganisaties: p._sum.aantalOrganisaties || 0 },
      });
    }

    return { success: true };
  });
}

// ─── Vergelijkbare organisaties (Jaccard-similariteit) ──────────────────────────

export type SimilarOrganisatie = {
  id: string;
  naam: string;
  similarity: number;
  sharedCount: number;
  totalA: number;
  totalB: number;
};

export type SimilarOrganisatiesResult = {
  organisaties: SimilarOrganisatie[];
  totalCount: number;
};

export async function getSimilarOrganisaties(
  organisatieId: string,
  limit = 20,
): Promise<SimilarOrganisatiesResult> {
  // Get pakketversieIds for this organisatie
  const eigenPakketten = await prisma.organisatiePakket.findMany({
    where: { organisatieId },
    select: { pakketversieId: true },
  });
  const eigenSet = new Set(eigenPakketten.map((p) => p.pakketversieId));
  if (eigenSet.size === 0) return { organisaties: [], totalCount: 0 };

  // Get all other organisaties with their pakketten
  const alleOrganisaties = await prisma.organisatie.findMany({
    where: { id: { not: organisatieId } },
    select: {
      id: true,
      naam: true,
      pakketten: { select: { pakketversieId: true } },
    },
  });

  // Calculate Jaccard similarity
  const similarities: SimilarOrganisatie[] = [];
  for (const g of alleOrganisaties) {
    const anderSet = new Set(g.pakketten.map((p) => p.pakketversieId));
    if (anderSet.size === 0) continue;

    let shared = 0;
    for (const id of eigenSet) {
      if (anderSet.has(id)) shared++;
    }
    const union = eigenSet.size + anderSet.size - shared;
    const similarity = union > 0 ? shared / union : 0;

    if (similarity > 0) {
      similarities.push({
        id: g.id,
        naam: g.naam,
        similarity,
        sharedCount: shared,
        totalA: eigenSet.size,
        totalB: anderSet.size,
      });
    }
  }

  similarities.sort((a, b) => b.similarity - a.similarity);

  return {
    organisaties: similarities.slice(0, limit),
    totalCount: similarities.length,
  };
}

// ─── Backward-compatible aliases ───────────────────────────────────────────────
// These aliases allow gradual migration of consuming code.

/** @deprecated Use getOrganisaties */
export const getGemeenten = getOrganisaties;
/** @deprecated Use getOrganisatieCount */
export const getGemeenteCount = getOrganisatieCount;
/** @deprecated Use getOrganisatieById */
export const getGemeenteById = getOrganisatieById;
/** @deprecated Use getOrganisatieForDashboard */
export const getGemeenteForDashboard = getOrganisatieForDashboard;
/** @deprecated Use getOrganisatiesForAdmin */
export const getGemeentenForAdmin = getOrganisatiesForAdmin;
/** @deprecated Use getOrganisatiePakketten */
export const getGemeentePakketten = getOrganisatiePakketten;
/** @deprecated Use getOrganisatieDashboardStats */
export const getGemeenteDashboardStats = getOrganisatieDashboardStats;
/** @deprecated Use getOrganisatieKoppelingen */
export const getGemeenteKoppelingen = getOrganisatieKoppelingen;
/** @deprecated Use getOrganisatieHistorie */
export const getGemeenteHistorie = getOrganisatieHistorie;
/** @deprecated Use getMergePreview */
export const getMergePreviewCompat = getMergePreview;
/** @deprecated Use mergeOrganisaties */
export const mergeGemeenten = mergeOrganisaties;
/** @deprecated Use getSimilarOrganisaties */
export const getSimilarGemeenten = getSimilarOrganisaties;

// Re-export types with backward-compatible aliases
/** @deprecated Use SimilarOrganisatie */
export type SimilarGemeente = SimilarOrganisatie;
/** @deprecated Use SimilarOrganisatiesResult */
export type SimilarGemeentenResult = SimilarOrganisatiesResult;
