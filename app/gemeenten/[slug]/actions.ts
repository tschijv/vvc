"use server";

import Anthropic from "@anthropic-ai/sdk";
import { getSessionUser } from "@/lib/auth-helpers";
import {
  getGemeentePakketten,
  getGemeenteDashboardStats,
  getGemeenteKoppelingen,
} from "@/lib/services/gemeente";
import { prisma } from "@/lib/prisma";

const ALLOWED_ROLES = [
  "ADMIN",
  "GEMEENTE_BEHEERDER",
  "GEMEENTE_RAADPLEGER",
  "KING_BEHEERDER",
  "KING_RAADPLEGER",
];

export async function getAIAdvies(gemeenteId: string, vraag: string) {
  const user = await getSessionUser();
  if (!user || !ALLOWED_ROLES.includes(user.role)) {
    throw new Error("Geen toegang tot AI-advisering");
  }

  if (!vraag.trim()) {
    throw new Error("Stel een vraag");
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("AI-advisering is niet geconfigureerd");
  }

  // Haal alle context op
  const [gemeente, pakketten, stats, koppelingen] = await Promise.all([
    prisma.gemeente.findUnique({
      where: { id: gemeenteId },
      select: { naam: true, cbsCode: true, progress: true },
    }),
    getGemeentePakketten(gemeenteId),
    getGemeenteDashboardStats(gemeenteId),
    getGemeenteKoppelingen(gemeenteId),
  ]);

  if (!gemeente) {
    throw new Error("Gemeente niet gevonden");
  }

  // Bouw context-tekst
  const pakkettenTekst = pakketten
    .map((gp) => {
      const pv = gp.pakketversie;
      const refcomps = pv.referentiecomponenten
        .map((r) => r.referentiecomponent.naam)
        .join(", ");
      const standaarden = pv.standaarden
        .map(
          (s) =>
            `${s.standaardversie.standaard.naam} ${s.standaardversie.naam}`
        )
        .join(", ");
      return `- ${pv.pakket.naam} (${pv.pakket.leverancier.naam}) v${pv.naam} — status: ${gp.status || pv.status}${refcomps ? ` | refcomponenten: ${refcomps}` : ""}${standaarden ? ` | standaarden: ${standaarden}` : ""}${gp.maatwerk ? ` | maatwerk: ${gp.maatwerk}` : ""}`;
    })
    .join("\n");

  const koppelingenTekst = koppelingen
    .slice(0, 30) // Beperk voor context-limiet
    .map(
      (k) =>
        `- ${k.bron} ${k.richting} ${k.doel} (${k.status || "onbekend"})${k.standaard ? ` [${k.standaard}]` : ""}`
    )
    .join("\n");

  const systemPrompt = `Je bent een deskundige ICT-adviseur voor Nederlandse gemeenten, gespecialiseerd in applicatieportfolio-management en de GEMMA-architectuur. Je geeft advies op basis van de data uit de VNG Voorzieningencatalogus.

Antwoord in het Nederlands. Wees concreet en praktisch. Verwijs naar specifieke pakketten, leveranciers en standaarden uit de data. Gebruik geen markdown-kopjes, schrijf vloeiende tekst met alinea's.

## Context: ${gemeente.naam}${gemeente.cbsCode ? ` (CBS: ${gemeente.cbsCode})` : ""}
Voortgang: ${gemeente.progress}%

### Statistieken
- Totaal pakketten: ${pakketten.length}
- Compliant met standaarden: ${stats.compliantCount}
- Einde ondersteuning: ${stats.eindeOndersteuningCount}
- SaaS-alternatieven beschikbaar: ${stats.saasAlternatievenCount}
- Referentiecomponenten met meerdere pakketten: ${stats.refcompMetMeerderePakketten}
- Koppelingen: ${koppelingen.length}

### Applicatieportfolio
${pakkettenTekst || "Geen pakketten geregistreerd."}

### Koppelingen (top ${Math.min(koppelingen.length, 30)})
${koppelingenTekst || "Geen koppelingen geregistreerd."}`;

  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: vraag }],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  return textBlock?.text || "Geen antwoord ontvangen.";
}
