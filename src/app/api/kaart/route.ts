import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/process/auth-helpers";
import { genereerKaartSvg, KaartError } from "@/service/kaart";

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user || (user.role !== "GEMEENTE" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const viewId = searchParams.get("viewId");
  const organisatieId = searchParams.get("gemeenteId");

  if (!viewId) {
    return NextResponse.json(
      { error: "viewId is verplicht" },
      { status: 400 }
    );
  }

  // For GEMEENTE users, use their own organisatie
  let targetOrganisatieId: string | null = organisatieId;
  if (user.role === "GEMEENTE") {
    targetOrganisatieId = user.organisatieId ?? null;
  }

  if (!targetOrganisatieId) {
    return NextResponse.json(
      { error: "gemeenteId is verplicht" },
      { status: 400 }
    );
  }

  try {
    const svgContent = await genereerKaartSvg(viewId, targetOrganisatieId);

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
    console.error("Internal error:", error);
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 });
  }
}
