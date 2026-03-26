import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getGemeentePakketten } from "@/service/gemeente";
import { auth } from "@/process/auth";
import { prisma } from "@/data/prisma";
import { parseBody } from "@/process/validation";
import { withRateLimit, RATE_LIMITS } from "@/process/rate-limit";
import { logAudit } from "@/service/audit";
import { tenant } from "@/process/tenant-config";
import type { components } from "@/integration/api-types";

type GemeentePakket = components["schemas"]["GemeentePakket"];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Verify gemeente exists
    const gemeente = await prisma.organisatie.findUnique({
      where: { id },
      select: { id: true, naam: true },
    });

    if (!gemeente) {
      return NextResponse.json(
        { error: `${tenant.organisatieType.capitaal} niet gevonden` },
        { status: 404 }
      );
    }

    const pakketten = await getGemeentePakketten(id);

    const data: GemeentePakket[] = pakketten.map((gp) => ({
      pakketId: gp.pakketversie.pakket.id,
      pakketNaam: gp.pakketversie.pakket.naam,
      pakketSlug: gp.pakketversie.pakket.slug,
      versie: gp.pakketversie.naam,
      status: gp.status || gp.pakketversie.status,
      leverancier: {
        naam: gp.pakketversie.pakket.leverancier.naam,
      },
      referentiecomponenten: gp.pakketversie.pakket.referentiecomponenten.map(
        (rc) => ({
          naam: rc.referentiecomponent.naam,
          guid: rc.referentiecomponent.guid,
        })
      ),
    }));

    return NextResponse.json({
      data,
      meta: { total: data.length, gemeenteNaam: gemeente.naam },
    });
  } catch (error) {
    console.error("API v1 gemeente pakketten fout:", error);
    return NextResponse.json(
      { error: "Interne serverfout" },
      { status: 500 }
    );
  }
}

// ─── Write: POST /api/v1/gemeenten/[id]/pakketten ──────────────────────────

const addPakketSchema = z.object({
  pakketversieId: z.string().uuid("Ongeldig pakketversieId"),
  status: z.string().max(100).optional(),
  maatwerk: z.string().max(500).optional(),
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

  // Only owning gemeente or ADMIN can add pakketten
  if (
    session.user.role !== "ADMIN" &&
    session.user.organisatieId !== organisatieId
  ) {
    return NextResponse.json(
      { error: `Onvoldoende rechten voor deze ${tenant.organisatieType.enkelvoud}` },
      { status: 403 },
    );
  }

  const parsed = await parseBody(request, addPakketSchema);
  if ("error" in parsed) return parsed.error;
  const { pakketversieId, status, maatwerk } = parsed.data;

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

    // Verify pakketversie exists
    const pakketversie = await prisma.pakketversie.findUnique({
      where: { id: pakketversieId },
      select: { id: true },
    });

    if (!pakketversie) {
      return NextResponse.json(
        { error: "Pakketversie niet gevonden" },
        { status: 404 },
      );
    }

    // Check if already exists
    const existing = await prisma.organisatiePakket.findUnique({
      where: {
        organisatieId_pakketversieId: {
          organisatieId,
          pakketversieId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Pakketversie is al toegevoegd aan deze ${tenant.organisatieType.enkelvoud}` },
        { status: 400 },
      );
    }

    const record = await prisma.organisatiePakket.create({
      data: {
        organisatieId,
        pakketversieId,
        status: status ?? null,
        maatwerk: maatwerk ?? null,
      },
    });

    logAudit({
      userId: session.user.id,
      userEmail: session.user.email,
      actie: "create",
      entiteit: "OrganisatiePakket",
      entiteitId: `${organisatieId}:${pakketversieId}`,
      details: `Pakketversie toegevoegd aan ${tenant.organisatieType.enkelvoud} "${gemeente.naam}" via API`,
    });

    return NextResponse.json({ data: record }, { status: 201 });
  } catch (error) {
    console.error("API v1 POST gemeente pakketten error:", error);
    return NextResponse.json(
      { error: "Interne serverfout" },
      { status: 500 },
    );
  }
}
