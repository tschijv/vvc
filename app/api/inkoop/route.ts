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

  // Haal pakketversies op die de geselecteerde referentiecomponenten implementeren
  const pakketversies = await prisma.pakketversie.findMany({
    where: {
      referentiecomponenten: {
        some: {
          referentiecomponentId: { in: refcompIds },
        },
      },
    },
    include: {
      pakket: {
        include: { leverancier: true },
      },
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
    },
    orderBy: { pakket: { leverancier: { naam: "asc" } } },
  });

  // Transformeer naar een handig response formaat
  const aanbod = pakketversies.map((pv) => ({
    leverancier: pv.pakket.leverancier.naam,
    leverancierSlug: pv.pakket.leverancier.slug,
    pakket: pv.pakket.naam,
    pakketSlug: pv.pakket.slug,
    versie: pv.naam,
    status: pv.status,
    referentiecomponenten: pv.referentiecomponenten.map((rc) => ({
      naam: rc.referentiecomponent.naam,
    })),
    standaarden: pv.standaarden.map((s) => ({
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
  for (const pv of pakketversies) {
    for (const s of pv.standaarden) {
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
