import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const p = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL || "" }),
});

const SAMENWERKINGEN = [
  {
    naam: "Drechtsteden",
    type: "Shared Service",
    gemeenten: ["Dordrecht", "Zwijndrecht", "Sliedrecht", "Papendrecht", "Hendrik-Ido-Ambacht", "Alblasserdam"],
  },
  {
    naam: "BghU (Belastingsamenwerking gemeenten en hoogheemraadschap Utrecht)",
    type: "Belastingen",
    gemeenten: ["Utrecht", "De Bilt", "Bunnik", "Wijk bij Duurstede", "Zeist", "Nieuwegein", "IJsselstein", "Lopik", "Montfoort"],
  },
  {
    naam: "GR IJsselland",
    type: "Veiligheidsregio",
    gemeenten: ["Zwolle", "Deventer", "Kampen", "Raalte", "Olst-Wijhe", "Ommen", "Hardenberg", "Dalfsen", "Staphorst", "Zwartewaterland", "Steenwijkerland"],
  },
  {
    naam: "Servicepunt71",
    type: "Shared Service",
    gemeenten: ["Leiden", "Leiderdorp", "Oegstgeest", "Zoeterwoude"],
  },
  {
    naam: "BSOB (Belastingsamenwerking Oost-Brabant)",
    type: "Belastingen",
    gemeenten: ["Eindhoven", "Helmond", "Geldrop-Mierlo", "Nuenen, Gerwen en Nederwetten", "Son en Breugel", "Best", "Veldhoven", "Waalre", "Eersel", "Bergeijk", "Bladel", "Reusel-De Mierden"],
  },
  {
    naam: "ISZW (Informatie Samenwerking Zuid-West)",
    type: "ICT Samenwerking",
    gemeenten: ["Middelburg", "Vlissingen", "Veere", "Schouwen-Duiveland", "Goes", "Noord-Beveland", "Kapelle", "Borsele", "Reimerswaal"],
  },
  {
    naam: "Metropoolregio Eindhoven",
    type: "Economische samenwerking",
    gemeenten: ["Eindhoven", "Helmond", "Veldhoven", "Geldrop-Mierlo", "Best", "Son en Breugel", "Nuenen, Gerwen en Nederwetten", "Waalre", "Eersel", "Bergeijk", "Bladel", "Reusel-De Mierden", "Oirschot", "Laarbeek", "Asten", "Someren", "Deurne", "Gemert-Bakel", "Cranendonck", "Heeze-Leende", "Valkenswaard"],
  },
  {
    naam: "VNG Realisatie",
    type: "Kennisdeling",
    gemeenten: ["Amsterdam", "Rotterdam", "'s-Gravenhage", "Utrecht", "Eindhoven", "Groningen", "Tilburg", "Almere", "Breda", "Nijmegen"],
  },
  {
    naam: "Regio Groningen-Assen",
    type: "Economische samenwerking",
    gemeenten: ["Groningen", "Assen", "Midden-Groningen", "Westerkwartier", "Het Hogeland", "Tynaarlo", "Noordenveld", "Aa en Hunze", "Veendam", "Oldambt", "Stadskanaal", "Pekela"],
  },
  {
    naam: "Parkstad Limburg",
    type: "Stadsregio",
    gemeenten: ["Heerlen", "Kerkrade", "Landgraaf", "Brunssum", "Voerendaal", "Simpelveld", "Beekdaelen"],
  },
];

async function main() {
  const organisaties = await p.organisatie.findMany({ select: { id: true, naam: true } });
  const orgMap = new Map(organisaties.map((o) => [o.naam.toLowerCase(), o.id]));

  console.log(`${organisaties.length} organisaties in database`);
  let swCreated = 0;
  let koppelingen = 0;

  for (const sw of SAMENWERKINGEN) {
    const samenwerking = await p.samenwerking.upsert({
      where: { id: sw.naam }, // will fail, use create
      update: { naam: sw.naam, type: sw.type },
      create: { naam: sw.naam, type: sw.type },
    }).catch(async () => {
      // upsert on naam doesn't work without unique constraint, use findFirst + create
      const existing = await p.samenwerking.findFirst({ where: { naam: sw.naam } });
      if (existing) return existing;
      return p.samenwerking.create({ data: { naam: sw.naam, type: sw.type } });
    });

    swCreated++;

    for (const gemeenteNaam of sw.gemeenten) {
      const orgId = orgMap.get(gemeenteNaam.toLowerCase());
      if (!orgId) {
        console.log(`  ⚠ "${gemeenteNaam}" niet gevonden in database`);
        continue;
      }
      try {
        await p.samenwerkingOrganisatie.upsert({
          where: {
            samenwerkingId_organisatieId: {
              samenwerkingId: samenwerking.id,
              organisatieId: orgId,
            },
          },
          update: {},
          create: {
            samenwerkingId: samenwerking.id,
            organisatieId: orgId,
          },
        });
        koppelingen++;
      } catch {}
    }
    console.log(`  ✅ ${sw.naam} — ${sw.gemeenten.length} gemeenten`);
  }

  console.log(`\nKlaar: ${swCreated} samenwerkingen, ${koppelingen} koppelingen`);
  await p.$disconnect();
}

main().catch(console.error);
