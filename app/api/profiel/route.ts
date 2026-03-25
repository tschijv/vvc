import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseBody } from "@/lib/validation";

const profielSchema = z.object({
  naam: z.string().min(1, "Naam mag niet leeg zijn").max(200).optional(),
  telefoon: z.string().max(50).nullable().optional(),
  functie: z.string().max(200).nullable().optional(),
  emailNotificaties: z.boolean().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      naam: true,
      telefoon: true,
      functie: true,
      rollen: true,
      emailNotificaties: true,
      lastLoginAt: true,
      organisatieId: true,
      leverancierId: true,
      organisatie: { select: { id: true, naam: true } },
      leverancier: { select: { id: true, naam: true, slug: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Gebruiker niet gevonden" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const parsed = await parseBody(req, profielSchema);
  if ("error" in parsed) return parsed.error;
  const { naam, telefoon, functie, emailNotificaties } = parsed.data;

  const data: Record<string, unknown> = {};
  if (naam !== undefined) data.naam = naam.trim();
  if (telefoon !== undefined) data.telefoon = telefoon?.trim() || null;
  if (functie !== undefined) data.functie = functie?.trim() || null;
  if (emailNotificaties !== undefined) data.emailNotificaties = emailNotificaties;

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: {
      id: true,
      email: true,
      naam: true,
      telefoon: true,
      functie: true,
      emailNotificaties: true,
    },
  });

  return NextResponse.json({ user: updated });
}
