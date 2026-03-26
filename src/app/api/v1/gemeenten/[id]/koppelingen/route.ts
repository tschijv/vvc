import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/process/auth";
import { prisma } from "@/data/prisma";
import { parseBody } from "@/process/validation";
import { withRateLimit, RATE_LIMITS } from "@/process/rate-limit";
import { logAudit } from "@/service/audit";
import { tenant } from "@/process/tenant-config";

const createKoppelingSchema = z.object({
  bronPakketversieId: z.string().uuid("Ongeldig bronPakketversieId"),
  doelPakketversieId: z.string().uuid("Ongeldig doelPakketversieId").optional(),
  doelExternPakketId: z.string().uuid("Ongeldig doelExternPakketId").optional(),
  richting: z.string().min(1, "Richting is verplicht").max(50),
  standaard: z.string().max(200).optional(),
  status: z.string().max(100).optional(),
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

  const { id: organisatieId } = await params;

  // Only owning gemeente or ADMIN can add koppelingen
  if (
    session.user.role !== "ADMIN" &&
    session.user.organisatieId !== organisatieId
  ) {
    return NextResponse.json(
      { error: `Onvoldoende rechten voor deze ${tenant.organisatieType.enkelvoud}` },
      { status: 403 },
    );
  }

  const parsed = await parseBody(request, createKoppelingSchema);
  if ("error" in parsed) return parsed.error;
  const { bronPakketversieId, doelPakketversieId, doelExternPakketId, richting, standaard, status } = parsed.data;

  try {
    // Verify gemeente exists
    const gemeente = await prisma.organisatie.findUnique({
      where: { id: organisatieId },
      select: { id: true, naam: true },
    });

    if (!gemeente) {
      return NextResponse.json(
        { error: `${tenant.organisatieType.capitaal} niet gevonden` },
        { status: 404 },
      );
    }

    // Verify bron pakketversie exists
    const bron = await prisma.pakketversie.findUnique({
      where: { id: bronPakketversieId },
      select: { id: true },
    });

    if (!bron) {
      return NextResponse.json(
        { error: "Bron pakketversie niet gevonden" },
        { status: 404 },
      );
    }

    // Verify doel pakketversie if provided
    if (doelPakketversieId) {
      const doel = await prisma.pakketversie.findUnique({
        where: { id: doelPakketversieId },
        select: { id: true },
      });

      if (!doel) {
        return NextResponse.json(
          { error: "Doel pakketversie niet gevonden" },
          { status: 404 },
        );
      }
    }

    // Verify doel extern pakket if provided
    if (doelExternPakketId) {
      const doelExtern = await prisma.externPakket.findUnique({
        where: { id: doelExternPakketId },
        select: { id: true },
      });

      if (!doelExtern) {
        return NextResponse.json(
          { error: "Doel extern pakket niet gevonden" },
          { status: 404 },
        );
      }
    }

    const koppeling = await prisma.koppeling.create({
      data: {
        organisatieId,
        bronPakketversieId,
        doelPakketversieId: doelPakketversieId ?? null,
        doelExternPakketId: doelExternPakketId ?? null,
        richting,
        standaard: standaard ?? null,
        status: status ?? null,
      },
    });

    logAudit({
      userId: session.user.id,
      userEmail: session.user.email,
      actie: "create",
      entiteit: "Koppeling",
      entiteitId: koppeling.id,
      details: `Koppeling aangemaakt voor ${tenant.organisatieType.enkelvoud} "${gemeente.naam}" via API`,
    });

    return NextResponse.json({ data: koppeling }, { status: 201 });
  } catch (error) {
    console.error("API v1 POST koppelingen error:", error);
    return NextResponse.json(
      { error: "Interne serverfout" },
      { status: 500 },
    );
  }
}
