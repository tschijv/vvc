import { prisma } from "@/lib/prisma";

// ─── Lijst & zoek ──────────────────────────────────────────────────────────────

export async function getGemeenten(options?: {
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

  return prisma.gemeente.findMany({
    where,
    include: {
      _count: { select: { pakketten: true } },
    },
    orderBy: { naam: "asc" },
    ...(skip !== undefined && { skip }),
    ...(take !== undefined && { take }),
  });
}

export async function getGemeenteCount(options?: {
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

  return prisma.gemeente.count({ where });
}

// ─── Detail ─────────────────────────────────────────────────────────────────────

export async function getGemeenteById(id: string) {
  return prisma.gemeente.findUnique({
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

export async function getGemeenteForDashboard(id: string) {
  return prisma.gemeente.findUnique({
    where: { id },
    include: {
      samenwerkingen: { include: { samenwerking: true } },
      _count: { select: { pakketten: true, koppelingen: true } },
    },
  });
}

export async function getGemeentenForAdmin() {
  return prisma.gemeente.findMany({
    select: { id: true, naam: true },
    orderBy: { naam: "asc" },
  });
}

// ─── Pakketten van gemeente ─────────────────────────────────────────────────────

export async function getGemeentePakketten(gemeenteId: string) {
  return prisma.gemeentePakket.findMany({
    where: { gemeenteId },
    include: {
      pakketversie: {
        include: {
          pakket: { include: { leverancier: true } },
          referentiecomponenten: {
            include: { referentiecomponent: true },
          },
          standaarden: {
            include: { standaardversie: { include: { standaard: true } } },
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

export async function getGemeenteDashboardStats(
  gemeenteId: string
): Promise<DashboardStats> {
  const gps = await prisma.gemeentePakket.findMany({
    where: { gemeenteId },
    include: {
      pakketversie: {
        include: {
          standaarden: true,
          referentiecomponenten: true,
        },
      },
    },
  });

  const compliantCount = gps.filter((gp) =>
    gp.pakketversie.standaarden.some((s) => s.compliancy === true)
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
    gp.pakketversie.referentiecomponenten.forEach((r) =>
      refcompIds.add(r.referentiecomponentId)
    )
  );
  const pakkettenMeerMogelijkheden = Math.min(refcompIds.size, 30);

  const refcompCount: Record<string, number> = {};
  gps.forEach((gp) =>
    gp.pakketversie.referentiecomponenten.forEach((r) => {
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
  gemeenteId: string
): Promise<{ naam: string; count: number }[]> {
  const gps = await prisma.gemeentePakket.findMany({
    where: { gemeenteId },
    include: {
      pakketversie: {
        include: {
          standaarden: {
            include: { standaardversie: { include: { standaard: true } } },
          },
        },
      },
    },
  });

  const standaardCounts: Record<string, number> = {};
  gps.forEach((gp) => {
    gp.pakketversie.standaarden.forEach((s) => {
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

export async function getGemeenteKoppelingen(
  gemeenteId: string
): Promise<KoppelingRow[]> {
  const koppelingen = await prisma.koppeling.findMany({
    where: { gemeenteId },
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

export async function getGemeenteHistorie(gemeenteId: string, take = 20) {
  return prisma.auditLog.findMany({
    where: {
      entiteitId: gemeenteId,
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
      aantalGemeenten: true,
    },
    where: { aantalGemeenten: { gt: 0 } },
    orderBy: { aantalGemeenten: "desc" },
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
    prisma.gemeente.findUniqueOrThrow({ where: { id: bronId }, select: { id: true, naam: true } }),
    prisma.gemeente.findUniqueOrThrow({ where: { id: doelId }, select: { id: true, naam: true } }),
  ]);

  const users = await prisma.user.count({ where: { gemeenteId: bronId } });

  const [bronPakketten, doelPakketten] = await Promise.all([
    prisma.gemeentePakket.findMany({ where: { gemeenteId: bronId }, select: { pakketversieId: true } }),
    prisma.gemeentePakket.findMany({ where: { gemeenteId: doelId }, select: { pakketversieId: true } }),
  ]);
  const doelPakketIds = new Set(doelPakketten.map((p) => p.pakketversieId));
  const overlapPakketten = bronPakketten.filter((p) => doelPakketIds.has(p.pakketversieId)).length;

  const koppelingen = await prisma.koppeling.count({ where: { gemeenteId: bronId } });

  const [bronSamenwerkingen, doelSamenwerkingen] = await Promise.all([
    prisma.samenwerkingGemeente.findMany({ where: { gemeenteId: bronId }, select: { samenwerkingId: true } }),
    prisma.samenwerkingGemeente.findMany({ where: { gemeenteId: doelId }, select: { samenwerkingId: true } }),
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

export async function mergeGemeenten(bronId: string, doelId: string) {
  return prisma.$transaction(async (tx) => {
    // 1. Users verplaatsen
    await tx.user.updateMany({
      where: { gemeenteId: bronId },
      data: { gemeenteId: doelId },
    });

    // 2. GemeentePakket: overlap verwijderen, unieke verplaatsen
    const doelPakketten = await tx.gemeentePakket.findMany({
      where: { gemeenteId: doelId },
      select: { pakketversieId: true },
    });
    const doelPakketIds = new Set(doelPakketten.map((p) => p.pakketversieId));

    const bronPakketten = await tx.gemeentePakket.findMany({
      where: { gemeenteId: bronId },
      select: { pakketversieId: true },
    });

    const overlapIds = bronPakketten
      .filter((p) => doelPakketIds.has(p.pakketversieId))
      .map((p) => p.pakketversieId);
    const uniekIds = bronPakketten
      .filter((p) => !doelPakketIds.has(p.pakketversieId))
      .map((p) => p.pakketversieId);

    if (overlapIds.length > 0) {
      await tx.gemeentePakket.deleteMany({
        where: { gemeenteId: bronId, pakketversieId: { in: overlapIds } },
      });
    }
    for (const pvId of uniekIds) {
      await tx.gemeentePakket.update({
        where: { gemeenteId_pakketversieId: { gemeenteId: bronId, pakketversieId: pvId } },
        data: { gemeenteId: doelId },
      });
    }

    // 3. SamenwerkingGemeente: overlap verwijderen, unieke verplaatsen
    const doelSamenwerkingen = await tx.samenwerkingGemeente.findMany({
      where: { gemeenteId: doelId },
      select: { samenwerkingId: true },
    });
    const doelSwIds = new Set(doelSamenwerkingen.map((s) => s.samenwerkingId));

    const bronSamenwerkingen = await tx.samenwerkingGemeente.findMany({
      where: { gemeenteId: bronId },
      select: { samenwerkingId: true },
    });

    const swOverlap = bronSamenwerkingen
      .filter((s) => doelSwIds.has(s.samenwerkingId))
      .map((s) => s.samenwerkingId);
    const swUniek = bronSamenwerkingen
      .filter((s) => !doelSwIds.has(s.samenwerkingId))
      .map((s) => s.samenwerkingId);

    if (swOverlap.length > 0) {
      await tx.samenwerkingGemeente.deleteMany({
        where: { gemeenteId: bronId, samenwerkingId: { in: swOverlap } },
      });
    }
    for (const swId of swUniek) {
      await tx.samenwerkingGemeente.update({
        where: { samenwerkingId_gemeenteId: { samenwerkingId: swId, gemeenteId: bronId } },
        data: { gemeenteId: doelId },
      });
    }

    // 4. Koppelingen verplaatsen
    await tx.koppeling.updateMany({
      where: { gemeenteId: bronId },
      data: { gemeenteId: doelId },
    });

    // 5. Brongemeente verwijderen
    await tx.gemeente.delete({ where: { id: bronId } });

    // 6. Herbereken aantalGemeenten
    const pakketTellingen = await tx.gemeentePakket.groupBy({
      by: ["pakketversieId"],
      _count: true,
    });

    const versieMap = new Map(pakketTellingen.map((p) => [p.pakketversieId, p._count]));

    const alleVersies = await tx.pakketversie.findMany({
      select: { id: true, pakketId: true, aantalGemeenten: true },
    });

    for (const v of alleVersies) {
      const nieuwAantal = versieMap.get(v.id) || 0;
      if (v.aantalGemeenten !== nieuwAantal) {
        await tx.pakketversie.update({
          where: { id: v.id },
          data: { aantalGemeenten: nieuwAantal },
        });
      }
    }

    const pakketAantallen = await tx.pakketversie.groupBy({
      by: ["pakketId"],
      _sum: { aantalGemeenten: true },
    });

    for (const p of pakketAantallen) {
      await tx.pakket.update({
        where: { id: p.pakketId },
        data: { aantalGemeenten: p._sum.aantalGemeenten || 0 },
      });
    }

    return { success: true };
  });
}

// ─── Vergelijkbare gemeenten (Jaccard-similariteit) ──────────────────────────

export type SimilarGemeente = {
  id: string;
  naam: string;
  similarity: number;
  sharedCount: number;
  totalA: number;
  totalB: number;
};

export type SimilarGemeentenResult = {
  gemeenten: SimilarGemeente[];
  totalCount: number;
};

export async function getSimilarGemeenten(
  gemeenteId: string,
  limit = 20,
): Promise<SimilarGemeentenResult> {
  // Get pakketversieIds for this gemeente
  const eigenPakketten = await prisma.gemeentePakket.findMany({
    where: { gemeenteId },
    select: { pakketversieId: true },
  });
  const eigenSet = new Set(eigenPakketten.map((p) => p.pakketversieId));
  if (eigenSet.size === 0) return { gemeenten: [], totalCount: 0 };

  // Get all other gemeenten with their pakketten
  const alleGemeenten = await prisma.gemeente.findMany({
    where: { id: { not: gemeenteId } },
    select: {
      id: true,
      naam: true,
      pakketten: { select: { pakketversieId: true } },
    },
  });

  // Calculate Jaccard similarity
  const similarities: SimilarGemeente[] = [];
  for (const g of alleGemeenten) {
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
    gemeenten: similarities.slice(0, limit),
    totalCount: similarities.length,
  };
}
