import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL || "" }),
});

/** Realistic Dutch review comments */
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

/**
 * Generate a random integer between min and max (inclusive).
 */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a sub-score loosely correlated with the overall score.
 * Returns null ~30% of the time to simulate optional sub-scores.
 */
function correlatedSubScore(overallScore: number): number | null {
  if (Math.random() < 0.3) return null;
  const offset = randInt(-1, 1);
  return Math.max(1, Math.min(5, overallScore + offset));
}

/**
 * Generate a realistic overall score (weighted toward 3-5).
 */
function realisticScore(): number {
  const r = Math.random();
  if (r < 0.05) return 1;
  if (r < 0.12) return 2;
  if (r < 0.35) return 3;
  if (r < 0.70) return 4;
  return 5;
}

export async function seedReviews() {
  console.log("Fetching existing data...");

  // Get all OrganisatiePakket entries to find which organisaties use which pakketten
  const orgPakketten = await prisma.organisatiePakket.findMany({
    select: {
      organisatieId: true,
      pakketversie: {
        select: { pakketId: true },
      },
    },
  });

  // Build a map: pakketId -> set of organisatieIds that use it
  const pakketOrgs = new Map<string, Set<string>>();
  for (const op of orgPakketten) {
    const pakketId = op.pakketversie.pakketId;
    if (!pakketOrgs.has(pakketId)) pakketOrgs.set(pakketId, new Set());
    pakketOrgs.get(pakketId)!.add(op.organisatieId);
  }

  // Get all users with an organisatieId (gemeente users)
  const users = await prisma.user.findMany({
    where: { organisatieId: { not: null }, actief: true },
    select: { id: true, organisatieId: true },
  });

  // Build a map: organisatieId -> userId
  const orgUserMap = new Map<string, string>();
  for (const u of users) {
    if (u.organisatieId) orgUserMap.set(u.organisatieId, u.id);
  }

  // If not enough users, get or create a fallback admin user
  let fallbackUserId: string | null = null;
  if (users.length === 0) {
    const admin = await prisma.user.findFirst({
      where: { rollen: { has: "ADMIN" } },
      select: { id: true },
    });
    fallbackUserId = admin?.id ?? null;
  }

  // Delete existing reviews first
  const deleted = await prisma.pakketReview.deleteMany({});
  console.log(`Deleted ${deleted.count} existing reviews.`);

  let created = 0;
  const TARGET = 500;

  // Collect all candidate (pakketId, organisatieId) pairs
  const candidates: Array<{ pakketId: string; organisatieId: string }> = [];
  for (const [pakketId, orgIds] of pakketOrgs) {
    for (const orgId of orgIds) {
      candidates.push({ pakketId, organisatieId: orgId });
    }
  }

  // Shuffle candidates
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  // Create reviews from shuffled candidates
  const reviewData = [];
  const seen = new Set<string>();

  for (const { pakketId, organisatieId } of candidates) {
    if (created >= TARGET) break;
    const key = `${pakketId}-${organisatieId}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const userId = orgUserMap.get(organisatieId) || fallbackUserId;
    if (!userId) continue;

    const score = realisticScore();
    const hasToelichting = Math.random() < 0.3;
    const isAnoniem = Math.random() < 0.2;

    reviewData.push({
      pakketId,
      organisatieId,
      userId,
      score,
      gebruiksgemak: correlatedSubScore(score),
      ondersteuning: correlatedSubScore(score),
      prijsKwaliteit: correlatedSubScore(score),
      standaardenSupport: correlatedSubScore(score),
      toelichting: hasToelichting
        ? TOELICHTINGEN[Math.floor(Math.random() * TOELICHTINGEN.length)]
        : null,
      anoniem: isAnoniem,
    });

    created++;
  }

  // Batch create
  if (reviewData.length > 0) {
    // Use createMany for efficiency
    const result = await prisma.pakketReview.createMany({
      data: reviewData,
      skipDuplicates: true,
    });
    console.log(`Created ${result.count} reviews across pakketten.`);
  } else {
    console.log("No candidates found for reviews. Make sure OrganisatiePakket data exists.");
  }

  return created;
}

// Run directly if executed as a script
if (require.main === module) {
  seedReviews()
    .then((count) => {
      console.log(`Seed complete: ${count} reviews created.`);
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seed failed:", err);
      process.exit(1);
    });
}
