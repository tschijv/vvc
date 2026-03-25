import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/process/auth";
import { prisma } from "@/data/prisma";
import { parseBody } from "@/process/validation";
import { logAudit } from "@/service/audit";

const addOrgSchema = z.object({
  organisatieId: z.string().min(1, "organisatieId is verplicht"),
  rol: z.enum(["BEHEERDER", "RAADPLEGER"]).default("BEHEERDER"),
});

const deleteOrgSchema = z.object({
  organisatieId: z.string().min(1, "organisatieId is verplicht"),
});

/** GET: List all organisaties for a user */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { id } = await params;
  const organisaties = await prisma.userOrganisatie.findMany({
    where: { userId: id },
    include: { organisatie: { select: { id: true, naam: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ organisaties });
}

/** POST: Add an organisatie to a user */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { id } = await params;
  const parsed = await parseBody(request, addOrgSchema);
  if ("error" in parsed) return parsed.error;

  const { organisatieId, rol } = parsed.data;

  // Check user exists
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: "Gebruiker niet gevonden" }, { status: 404 });
  }

  // Check org exists
  const org = await prisma.organisatie.findUnique({ where: { id: organisatieId } });
  if (!org) {
    return NextResponse.json({ error: "Organisatie niet gevonden" }, { status: 404 });
  }

  // Upsert the membership
  const membership = await prisma.userOrganisatie.upsert({
    where: { userId_organisatieId: { userId: id, organisatieId } },
    create: { userId: id, organisatieId, rol },
    update: { rol },
  });

  logAudit({
    userId: session.user.id,
    userEmail: session.user.email,
    actie: "add-user-organisatie",
    entiteit: "UserOrganisatie",
    entiteitId: `${id}:${organisatieId}`,
    details: `Added user ${user.email} to organisatie ${org.naam} with rol ${rol}`,
  });

  return NextResponse.json(membership, { status: 201 });
}

/** DELETE: Remove an organisatie from a user */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { id } = await params;
  const parsed = await parseBody(request, deleteOrgSchema);
  if ("error" in parsed) return parsed.error;

  const { organisatieId } = parsed.data;

  try {
    await prisma.userOrganisatie.delete({
      where: { userId_organisatieId: { userId: id, organisatieId } },
    });
  } catch {
    return NextResponse.json({ error: "Koppeling niet gevonden" }, { status: 404 });
  }

  logAudit({
    userId: session.user.id,
    userEmail: session.user.email,
    actie: "remove-user-organisatie",
    entiteit: "UserOrganisatie",
    entiteitId: `${id}:${organisatieId}`,
  });

  return NextResponse.json({ ok: true });
}
