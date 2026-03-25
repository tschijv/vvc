import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

// Realistic Dutch first-name initials and surnames for deterministic fake names
const INITIALS = [
  "J.", "M.", "A.", "P.", "W.", "H.", "C.", "R.", "B.", "E.",
  "K.", "L.", "T.", "S.", "N.", "D.", "F.", "G.", "I.", "V.",
];

const TUSSENVOEGSELS = [
  "de", "van", "van de", "van den", "van der", "den", "ter", "te",
  "in 't", "op de", "van het", "uit de",
];

const ACHTERNAMEN = [
  "Vries", "Berg", "Boer", "Visser", "Meulen", "Bakker", "Groot",
  "Janssen", "Hendriks", "Dekker", "Bruin", "Jong", "Smit", "Kramer",
  "Bos", "Willemsen", "Mulder", "Graaf", "Kok", "Peters",
  "Hoek", "Linden", "Dijkstra", "Leeuwen", "Rijn", "Dijk",
  "Heuvel", "Meer", "Vliet", "Wal", "Broek", "Zee",
  "Dam", "Ven", "Horst", "Beek", "Veen", "Wijk",
  "Kampen", "Poel",
];

/**
 * Simple deterministic hash from a string, producing a positive integer.
 */
function simpleHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * Generate a realistic fake Dutch name based on the gemeente name (deterministic).
 */
function generateFakeName(gemeenteNaam: string): string {
  const h1 = simpleHash(gemeenteNaam);
  const h2 = simpleHash(gemeenteNaam + "_t");
  const h3 = simpleHash(gemeenteNaam + "_a");
  const initiaal = INITIALS[Math.abs(h1) % INITIALS.length];
  const tussenvoegsel = TUSSENVOEGSELS[Math.abs(h2) % TUSSENVOEGSELS.length];
  const achternaam = ACHTERNAMEN[Math.abs(h3) % ACHTERNAMEN.length];
  return `${initiaal} ${tussenvoegsel} ${achternaam}`;
}

/**
 * Generate a fake email based on the fake name and gemeente name (deterministic).
 */
function generateFakeEmail(fakeName: string, gemeenteNaam: string): string {
  // "J. van de Vries" -> "j.vries"
  const nameParts = fakeName.toLowerCase().replace(/\./g, "").trim().split(/\s+/);
  const initiaal = nameParts[0] || "x";
  const achternaam = nameParts[nameParts.length - 1] || "onbekend";
  const localPart = `${initiaal}.${achternaam}`;

  // Pak alleen het eerste woord van de gemeentenaam
  // "Barendrecht, Ridderkerk" -> "barendrecht"
  // "'s-Gravenhage" -> "s-gravenhage"
  const eersteNaam = gemeenteNaam.split(/[,&]/)[0].trim()
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  return `${localPart}@${eersteNaam}.nl`;
}

/**
 * Generate a fake Dutch phone number (deterministic based on gemeente name).
 */
function generateFakePhone(gemeenteNaam: string): string {
  const h = simpleHash(gemeenteNaam + "_telefoon");
  const prefix = "088";
  const part1 = String(100 + (h % 900)).padStart(3, "0");
  const part2 = String(1000 + ((h >> 10) % 9000)).padStart(4, "0");
  return `${prefix}-${part1} ${part2}`;
}

export async function POST() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  try {
    const gemeenten = await prisma.organisatie.findMany({
      select: { id: true, naam: true, contactpersoon: true, email: true, telefoon: true },
    });

    let updated = 0;

    for (const gemeente of gemeenten) {
      const fakeName = generateFakeName(gemeente.naam);
      const fakeEmail = generateFakeEmail(fakeName, gemeente.naam);
      const fakePhone = generateFakePhone(gemeente.naam);

      await prisma.organisatie.update({
        where: { id: gemeente.id },
        data: {
          contactpersoon: fakeName,
          email: fakeEmail,
          telefoon: fakePhone,
          // website is kept as-is (public data)
        },
      });

      updated++;
    }

    return NextResponse.json({
      success: true,
      message: `${updated} gemeenten geanonimiseerd`,
      updated,
      total: gemeenten.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Anonymisatie fout:", error);
    return NextResponse.json(
      {
        error: "Anonymisatie mislukt",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
