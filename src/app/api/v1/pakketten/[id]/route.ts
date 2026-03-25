import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/process/auth";
import { prisma } from "@/data/prisma";
import { parseBody } from "@/process/validation";
import { withRateLimit, RATE_LIMITS } from "@/process/rate-limit";
import { logAudit } from "@/service/audit";

const updatePakketSchema = z.object({
  naam: z.string().min(1).max(200).optional(),
  beschrijving: z.string().max(2000).optional(),
});

export async function PUT(
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

  const { id } = await params;

  const parsed = await parseBody(request, updatePakketSchema);
  if ("error" in parsed) return parsed.error;
  const data = parsed.data;

  try {
    const pakket = await prisma.pakket.findUnique({
      where: { id },
      select: { id: true, leverancierId: true },
    });

    if (!pakket) {
      return NextResponse.json(
        { error: "Pakket niet gevonden" },
        { status: 404 },
      );
    }

    // Only owning leverancier or ADMIN can update
    if (
      session.user.role !== "ADMIN" &&
      session.user.leverancierId !== pakket.leverancierId
    ) {
      return NextResponse.json(
        { error: "Onvoldoende rechten voor dit pakket" },
        { status: 403 },
      );
    }

    const updated = await prisma.pakket.update({
      where: { id },
      data: {
        ...(data.naam !== undefined && { naam: data.naam }),
        ...(data.beschrijving !== undefined && { beschrijving: data.beschrijving }),
      },
      include: {
        leverancier: { select: { naam: true, slug: true } },
      },
    });

    logAudit({
      userId: session.user.id,
      userEmail: session.user.email,
      actie: "update",
      entiteit: "Pakket",
      entiteitId: id,
      details: `Pakket bijgewerkt via API`,
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("API v1 PUT pakketten error:", error);
    return NextResponse.json(
      { error: "Interne serverfout" },
      { status: 500 },
    );
  }
}

export async function DELETE(
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

  // Only ADMIN can delete pakketten
  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Alleen beheerders mogen pakketten verwijderen" },
      { status: 403 },
    );
  }

  const { id } = await params;

  try {
    const pakket = await prisma.pakket.findUnique({
      where: { id },
      select: { id: true, naam: true },
    });

    if (!pakket) {
      return NextResponse.json(
        { error: "Pakket niet gevonden" },
        { status: 404 },
      );
    }

    await prisma.pakket.delete({ where: { id } });

    logAudit({
      userId: session.user.id,
      userEmail: session.user.email,
      actie: "delete",
      entiteit: "Pakket",
      entiteitId: id,
      details: `Pakket "${pakket.naam}" verwijderd via API`,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("API v1 DELETE pakketten error:", error);
    return NextResponse.json(
      { error: "Interne serverfout" },
      { status: 500 },
    );
  }
}
