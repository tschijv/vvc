import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-helpers";
import {
  invalidateCache,
  getLiveBegrippen,
  getCacheInfo,
  setVocabulaires,
  VocabulaireConfig,
} from "@/lib/services/begrippen-live";

/**
 * GET: Haal cache-status op
 */
export async function GET() {
  const info = await getCacheInfo();
  return NextResponse.json(info);
}

/**
 * POST: Invalideer cache en haal begrippen opnieuw op van SKOSMOS
 */
export async function POST() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  try {
    invalidateCache();
    const begrippen = await getLiveBegrippen();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      count: begrippen.length,
    });
  } catch (error) {
    console.error("Begrippen cache refresh fout:", error);
    return NextResponse.json(
      { error: "Fout bij verversen begrippen cache" },
      { status: 500 }
    );
  }
}

/**
 * PUT: Wijzig vocabulaires en ververs de cache
 */
export async function PUT(request: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const vocabs = body.vocabulaires as VocabulaireConfig[];

    if (!Array.isArray(vocabs)) {
      return NextResponse.json(
        { error: "vocabulaires moet een array zijn" },
        { status: 400 }
      );
    }

    // Valideer: elk item moet naam en apiUrl hebben
    for (const v of vocabs) {
      if (!v.naam || typeof v.naam !== "string") {
        return NextResponse.json(
          { error: `Ongeldige naam: "${v.naam}". Naam is verplicht.` },
          { status: 400 }
        );
      }
      if (!v.apiUrl || typeof v.apiUrl !== "string") {
        return NextResponse.json(
          { error: `Ongeldige API URL voor "${v.naam}". URL is verplicht.` },
          { status: 400 }
        );
      }
      try {
        new URL(v.apiUrl);
      } catch {
        return NextResponse.json(
          { error: `Ongeldige URL voor "${v.naam}": ${v.apiUrl}` },
          { status: 400 }
        );
      }
    }

    // Update vocabulaires in database (invalideert cache, maar haalt niet opnieuw op)
    await setVocabulaires(vocabs);

    return NextResponse.json({
      success: true,
      cacheInfo: await getCacheInfo(),
    });
  } catch (error) {
    console.error("Begrippen vocabulaires update fout:", error);
    return NextResponse.json(
      { error: "Fout bij opslaan vocabulaires" },
      { status: 500 }
    );
  }
}
