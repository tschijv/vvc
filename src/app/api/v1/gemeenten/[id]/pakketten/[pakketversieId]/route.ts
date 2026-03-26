import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/process/auth";
import { prisma } from "@/data/prisma";
import { withRateLimit, RATE_LIMITS } from "@/process/rate-limit";
import { logAudit } from "@/service/audit";
import { tenant } from "@/process/tenant-config";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pakketversieId: string }> },
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

  const { id: organisatieId, pakketversieId } = await params;

  // Only owning gemeente or ADMIN can remove pakketten
  if (
    session.user.role !== "ADMIN" &&
    session.user.organisatieId !== organisatieId
  ) {
    return NextResponse.json(
      { error: `Onvoldoende rechten voor deze ${tenant.organisatieType.enkelvoud}` },
      { status: 403 },
    );
  }

  try {
    const existing = await prisma.organisatiePakket.findUnique({
      where: {
        organisatieId_pakketversieId: {
          organisatieId,
          pakketversieId,
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: `Pakketversie niet gevonden in ${tenant.organisatieType.enkelvoud} portfolio` },
        { status: 404 },
      );
    }

    await prisma.organisatiePakket.delete({
      where: {
        organisatieId_pakketversieId: {
          organisatieId,
          pakketversieId,
        },
      },
    });

    logAudit({
      userId: session.user.id,
      userEmail: session.user.email,
      actie: "delete",
      entiteit: "OrganisatiePakket",
      entiteitId: `${organisatieId}:${pakketversieId}`,
      details: `Pakketversie verwijderd uit ${tenant.organisatieType.enkelvoud} portfolio via API`,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("API v1 DELETE gemeente pakket error:", error);
    return NextResponse.json(
      { error: "Interne serverfout" },
      { status: 500 },
    );
  }
}
