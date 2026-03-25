import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/process/auth";
import { prisma } from "@/data/prisma";
import { parseBody } from "@/process/validation";
import { withRateLimit, RATE_LIMITS } from "@/process/rate-limit";
import { logAudit } from "@/service/audit";

const createVersieSchema = z.object({
  naam: z.string().min(1, "Naam is verplicht").max(200),
  status: z.enum(
    ["In ontwikkeling", "In test", "In distributie", "Uit distributie"],
    { errorMap: () => ({ message: "Ongeldige status. Kies uit: In ontwikkeling, In test, In distributie, Uit distributie" }) },
  ),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const blocked = withRateLimit(request, RATE_LIMITS.admin);
  if (blocked) return blocked;

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: "Niet geautoriseerd" },
      { status: 401 },
    );
  }

  if (!["API_USER", "ADMIN"].includes(session.user.role)) {
    return NextResponse.json(
      { error: "Onvoldoende rechten" },
      { status: 403 },
    );
  }

  const { id: pakketId } = await params;

  const parsed = await parseBody(request, createVersieSchema);
  if ("error" in parsed) return parsed.error;
  const { naam, status } = parsed.data;

  try {
    const pakket = await prisma.pakket.findUnique({
      where: { id: pakketId },
      select: { id: true, naam: true, leverancierId: true },
    });

    if (!pakket) {
      return NextResponse.json(
        { error: "Pakket niet gevonden" },
        { status: 404 },
      );
    }

    // Only owning leverancier or ADMIN can add versions
    if (
      session.user.role !== "ADMIN" &&
      session.user.leverancierId !== pakket.leverancierId
    ) {
      return NextResponse.json(
        { error: "Onvoldoende rechten voor dit pakket" },
        { status: 403 },
      );
    }

    const versie = await prisma.pakketversie.create({
      data: {
        naam,
        status,
        pakketId,
      },
    });

    logAudit({
      userId: session.user.id,
      userEmail: session.user.email,
      actie: "create",
      entiteit: "Pakketversie",
      entiteitId: versie.id,
      details: `Versie "${naam}" toegevoegd aan pakket "${pakket.naam}" via API`,
    });

    return NextResponse.json({ data: versie }, { status: 201 });
  } catch (error) {
    console.error("API v1 POST pakketversies error:", error);
    return NextResponse.json(
      { error: "Interne serverfout" },
      { status: 500 },
    );
  }
}
