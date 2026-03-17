import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-helpers";
import { mergeGemeenten } from "@/lib/services/gemeente";
import { logAudit } from "@/lib/services/audit";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  try {
    const { bronGemeenteId, doelGemeenteId } = await req.json();

    if (!bronGemeenteId || !doelGemeenteId) {
      return NextResponse.json(
        { error: "bronGemeenteId en doelGemeenteId zijn verplicht." },
        { status: 400 }
      );
    }

    if (bronGemeenteId === doelGemeenteId) {
      return NextResponse.json(
        { error: "Bron- en doelgemeente mogen niet dezelfde zijn." },
        { status: 400 }
      );
    }

    await mergeGemeenten(bronGemeenteId, doelGemeenteId);

    logAudit({
      userId: user.id,
      userEmail: user.email,
      actie: "merge",
      entiteit: "Gemeente",
      entiteitId: doelGemeenteId,
      details: `Brongemeente ${bronGemeenteId} samengevoegd naar doelgemeente ${doelGemeenteId}`,
    });

    return NextResponse.json({
      message: "Gemeenten succesvol samengevoegd.",
    });
  } catch {
    return NextResponse.json(
      { error: "Er is een fout opgetreden bij het samenvoegen." },
      { status: 500 }
    );
  }
}
