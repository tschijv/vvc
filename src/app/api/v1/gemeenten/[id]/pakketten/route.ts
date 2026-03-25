import { NextRequest, NextResponse } from "next/server";
import { getGemeentePakketten } from "@/service/gemeente";
import { prisma } from "@/data/prisma";
import type { components } from "@/integration/api-types";

type GemeentePakket = components["schemas"]["GemeentePakket"];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Verify gemeente exists
    const gemeente = await prisma.organisatie.findUnique({
      where: { id },
      select: { id: true, naam: true },
    });

    if (!gemeente) {
      return NextResponse.json(
        { error: "Gemeente niet gevonden" },
        { status: 404 }
      );
    }

    const pakketten = await getGemeentePakketten(id);

    const data: GemeentePakket[] = pakketten.map((gp) => ({
      pakketId: gp.pakketversie.pakket.id,
      pakketNaam: gp.pakketversie.pakket.naam,
      pakketSlug: gp.pakketversie.pakket.slug,
      versie: gp.pakketversie.naam,
      status: gp.status || gp.pakketversie.status,
      leverancier: {
        naam: gp.pakketversie.pakket.leverancier.naam,
      },
      referentiecomponenten: gp.pakketversie.pakket.referentiecomponenten.map(
        (rc) => ({
          naam: rc.referentiecomponent.naam,
          guid: rc.referentiecomponent.guid,
        })
      ),
    }));

    return NextResponse.json({
      data,
      meta: { total: data.length, gemeenteNaam: gemeente.naam },
    });
  } catch (error) {
    console.error("API v1 gemeente pakketten fout:", error);
    return NextResponse.json(
      { error: "Interne serverfout" },
      { status: 500 }
    );
  }
}
