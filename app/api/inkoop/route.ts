import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/inkoop?refcomps=id1,id2,id3
 *
 * Geeft voor de geselecteerde referentiecomponenten:
 * - De pakketversies die deze referentiecomponenten implementeren
 * - De standaarden die van toepassing zijn op die pakketversies
 */
export async function GET(request: NextRequest) {
  const refcompIds = request.nextUrl.searchParams
    .get("refcomps")
    ?.split(",")
    .filter(Boolean);

  if (!refcompIds?.length) {
    return NextResponse.json(
      { error: "Selecteer minimaal één referentiecomponent" },
      { status: 400 }
    );
  }

  // Haal pakketten op die de geselecteerde referentiecomponenten implementeren
  const pakketten = await prisma.pakket.findMany({
    where: {
      referentiecomponenten: {
        some: {
          referentiecomponentId: { in: refcompIds },
        },
      },
    },
    include: {
      leverancier: true,
      referentiecomponenten: {
        where: {
          referentiecomponentId: { in: refcompIds },
        },
        include: { referentiecomponent: true },
      },
      standaarden: {
        include: {
          standaardversie: {
            include: { standaard: true },
          },
        },
      },
      versies: {
        orderBy: { startDistributie: "desc" },
        take: 1,
        select: { naam: true, status: true },
      },
    },
    orderBy: { leverancier: { naam: "asc" } },
  });

  // Transformeer naar een handig response formaat
  const aanbod = pakketten.map((p) => ({
    leverancier: p.leverancier.naam,
    leverancierSlug: p.leverancier.slug,
    pakket: p.naam,
    pakketSlug: p.slug,
    versie: p.versies[0]?.naam || "",
    status: p.versies[0]?.status || "Onbekend",
    referentiecomponenten: p.referentiecomponenten.map((rc) => ({
      naam: rc.referentiecomponent.naam,
    })),
    standaarden: p.standaarden.map((s) => ({
      naam: s.standaardversie.standaard.naam,
      versie: s.standaardversie.naam,
      compliancy: s.compliancy,
    })),
  }));

  // Verzamel unieke standaarden die van toepassing zijn
  const standaardenMap = new Map<
    string,
    { naam: string; versies: Set<string> }
  >();
  for (const p of pakketten) {
    for (const s of p.standaarden) {
      const key = s.standaardversie.standaard.naam;
      if (!standaardenMap.has(key)) {
        standaardenMap.set(key, { naam: key, versies: new Set() });
      }
      standaardenMap.get(key)!.versies.add(s.standaardversie.naam);
    }
  }

  const toepasselijkeStandaarden = Array.from(standaardenMap.values()).map(
    (s) => ({
      naam: s.naam,
      versies: Array.from(s.versies),
    })
  );

  return NextResponse.json({
    aanbod,
    standaarden: toepasselijkeStandaarden,
    totaal: aanbod.length,
  });
}
