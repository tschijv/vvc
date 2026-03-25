import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { parseBody } from "@/lib/validation";

const seedSchema = z.object({
  gemeente: z.string().max(200).optional(),
  aantalPakketten: z.number().int().min(1).max(1000).optional(),
});

/**
 * POST /api/admin/seed-demo-gemeente
 *
 * Vult een gemeente met demo-data: pakketten, koppelingen, etc.
 * Alleen voor ADMIN.
 */
export async function POST(request: Request) {
  // Allow seed via secret header OR admin session
  const seedSecret = request.headers.get("x-seed-secret");
  if (seedSecret !== process.env.AUTH_SECRET) {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Niet gemachtigd" }, { status: 403 });
    }
  }

  const parsed = await parseBody(request, seedSchema);
  if ("error" in parsed) return parsed.error;
  const gemeenteNaam = parsed.data.gemeente || "'s-Gravenhage";
  const gewenstAantal = parsed.data.aantalPakketten || 200;

  try {
    // Find gemeente
    const gemeente = await prisma.gemeente.findFirst({
      where: { naam: { contains: gemeenteNaam.replace("'", ""), mode: "insensitive" } },
      select: { id: true, naam: true, _count: { select: { pakketten: true, koppelingen: true } } },
    });

    if (!gemeente) {
      return NextResponse.json({ error: `Gemeente "${gemeenteNaam}" niet gevonden` }, { status: 404 });
    }

    // Get all pakketversies, ordered by popularity then random
    const allPakketversies = await prisma.pakketversie.findMany({
      orderBy: { aantalGemeenten: "desc" },
      take: gewenstAantal + 50, // extra margin
      select: {
        id: true,
        naam: true,
        pakket: { select: { naam: true, leverancier: { select: { naam: true } } } },
      },
    });

    // Check existing gemeente-pakket links to avoid duplicates
    const existing = await prisma.gemeentePakket.findMany({
      where: { gemeenteId: gemeente.id },
      select: { pakketversieId: true },
    });
    const existingIds = new Set(existing.map((e) => e.pakketversieId));

    // Add pakketten that don't already exist
    const statussen = ["In gebruik", "In gebruik", "In gebruik", "In invoering", "In uitfasering"];
    const licentievormen = ["SaaS", "On-premise", "Hybrid", "SaaS", "SaaS"];
    const technologieen = ["Webapplicatie", "Desktop", "Webapplicatie", "Mobile", "Webapplicatie"];

    const nog = gewenstAantal - existing.length;
    const toCreate = allPakketversies
      .filter((pv) => !existingIds.has(pv.id))
      .slice(0, Math.max(0, nog));

    let pakkettenAangemaakt = 0;
    for (const pv of toCreate) {
      await prisma.gemeentePakket.create({
        data: {
          gemeenteId: gemeente.id,
          pakketversieId: pv.id,
          status: statussen[Math.floor(Math.random() * statussen.length)],
          technologie: technologieen[Math.floor(Math.random() * technologieen.length)],
          licentievorm: licentievormen[Math.floor(Math.random() * licentievormen.length)],
          aantalGebruikers: Math.floor(Math.random() * 500) + 10,
          verantwoordelijke: ["ICT Afdeling", "Functioneel Beheer", "Informatiemanagement"][Math.floor(Math.random() * 3)],
          mutatiedatum: new Date(),
        },
      });
      pakkettenAangemaakt++;
    }

    // Add koppelingen between pakketten of this gemeente
    const gemeentePakketten = await prisma.gemeentePakket.findMany({
      where: { gemeenteId: gemeente.id },
      select: { pakketversieId: true },
      take: 20,
    });

    let koppelingenAangemaakt = 0;
    const pvIds = gemeentePakketten.map((gp) => gp.pakketversieId);

    if (pvIds.length >= 2) {
      // Get extern pakketten for some external koppelingen
      const externPakketten = await prisma.externPakket.findMany({
        take: 5,
        select: { id: true },
      });

      const standaarden = ["StUF-BG", "StUF-ZKN", "API", "REST", "SOAP", "ZDS", "ZGW API"];
      const richtingen = ["beide", "bron_naar_doel", "doel_naar_bron"];
      const protocollen = ["HTTPS", "SOAP", "REST API", "SFTP", "MQ"];

      // Create internal koppelingen (between own pakketten)
      const maxKoppelingen = Math.min(8, Math.floor(pvIds.length / 2));
      for (let i = 0; i < maxKoppelingen; i++) {
        const bronIdx = i * 2;
        const doelIdx = i * 2 + 1;
        if (bronIdx >= pvIds.length || doelIdx >= pvIds.length) break;

        try {
          await prisma.koppeling.create({
            data: {
              gemeenteId: gemeente.id,
              bronPakketversieId: pvIds[bronIdx],
              doelPakketversieId: pvIds[doelIdx],
              richting: richtingen[Math.floor(Math.random() * richtingen.length)],
              standaard: standaarden[Math.floor(Math.random() * standaarden.length)],
              transportprotocol: protocollen[Math.floor(Math.random() * protocollen.length)],
              status: "Actief",
              buitengemeentelijk: false,
            },
          });
          koppelingenAangemaakt++;
        } catch {
          // Skip duplicates
        }
      }

      // Create buitengemeentelijke koppelingen
      for (const ep of externPakketten.slice(0, 3)) {
        const bronPv = pvIds[Math.floor(Math.random() * pvIds.length)];
        try {
          await prisma.koppeling.create({
            data: {
              gemeenteId: gemeente.id,
              bronPakketversieId: bronPv,
              doelExternPakketId: ep.id,
              richting: "bron_naar_doel",
              standaard: standaarden[Math.floor(Math.random() * standaarden.length)],
              transportprotocol: "HTTPS",
              status: "Actief",
              buitengemeentelijk: true,
            },
          });
          koppelingenAangemaakt++;
        } catch {
          // Skip duplicates
        }
      }
    }

    // Update progress
    const totalPakketten = await prisma.gemeentePakket.count({
      where: { gemeenteId: gemeente.id },
    });
    const progress = Math.min(5, Math.floor(totalPakketten / 5));
    await prisma.gemeente.update({
      where: { id: gemeente.id },
      data: { progress, lastActivity: new Date() },
    });

    return NextResponse.json({
      success: true,
      gemeente: gemeente.naam,
      pakkettenAangemaakt,
      koppelingenAangemaakt,
      totaalPakketten: totalPakketten,
      voortgang: progress,
    });
  } catch (error) {
    console.error("Seed demo-gemeente error:", error);
    return NextResponse.json(
      { error: "Fout bij seeden", details: String(error) },
      { status: 500 },
    );
  }
}
