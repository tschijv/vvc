import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-helpers";
import { genereerKaartSvg, KaartError } from "@/lib/services/kaart";

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user || (user.role !== "GEMEENTE" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const viewId = searchParams.get("viewId");
  const gemeenteId = searchParams.get("gemeenteId");

  if (!viewId) {
    return NextResponse.json(
      { error: "viewId is verplicht" },
      { status: 400 }
    );
  }

  // For GEMEENTE users, use their own gemeente
  let targetGemeenteId: string | null = gemeenteId;
  if (user.role === "GEMEENTE") {
    targetGemeenteId = user.organisatieId ?? null;
  }

  if (!targetGemeenteId) {
    return NextResponse.json(
      { error: "gemeenteId is verplicht" },
      { status: 400 }
    );
  }

  try {
    const svgContent = await genereerKaartSvg(viewId, targetGemeenteId);

    return new NextResponse(svgContent, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (error) {
    if (error instanceof KaartError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    console.error("Kaart generatie fout:", error);
    return NextResponse.json(
      {
        error: "Fout bij genereren kaart",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
