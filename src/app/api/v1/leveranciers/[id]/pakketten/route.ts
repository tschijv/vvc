import { NextRequest, NextResponse } from "next/server";
import { getLeverancierPakketten } from "@/service/leverancier";
import { prisma } from "@/data/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Verify leverancier exists
    const leverancier = await prisma.leverancier.findUnique({
      where: { id },
      select: { id: true, naam: true },
    });

    if (!leverancier) {
      return NextResponse.json(
        { error: "Leverancier niet gevonden" },
        { status: 404 }
      );
    }

    const pakketten = await getLeverancierPakketten(id);

    const data = pakketten.map((p) => ({
      id: p.id,
      naam: p.naam,
      slug: p.slug,
      leverancier: p.leverancier.naam,
      laatsteVersie: p.versies[0]
        ? { naam: p.versies[0].naam, status: p.versies[0].status }
        : null,
    }));

    return NextResponse.json({
      data,
      meta: { total: data.length, leverancierNaam: leverancier.naam },
    });
  } catch (error) {
    console.error("API v1 leverancier pakketten fout:", error);
    return NextResponse.json(
      { error: "Interne serverfout" },
      { status: 500 }
    );
  }
}
