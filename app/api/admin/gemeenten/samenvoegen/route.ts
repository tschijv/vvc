import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth-helpers";
import { mergeGemeenten } from "@/lib/services/gemeente";
import { logAudit } from "@/lib/services/audit";
import { parseBody, idSchema } from "@/lib/validation";

const samenvoegSchema = z.object({
  bronGemeenteId: idSchema,
  doelGemeenteId: idSchema,
}).refine((data) => data.bronGemeenteId !== data.doelGemeenteId, {
  message: "Bron- en doelgemeente mogen niet dezelfde zijn.",
});

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  try {
    const parsed = await parseBody(req, samenvoegSchema);
    if ("error" in parsed) return parsed.error;
    const { bronGemeenteId, doelGemeenteId } = parsed.data;

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
