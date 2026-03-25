import { prisma } from "@/data/prisma";
import { getGemeentePakketten } from "@/service/gemeente";
import { sterrenDisplay } from "@/process/progress";
import type { SuggestieData, PakketRow } from "./types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function sterren(progress: number): string[] {
  return sterrenDisplay(progress).map((s) => (s === "\u2605" ? "filled" : "empty"));
}

export async function loadPakketRows(
  gemeenteId: string,
  filters?: { compliancy?: string; standaard?: string; testrapport?: string },
): Promise<PakketRow[]> {
  const gps = await getGemeentePakketten(gemeenteId);

  let filtered = gps;
  if (filters?.compliancy === "niet") {
    filtered = filtered.filter((gp) => !gp.pakketversie.pakket.standaarden.some((s) => s.compliancy));
  } else if (filters?.compliancy === "wel") {
    filtered = filtered.filter((gp) => gp.pakketversie.pakket.standaarden.some((s) => s.compliancy));
  }
  if (filters?.standaard) {
    filtered = filtered.filter((gp) =>
      gp.pakketversie.pakket.standaarden.some((s) => `${s.standaardversie.standaard.naam} ${s.standaardversie.naam}` === filters.standaard)
    );
  }
  if (filters?.testrapport) {
    filtered = filtered.filter((gp) =>
      gp.pakketversie.pakket.standaarden.some((s) => s.compliancy && `${s.standaardversie.standaard.naam} ${s.standaardversie.naam}` === filters.testrapport)
    );
  }

  return filtered.map((gp) => ({
    pakketversieId: gp.pakketversie.id,
    leverancier: gp.pakketversie.pakket.leverancier.naam,
    pakketNaam: gp.pakketversie.pakket.naam,
    pakketSlug: gp.pakketversie.pakket.slug,
    versie: gp.pakketversie.naam,
    status: gp.status,
    datumIngangStatus: gp.datumIngangStatus,
    gebruiktVoor: gp.pakketversie.pakket.referentiecomponenten.map((r) => r.referentiecomponent.naam),
    hasCompliancy: gp.pakketversie.pakket.standaarden.some((s) => s.compliancy === true),
    standaardNamen: Array.from(new Set<string>(gp.pakketversie.pakket.standaarden.map((s: { standaardversie: { standaard: { naam: string } } }) => s.standaardversie.standaard.naam))),
    testrapportStandaarden: Array.from(new Set<string>(gp.pakketversie.pakket.standaarden.filter((s: { compliancy: boolean | null }) => s.compliancy).map((s: { standaardversie: { standaard: { naam: string } } }) => s.standaardversie.standaard.naam))),
    technologie: gp.technologie,
    verantwoordelijke: gp.verantwoordelijke,
    licentievorm: gp.licentievorm,
    aantalGebruikers: gp.aantalGebruikers,
    maatwerk: gp.maatwerk,
  }));
}

export async function loadSuggesties(gemeenteId: string): Promise<SuggestieData> {
  // Run three independent queries in parallel:
  // 1. gemeentePakketIds (needed for populairePakketten)
  // 2. gemeentePakketten (for nieuweVersies)
  // 3. bgKoppelingen (for buitengemeentelijkeKoppelingen)
  const [gemeentePakketIds, gemeentePakketten, bgKoppelingen] = await Promise.all([
    prisma.organisatiePakket.findMany({
      where: { organisatieId: gemeenteId },
      select: { pakketversie: { select: { pakketId: true } } },
    }),
    prisma.organisatiePakket.findMany({
      where: { organisatieId: gemeenteId },
      select: {
        pakketversie: {
          select: {
            id: true, naam: true, createdAt: true,
            pakket: {
              select: {
                id: true, naam: true, slug: true,
                leverancier: { select: { naam: true } },
                versies: {
                  where: { status: { in: ["In gebruik", "In distributie"] } },
                  select: { id: true, naam: true, createdAt: true, mutatiedatum: true },
                  orderBy: { createdAt: "desc" },
                },
              },
            },
          },
        },
      },
    }),
    prisma.koppeling.findMany({
      where: { organisatieId: gemeenteId, buitengemeentelijk: true },
      select: {
        standaard: true, transportprotocol: true, createdAt: true,
        doelExternPakket: { select: { naam: true } },
        bronExternPakket: { select: { naam: true } },
        doelPakketversie: { select: { pakket: { select: { naam: true, leverancier: { select: { naam: true } } } } } },
        bronPakketversie: { select: { pakket: { select: { naam: true, leverancier: { select: { naam: true } } } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const heeftPakketIds = new Set<string>(gemeentePakketIds.map((gp: { pakketversie: { pakketId: string } }) => gp.pakketversie.pakketId));

  // populairePakketten depends on heeftPakketIds, so it runs after the first batch
  const populairePakketten = await prisma.pakket.findMany({
    where: {
      id: { notIn: Array.from(heeftPakketIds) },
      aantalGemeenten: { gte: 10 },
    },
    select: {
      naam: true, slug: true, mutatiedatum: true,
      leverancier: { select: { naam: true } },
      versies: {
        where: { status: { in: ["In gebruik", "In distributie"] } },
        select: { naam: true }, orderBy: { createdAt: "desc" }, take: 1,
      },
    },
    orderBy: { aantalGemeenten: "desc" }, take: 20,
  });

  const nieuwePakketten = populairePakketten
    .filter((p) => p.versies.length > 0)
    .map((p) => ({
      leverancier: p.leverancier.naam,
      pakketversie: `${p.naam} ${p.versies[0].naam}`,
      pakketSlug: p.slug,
      datum: p.mutatiedatum ? p.mutatiedatum.toLocaleDateString("nl-NL") : "\u2014",
    }));

  const nieuweVersies: SuggestieData["nieuweVersies"] = [];
  const gezienPakketIds = new Set<string>();
  for (const gp of gemeentePakketten) {
    const pakket = gp.pakketversie.pakket;
    if (gezienPakketIds.has(pakket.id)) continue;
    gezienPakketIds.add(pakket.id);
    const nieuwereVersie = pakket.versies.find(
      (v) => v.id !== gp.pakketversie.id && v.createdAt > gp.pakketversie.createdAt
    );
    if (nieuwereVersie) {
      nieuweVersies.push({
        leverancier: pakket.leverancier.naam, pakketNaam: pakket.naam,
        pakketSlug: pakket.slug, huidigeVersie: gp.pakketversie.naam,
        nieuweVersie: nieuwereVersie.naam,
        datum: nieuwereVersie.mutatiedatum ? nieuwereVersie.mutatiedatum.toLocaleDateString("nl-NL") : "\u2014",
      });
    }
  }

  const buitengemeentelijkeKoppelingen = bgKoppelingen.map((k) => {
    const voorziening = k.doelExternPakket?.naam || k.bronExternPakket?.naam || k.doelPakketversie?.pakket.naam || k.bronPakketversie?.pakket.naam || "Onbekend";
    const bron = k.doelPakketversie?.pakket.leverancier.naam || k.bronPakketversie?.pakket.leverancier.naam || "\u2014";
    return {
      voorziening, standaard: k.standaard || "\u2014",
      transportprotocol: k.transportprotocol || "\u2014",
      datum: k.createdAt.toLocaleDateString("nl-NL"), bron,
    };
  });

  return { nieuwePakketten, nieuweVersies, buitengemeentelijkeKoppelingen };
}
