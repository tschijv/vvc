import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_gNA4LHj7bmxw@ep-empty-cake-aga3xz6i-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require";

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const paginas = [
  {
    slug: "voor-gemeenten",
    titel: "Hoe werkt de catalogus \u2014 Voor gemeenten",
    inhoud: `<p>De GEMMA Voorzieningencatalogus helpt gemeenten bij het beheren van hun applicatielandschap en het maken van weloverwogen keuzes bij ICT-vervangings- of investeringsvraagstukken.</p>

<h2>Wat kunt u als gemeente?</h2>

<ul>
<li><strong>Applicatieportfolio beheren</strong> \u2014 Registreer welke software uw gemeente gebruikt en houd dit overzicht actueel.</li>
<li><strong>Vergelijken met andere gemeenten</strong> \u2014 Bekijk welke software vergelijkbare gemeenten gebruiken.</li>
<li><strong>Marktori\u00ebntatie</strong> \u2014 Ontdek welke pakketten beschikbaar zijn voor specifieke referentiecomponenten.</li>
<li><strong>Compliancy monitoren</strong> \u2014 Bekijk in hoeverre pakketten voldoen aan GEMMA standaarden.</li>
</ul>

<h2>Hoe meldt u zich aan?</h2>

<ol>
<li>Ga naar de <a href="/info/aanmelden-gemeente">aanmeldpagina</a></li>
<li>Vul uw gemeentegegevens in</li>
<li>U ontvangt een bevestigingsmail met inloggegevens</li>
<li>Log in en begin met het vullen van uw applicatieportfolio</li>
</ol>

<h2>Tips</h2>

<ul>
<li>Zoek eerst of een pakket door een leverancier geregistreerd is voordat u het zelf registreert</li>
<li>Indien een pakket of versie er niet in staat, meldt dit aan de leverancier</li>
<li>Controleer of alle gebruikers nog werkzaam zijn bij uw gemeente</li>
</ul>`,
  },
  {
    slug: "voor-leveranciers",
    titel: "Hoe werkt de catalogus \u2014 Voor leveranciers",
    inhoud: `<p>De GEMMA Voorzieningencatalogus biedt ICT-leveranciers de mogelijkheid om hun software zichtbaar te maken voor alle Nederlandse gemeenten.</p>

<h2>Wat kunt u als leverancier?</h2>

<ul>
<li><strong>Pakketten registreren</strong> \u2014 Registreer uw softwarepakketten met versie-informatie en beschrijvingen.</li>
<li><strong>Referentiecomponenten koppelen</strong> \u2014 Geef aan welke GEMMA referentiecomponenten uw software ondersteunt.</li>
<li><strong>Standaarden aangeven</strong> \u2014 Toon aan welke GEMMA standaarden uw pakketversies ondersteunen.</li>
<li><strong>Compliancy tonen</strong> \u2014 Upload testrapporten en toon compliancy met standaarden.</li>
</ul>

<h2>Addenda</h2>

<p>VNG Realisatie biedt leveranciers de mogelijkheid om addenda te ondertekenen. Hiermee committeert een leverancier zich aan bepaalde afspraken rondom interoperabiliteit en standaarden.</p>

<h2>Tips voor leveranciers</h2>

<ul>
<li>Controleer de URL's bij het pakket \u2014 ze staan soms nog op oude locaties</li>
<li>Vul de referentiecomponenten in voor uw pakketversies</li>
<li>Houd uw contactgegevens actueel</li>
<li>Registreer nieuwe versies tijdig</li>
</ul>

<p><strong>Wilt u zich aanmelden?</strong> Ga naar de <a href="/info/aanmelden-leverancier">aanmeldpagina voor leveranciers</a>.</p>`,
  },
  {
    slug: "aanmelden-gemeente",
    titel: "Aanmelden als gemeente",
    inhoud: `<p>Wilt u als gemeente deelnemen aan de Voorzieningencatalogus? Hieronder vindt u de stappen om u aan te melden en uw softwaregegevens te registreren.</p>

<h2>Stappen om u aan te melden</h2>

<ol>
<li><strong>Contactpersoon aanwijzen</strong> \u2014 Wijs binnen uw gemeente een contactpersoon aan die verantwoordelijk wordt voor het beheer van de gegevens in de Voorzieningencatalogus.</li>
<li><strong>Aanmelding indienen</strong> \u2014 Stuur een e-mail naar het beheerteam met de gegevens van uw contactpersoon en uw gemeente.</li>
<li><strong>Account ontvangen</strong> \u2014 U ontvangt inloggegevens waarmee u kunt inloggen op de Voorzieningencatalogus.</li>
<li><strong>Gegevens invoeren</strong> \u2014 Vul uw softwarepakketten en bijbehorende gegevens in. U kunt hiervoor ook een Excel-import gebruiken.</li>
</ol>

<h3>Contact</h3>

<p>Heeft u vragen over het aanmelden of wilt u direct aan de slag? Neem contact op via <a href="mailto:gemmaonline@vng.nl">gemmaonline@vng.nl</a>.</p>`,
  },
  {
    slug: "aanmelden-leverancier",
    titel: "Aanmelden als leverancier",
    inhoud: `<p>Als softwareleverancier kunt u zich aanmelden voor de Voorzieningencatalogus om uw producten zichtbaar te maken voor gemeenten en samenwerkingsverbanden in Nederland.</p>

<h2>Stappen om u aan te melden</h2>

<ol>
<li><strong>Aanvraag indienen</strong> \u2014 Stuur een e-mail met uw bedrijfsgegevens en de naam van de contactpersoon die de gegevens gaat beheren.</li>
<li><strong>Verificatie</strong> \u2014 Het beheerteam verifieert uw gegevens en controleert of uw organisatie softwareproducten levert aan gemeenten.</li>
<li><strong>Account activeren</strong> \u2014 Na goedkeuring ontvangt u inloggegevens waarmee u uw softwarepakketten kunt registreren in de catalogus.</li>
<li><strong>Productgegevens invullen</strong> \u2014 Registreer uw softwarepakketten, inclusief informatie over ondersteunde standaarden en koppelvlakken.</li>
</ol>

<h3>Contact</h3>

<p>Wilt u zich aanmelden of heeft u vragen? Neem contact op via <a href="mailto:gemmaonline@vng.nl">gemmaonline@vng.nl</a>.</p>`,
  },
  {
    slug: "rapportages",
    titel: "Rapportages",
    inhoud: `<p>De Voorzieningencatalogus biedt diverse rapportages waarmee gemeenten en samenwerkingsverbanden inzicht krijgen in hun softwarelandschap en dat kunnen vergelijken met andere organisaties.</p>

<h2>Beschikbare rapportages</h2>

<h3>Voortgang gemeenten</h3>
<p>Overzicht van de voortgang per gemeente bij het invullen van hun softwarepakketgegevens in de Voorzieningencatalogus. Dit rapport toont welke gemeenten actief hun gegevens bijhouden.</p>

<h3>Compliancy overzicht</h3>
<p>Inzicht in de mate waarin softwarepakketten voldoen aan relevante standaarden en koppelvlakken. Dit helpt gemeenten bij het maken van weloverwogen keuzes bij aanbestedingen.</p>

<h3>Marktscanalyse</h3>
<p>Analyse van de softwaremarkt voor gemeenten, inclusief marktaandelen per referentiecomponent en trends in het gebruik van softwarepakketten.</p>

<p>Bekijk het <a href="/gemeenten">overzicht van gemeenten</a> om te zien welke gemeenten deelnemen aan de Voorzieningencatalogus.</p>`,
  },
  {
    slug: "gebruik-kaart",
    titel: "Gebruik Voorzieningencatalogus",
    inhoud: `<p>De Voorzieningencatalogus wordt breed gebruikt door gemeenten, leveranciers en samenwerkingsverbanden in heel Nederland. Hieronder vindt u een overzicht van het huidige gebruik.</p>

<h2>Deelname in cijfers</h2>

<ul>
<li><strong>342</strong> Gemeenten</li>
<li><strong>314</strong> Leveranciers</li>
<li><strong>84</strong> Samenwerkingsverbanden</li>
</ul>

<h2>Gebruik en bereik</h2>

<ul>
<li>Het merendeel van de Nederlandse gemeenten neemt actief deel aan de Voorzieningencatalogus.</li>
<li>Leveranciers gebruiken de catalogus om hun producten zichtbaar te maken voor gemeenten.</li>
<li>Samenwerkingsverbanden delen hun softwaregegevens collectief via de catalogus.</li>
<li>De catalogus bevat gegevens over duizenden softwarepakketten die bij gemeenten in gebruik zijn.</li>
</ul>`,
  },
  {
    slug: "gebruikersonderzoeken",
    titel: "Gebruikersonderzoeken",
    inhoud: `<p>Sinds 2014 is er om de 2 jaar onderzoeken uitgevoerd naar het gebruik en de ervaring van de GEMMA voorzieningencatalogus. Tot 2020 is dit in \u00e9\u00e9n gezamenlijk onderzoek gedaan voor GEMMA Online, de GEMMA, de GIBIT, StUFTestplatform en de GEMMA voorzieningencatalogus. Vanaf 2021 zijn de onderzoeken gericht op de producten zelf en niet op allen tegelijk.</p>

<ul>
<li><a href="#">Ledentevredenheidsonderzoek 2023</a></li>
<li><a href="#">Gebruikersonderzoek 2021</a></li>
</ul>

<p>De <a href="#">voorgaande onderzoeken</a> staan gepubliceerd op GEMMA Online.</p>`,
  },
  {
    slug: "praktijkvoorbeeld-delft",
    titel: "Gemeente Delft over de Voorzieningencatalogus",
    inhoud: `<p>Ontdek hoe de gemeente Delft de GEMMA Voorzieningencatalogus inzet om haar applicatielandschap in kaart te brengen in combinatie met Gemeentelijke Model Architectuur (GEMMA).</p>

<div style="margin: 1.5rem 0; position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; border-radius: 8px;">
<iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" src="https://www.youtube.com/embed/GqGA93VVCFo" title="Gemeente Delft over de Voorzieningencatalogus" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

<p>Wil je zelf aan de slag met de Voorzieningencatalogus en een architectuurtool? Bezoek dan de <a href="#">Handleiding koppeling architectuurtools</a></p>`,
  },
  {
    slug: "praktijkvoorbeeld-rid",
    titel: "RID de Liemers",
    inhoud: `<h2>Automatische melding van software-updates via TopDesk - RID de Liemers</h2>

<p>RID de Liemers is d\u00e9 partner van de gemeenten Duiven, Westervoort en Zevenaar op het gebied van inkoop en ICT. Doordat we de ICT-voorzieningen voor meerdere gemeenten beheren, hebben wij tal van applicaties onder onze hoede. Om hier grip op te krijgen, hebben wij het ITIL changeproces ingericht in Topdesk.</p>

<p>Onderstaande afbeelding geeft weer hoe het changeproces in eerste instantie is ingericht:</p>

<div style="background: #f8f9fa; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; text-align: center; margin: 1rem 0;">
<div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; flex-wrap: wrap; font-size: 0.8rem;">
<div style="background: #1a6ca8; color: white; padding: 0.75rem; border-radius: 6px; min-width: 100px; text-align: center;">Applicatie-beheerder in gemeente krijgt melding over update</div>
<span style="color: #e35b10; font-size: 1.2rem; font-weight: bold;">\u25B6</span>
<div style="background: #6b7280; color: white; padding: 0.75rem; border-radius: 6px; min-width: 100px; text-align: center;">Verzoek voor update wordt ingevoerd in Topdesk naar (inclusief nieuw versie-nummer)</div>
<span style="color: #e35b10; font-size: 1.2rem; font-weight: bold;">\u25B6</span>
<div style="background: #e35b10; color: white; padding: 0.75rem; border-radius: 6px; min-width: 100px; text-align: center;">Systeem-beheerder krijgt melding en controleert impact huidige infrastructuur</div>
<span style="color: #e35b10; font-size: 1.2rem; font-weight: bold;">\u25B6</span>
<div style="background: #1a6ca8; color: white; padding: 0.75rem; border-radius: 6px; min-width: 100px; text-align: center;">systeem-beheerder voert update uit</div>
<span style="color: #e35b10; font-size: 1.2rem; font-weight: bold;">\u25B6</span>
<div style="background: #1a6ca8; color: white; padding: 0.75rem; border-radius: 6px; min-width: 100px; text-align: center;">Terug-koppeling applicatie-beheerder</div>
<span style="color: #e35b10; font-size: 1.2rem; font-weight: bold;">\u25B6</span>
<div style="background: #374151; color: white; padding: 0.75rem; border-radius: 6px; min-width: 100px; text-align: center;">call wordt gesloten</div>
</div>
</div>

<h2>Software-updates in de Voorzieningencatalogus</h2>

<p>Om ervoor te zorgen dat de beheerder van de Voorzieningencatalogus ook weet dat er een software-update heeft plaatsgevonden, hebben we een aantal stappen aan het changeproces toegevoegd:</p>

<div style="background: #f8f9fa; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; text-align: center; margin: 1rem 0;">
<div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; flex-wrap: wrap; font-size: 0.8rem;">
<div style="background: #1a6ca8; color: white; padding: 0.75rem; border-radius: 6px; min-width: 100px; text-align: center;">Systeem-beheerder voert update uit en zet de melding door in TopDesk</div>
<span style="color: #e35b10; font-size: 1.2rem; font-weight: bold;">\u25B6</span>
<div style="background: #e35b10; color: white; padding: 0.75rem; border-radius: 6px; min-width: 100px; text-align: center;">Melding wordt doorgezet naar de beheerder van de software-catalogus</div>
<span style="color: #e35b10; font-size: 1.2rem; font-weight: bold;">\u25B6</span>
<div style="background: #6b7280; color: white; padding: 0.75rem; border-radius: 6px; min-width: 100px; text-align: center;">Beheerder van de software-catalogus past de catalogus aan en zet de melding door in Topdesk</div>
<span style="color: #e35b10; font-size: 1.2rem; font-weight: bold;">\u25B6</span>
<div style="background: #e35b10; color: white; padding: 0.75rem; border-radius: 6px; min-width: 100px; text-align: center;">Proces-beheerder (change manager) controleert de stappen</div>
<span style="color: #e35b10; font-size: 1.2rem; font-weight: bold;">\u25B6</span>
<div style="background: #374151; color: white; padding: 0.75rem; border-radius: 6px; min-width: 100px; text-align: center;">Call wordt gesloten</div>
</div>
</div>

<p>Op deze manier krijgt de beheerder van de voorzieningencatalogus iedere keer een signaal als er een software-update heeft plaatsgevonden.</p>`,
  },
];

async function main() {
  for (const pagina of paginas) {
    await prisma.pagina.upsert({
      where: { slug: pagina.slug },
      update: { titel: pagina.titel, inhoud: pagina.inhoud },
      create: pagina,
    });
    console.log(`Pagina '${pagina.slug}' aangemaakt/bijgewerkt`);
  }

  console.log(`\nKlaar: ${paginas.length} pagina's in database`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
