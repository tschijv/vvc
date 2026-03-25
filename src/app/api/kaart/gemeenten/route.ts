import { NextResponse } from "next/server";
import { prisma } from "@/data/prisma";

/**
 * Public API: returns gemeente progress data for the choropleth map.
 * Each item has cbsCode (for matching GeoJSON), naam, progress (0-100),
 * and aantalPakketten.
 */
export async function GET() {
  try {
    const gemeenten = await prisma.organisatie.findMany({
      select: {
        id: true,
        naam: true,
        cbsCode: true,
        progress: true,
        _count: { select: { pakketten: true } },
      },
      // No orderBy needed — client builds a Map keyed by cbsCode
    });

    const data = gemeenten.map((g) => ({
      id: g.id,
      naam: g.naam,
      cbsCode: g.cbsCode,
      progress: g.progress,
      aantalPakketten: g._count.pakketten,
    }));

    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=7200" } }
    );
  } catch (error) {
    console.error("Kaart gemeenten API fout:", error);
    return NextResponse.json(
      { error: "Interne serverfout" },
      { status: 500 }
    );
  }
}
