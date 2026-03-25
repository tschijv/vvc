"use server";

import { getSessionUser, canEditGemeentePortfolio } from "@/process/auth-helpers";
import { prisma } from "@/data/prisma";
import { logAudit } from "@/service/audit";

type ActionResult = { success: true } | { error: string };

/**
 * Search pakketversies for the add-to-portfolio modal.
 */
export async function searchPakketversies(query: string) {
  const user = await getSessionUser();
  if (!user) return [];

  const results = await prisma.pakketversie.findMany({
    where: {
      OR: [
        { naam: { contains: query, mode: "insensitive" } },
        { pakket: { naam: { contains: query, mode: "insensitive" } } },
      ],
    },
    select: {
      id: true,
      naam: true,
      status: true,
      pakket: {
        select: {
          id: true,
          naam: true,
          leverancier: { select: { naam: true } },
        },
      },
    },
    take: 20,
    orderBy: { pakket: { naam: "asc" } },
  });

  return results.map((pv) => ({
    id: pv.id,
    label: `${pv.pakket.naam} — ${pv.naam}`,
    pakketNaam: pv.pakket.naam,
    versieNaam: pv.naam,
    leverancierNaam: pv.pakket.leverancier?.naam || "Onbekend",
    status: pv.status,
  }));
}

/**
 * Add a pakketversie to a gemeente's portfolio.
 */
export async function addPakketToPortfolio(
  gemeenteId: string,
  data: {
    pakketversieId: string;
    status?: string;
    technologie?: string;
    verantwoordelijke?: string;
    licentievorm?: string;
    aantalGebruikers?: number;
    maatwerk?: string;
  },
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!canEditGemeentePortfolio(user, gemeenteId)) {
    return { error: "Geen toegang om het portfolio te bewerken." };
  }

  try {
    // Check if already exists
    const existing = await prisma.organisatiePakket.findUnique({
      where: {
        organisatieId_pakketversieId: {
          organisatieId: gemeenteId,
          pakketversieId: data.pakketversieId,
        },
      },
    });

    if (existing) {
      return { error: "Dit pakket staat al in het portfolio." };
    }

    await prisma.organisatiePakket.create({
      data: {
        organisatieId: gemeenteId,
        pakketversieId: data.pakketversieId,
        status: data.status || null,
        technologie: data.technologie || null,
        verantwoordelijke: data.verantwoordelijke || null,
        licentievorm: data.licentievorm || null,
        aantalGebruikers: data.aantalGebruikers || null,
        maatwerk: data.maatwerk || null,
        mutatiedatum: new Date(),
      },
    });

    await logAudit({
      userId: user!.id,
      userEmail: user!.email,
      actie: "portfolio_add",
      entiteit: "GemeentePakket",
      entiteitId: `${gemeenteId}:${data.pakketversieId}`,
      details: `Pakketversie ${data.pakketversieId} toegevoegd aan portfolio`,
    });

    return { success: true };
  } catch (err) {
    console.error("addPakketToPortfolio error:", err);
    return { error: "Er ging iets mis bij het toevoegen." };
  }
}

/**
 * Update a GemeentePakket record.
 */
export async function updateGemeentePakket(
  gemeenteId: string,
  pakketversieId: string,
  data: {
    status?: string;
    technologie?: string;
    verantwoordelijke?: string;
    licentievorm?: string;
    aantalGebruikers?: number;
    maatwerk?: string;
  },
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!canEditGemeentePortfolio(user, gemeenteId)) {
    return { error: "Geen toegang om het portfolio te bewerken." };
  }

  try {
    await prisma.organisatiePakket.update({
      where: {
        organisatieId_pakketversieId: { organisatieId: gemeenteId, pakketversieId },
      },
      data: {
        status: data.status ?? undefined,
        technologie: data.technologie ?? undefined,
        verantwoordelijke: data.verantwoordelijke ?? undefined,
        licentievorm: data.licentievorm ?? undefined,
        aantalGebruikers: data.aantalGebruikers ?? undefined,
        maatwerk: data.maatwerk ?? undefined,
        mutatiedatum: new Date(),
      },
    });

    await logAudit({
      userId: user!.id,
      userEmail: user!.email,
      actie: "portfolio_update",
      entiteit: "GemeentePakket",
      entiteitId: `${gemeenteId}:${pakketversieId}`,
      details: JSON.stringify(data),
    });

    return { success: true };
  } catch (err) {
    console.error("updateGemeentePakket error:", err);
    return { error: "Er ging iets mis bij het bijwerken." };
  }
}

/**
 * Remove a pakketversie from a gemeente's portfolio.
 */
export async function removeGemeentePakket(
  gemeenteId: string,
  pakketversieId: string,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!canEditGemeentePortfolio(user, gemeenteId)) {
    return { error: "Geen toegang om het portfolio te bewerken." };
  }

  try {
    await prisma.organisatiePakket.delete({
      where: {
        organisatieId_pakketversieId: { organisatieId: gemeenteId, pakketversieId },
      },
    });

    await logAudit({
      userId: user!.id,
      userEmail: user!.email,
      actie: "portfolio_remove",
      entiteit: "GemeentePakket",
      entiteitId: `${gemeenteId}:${pakketversieId}`,
      details: `Pakketversie ${pakketversieId} verwijderd uit portfolio`,
    });

    return { success: true };
  } catch (err) {
    console.error("removeGemeentePakket error:", err);
    return { error: "Er ging iets mis bij het verwijderen." };
  }
}
