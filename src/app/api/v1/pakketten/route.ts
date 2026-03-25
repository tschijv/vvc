import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/process/auth";
import { prisma } from "@/data/prisma";
import { parseBody, naamSchema } from "@/process/validation";
import { withRateLimit, RATE_LIMITS } from "@/process/rate-limit";
import { logAudit } from "@/service/audit";

const createPakketSchema = z.object({
  naam: naamSchema,
  beschrijving: z.string().max(2000).optional(),
  leverancierId: z.string().uuid("Ongeldig leverancierId"),
});

/**
 * Generate a URL-friendly slug from a name.
 */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(request: NextRequest) {
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

  const parsed = await parseBody(request, createPakketSchema);
  if ("error" in parsed) return parsed.error;
  const { naam, beschrijving, leverancierId } = parsed.data;

  try {
    // Verify leverancier exists
    const leverancier = await prisma.leverancier.findUnique({
      where: { id: leverancierId },
      select: { id: true },
    });

    if (!leverancier) {
      return NextResponse.json(
        { error: "Leverancier niet gevonden" },
        { status: 404 },
      );
    }

    // Generate unique slug
    let slug = slugify(naam) || "pakket";
    let uniqueSlug = slug;
    let counter = 1;
    while (
      await prisma.pakket.findUnique({ where: { slug: uniqueSlug }, select: { id: true } })
    ) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    const pakket = await prisma.pakket.create({
      data: {
        naam,
        slug: uniqueSlug,
        beschrijving: beschrijving ?? null,
        leverancierId,
      },
      include: {
        leverancier: { select: { naam: true, slug: true } },
      },
    });

    logAudit({
      userId: session.user.id,
      userEmail: session.user.email,
      actie: "create",
      entiteit: "Pakket",
      entiteitId: pakket.id,
      details: `Pakket "${naam}" aangemaakt via API`,
    });

    return NextResponse.json({ data: pakket }, { status: 201 });
  } catch (error) {
    console.error("API v1 POST pakketten error:", error);
    return NextResponse.json(
      { error: "Interne serverfout" },
      { status: 500 },
    );
  }
}
