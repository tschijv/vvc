import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

const APPLICATIEFUNCTIES = [
  { naam: "Aanmaken, delen, verwijderen en wijzigen van documenten", beschrijving: "Functionaliteit voor documentbeheer: aanmaken, delen, verwijderen en wijzigen van documenten." },
  { naam: "Aanmaken, raadplegen, bijwerken en verwijderen van afspraken", beschrijving: "Functionaliteit voor afsprakenbeheer: CRUD-operaties op afspraken." },
  { naam: "Analyseren van gegevens", beschrijving: "Functionaliteit voor het analyseren van gegevens en datasets." },
  { naam: "Beantwoorden van zoekvragen", beschrijving: "Functionaliteit voor het beantwoorden van zoekvragen vanuit informatiesystemen." },
  { naam: "Genereren van berichten mbt afspraken", beschrijving: "Functionaliteit voor het automatisch genereren van berichten over afspraken (herinneringen, bevestigingen)." },
  { naam: "Indienen aanvraag en tonen ontvangstbevestiging", beschrijving: "Functionaliteit voor het indienen van aanvragen en het tonen van ontvangstbevestigingen." },
  { naam: "Integreren van gegevens", beschrijving: "Functionaliteit voor het integreren en samenvoegen van gegevens uit meerdere bronnen." },
  { naam: "Maken en tonen van rapportages", beschrijving: "Functionaliteit voor het genereren en presenteren van rapportages en overzichten." },
  { naam: "Maken en tonen van trendanalyses", beschrijving: "Functionaliteit voor het analyseren en visualiseren van trends over tijd." },
  { naam: "Ondersteunen van vraag-antwoord dialoog", beschrijving: "Functionaliteit voor het ondersteunen van interactieve vraag-antwoord dialogen." },
  { naam: "Tonen en bijwerken van documenten", beschrijving: "Functionaliteit voor het raadplegen en bewerken van documenten." },
  { naam: "Tonen en bijwerken zaakgegevens", beschrijving: "Functionaliteit voor het raadplegen en bijwerken van zaakgegevens." },
  { naam: "Tonen en zoeken van informatieobjecten", beschrijving: "Functionaliteit voor het doorzoeken en tonen van informatieobjecten." },
  { naam: "Tonen van standaard selecties", beschrijving: "Functionaliteit voor het tonen van voorgedefinieerde selecties en overzichten." },
  { naam: "Uitwisselen van berichten met ketenpartners", beschrijving: "Functionaliteit voor berichtenverkeer met externe ketenpartners." },
  { naam: "Verwerven en transformeren van data", beschrijving: "Functionaliteit voor het ophalen en transformeren van data uit externe bronnen." },
];

export async function POST() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  try {
    let created = 0;
    let existing = 0;

    for (const af of APPLICATIEFUNCTIES) {
      const exists = await prisma.applicatiefunctie.findFirst({
        where: { naam: af.naam },
      });

      if (!exists) {
        await prisma.applicatiefunctie.create({
          data: { naam: af.naam, beschrijving: af.beschrijving },
        });
        created++;
      } else {
        existing++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `${created} applicatiefuncties aangemaakt, ${existing} bestonden al`,
      total: APPLICATIEFUNCTIES.length,
    });
  } catch (error) {
    console.error("Seed applicatiefuncties error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
