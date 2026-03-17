import { prisma } from "@/lib/prisma";

// ─── Detail ─────────────────────────────────────────────────────────────────────

export async function getSamenwerkingById(id: string) {
  return prisma.samenwerking.findUnique({
    where: { id },
    include: {
      gemeenten: {
        include: {
          gemeente: {
            include: {
              _count: { select: { pakketten: true, koppelingen: true } },
            },
          },
        },
        orderBy: { gemeente: { naam: "asc" } },
      },
    },
  });
}

// ─── Aggregated pakketten across all member gemeenten ───────────────────────────

export type SamenwerkingPakketRow = {
  leverancier: string;
  pakketNaam: string;
  pakketSlug: string;
  versie: string;
  status: string | null;
  datumIngangStatus: Date | null;
  gebruiktVoor: string[];
  hasCompliancy: boolean;
  gemeenteNaam: string;
};

export async function getSamenwerkingPakketten(
  samenwerkingId: string
): Promise<SamenwerkingPakketRow[]> {
  // Get all gemeente IDs in this samenwerking
  const links = await prisma.samenwerkingGemeente.findMany({
    where: { samenwerkingId },
    select: { gemeenteId: true, gemeente: { select: { naam: true } } },
  });

  const gemeenteMap = new Map(
    links.map((l) => [l.gemeenteId, l.gemeente.naam])
  );
  const gemeenteIds = links.map((l) => l.gemeenteId);

  if (gemeenteIds.length === 0) return [];

  const gps = await prisma.gemeentePakket.findMany({
    where: { gemeenteId: { in: gemeenteIds } },
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

  return gps.map((gp) => ({
    leverancier: gp.pakketversie.pakket.leverancier.naam,
    pakketNaam: gp.pakketversie.pakket.naam,
    pakketSlug: gp.pakketversie.pakket.slug,
    versie: gp.pakketversie.naam,
    status: gp.status,
    datumIngangStatus: gp.datumIngangStatus,
    gebruiktVoor: gp.pakketversie.referentiecomponenten.map(
      (r) => r.referentiecomponent.naam
    ),
    hasCompliancy: gp.pakketversie.standaarden.some(
      (s) => s.compliancy === true
    ),
    gemeenteNaam: gemeenteMap.get(gp.gemeenteId) || "Onbekend",
  }));
}

// ─── Aggregated koppelingen across all member gemeenten ─────────────────────────

export type SamenwerkingKoppelingRow = {
  bron: string;
  richting: string;
  doel: string;
  status: string | null;
  standaard: string | null;
  gemeenteNaam: string;
};

export async function getSamenwerkingKoppelingen(
  samenwerkingId: string
): Promise<SamenwerkingKoppelingRow[]> {
  const links = await prisma.samenwerkingGemeente.findMany({
    where: { samenwerkingId },
    select: { gemeenteId: true, gemeente: { select: { naam: true } } },
  });

  const gemeenteMap = new Map(
    links.map((l) => [l.gemeenteId, l.gemeente.naam])
  );
  const gemeenteIds = links.map((l) => l.gemeenteId);

  if (gemeenteIds.length === 0) return [];

  const koppelingen = await prisma.koppeling.findMany({
    where: { gemeenteId: { in: gemeenteIds } },
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
      gemeenteNaam: gemeenteMap.get(k.gemeenteId) || "Onbekend",
    };
  });
}

// ─── Dashboard stats (aggregated) ───────────────────────────────────────────────

export type SamenwerkingDashboardStats = {
  totaalPakketten: number;
  totaalKoppelingen: number;
  compliantCount: number;
  eindeOndersteuningCount: number;
  gemeenteCount: number;
};

export async function getSamenwerkingDashboardStats(
  samenwerkingId: string
): Promise<SamenwerkingDashboardStats> {
  const links = await prisma.samenwerkingGemeente.findMany({
    where: { samenwerkingId },
    select: { gemeenteId: true },
  });
  const gemeenteIds = links.map((l) => l.gemeenteId);

  if (gemeenteIds.length === 0) {
    return {
      totaalPakketten: 0,
      totaalKoppelingen: 0,
      compliantCount: 0,
      eindeOndersteuningCount: 0,
      gemeenteCount: 0,
    };
  }

  const [pakketCount, koppelingCount, gps] = await Promise.all([
    prisma.gemeentePakket.count({
      where: { gemeenteId: { in: gemeenteIds } },
    }),
    prisma.koppeling.count({
      where: { gemeenteId: { in: gemeenteIds } },
    }),
    prisma.gemeentePakket.findMany({
      where: { gemeenteId: { in: gemeenteIds } },
      include: {
        pakketversie: {
          include: { standaarden: true },
        },
      },
    }),
  ]);

  const compliantCount = gps.filter((gp) =>
    gp.pakketversie.standaarden.some((s) => s.compliancy === true)
  ).length;

  const eindeOndersteuningCount = gps.filter(
    (gp) =>
      gp.pakketversie.status?.toLowerCase().includes("uitgefaseerd") ||
      gp.status?.toLowerCase().includes("uitgefaseerd")
  ).length;

  return {
    totaalPakketten: pakketCount,
    totaalKoppelingen: koppelingCount,
    compliantCount,
    eindeOndersteuningCount,
    gemeenteCount: gemeenteIds.length,
  };
}
