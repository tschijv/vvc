import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const p = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL || "" }),
});

const DEMO_NOTIFICATIES = [
  {
    titel: "Welkom bij de Voorzieningencatalogus",
    bericht: "Uw account is succesvol aangemaakt. Ontdek alle functies van het platform.",
    type: "success",
    link: "/info/voor-gemeenten",
  },
  {
    titel: "Nieuwe standaardversie beschikbaar",
    bericht: "StUF-ZKN 3.10 is toegevoegd aan de catalogus. Controleer of uw pakketten compliant zijn.",
    type: "info",
    link: "/standaarden",
  },
  {
    titel: "Datakwaliteitscontrole gepland",
    bericht: "Op 1 april vindt een controle plaats op de volledigheid van pakketgegevens. Zorg dat uw gegevens actueel zijn.",
    type: "warning",
    link: "/pakketten",
  },
  {
    titel: "Import succesvol afgerond",
    bericht: "Het importbestand met 342 gemeentepakketten is succesvol verwerkt.",
    type: "success",
  },
  {
    titel: "Onderhoud gepland",
    bericht: "Op zaterdag 22 maart is er gepland onderhoud van 02:00 tot 06:00 uur. De catalogus is dan niet beschikbaar.",
    type: "warning",
  },
  {
    titel: "Nieuwe leverancier geregistreerd",
    bericht: "Leverancier 'CloudSolutions BV' heeft zich aangemeld en wacht op goedkeuring.",
    type: "info",
    link: "/admin/registraties",
  },
  {
    titel: "Sync met GEMMA mislukt",
    bericht: "De automatische synchronisatie met GEMMA Online is mislukt. Controleer de verbinding.",
    type: "error",
    link: "/admin",
  },
  {
    titel: "3 pakketten zonder actieve versie",
    bericht: "Er zijn 3 pakketten gevonden zonder een actieve versie. Dit kan wijzen op verouderde gegevens.",
    type: "warning",
    link: "/pakketten",
  },
];

async function main() {
  // Find the admin user
  const admin = await p.user.findFirst({
    where: { rollen: { has: "ADMIN" } },
  });

  if (!admin) {
    console.log("Geen admin-gebruiker gevonden. Seed overgeslagen.");
    await p.$disconnect();
    return;
  }

  console.log(`Seeding notificaties voor ${admin.email}...`);

  // Create demo notifications with staggered dates
  const now = new Date();
  for (let i = 0; i < DEMO_NOTIFICATIES.length; i++) {
    const n = DEMO_NOTIFICATIES[i];
    const createdAt = new Date(now.getTime() - i * 3 * 60 * 60 * 1000); // 3 hours apart
    await p.notificatie.create({
      data: {
        userId: admin.id,
        titel: n.titel,
        bericht: n.bericht,
        type: n.type,
        link: n.link || null,
        gelezen: i >= 4, // first 4 unread, rest read
        createdAt,
      },
    });
    console.log(`  + ${n.titel}`);
  }

  const total = await p.notificatie.count({ where: { userId: admin.id } });
  console.log(`\nDone: ${total} notificaties voor ${admin.email}`);
  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
