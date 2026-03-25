"use server";

import { getSessionUser, canEditGemeentePortfolio } from "@/process/auth-helpers";
import { prisma } from "@/data/prisma";
import { logAudit } from "@/service/audit";

type ActionResult = { success: true } | { error: string };

type KoppelingData = {
  bronPakketversieId?: string;
  bronExternNaam?: string;
  richting: string; // "heen" | "weer" | "beide"
  doelPakketversieId?: string;
  doelExternNaam?: string;
  buitengemeentelijk?: boolean;
  status?: string;
  standaard?: string;
  transportprotocol?: string;
  aanvullendeInformatie?: string;
};

/**
 * Look up or create an ExternPakket by name.
 */
async function resolveExternPakket(naam: string): Promise<string> {
  const existing = await prisma.externPakket.findFirst({
    where: { naam: { equals: naam, mode: "insensitive" } },
  });
  if (existing) return existing.id;

  const created = await prisma.externPakket.create({
    data: { naam },
  });
  return created.id;
}

/**
 * Add a new koppeling to a gemeente.
 */
export async function addKoppeling(
  gemeenteId: string,
  data: KoppelingData,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!canEditGemeentePortfolio(user, gemeenteId)) {
    return { error: "Geen toegang om koppelingen te bewerken." };
  }

  try {
    // Resolve extern pakketten if names are provided
    let bronExternPakketId: string | undefined;
    if (data.bronExternNaam) {
      bronExternPakketId = await resolveExternPakket(data.bronExternNaam);
    }

    let doelExternPakketId: string | undefined;
    if (data.doelExternNaam) {
      doelExternPakketId = await resolveExternPakket(data.doelExternNaam);
    }

    await prisma.koppeling.create({
      data: {
        organisatieId: gemeenteId,
        bronPakketversieId: data.bronPakketversieId || null,
        bronExternPakketId: bronExternPakketId || null,
        richting: data.richting || "beide",
        doelPakketversieId: data.doelPakketversieId || null,
        doelExternPakketId: doelExternPakketId || null,
        buitengemeentelijk: data.buitengemeentelijk ?? false,
        status: data.status || null,
        standaard: data.standaard || null,
        transportprotocol: data.transportprotocol || null,
        aanvullendeInformatie: data.aanvullendeInformatie || null,
      },
    });

    await logAudit({
      userId: user!.id,
      userEmail: user!.email,
      actie: "koppeling_add",
      entiteit: "Koppeling",
      entiteitId: gemeenteId,
      details: `Koppeling toegevoegd: ${data.bronPakketversieId || data.bronExternNaam || "?"} ${data.richting} ${data.doelPakketversieId || data.doelExternNaam || "?"}`,
    });

    return { success: true };
  } catch (err) {
    console.error("addKoppeling error:", err);
    return { error: "Er ging iets mis bij het toevoegen van de koppeling." };
  }
}

/**
 * Update an existing koppeling.
 */
export async function updateKoppeling(
  koppelingId: string,
  data: KoppelingData,
): Promise<ActionResult> {
  const user = await getSessionUser();

  try {
    // Look up the koppeling to get gemeenteId for auth check
    const koppeling = await prisma.koppeling.findUnique({
      where: { id: koppelingId },
      select: { organisatieId: true },
    });

    if (!koppeling) {
      return { error: "Koppeling niet gevonden." };
    }

    if (!canEditGemeentePortfolio(user, koppeling.organisatieId)) {
      return { error: "Geen toegang om koppelingen te bewerken." };
    }

    // Resolve extern pakketten if names are provided
    let bronExternPakketId: string | null = null;
    if (data.bronExternNaam) {
      bronExternPakketId = await resolveExternPakket(data.bronExternNaam);
    }

    let doelExternPakketId: string | null = null;
    if (data.doelExternNaam) {
      doelExternPakketId = await resolveExternPakket(data.doelExternNaam);
    }

    await prisma.koppeling.update({
      where: { id: koppelingId },
      data: {
        bronPakketversieId: data.bronPakketversieId || null,
        bronExternPakketId: bronExternPakketId,
        richting: data.richting || "beide",
        doelPakketversieId: data.doelPakketversieId || null,
        doelExternPakketId: doelExternPakketId,
        buitengemeentelijk: data.buitengemeentelijk ?? false,
        status: data.status || null,
        standaard: data.standaard || null,
        transportprotocol: data.transportprotocol || null,
        aanvullendeInformatie: data.aanvullendeInformatie || null,
      },
    });

    await logAudit({
      userId: user!.id,
      userEmail: user!.email,
      actie: "koppeling_update",
      entiteit: "Koppeling",
      entiteitId: koppelingId,
      details: JSON.stringify(data),
    });

    return { success: true };
  } catch (err) {
    console.error("updateKoppeling error:", err);
    return { error: "Er ging iets mis bij het bijwerken van de koppeling." };
  }
}

/**
 * Delete a koppeling.
 */
export async function deleteKoppeling(
  koppelingId: string,
): Promise<ActionResult> {
  const user = await getSessionUser();

  try {
    const koppeling = await prisma.koppeling.findUnique({
      where: { id: koppelingId },
      select: { organisatieId: true },
    });

    if (!koppeling) {
      return { error: "Koppeling niet gevonden." };
    }

    if (!canEditGemeentePortfolio(user, koppeling.organisatieId)) {
      return { error: "Geen toegang om koppelingen te verwijderen." };
    }

    await prisma.koppeling.delete({
      where: { id: koppelingId },
    });

    await logAudit({
      userId: user!.id,
      userEmail: user!.email,
      actie: "koppeling_delete",
      entiteit: "Koppeling",
      entiteitId: koppelingId,
      details: `Koppeling ${koppelingId} verwijderd`,
    });

    return { success: true };
  } catch (err) {
    console.error("deleteKoppeling error:", err);
    return { error: "Er ging iets mis bij het verwijderen van de koppeling." };
  }
}

/**
 * Search pakketversies that belong to a gemeente's portfolio (for bron/doel dropdowns).
 */
export async function searchGemeentePakketversies(
  gemeenteId: string,
): Promise<{ id: string; label: string }[]> {
  const user = await getSessionUser();
  if (!user) return [];

  try {
    const gemeentePakketten = await prisma.organisatiePakket.findMany({
      where: { organisatieId: gemeenteId },
      include: {
        pakketversie: {
          include: {
            pakket: { select: { naam: true } },
          },
        },
      },
      orderBy: { pakketversie: { pakket: { naam: "asc" } } },
    });

    return gemeentePakketten.map((gp) => ({
      id: gp.pakketversie.id,
      label: `${gp.pakketversie.pakket.naam} — ${gp.pakketversie.naam}`,
    }));
  } catch (err) {
    console.error("searchGemeentePakketversies error:", err);
    return [];
  }
}
