"use server";

import { getSessionUser, canEditLeverancierPakket } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/services/audit";

type ActionResult = { success: true } | { error: string };

/**
 * Update a pakket's naam and/or beschrijving.
 */
export async function updatePakket(
  pakketId: string,
  data: { naam?: string; beschrijving?: string },
): Promise<ActionResult> {
  const user = await getSessionUser();

  const pakket = await prisma.pakket.findUnique({
    where: { id: pakketId },
    select: { leverancierId: true },
  });
  if (!pakket) return { error: "Pakket niet gevonden." };

  if (!canEditLeverancierPakket(user, pakket.leverancierId)) {
    return { error: "Geen toegang om dit pakket te bewerken." };
  }

  try {
    await prisma.pakket.update({
      where: { id: pakketId },
      data: {
        naam: data.naam ?? undefined,
        beschrijving: data.beschrijving ?? undefined,
        mutatiedatum: new Date(),
      },
    });

    await logAudit({
      userId: user!.id,
      userEmail: user!.email,
      actie: "update",
      entiteit: "Pakket",
      entiteitId: pakketId,
      details: JSON.stringify(data),
    });

    return { success: true };
  } catch (err) {
    console.error("updatePakket error:", err);
    return { error: "Er ging iets mis bij het bijwerken van het pakket." };
  }
}

/**
 * Add a new pakketversie to a pakket.
 */
export async function addPakketversie(
  pakketId: string,
  data: {
    naam: string;
    status?: string;
    beschrijving?: string;
    startOntwikkeling?: string;
    startTest?: string;
    startDistributie?: string;
  },
): Promise<ActionResult> {
  const user = await getSessionUser();

  const pakket = await prisma.pakket.findUnique({
    where: { id: pakketId },
    select: { leverancierId: true },
  });
  if (!pakket) return { error: "Pakket niet gevonden." };

  if (!canEditLeverancierPakket(user, pakket.leverancierId)) {
    return { error: "Geen toegang om versies toe te voegen." };
  }

  try {
    const versie = await prisma.pakketversie.create({
      data: {
        pakketId,
        naam: data.naam,
        status: data.status || "In ontwikkeling",
        beschrijving: data.beschrijving || null,
        startOntwikkeling: data.startOntwikkeling ? new Date(data.startOntwikkeling) : null,
        startTest: data.startTest ? new Date(data.startTest) : null,
        startDistributie: data.startDistributie ? new Date(data.startDistributie) : null,
      },
    });

    await logAudit({
      userId: user!.id,
      userEmail: user!.email,
      actie: "create",
      entiteit: "Pakketversie",
      entiteitId: versie.id,
      details: `Versie "${data.naam}" toegevoegd aan pakket ${pakketId}`,
    });

    return { success: true };
  } catch (err) {
    console.error("addPakketversie error:", err);
    return { error: "Er ging iets mis bij het toevoegen van de versie." };
  }
}

/**
 * Update an existing pakketversie.
 */
export async function updatePakketversie(
  pakketversieId: string,
  data: {
    naam?: string;
    status?: string;
    beschrijving?: string;
    startOntwikkeling?: string;
    startTest?: string;
    startDistributie?: string;
  },
): Promise<ActionResult> {
  const user = await getSessionUser();

  const versie = await prisma.pakketversie.findUnique({
    where: { id: pakketversieId },
    select: { pakket: { select: { leverancierId: true } } },
  });
  if (!versie) return { error: "Pakketversie niet gevonden." };

  if (!canEditLeverancierPakket(user, versie.pakket.leverancierId)) {
    return { error: "Geen toegang om deze versie te bewerken." };
  }

  try {
    await prisma.pakketversie.update({
      where: { id: pakketversieId },
      data: {
        naam: data.naam ?? undefined,
        status: data.status ?? undefined,
        beschrijving: data.beschrijving ?? undefined,
        startOntwikkeling: data.startOntwikkeling !== undefined
          ? (data.startOntwikkeling ? new Date(data.startOntwikkeling) : null)
          : undefined,
        startTest: data.startTest !== undefined
          ? (data.startTest ? new Date(data.startTest) : null)
          : undefined,
        startDistributie: data.startDistributie !== undefined
          ? (data.startDistributie ? new Date(data.startDistributie) : null)
          : undefined,
        mutatiedatum: new Date(),
      },
    });

    await logAudit({
      userId: user!.id,
      userEmail: user!.email,
      actie: "update",
      entiteit: "Pakketversie",
      entiteitId: pakketversieId,
      details: JSON.stringify(data),
    });

    return { success: true };
  } catch (err) {
    console.error("updatePakketversie error:", err);
    return { error: "Er ging iets mis bij het bijwerken van de versie." };
  }
}

/**
 * Delete a pakketversie (only if no GemeentePakket references exist).
 */
export async function deletePakketversie(
  pakketversieId: string,
): Promise<ActionResult> {
  const user = await getSessionUser();

  const versie = await prisma.pakketversie.findUnique({
    where: { id: pakketversieId },
    select: {
      naam: true,
      pakketId: true,
      pakket: { select: { leverancierId: true } },
    },
  });
  if (!versie) return { error: "Pakketversie niet gevonden." };

  if (!canEditLeverancierPakket(user, versie.pakket.leverancierId)) {
    return { error: "Geen toegang om deze versie te verwijderen." };
  }

  // Check for GemeentePakket references
  const refCount = await prisma.gemeentePakket.count({
    where: { pakketversieId },
  });
  if (refCount > 0) {
    return {
      error: `Deze versie is in gebruik bij ${refCount} gemeente(n) en kan niet worden verwijderd.`,
    };
  }

  try {
    await prisma.pakketversie.delete({
      where: { id: pakketversieId },
    });

    await logAudit({
      userId: user!.id,
      userEmail: user!.email,
      actie: "delete",
      entiteit: "Pakketversie",
      entiteitId: pakketversieId,
      details: `Versie "${versie.naam}" verwijderd van pakket ${versie.pakketId}`,
    });

    return { success: true };
  } catch (err) {
    console.error("deletePakketversie error:", err);
    return { error: "Er ging iets mis bij het verwijderen van de versie." };
  }
}

/**
 * Fetch all referentiecomponenten for selection.
 */
export async function getAllReferentiecomponenten() {
  return prisma.referentiecomponent.findMany({
    select: { id: true, naam: true },
    orderBy: { naam: "asc" },
  });
}

/**
 * Fetch current referentiecomponenten for a pakket.
 */
export async function getPakketversieRefcomps(pakketversieId: string) {
  // Look up the pakketId from the versie, then get pakket-level refcomps
  const versie = await prisma.pakketversie.findUnique({
    where: { id: pakketversieId },
    select: { pakketId: true },
  });
  if (!versie) return [];
  const links = await prisma.pakketReferentiecomponent.findMany({
    where: { pakketId: versie.pakketId, type: "leverancier" },
    select: { referentiecomponentId: true },
  });
  return links.map((l) => l.referentiecomponentId);
}

/**
 * Update referentiecomponenten for a pakket (replace all of type "leverancier").
 * Still accepts pakketversieId for backwards compatibility with the modal.
 */
export async function updatePakketversieRefcomps(
  pakketversieId: string,
  referentiecomponentIds: string[],
): Promise<ActionResult> {
  const user = await getSessionUser();

  const versie = await prisma.pakketversie.findUnique({
    where: { id: pakketversieId },
    select: { pakketId: true, pakket: { select: { leverancierId: true } } },
  });
  if (!versie) return { error: "Pakketversie niet gevonden." };

  if (!canEditLeverancierPakket(user, versie.pakket.leverancierId)) {
    return { error: "Geen toegang om referentiecomponenten te bewerken." };
  }

  try {
    // Delete existing leverancier-type links at pakket level
    await prisma.pakketReferentiecomponent.deleteMany({
      where: { pakketId: versie.pakketId, type: "leverancier" },
    });

    // Create new links
    if (referentiecomponentIds.length > 0) {
      await prisma.pakketReferentiecomponent.createMany({
        data: referentiecomponentIds.map((rcId) => ({
          pakketId: versie.pakketId,
          referentiecomponentId: rcId,
          type: "leverancier",
        })),
      });
    }

    await logAudit({
      userId: user!.id,
      userEmail: user!.email,
      actie: "update",
      entiteit: "PakketReferentiecomponent",
      entiteitId: versie.pakketId,
      details: `Referentiecomponenten bijgewerkt: ${referentiecomponentIds.length} geselecteerd`,
    });

    return { success: true };
  } catch (err) {
    console.error("updatePakketversieRefcomps error:", err);
    return { error: "Er ging iets mis bij het bijwerken van referentiecomponenten." };
  }
}

/**
 * Create a new Standaard + Standaardversie (or add a versie to an existing Standaard).
 * Returns the new standaardversie id.
 */
export async function createStandaardversie(data: {
  standaardNaam: string;
  versieNaam: string;
}): Promise<{ id: string } | { error: string }> {
  const user = await getSessionUser();
  if (!user || !["ADMIN", "LEVERANCIER"].includes(user.role)) {
    return { error: "Geen toegang." };
  }

  try {
    // Find or create the Standaard
    let standaard = await prisma.standaard.findFirst({
      where: { naam: { equals: data.standaardNaam, mode: "insensitive" } },
    });

    if (!standaard) {
      standaard = await prisma.standaard.create({
        data: { naam: data.standaardNaam },
      });
      await logAudit({
        userId: user.id, userEmail: user.email,
        actie: "create", entiteit: "Standaard", entiteitId: standaard.id,
        details: `Standaard "${data.standaardNaam}" aangemaakt`,
      });
    }

    // Check if versie already exists
    const existing = await prisma.standaardversie.findFirst({
      where: {
        standaardId: standaard.id,
        naam: { equals: data.versieNaam, mode: "insensitive" },
      },
    });
    if (existing) {
      return { error: `Versie "${data.versieNaam}" bestaat al voor standaard "${standaard.naam}".` };
    }

    const versie = await prisma.standaardversie.create({
      data: {
        standaardId: standaard.id,
        naam: data.versieNaam,
      },
    });

    await logAudit({
      userId: user.id, userEmail: user.email,
      actie: "create", entiteit: "Standaardversie", entiteitId: versie.id,
      details: `Standaardversie "${data.standaardNaam} ${data.versieNaam}" aangemaakt`,
    });

    return { id: versie.id };
  } catch (err) {
    console.error("createStandaardversie error:", err);
    return { error: "Er ging iets mis bij het aanmaken van de standaardversie." };
  }
}

/**
 * Fetch all standaardversies (with standaard name) for selection.
 */
export async function getAllStandaardversies() {
  return prisma.standaardversie.findMany({
    select: { id: true, naam: true, standaard: { select: { naam: true } } },
    orderBy: [{ standaard: { naam: "asc" } }, { naam: "asc" }],
  });
}

/**
 * Fetch current standaardversies for a pakket (via pakketversieId for compat).
 */
export async function getPakketversieStandaarden(pakketversieId: string) {
  const versie = await prisma.pakketversie.findUnique({
    where: { id: pakketversieId },
    select: { pakketId: true },
  });
  if (!versie) return [];
  const links = await prisma.pakketStandaard.findMany({
    where: { pakketId: versie.pakketId },
    select: { standaardversieId: true, compliancy: true },
  });
  return links.map((l) => ({ standaardversieId: l.standaardversieId, compliancy: l.compliancy }));
}

/**
 * Update standaarden for a pakket (replace all). Accepts pakketversieId for compat.
 */
export async function updatePakketversieStandaarden(
  pakketversieId: string,
  standaarden: { standaardversieId: string; compliancy: boolean }[],
): Promise<ActionResult> {
  const user = await getSessionUser();

  const versie = await prisma.pakketversie.findUnique({
    where: { id: pakketversieId },
    select: { pakketId: true, pakket: { select: { leverancierId: true } } },
  });
  if (!versie) return { error: "Pakketversie niet gevonden." };
  if (!canEditLeverancierPakket(user, versie.pakket.leverancierId)) {
    return { error: "Geen toegang om standaarden te bewerken." };
  }

  try {
    await prisma.pakketStandaard.deleteMany({ where: { pakketId: versie.pakketId } });
    if (standaarden.length > 0) {
      await prisma.pakketStandaard.createMany({
        data: standaarden.map((s) => ({
          pakketId: versie.pakketId,
          standaardversieId: s.standaardversieId,
          compliancy: s.compliancy,
        })),
      });
    }

    await logAudit({
      userId: user!.id, userEmail: user!.email,
      actie: "update", entiteit: "PakketStandaard", entiteitId: versie.pakketId,
      details: `Standaarden bijgewerkt: ${standaarden.length} geselecteerd`,
    });
    return { success: true };
  } catch (err) {
    console.error("updatePakketversieStandaarden error:", err);
    return { error: "Er ging iets mis bij het bijwerken van standaarden." };
  }
}

/**
 * Fetch all applicatiefuncties for selection.
 */
export async function getAllApplicatiefuncties() {
  return prisma.applicatiefunctie.findMany({
    select: { id: true, naam: true },
    orderBy: { naam: "asc" },
  });
}

/**
 * Fetch current applicatiefuncties for a pakket (via pakketversieId for compat).
 */
export async function getPakketversieAppFuncties(pakketversieId: string) {
  const versie = await prisma.pakketversie.findUnique({
    where: { id: pakketversieId },
    select: { pakketId: true },
  });
  if (!versie) return [];
  const links = await prisma.pakketApplicatiefunctie.findMany({
    where: { pakketId: versie.pakketId },
    select: { applicatiefunctieId: true },
  });
  return links.map((l) => l.applicatiefunctieId);
}

/**
 * Update applicatiefuncties for a pakket (replace all). Accepts pakketversieId for compat.
 */
export async function updatePakketversieAppFuncties(
  pakketversieId: string,
  applicatiefunctieIds: string[],
): Promise<ActionResult> {
  const user = await getSessionUser();

  const versie = await prisma.pakketversie.findUnique({
    where: { id: pakketversieId },
    select: { pakketId: true, pakket: { select: { leverancierId: true } } },
  });
  if (!versie) return { error: "Pakketversie niet gevonden." };
  if (!canEditLeverancierPakket(user, versie.pakket.leverancierId)) {
    return { error: "Geen toegang om applicatiefuncties te bewerken." };
  }

  try {
    await prisma.pakketApplicatiefunctie.deleteMany({ where: { pakketId: versie.pakketId } });
    if (applicatiefunctieIds.length > 0) {
      await prisma.pakketApplicatiefunctie.createMany({
        data: applicatiefunctieIds.map((afId) => ({
          pakketId: versie.pakketId,
          applicatiefunctieId: afId,
        })),
      });
    }

    await logAudit({
      userId: user!.id, userEmail: user!.email,
      actie: "update", entiteit: "PakketApplicatiefunctie", entiteitId: versie.pakketId,
      details: `Applicatiefuncties bijgewerkt: ${applicatiefunctieIds.length} geselecteerd`,
    });
    return { success: true };
  } catch (err) {
    console.error("updatePakketversieAppFuncties error:", err);
    return { error: "Er ging iets mis bij het bijwerken van applicatiefuncties." };
  }
}

/**
 * Fetch current technologieen for a pakket (via pakketversieId for compat).
 */
export async function getPakketversieTechnologieen(pakketversieId: string) {
  const versie = await prisma.pakketversie.findUnique({
    where: { id: pakketversieId },
    select: { pakketId: true },
  });
  if (!versie) return [];
  const links = await prisma.pakketTechnologie.findMany({
    where: { pakketId: versie.pakketId },
    select: { technologie: true },
  });
  return links.map((l) => l.technologie);
}

/**
 * Update technologieen for a pakket (replace all). Accepts pakketversieId for compat.
 */
export async function updatePakketversieTechnologieen(
  pakketversieId: string,
  technologieen: string[],
): Promise<ActionResult> {
  const user = await getSessionUser();

  const versie = await prisma.pakketversie.findUnique({
    where: { id: pakketversieId },
    select: { pakketId: true, pakket: { select: { leverancierId: true } } },
  });
  if (!versie) return { error: "Pakketversie niet gevonden." };
  if (!canEditLeverancierPakket(user, versie.pakket.leverancierId)) {
    return { error: "Geen toegang om technologieën te bewerken." };
  }

  try {
    await prisma.pakketTechnologie.deleteMany({ where: { pakketId: versie.pakketId } });
    if (technologieen.length > 0) {
      await prisma.pakketTechnologie.createMany({
        data: technologieen.filter((t) => t.trim()).map((t) => ({
          pakketId: versie.pakketId,
          technologie: t.trim(),
        })),
      });
    }

    await logAudit({
      userId: user!.id, userEmail: user!.email,
      actie: "update", entiteit: "PakketTechnologie", entiteitId: versie.pakketId,
      details: `Technologieën bijgewerkt: ${technologieen.length}`,
    });
    return { success: true };
  } catch (err) {
    console.error("updatePakketversieTechnologieen error:", err);
    return { error: "Er ging iets mis bij het bijwerken van technologieën." };
  }
}

/**
 * Add a contact to a pakket.
 */
export async function addPakketContact(
  pakketId: string,
  data: { naam: string; email?: string; telefoon?: string; rol?: string },
): Promise<ActionResult> {
  const user = await getSessionUser();

  const pakket = await prisma.pakket.findUnique({
    where: { id: pakketId },
    select: { leverancierId: true },
  });
  if (!pakket) return { error: "Pakket niet gevonden." };

  if (!canEditLeverancierPakket(user, pakket.leverancierId)) {
    return { error: "Geen toegang om contactpersonen toe te voegen." };
  }

  try {
    const contact = await prisma.pakketContact.create({
      data: {
        pakketId,
        naam: data.naam,
        email: data.email || null,
        telefoon: data.telefoon || null,
        rol: data.rol || null,
      },
    });

    await logAudit({
      userId: user!.id,
      userEmail: user!.email,
      actie: "create",
      entiteit: "PakketContact",
      entiteitId: contact.id,
      details: `Contact "${data.naam}" toegevoegd aan pakket ${pakketId}`,
    });

    return { success: true };
  } catch (err) {
    console.error("addPakketContact error:", err);
    return { error: "Er ging iets mis bij het toevoegen van het contact." };
  }
}

/**
 * Update a pakket contact.
 */
export async function updatePakketContact(
  contactId: string,
  data: { naam?: string; email?: string; telefoon?: string; rol?: string },
): Promise<ActionResult> {
  const user = await getSessionUser();

  const contact = await prisma.pakketContact.findUnique({
    where: { id: contactId },
    select: { pakket: { select: { leverancierId: true } } },
  });
  if (!contact) return { error: "Contact niet gevonden." };

  if (!canEditLeverancierPakket(user, contact.pakket.leverancierId)) {
    return { error: "Geen toegang om dit contact te bewerken." };
  }

  try {
    await prisma.pakketContact.update({
      where: { id: contactId },
      data: {
        naam: data.naam ?? undefined,
        email: data.email ?? undefined,
        telefoon: data.telefoon ?? undefined,
        rol: data.rol ?? undefined,
      },
    });

    await logAudit({
      userId: user!.id,
      userEmail: user!.email,
      actie: "update",
      entiteit: "PakketContact",
      entiteitId: contactId,
      details: JSON.stringify(data),
    });

    return { success: true };
  } catch (err) {
    console.error("updatePakketContact error:", err);
    return { error: "Er ging iets mis bij het bijwerken van het contact." };
  }
}

/**
 * Delete a pakket contact.
 */
export async function deletePakketContact(
  contactId: string,
): Promise<ActionResult> {
  const user = await getSessionUser();

  const contact = await prisma.pakketContact.findUnique({
    where: { id: contactId },
    select: {
      naam: true,
      pakketId: true,
      pakket: { select: { leverancierId: true } },
    },
  });
  if (!contact) return { error: "Contact niet gevonden." };

  if (!canEditLeverancierPakket(user, contact.pakket.leverancierId)) {
    return { error: "Geen toegang om dit contact te verwijderen." };
  }

  try {
    await prisma.pakketContact.delete({
      where: { id: contactId },
    });

    await logAudit({
      userId: user!.id,
      userEmail: user!.email,
      actie: "delete",
      entiteit: "PakketContact",
      entiteitId: contactId,
      details: `Contact "${contact.naam}" verwijderd van pakket ${contact.pakketId}`,
    });

    return { success: true };
  } catch (err) {
    console.error("deletePakketContact error:", err);
    return { error: "Er ging iets mis bij het verwijderen van het contact." };
  }
}
