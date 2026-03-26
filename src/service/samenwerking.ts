import { prisma } from "@/data/prisma";

// ─── Detail ─────────────────────────────────────────────────────────────────────

export async function getSamenwerkingById(id: string) {
  return prisma.samenwerking.findUnique({
    where: { id },
    include: {
      organisaties: {
        include: {
          organisatie: {
            include: {
              _count: { select: { pakketten: true, koppelingen: true } },
            },
          },
        },
        orderBy: { organisatie: { naam: "asc" } },
      },
    },
  });
}

// ─── Aggregated pakketten across all member organisaties ────────────────────────

export type SamenwerkingPakketRow = {
  leverancier: string;
  pakketNaam: string;
  pakketSlug: string;
  versie: string;
  status: string | null;
  datumIngangStatus: Date | null;
  gebruiktVoor: string[];
  hasCompliancy: boolean;
  organisatieNaam: string;
};

export async function getSamenwerkingPakketten(
  samenwerkingId: string
): Promise<SamenwerkingPakketRow[]> {
  // Get all organisatie IDs in this samenwerking
  const links = await prisma.samenwerkingOrganisatie.findMany({
    where: { samenwerkingId },
    select: { organisatieId: true, organisatie: { select: { naam: true } } },
  });

  const organisatieMap = new Map(
    links.map((l) => [l.organisatieId, l.organisatie.naam])
  );
  const organisatieIds = links.map((l) => l.organisatieId);

  if (organisatieIds.length === 0) return [];

  const gps = await prisma.organisatiePakket.findMany({
    where: { organisatieId: { in: organisatieIds } },
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

  return gps.map((gp) => ({
    leverancier: gp.pakketversie.pakket.leverancier.naam,
    pakketNaam: gp.pakketversie.pakket.naam,
    pakketSlug: gp.pakketversie.pakket.slug,
    versie: gp.pakketversie.naam,
    status: gp.status,
    datumIngangStatus: gp.datumIngangStatus,
    gebruiktVoor: gp.pakketversie.pakket.referentiecomponenten.map(
      (r) => r.referentiecomponent.naam
    ),
    hasCompliancy: gp.pakketversie.pakket.standaarden.some(
      (s) => s.compliancy === true
    ),
    organisatieNaam: organisatieMap.get(gp.organisatieId) || "Onbekend",
  }));
}

// ─── Aggregated koppelingen across all member organisaties ──────────────────────

export type SamenwerkingKoppelingRow = {
  bron: string;
  richting: string;
  doel: string;
  status: string | null;
  standaard: string | null;
  organisatieNaam: string;
};

export async function getSamenwerkingKoppelingen(
  samenwerkingId: string
): Promise<SamenwerkingKoppelingRow[]> {
  const links = await prisma.samenwerkingOrganisatie.findMany({
    where: { samenwerkingId },
    select: { organisatieId: true, organisatie: { select: { naam: true } } },
  });

  const organisatieMap = new Map(
    links.map((l) => [l.organisatieId, l.organisatie.naam])
  );
  const organisatieIds = links.map((l) => l.organisatieId);

  if (organisatieIds.length === 0) return [];

  const koppelingen = await prisma.koppeling.findMany({
    where: { organisatieId: { in: organisatieIds } },
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
        ? `${k.doelExternPakket.naam}${k.doelExternPakket.versie ? ` ${k.doelExternPakket.versie}` : ""}${k.buitenOrganisatie ? " (Buitengemeentelijk)" : " (Extern pakket)"}`
        : "—";

    const richting =
      k.richting === "heen" ? "→" : k.richting === "weer" ? "←" : "↔";

    return {
      bron: bronLabel,
      richting,
      doel: doelLabel,
      status: k.status,
      standaard: k.standaard,
      organisatieNaam: organisatieMap.get(k.organisatieId) || "Onbekend",
    };
  });
}

// ─── Dashboard stats (aggregated) ───────────────────────────────────────────────

export type SamenwerkingDashboardStats = {
  totaalPakketten: number;
  totaalKoppelingen: number;
  compliantCount: number;
  eindeOndersteuningCount: number;
  organisatieCount: number;
};

export async function getSamenwerkingDashboardStats(
  samenwerkingId: string
): Promise<SamenwerkingDashboardStats> {
  const links = await prisma.samenwerkingOrganisatie.findMany({
    where: { samenwerkingId },
    select: { organisatieId: true },
  });
  const organisatieIds = links.map((l) => l.organisatieId);

  if (organisatieIds.length === 0) {
    return {
      totaalPakketten: 0,
      totaalKoppelingen: 0,
      compliantCount: 0,
      eindeOndersteuningCount: 0,
      organisatieCount: 0,
    };
  }

  const [pakketCount, koppelingCount, gps] = await Promise.all([
    prisma.organisatiePakket.count({
      where: { organisatieId: { in: organisatieIds } },
    }),
    prisma.koppeling.count({
      where: { organisatieId: { in: organisatieIds } },
    }),
    prisma.organisatiePakket.findMany({
      where: { organisatieId: { in: organisatieIds } },
      include: {
        pakketversie: {
          include: {
            pakket: {
              include: { standaarden: true },
            },
          },
        },
      },
    }),
  ]);

  const compliantCount = gps.filter((gp) =>
    gp.pakketversie.pakket.standaarden.some((s) => s.compliancy === true)
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
    organisatieCount: organisatieIds.length,
  };
}
