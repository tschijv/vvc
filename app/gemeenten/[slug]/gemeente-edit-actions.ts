"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser, canEditGemeentePortfolio } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

export async function updateGemeenteContact(
  gemeenteId: string,
  data: {
    contactpersoon: string;
    email: string;
    telefoon: string;
    website: string;
  },
) {
  const user = await getSessionUser();
  if (!user) throw new Error("Niet ingelogd");

  // Look up gemeente slug for auth check
  const gemeente = await prisma.organisatie.findUnique({
    where: { id: gemeenteId },
    select: { slug: true },
  });
  if (!gemeente) throw new Error("Gemeente niet gevonden");

  if (!canEditGemeentePortfolio(user, gemeente.slug)) {
    throw new Error("Geen rechten om deze gemeente te bewerken");
  }

  await prisma.organisatie.update({
    where: { id: gemeenteId },
    data: {
      contactpersoon: data.contactpersoon.trim() || null,
      email: data.email.trim() || null,
      telefoon: data.telefoon.trim() || null,
      website: data.website.trim() || null,
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "GEMEENTE_CONTACT_UPDATED",
      entityType: "Gemeente",
      entityId: gemeenteId,
      details: `Contactgegevens bijgewerkt door ${user.email}`,
    },
  });

  revalidatePath(`/gemeenten/${gemeente.slug}`);
  return { success: true };
}
