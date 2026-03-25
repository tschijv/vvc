import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getLeveranciers,
  getLeverancierCount,
} from "@/service/leverancier";
import { negotiateFormat, isRdfFormat } from "@/integration/rdf/content-negotiation";
import { serializeRdf } from "@/integration/rdf/serializer";
import { leverancierToTriples } from "@/integration/rdf/mappers";
import { withRateLimit, RATE_LIMITS } from "@/process/rate-limit";
import { auth } from "@/process/auth";
import { prisma } from "@/data/prisma";
import { parseBody, naamSchema } from "@/process/validation";
import { logAudit } from "@/service/audit";
import type { components } from "@/integration/api-types";

type LeverancierSummary = components["schemas"]["LeverancierSummary"];
type PaginationMeta = components["schemas"]["PaginationMeta"];

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

export async function GET(request: NextRequest) {
  const blocked = withRateLimit(request, RATE_LIMITS.api);
  if (blocked) return blocked;
  const format = negotiateFormat(request);
  const { searchParams } = new URL(request.url);
  const zoek = searchParams.get("zoek") || undefined;
  const offset = Math.max(0, parseInt(searchParams.get("offset") || "0") || 0);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT)) || DEFAULT_LIMIT)
  );

  try {
    if (isRdfFormat(format)) {
      const leveranciers = await getLeveranciers({ zoek, skip: offset, take: limit });
      const quads = leveranciers.flatMap((l) => leverancierToTriples(l));
      return serializeRdf(quads, format);
    }

    const [leveranciers, total] = await Promise.all([
      getLeveranciers({ zoek, skip: offset, take: limit }),
      getLeverancierCount({ zoek }),
    ]);

    const data: LeverancierSummary[] = leveranciers.map((l) => ({
      id: l.id,
      naam: l.naam,
      slug: l.slug,
      contactpersoon: l.contactpersoon,
      email: l.email,
      website: l.website,
      beschrijvingDiensten: l.beschrijvingDiensten,
      supportPortalUrl: l.supportPortalUrl,
      documentatieUrl: l.documentatieUrl,
      kennisbankUrl: l.kennisbankUrl,
      aantalPakketten: l._count.pakketten,
      addenda: l.addenda.map((a) => a.addendum.naam),
    }));

    const meta: PaginationMeta = { total, offset, limit };

    return NextResponse.json(
      { data, meta },
      { headers: { "X-Total-Count": String(total) } }
    );
  } catch (error) {
    console.error("API v1 leveranciers fout:", error);
    return NextResponse.json(
      { error: "Interne serverfout" },
      { status: 500 }
    );
  }
}

// ─── Write: POST /api/v1/leveranciers ──────────────────────────────────────

const createLeverancierSchema = z.object({
  naam: naamSchema,
  contactpersoon: z.string().max(200).optional(),
  email: z.string().email("Ongeldig e-mailadres").max(255).optional(),
  telefoon: z.string().max(50).optional(),
  website: z.string().url("Ongeldige URL").max(500).optional(),
});

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

  // Only ADMIN can create leveranciers
  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Alleen beheerders mogen leveranciers aanmaken" },
      { status: 403 },
    );
  }

  const parsed = await parseBody(request, createLeverancierSchema);
  if ("error" in parsed) return parsed.error;
  const { naam, contactpersoon, email, telefoon, website } = parsed.data;

  try {
    // Generate unique slug
    let slug = slugify(naam) || "leverancier";
    let uniqueSlug = slug;
    let counter = 1;
    while (
      await prisma.leverancier.findUnique({ where: { slug: uniqueSlug }, select: { id: true } })
    ) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    const leverancier = await prisma.leverancier.create({
      data: {
        naam,
        slug: uniqueSlug,
        contactpersoon: contactpersoon ?? null,
        email: email ?? null,
        telefoon: telefoon ?? null,
        website: website ?? null,
      },
    });

    logAudit({
      userId: session.user.id,
      userEmail: session.user.email,
      actie: "create",
      entiteit: "Leverancier",
      entiteitId: leverancier.id,
      details: `Leverancier "${naam}" aangemaakt via API`,
    });

    return NextResponse.json({ data: leverancier }, { status: 201 });
  } catch (error) {
    console.error("API v1 POST leveranciers error:", error);
    return NextResponse.json(
      { error: "Interne serverfout" },
      { status: 500 },
    );
  }
}
