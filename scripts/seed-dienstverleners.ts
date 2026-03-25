import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const p = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL || "" }),
});

const DIENSTVERLENERS = [
  {
    naam: "DigiConnect Advies",
    slug: "digiconnect-advies",
    beschrijving: "Adviesbureau gespecialiseerd in digitale transformatie voor gemeenten.",
    type: "Advies",
    specialisaties: "Zaakgericht werken,Informatiebeveiliging,BIO",
    contactpersoon: "Jan de Vries",
    email: "info@digiconnect-advies.nl",
    telefoon: "030-1234567",
    website: "https://www.digiconnect-advies.nl",
    regio: "Landelijk",
  },
  {
    naam: "GemeenteIT Implementaties",
    slug: "gemeenteit-implementaties",
    beschrijving: "Implementatiepartner voor zaaksystemen en documentbeheer bij gemeenten.",
    type: "Implementatie",
    specialisaties: "Zaaksystemen,Documentbeheer,Migratie",
    contactpersoon: "Marieke Bakker",
    email: "info@gemeenteit.nl",
    telefoon: "020-9876543",
    website: "https://www.gemeenteit.nl",
    regio: "Landelijk",
  },
  {
    naam: "Overheid Beheer BV",
    slug: "overheid-beheer",
    beschrijving: "Beheerdiensten voor applicatielandschappen van overheden.",
    type: "Beheer",
    specialisaties: "Applicatiebeheer,Monitoring,SLA management",
    contactpersoon: "Peter Jansen",
    email: "contact@overheidbeheer.nl",
    telefoon: "070-5551234",
    website: "https://www.overheidbeheer.nl",
    regio: "Landelijk",
  },
  {
    naam: "HostNederland",
    slug: "hostnederland",
    beschrijving: "Hosting en infrastructuur specifiek voor overheidsorganisaties.",
    type: "Hosting",
    specialisaties: "Cloud hosting,Managed services,Backup",
    contactpersoon: "Annemarie Smit",
    email: "sales@hostnederland.nl",
    telefoon: "088-4443210",
    website: "https://www.hostnederland.nl",
    regio: "Landelijk",
  },
  {
    naam: "Lokaal Digitaal Training",
    slug: "lokaal-digitaal-training",
    beschrijving: "Trainingen en workshops voor medewerkers van gemeenten op het gebied van digitalisering.",
    type: "Training",
    specialisaties: "GEMMA,Digitale vaardigheden,Informatiebeveiliging",
    contactpersoon: "Henk van Dam",
    email: "info@lokaaldigitaal.nl",
    telefoon: "040-6667788",
    website: "https://www.lokaaldigitaal.nl",
    regio: "Regionaal",
  },
  {
    naam: "Datamigratie Experts",
    slug: "datamigratie-experts",
    beschrijving: "Gespecialiseerd in datamigratie bij systeemwisselingen in de overheid.",
    type: "Implementatie",
    specialisaties: "Datamigratie,ETL,Datakwaliteit",
    contactpersoon: "Sandra Mulder",
    email: "info@datamigratieexperts.nl",
    telefoon: "010-3334455",
    website: "https://www.datamigratieexperts.nl",
    regio: "Landelijk",
  },
  {
    naam: "Zuidwest Advies & Beheer",
    slug: "zuidwest-advies-beheer",
    beschrijving: "Regionale dienstverlener voor gemeenten in Zeeland en West-Brabant.",
    type: "Advies",
    specialisaties: "Inkoop,Aanbesteding,Beheer",
    contactpersoon: "Kees Willems",
    email: "info@zuidwestadvies.nl",
    telefoon: "0118-112233",
    website: "https://www.zuidwestadvies.nl",
    regio: "Regionaal",
  },
  {
    naam: "VeiligOnline Consultancy",
    slug: "veiligonline-consultancy",
    beschrijving: "Consultancy op het gebied van informatiebeveiliging en privacy voor de publieke sector.",
    type: "Advies",
    specialisaties: "BIO,AVG,Pentesting,ISMS",
    contactpersoon: "Eva de Groot",
    email: "info@veiligonline.nl",
    telefoon: "085-9998877",
    website: "https://www.veiligonline.nl",
    regio: "Landelijk",
  },
  {
    naam: "Friesland ICT Services",
    slug: "friesland-ict-services",
    beschrijving: "ICT-dienstverlener voor gemeenten in Friesland.",
    type: "Beheer",
    specialisaties: "Werkplekbeheer,Netwerken,Helpdesk",
    contactpersoon: "Sjoerd Dijkstra",
    email: "info@frieslandict.nl",
    telefoon: "058-2223344",
    website: "https://www.frieslandict.nl",
    regio: "Lokaal",
  },
  {
    naam: "Integratieplatform Nederland",
    slug: "integratieplatform-nederland",
    beschrijving: "Specialist in koppelingen en integratieplatformen voor overheden.",
    type: "Implementatie",
    specialisaties: "API management,Digikoppeling,StUF,Integratie",
    contactpersoon: "Rob Vermeer",
    email: "info@integratieplatform.nl",
    telefoon: "030-7778899",
    website: "https://www.integratieplatform.nl",
    regio: "Landelijk",
  },
];

const CLOUDPROVIDERS = [
  {
    naam: "CloudNL",
    slug: "cloudnl",
    beschrijving: "Nederlandse cloud-provider met datacenters in Amsterdam en Rotterdam.",
    type: "IaaS",
    certificeringen: "ISO 27001,BIO,SOC 2",
    datacenterLocatie: "Nederland",
    contactpersoon: "Tom Bakker",
    email: "info@cloudnl.nl",
    telefoon: "020-1112233",
    website: "https://www.cloudnl.nl",
  },
  {
    naam: "GovCloud Services",
    slug: "govcloud-services",
    beschrijving: "Overheidscloud met BIO-certificering en dataopslag binnen Nederland.",
    type: "PaaS",
    certificeringen: "ISO 27001,BIO,NEN 7510,SOC 2",
    datacenterLocatie: "Nederland",
    contactpersoon: "Lisa van Dijk",
    email: "info@govcloud.nl",
    telefoon: "070-4445566",
    website: "https://www.govcloud.nl",
  },
  {
    naam: "EuroHosting",
    slug: "eurohosting",
    beschrijving: "Europese hostingprovider met focus op publieke sector en compliance.",
    type: "Hosting",
    certificeringen: "ISO 27001,SOC 2",
    datacenterLocatie: "EU",
    contactpersoon: "Michael Brouwer",
    email: "info@eurohosting.eu",
    telefoon: "088-7778899",
    website: "https://www.eurohosting.eu",
  },
  {
    naam: "SaaS Gemeente Platform",
    slug: "saas-gemeente-platform",
    beschrijving: "SaaS-platform specifiek ontworpen voor gemeentelijke processen.",
    type: "SaaS",
    certificeringen: "ISO 27001,BIO,NEN 7510",
    datacenterLocatie: "Nederland",
    contactpersoon: "Nadia Visser",
    email: "info@saasgemeinteplatform.nl",
    telefoon: "030-6669900",
    website: "https://www.saasgemeenteplatform.nl",
  },
  {
    naam: "SecureStack Nederland",
    slug: "securestack-nederland",
    beschrijving: "Beveiligde infrastructuur en managed kubernetes voor overheidsapplicaties.",
    type: "PaaS",
    certificeringen: "ISO 27001,BIO,SOC 2,NEN 7510",
    datacenterLocatie: "Nederland",
    contactpersoon: "Jeroen Kok",
    email: "info@securestack.nl",
    telefoon: "085-1234567",
    website: "https://www.securestack.nl",
  },
];

async function main() {
  console.log("Seeding dienstverleners...");

  for (const dv of DIENSTVERLENERS) {
    await p.dienstverlener.upsert({
      where: { slug: dv.slug },
      update: dv,
      create: dv,
    });
  }

  console.log(`  ${DIENSTVERLENERS.length} dienstverleners aangemaakt/bijgewerkt`);

  console.log("Seeding cloudproviders...");

  for (const cp of CLOUDPROVIDERS) {
    await p.cloudprovider.upsert({
      where: { slug: cp.slug },
      update: cp,
      create: cp,
    });
  }

  console.log(`  ${CLOUDPROVIDERS.length} cloudproviders aangemaakt/bijgewerkt`);

  // Link dienstverleners to pakketten AND organisaties
  const pakketten = await p.pakket.findMany({ select: { id: true } });
  const organisaties = await p.organisatie.findMany({ select: { id: true } });
  const dienstverleners = await p.dienstverlener.findMany({ select: { id: true } });
  const cloudproviders = await p.cloudprovider.findMany({ select: { id: true } });

  console.log(`  Linking: ${dienstverleners.length} DVs, ${cloudproviders.length} CPs, ${pakketten.length} pakketten, ${organisaties.length} organisaties`);

  // Each dienstverlener gets 5-20 random pakketten
  let dvPakLinked = 0;
  for (const dv of dienstverleners) {
    const numPak = Math.floor(Math.random() * 16) + 5;
    const shuffled = [...pakketten].sort(() => Math.random() - 0.5).slice(0, numPak);
    for (const pak of shuffled) {
      try {
        await p.dienstverlenerPakket.upsert({
          where: { dienstverlenerId_pakketId: { dienstverlenerId: dv.id, pakketId: pak.id } },
          update: {},
          create: { dienstverlenerId: dv.id, pakketId: pak.id },
        });
        dvPakLinked++;
      } catch {}
    }
  }
  console.log(`  ${dvPakLinked} dienstverlener-pakket koppelingen`);

  // Each dienstverlener gets 10-50 random organisatie-klanten
  let dvOrgLinked = 0;
  for (const dv of dienstverleners) {
    const numOrg = Math.min(organisaties.length, Math.floor(Math.random() * 41) + 10);
    const shuffled = [...organisaties].sort(() => Math.random() - 0.5).slice(0, numOrg);
    for (const org of shuffled) {
      try {
        await p.dienstverlenerOrganisatie.upsert({
          where: { dienstverlenerId_organisatieId: { dienstverlenerId: dv.id, organisatieId: org.id } },
          update: {},
          create: { dienstverlenerId: dv.id, organisatieId: org.id },
        });
        dvOrgLinked++;
      } catch {}
    }
  }
  console.log(`  ${dvOrgLinked} dienstverlener-organisatie koppelingen`);

  // Each cloudprovider gets 10-40 random pakketten
  let cpPakLinked = 0;
  for (const cp of cloudproviders) {
    const numPak = Math.min(pakketten.length, Math.floor(Math.random() * 31) + 10);
    const shuffled = [...pakketten].sort(() => Math.random() - 0.5).slice(0, numPak);
    for (const pak of shuffled) {
      try {
        await p.cloudproviderPakket.upsert({
          where: { cloudproviderId_pakketId: { cloudproviderId: cp.id, pakketId: pak.id } },
          update: {},
          create: { cloudproviderId: cp.id, pakketId: pak.id },
        });
        cpPakLinked++;
      } catch {}
    }
  }
  console.log(`  ${cpPakLinked} cloudprovider-pakket koppelingen`);

  console.log("Seed voltooid!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
