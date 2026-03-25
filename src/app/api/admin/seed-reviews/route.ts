import { NextResponse } from "next/server";
import { auth } from "@/process/auth";
import { prisma } from "@/data/prisma";

/**
 * Realistic Dutch review comments.
 */
const TOELICHTINGEN = [
  "Goede integratie met zaaksysteem.",
  "Support reageert traag, soms pas na een week.",
  "Uitstekende API-documentatie, makkelijk te koppelen.",
  "Gebruiksvriendelijke interface, medewerkers waren snel ingewerkt.",
  "Prijs-kwaliteitverhouding is redelijk, maar licentiemodel onduidelijk.",
  "Standaarden worden goed ondersteund, inclusief StUF en ZGW.",
  "Na de laatste update werkt de koppeling met ons DMS niet meer goed.",
  "Hele prettige samenwerking met de leverancier.",
  "Wij gebruiken dit pakket al jaren en zijn tevreden.",
  "De migratie van het oude systeem was complex maar goed begeleid.",
  "Regelmatig updates, het pakket wordt actief doorontwikkeld.",
  "Wij missen nog een goede rapportagemodule.",
  "Performance is prima, ook bij grote volumes.",
  "Het pakket voldoet aan onze eisen op het gebied van informatiebeveiliging.",
  "Training en documentatie kunnen beter.",
  "Goede ervaring met de helpdesk, altijd snel geholpen.",
  "De overgang naar de cloud-versie verliep probleemloos.",
  "Koppelingen met andere systemen zijn eenvoudig op te zetten.",
  "We willen graag meer zelfserviceopties voor eindgebruikers.",
  "Het dashboard biedt goed inzicht in de voortgang.",
  "De mobiele versie werkt nog niet optimaal.",
  "Uitstekend pakket voor een kleine gemeente.",
  "Na een stroeve start zijn we nu erg tevreden.",
  "De leverancier denkt goed mee over gemeentelijke processen.",
  "Implementatie duurde langer dan verwacht.",
  "Goede ondersteuning bij het aansluiten op de Haal Centraal API.",
  "Het pakket is flexibel configureerbaar, dat is een groot pluspunt.",
  "Stabiliteit kan beter, we ervaren af en toe storingen.",
  "De rapportages voldoen aan de eisen van de gemeentelijke accountant.",
  "We zijn overgestapt van een concurrent en merken een groot verschil in kwaliteit.",
];

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function correlatedSubScore(overall: number): number | null {
  if (Math.random() < 0.3) return null;
  return Math.max(1, Math.min(5, overall + randInt(-1, 1)));
}

function realisticScore(): number {
  const r = Math.random();
  if (r < 0.05) return 1;
  if (r < 0.12) return 2;
  if (r < 0.35) return 3;
  if (r < 0.70) return 4;
  return 5;
}

/**
 * POST /api/admin/seed-reviews
 * Admin-only endpoint to seed ~500 reviews across pakketten.
 */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Alleen beheerders" }, { status: 403 });
  }

  try {
    // Get OrganisatiePakket data
    const orgPakketten = await prisma.organisatiePakket.findMany({
      select: {
        organisatieId: true,
        pakketversie: { select: { pakketId: true } },
      },
    });

    const pakketOrgs = new Map<string, Set<string>>();
    for (const op of orgPakketten) {
      const pid = op.pakketversie.pakketId;
      if (!pakketOrgs.has(pid)) pakketOrgs.set(pid, new Set());
      pakketOrgs.get(pid)!.add(op.organisatieId);
    }

    // Get gemeente users
    const users = await prisma.user.findMany({
      where: { organisatieId: { not: null }, actief: true },
      select: { id: true, organisatieId: true },
    });

    const orgUserMap = new Map<string, string>();
    for (const u of users) {
      if (u.organisatieId) orgUserMap.set(u.organisatieId, u.id);
    }

    let fallbackUserId: string | null = null;
    if (users.length === 0) {
      const admin = await prisma.user.findFirst({
        where: { rollen: { has: "ADMIN" } },
        select: { id: true },
      });
      fallbackUserId = admin?.id ?? null;
    }

    // Clear existing reviews
    await prisma.pakketReview.deleteMany({});

    // Collect candidates
    const candidates: Array<{ pakketId: string; organisatieId: string }> = [];
    for (const [pakketId, orgIds] of pakketOrgs) {
      for (const orgId of orgIds) {
        candidates.push({ pakketId, organisatieId: orgId });
      }
    }

    // Shuffle
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    const TARGET = 500;
    const seen = new Set<string>();
    const reviewData: Array<{
      pakketId: string;
      organisatieId: string;
      userId: string;
      score: number;
      gebruiksgemak: number | null;
      ondersteuning: number | null;
      prijsKwaliteit: number | null;
      standaardenSupport: number | null;
      toelichting: string | null;
      anoniem: boolean;
    }> = [];

    for (const { pakketId, organisatieId } of candidates) {
      if (reviewData.length >= TARGET) break;
      const key = `${pakketId}-${organisatieId}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const userId = orgUserMap.get(organisatieId) || fallbackUserId;
      if (!userId) continue;

      const score = realisticScore();
      reviewData.push({
        pakketId,
        organisatieId,
        userId,
        score,
        gebruiksgemak: correlatedSubScore(score),
        ondersteuning: correlatedSubScore(score),
        prijsKwaliteit: correlatedSubScore(score),
        standaardenSupport: correlatedSubScore(score),
        toelichting:
          Math.random() < 0.3
            ? TOELICHTINGEN[Math.floor(Math.random() * TOELICHTINGEN.length)]
            : null,
        anoniem: Math.random() < 0.2,
      });
    }

    const result = await prisma.pakketReview.createMany({
      data: reviewData,
      skipDuplicates: true,
    });

    return NextResponse.json({
      message: `${result.count} reviews aangemaakt`,
      count: result.count,
    });
  } catch (err) {
    console.error("Seed reviews failed:", err);
    return NextResponse.json(
      { error: "Seed failed", details: String(err) },
      { status: 500 }
    );
  }
}
