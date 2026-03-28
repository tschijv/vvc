"use server";

import Anthropic from "@anthropic-ai/sdk";
import { getSessionUser } from "@/process/auth-helpers";
import {
  getGemeentePakketten,
  getGemeenteDashboardStats,
  getGemeenteKoppelingen,
} from "@/service/gemeente";
import { prisma } from "@/data/prisma";

const ALLOWED_ROLES = [
  "ADMIN",
  "BEHEERDER",
  "RAADPLEGER",
  "KING_BEHEERDER",
  "KING_RAADPLEGER",
];

type AIResult = { ok: true; text: string } | { ok: false; error: string };

export async function getAIAdvies(organisatieId: string, vraag: string): Promise<AIResult> {
  try {
    const user = await getSessionUser();
    if (!user || !ALLOWED_ROLES.includes(user.role)) {
      return { ok: false, error: "403: Geen toegang tot AI-advisering" };
    }

    if (!vraag.trim()) {
      return { ok: false, error: "Stel een vraag" };
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return { ok: false, error: "config: ANTHROPIC_API_KEY is niet geconfigureerd" };
    }

    // Haal alle context op
    const [gemeente, pakketten, stats, koppelingen] = await Promise.all([
      prisma.organisatie.findUnique({
        where: { id: organisatieId },
        select: { naam: true, cbsCode: true, progress: true },
      }),
      getGemeentePakketten(organisatieId),
      getGemeenteDashboardStats(organisatieId),
      getGemeenteKoppelingen(organisatieId),
    ]);

    if (!gemeente) {
      return { ok: false, error: "Organisatie niet gevonden" };
    }

    // Bouw context-tekst
    const pakkettenTekst = pakketten
      .map((gp) => {
        const pv = gp.pakketversie;
        const refcomps = (pv.pakket.referentiecomponenten ?? [])
          .map((r) => r.referentiecomponent.naam)
          .join(", ");
        const standaarden = (pv.pakket.standaarden ?? [])
          .map(
            (s) =>
              `${s.standaardversie?.standaard?.naam ?? ""} ${s.standaardversie?.naam ?? ""}`.trim()
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

Antwoord in het Nederlands. Wees concreet en praktisch. Verwijs naar specifieke pakketten, leveranciers en standaarden uit de data.

Formatteer je antwoord als HTML-fragmenten (geen volledige pagina). Gebruik:
- <h3> voor sectiekoppen
- <p> voor alinea's
- <ul>/<li> voor opsommingen
- <strong> voor nadruk op pakketnamen, leveranciers en standaarden
- <table class="ai-table"><thead><tr><th>...</th></tr></thead><tbody><tr><td>...</td></tr></tbody></table> voor vergelijkingen of overzichten
- <span class="ai-status-rood">, <span class="ai-status-oranje">, <span class="ai-status-groen"> voor statusindicatoren (rood=actie vereist, oranje=aandacht, groen=goed)

Geef GEEN markdown terug, alleen schone HTML.

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
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: vraag }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    return { ok: true, text: textBlock?.text || "Geen antwoord ontvangen." };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = (err as { status?: number }).status;
    console.error("AI-adviseur error:", { status, message: msg });
    return { ok: false, error: `${status || "unknown"}: ${msg}` };
  }
}
