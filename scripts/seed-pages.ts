import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const p = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL || "" }),
});

const PAGES = [
  {
    slug: "voor-gemeenten",
    titel: "Voor gemeenten",
    inhoud: `<h2>Hoe werkt de Voorzieningencatalogus voor gemeenten?</h2>
<p>De GEMMA Voorzieningencatalogus biedt gemeenten inzicht in het softwaregebruik van alle Nederlandse gemeenten. Gemeenten en samenwerkingsverbanden kunnen hun applicatielandschap invoeren, dat automatisch wordt gekoppeld aan het GEMMA referentiecomponentenframework.</p>
<h3>Waarvoor gebruiken gemeenten de catalogus?</h3>
<ul>
<li><strong>Marktoriëntatie</strong> — Zoek naar nieuwe of vervangende software op basis van referentiecomponenten.</li>
<li><strong>Vergelijken met andere gemeenten</strong> — Bekijk welke pakketten vergelijkbare gemeenten gebruiken.</li>
<li><strong>Contact leggen</strong> — Neem contact op met gemeenten die interessante pakketten gebruiken om ervaringen uit te wisselen.</li>
<li><strong>ICT-vervangingsplannen</strong> — Plan de vervanging van softwarepakketten.</li>
<li><strong>Bestekteksten genereren</strong> — Gebruik de <a href="/inkoop">inkoopondersteuning</a> voor bestekteksten op basis van standaarden.</li>
<li><strong>Aanbestedingstrajecten</strong> — Vergelijk aanbod van leveranciers.</li>
</ul>
<h3>Handleidingen</h3>
<ul>
<li><strong>Gebruikersbeheer</strong> — Wachtwoord resetten, gebruikers beheren en machtigingsniveaus.</li>
<li><strong>Werken met Archi</strong> — Exporteer de voorzieningencatalogus naar architectuurtools.</li>
<li><strong>Mijn Voorzieningencatalogus beheren</strong> — Koppelingen vastleggen, externe pakketten toevoegen en ontbrekende informatie melden bij leveranciers.</li>
</ul>
<p>Raadpleeg de <a href="/info/veelgestelde-vragen">veelgestelde vragen</a> voor meer informatie, of neem contact op via <a href="mailto:voorzieningencatalogus@vng.nl">voorzieningencatalogus@vng.nl</a>.</p>`,
  },
  {
    slug: "voor-leveranciers",
    titel: "Voor leveranciers",
    inhoud: `<h2>Hoe werkt de Voorzieningencatalogus voor leveranciers?</h2>
<p>De GEMMA Voorzieningencatalogus is het platform waar ICT-leveranciers hun softwarepakketten kunnen registreren en zichtbaar maken voor Nederlandse gemeenten.</p>
<p>Om deel te nemen aan de catalogus dient een leverancier te voldoen aan de richtlijnen: het aanbieden van software voor de gemeentelijke markt.</p>
<h3>Spelregels voor leveranciers</h3>
<ul>
<li><strong>Eigen verantwoordelijkheid</strong> — Leveranciers zijn verantwoordelijk voor hun eigen informatie en gebruikersbeheer binnen de Voorzieningencatalogus.</li>
<li><strong>Minimaal één pakket</strong> — Er dient minimaal één softwarepakket geregistreerd te zijn zodat gemeenten dit kunnen toevoegen aan hun applicatieportfolio.</li>
<li><strong>Actuele gegevens</strong> — De catalogus controleert periodiek het gebruik en de datakwaliteit. Niet-actuele informatie kan na melding worden verwijderd.</li>
</ul>
<h3>Handleidingen</h3>
<ul>
<li><strong>Registratie</strong> — Hoe u zich aanmeldt als leverancier.</li>
<li><strong>Gebruikersbeheer</strong> — Wachtwoord resetten, gebruikers toevoegen of verwijderen.</li>
<li><strong>Portfoliobeheer</strong> — Uw pakketportfolio beheren, deelnemende gemeenten bekijken en suggesties doen.</li>
<li><strong>Testrapporten</strong> — Testrapporten toevoegen aan standaarden.</li>
</ul>`,
  },
  {
    slug: "marktscan-digikoppeling",
    titel: "Marktscan Digikoppeling",
    inhoud: `<h2>Marktscan Digikoppeling</h2>
<p>De marktscan Digikoppeling helpt overheidsorganisaties bij het selecteren van een geschikte leverancier voor het leveren van een generieke Digikoppeling-adapter, om aan te sluiten op Landelijke Voorzieningen.</p>
<p>VNG Realisatie en Logius hebben eind 2018 een update van de marktscan Digikoppeling uitgevoerd. Negen leveranciers hebben in totaal twaalf aanbiedingen ingediend — vier lokale oplossingen en acht cloudoplossingen.</p>
<h3>Beschikbare standaarden</h3>
<p>U kunt filteren op pakketten die de volgende standaarden ondersteunen:</p>
<ul>
<li><strong>Digikoppeling 2.0</strong> — ebMS 2.0 en WUS 2.0 standaarden</li>
<li><strong>Digikoppeling Grote Berichten 2.0</strong></li>
</ul>
<h3>Servicebussen</h3>
<p>De catalogus toont ook servicebussen met Digikoppeling-ondersteuning. Ingelogde gemeenten kunnen via de leverancierspagina's zien welke andere gemeenten specifieke pakketversies gebruiken.</p>
<p>Resultaten kunnen worden gefilterd op beschikbaarheid van testrapporten en compliancy-status.</p>`,
  },
  {
    slug: "inkoopondersteuning",
    titel: "Inkoopondersteuning",
    inhoud: `<h2>Inkoopondersteuning</h2>
<p>De Voorzieningencatalogus biedt inkoopondersteuning met voorbeeldteksten voor het toepassen van GEMMA-standaarden bij de aanschaf van software.</p>
<p>Standaarden zijn van groot belang voor gemeenten en dienen zorgvuldig en bewust te worden opgenomen in het inkoopproces en de gunning.</p>
<h3>Hoe werkt het?</h3>
<p>Gemeenten wordt geadviseerd om <strong>GIBIT als inkoopvoorwaarden</strong> toe te passen bij ICT-producten en -diensten. GIBIT borgt duurzame ICT-kwaliteitsstandaarden op het gebied van architectuur, interoperabiliteit, informatiebeveiliging, toegankelijkheid, archivering, documentatie, dataportabiliteit en aansluiting op de landelijke digitale infrastructuur.</p>
<ol>
<li>Selecteer één of meer referentiecomponenten via de <a href="/inkoop">inkoopondersteuning</a>.</li>
<li>Bekijk welke eindproduct-, halffabricaat-, grondstof- en gegevensstandaarden verplicht of aanbevolen zijn.</li>
<li>Genereer bestekteksten in RTF-formaat voor gebruik in uw aanbestedingsdocumenten.</li>
</ol>`,
  },
  {
    slug: "monitor-digitoegankelijkheid",
    titel: "Monitor digitoegankelijke pakketten",
    inhoud: `<h2>Monitor digitoegankelijke pakketten</h2>
<p>De monitor digitoegankelijkheid biedt inzicht in de digitale toegankelijkheid van softwarepakketten in de catalogus. De monitor toont:</p>
<ul>
<li>Hoeveel pakketversies, volgens leveranciers, ondersteuning bieden voor digitale toegankelijkheid</li>
<li>Hoeveel pakketversies compliant zijn</li>
<li>Hoeveel pakketversies een testrapport of auditrapport hebben</li>
</ul>
<p>Deze informatie wordt door leveranciers zelf ingevoerd in de Voorzieningencatalogus. Gemeenten zijn wettelijk verplicht om digitaal toegankelijke dienstverlening te bieden conform de Web Content Accessibility Guidelines (WCAG).</p>
<p>Heeft u vragen of opmerkingen over de monitor? Neem contact op via <a href="mailto:voorzieningencatalogus@vng.nl">voorzieningencatalogus@vng.nl</a>.</p>`,
  },
  {
    slug: "downloads",
    titel: "Beschikbare downloads",
    inhoud: `<h2>Beschikbare downloads</h2>
<p>De GEMMA Voorzieningencatalogus biedt openbare exportbestanden met softwarepakketgegevens gekoppeld aan referentiecomponenten en standaarden uit de GEMMA-architectuur.</p>
<h3>Openbare exports</h3>
<ul>
<li><strong>Alle pakketten</strong> — Alle softwarepakketten en versies, referentiecomponenten per versie en ondersteunde technologie.</li>
<li><strong>Referentiecomponenten en standaarden</strong> — Beschikbaar op <a href="https://www.gemmaonline.nl" target="_blank">GEMMAonline</a>, inclusief alle referentiecomponenten met eigenschappen en alle standaarden/versies.</li>
<li><strong>Alle pakketten en compliancy</strong> — Alle pakketten, versies, ondersteunde standaarden, compliancy-status en URL's naar testrapporten.</li>
<li><strong>Alle leveranciers</strong> — Contactgegevens en details van leveranciers.</li>
</ul>
<h3>Exports voor ingelogde gemeenten</h3>
<ul>
<li><strong>Mijn pakketten</strong> — Exporteerbaar pakketoverzicht, inclusief IBD-fotoformaat (exclusief externe pakketten).</li>
<li><strong>Mijn koppelingen</strong> — Exporteerbare koppelingsgegevens.</li>
</ul>
<p>Bestanden worden aangeboden in CSV-formaat, geschikt voor OpenOffice Calc of Microsoft Excel. Pakketten, referentiecomponenten en standaarden kunnen worden gekoppeld via unieke identificatiecodes (GUID's) in de bestanden.</p>
<p>U kunt ook de <a href="/api/v1/docs">API</a> gebruiken om programmatisch toegang te krijgen tot de gegevens.</p>`,
  },
  {
    slug: "rapportages",
    titel: "Rapportages",
    inhoud: `<h2>Rapportages</h2>
<p>De Voorzieningencatalogus biedt periodieke rapportages over het gebruik door gemeenten en leveranciers. Per maand worden het aantal actieve gemeenten, ingelogde gebruikers en zoekopdrachten bijgehouden.</p>
<h3>Overzicht</h3>
<ul>
<li><strong>Voortgangsrapportage</strong> — Toont per gemeente hoe volledig het softwareportfolio is ingevuld.</li>
<li><strong>Compliancy rapportage</strong> — Overzicht van de mate waarin pakketten voldoen aan verplichte standaarden.</li>
<li><strong>Marktaandeel</strong> — Analyse van het gebruik van pakketten per referentiecomponent.</li>
<li><strong>Gebruiksstatistieken</strong> — Maandelijks overzicht van actieve gemeenten, ingelogde gebruikers en zoekopdrachten.</li>
</ul>`,
  },
  {
    slug: "gebruik-kaart",
    titel: "Gebruik Voorzieningencatalogus",
    inhoud: `<h2>Gebruik Voorzieningencatalogus</h2>
<p>Alle gemeenten hebben één of meerdere inlogaccounts waarmee ze het gemeentelijk applicatieportfolio kunnen invoeren. Vanuit de gemeente is minimaal één gebruiker aangewezen als beheerder (doorgaans de informatiemanager of I&A-coördinator). Deze gebruiker kan nieuwe accounts aanmaken voor collega's.</p>
<p>Op de besloten pagina "Alle samenwerkingen" (na inloggen in het inlogmenu) is inzichtelijk welke samenwerkingsverbanden een account hebben en welke gemeenten in het samenwerkingsverband zitten.</p>
<p>De <a href="/kaart/nederland">kaart</a> wordt dagelijks bijgewerkt. Kleuren zijn gebaseerd op het aantal voortgangssterren dat een gemeente heeft behaald.</p>`,
  },
  {
    slug: "aanmelden-gemeente",
    titel: "Aanmelden als gemeente of samenwerking",
    inhoud: `<h2>Hoe meld ik mij aan als gemeente of samenwerking?</h2>
<p>Alle gemeenten beschikken inmiddels over inlogaccounts om hun applicatieportfolio in te voeren. Heeft u geen persoonlijke toegang, neem dan contact op met uw informatiemanager of I&A-coördinator. Deze kan u machtigen binnen uw organisatie.</p>
<h3>Voor samenwerkingsverbanden</h3>
<p>Als uw samenwerkingsverband staat vermeld bij de deelnemende gemeenten, dan is er al een account toegewezen. Vraag machtiging aan bij uw ICT-manager. Beschikt uw samenwerkingsverband nog niet over een account, dan kunt u een verzoek indienen via <a href="mailto:voorzieningencatalogus@vng.nl">voorzieningencatalogus@vng.nl</a>.</p>`,
  },
  {
    slug: "aanmelden-leverancier",
    titel: "Aanmelden als leverancier",
    inhoud: `<h2>Hoe meld ik mij aan als leverancier?</h2>
<p>Leveranciers kunnen zich aanmelden door de volgende gegevens te mailen naar <a href="mailto:voorzieningencatalogus@vng.nl">voorzieningencatalogus@vng.nl</a>:</p>
<ul>
<li>Volledige organisatienaam</li>
<li>Organisatienaamgeving voor de Voorzieningencatalogus</li>
<li>Naam contactpersoon</li>
<li>Functie contactpersoon</li>
<li>Telefoonnummer contactpersoon</li>
<li>E-mailadres contactpersoon (geen algemeen adres)</li>
<li>Website-URL</li>
</ul>
<p>VNG Realisatie controleert of de aanvrager voldoet aan de richtlijnen van de catalogus, met name of de leverancier software aanbiedt voor de gemeentelijke markt.</p>
<h3>StUF-standaard testen</h3>
<p>Leveranciers die verplichte StUF-standaarden implementeren en nog geen toegang hebben tot het testplatform, kunnen zich registreren via het registratieformulier van het StUF-testplatform.</p>`,
  },
  {
    slug: "nieuws",
    titel: "Nieuws",
    inhoud: `<h2>Ontwikkelingen rond de Voorzieningencatalogus</h2>
<p>Hier vindt u het laatste nieuws over de GEMMA Voorzieningencatalogus.</p>
<h3>Maart 2026</h3>
<ul>
<li>Begrippenkader (NL-SBB) geïntegreerd met glossary-functionaliteit</li>
<li>Nieuwe zoekfunctie over alle objecttypen</li>
<li>Externe API v1 met OpenAPI/Swagger documentatie</li>
<li>Nieuwe Voorzieningencatalogus live — gebouwd op moderne technologie ter vervanging van het Drupal 7 platform</li>
</ul>
<h3>Achtergrond</h3>
<p>De nieuwe Voorzieningencatalogus is ontwikkeld omdat de ondersteuning van het onderliggende platform (Drupal 7) is verlopen. In samenwerking met het Waterschapshuis, GGD-GHOR, Kennisnet en andere stakeholders is onderzocht hoe gemeenten softwareinformatie registreren. Een uitgangspunt voor het nieuwe platform is geautomatiseerde gegevensopvraging uit bestaande gemeentelijke bronnen, in lijn met Common Ground-principes.</p>`,
  },
  {
    slug: "praktijkvoorbeeld-rid",
    titel: "Praktijkvoorbeeld: RID de Liemers",
    inhoud: `<h2>Automatische melding van software-updates via TopDesk — RID de Liemers</h2>
<p>RID de Liemers is dé partner van de gemeenten Duiven, Westervoort en Zevenaar op het gebied van inkoop en ICT. Doordat we de ICT-voorzieningen voor meerdere gemeenten beheren, hebben wij tal van applicaties onder onze hoede.</p>
<p>Om hier grip op te krijgen, hebben wij het ITIL changeproces ingericht in Topdesk.</p>
<h3>Software-updates in de Voorzieningencatalogus</h3>
<p>Om ervoor te zorgen dat de beheerder van de Voorzieningencatalogus ook weet dat er een software-update heeft plaatsgevonden, hebben we een aantal stappen aan het changeproces toegevoegd. Op deze manier krijgt de beheerder van de voorzieningencatalogus iedere keer een signaal als er een software-update heeft plaatsgevonden.</p>
<figure>
<img src="/images/changeproces-rid-1.png" alt="Changeproces RID de Liemers — stap 1: het oorspronkelijke ITIL changeproces in TopDesk" />
<figcaption>Het oorspronkelijke ITIL changeproces in TopDesk</figcaption>
</figure>
<figure>
<img src="/images/changeproces-rid-2.png" alt="Changeproces RID de Liemers — stap 2: het changeproces met toegevoegde stappen voor de Voorzieningencatalogus" />
<figcaption>Het changeproces met toegevoegde stappen voor melding aan de Voorzieningencatalogus</figcaption>
</figure>`,
  },
  {
    slug: "praktijkvoorbeeld-delft",
    titel: "Praktijkvoorbeeld: Gemeente Delft over de Voorzieningencatalogus",
    inhoud: `<h2>Gemeente Delft over de Voorzieningencatalogus</h2>
<p>Ontdek hoe de gemeente Delft de GEMMA Voorzieningencatalogus inzet om haar applicatielandschap in kaart te brengen in combinatie met Gemeentelijke Model Architectuur (GEMMA).</p>
<div class="video-embed"><iframe width="800" height="450" src="https://www.youtube-nocookie.com/embed/GqGA93VVCFo" title="Gemeente Delft over de Voorzieningencatalogus" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>
<p>Wil je zelf aan de slag met de Voorzieningencatalogus en een architectuurtool? Bezoek dan de <a href="https://www.gemmaonline.nl/wiki/Handleiding_koppeling_architectuurtools" target="_blank">Handleiding koppeling architectuurtools</a>.</p>`,
  },
  {
    slug: "gebruikersonderzoeken",
    titel: "Gebruikersonderzoeken",
    inhoud: `<h2>Gebruikersonderzoeken</h2>
<p>Sinds 2014 is er om de 2 jaar onderzoeken uitgevoerd naar het gebruik en de ervaring van de GEMMA Voorzieningencatalogus. Tot 2020 is dit in één gezamenlijk onderzoek gedaan voor GEMMA Online, de GEMMA, de GIBIT, StUF Testplatform en de GEMMA Voorzieningencatalogus. Vanaf 2021 zijn de onderzoeken gericht op de producten zelf en niet op allen tegelijk.</p>
<ul>
<li><a href="/info/ledentevredenheidsonderzoek-2023">Ledentevredenheidsonderzoek 2023</a></li>
<li><a href="/info/gebruikersonderzoek-2021">Gebruikersonderzoek 2021</a></li>
</ul>
<p>De <a href="https://www.gemmaonline.nl/index.php/Evaluaties_GEMMA" target="_blank">voorgaande onderzoeken</a> staan gepubliceerd op GEMMA Online.</p>`,
  },
  {
    slug: "ledentevredenheidsonderzoek-2023",
    titel: "Ledentevredenheidsonderzoek 2023",
    inhoud: `<h2>Ledentevredenheidsonderzoek 2023</h2>
<p>In december 2023 heeft er een onderzoek plaatsgevonden onder de gemeentelijke gebruikers van de voorzieningencatalogus. Het doel van het onderzoek was om de ledentevredenheid te meten rondom de GEMMA Voorzieningencatalogus bij gemeenten en samenwerkingen.</p>
<p>De 69 respondenten hebben de GEMMA Voorzieningencatalogus een gebruikerstevredenheidscijfer van gemiddeld <strong>6,9</strong> gegeven. Een lichte daling ten opzichte van 2020 (7,1).</p>
<ul>
<li>De GEMMA Voorzieningencatalogus wordt vooral voor het verkrijgen van overzicht en gluren bij de buren gebruikt.</li>
<li>69% beveelt de GEMMA Voorzieningencatalogus aan anderen aan.</li>
<li>Er is ruimte om de GEMMA Voorzieningencatalogus beter te laten voldoen aan verwachtingen (6,9) en aan de betrouwbaarheid van de gegevens (5,7).</li>
<li>De dienstverlening wordt als goed ervaren maar het is veelal onbekend bij gemeenten dat deze er is via de verschillende kanalen.</li>
</ul>
<h3>Voor welk(e) doel(en) gebruikt u de GEMMA Voorzieningencatalogus binnen uw organisatie?</h3>
<img src="/images/lto2023-doelen.png" alt="Ledentevredenheidsonderzoek 2023 — waarvoor wordt de voorzieningencatalogus ingezet" />
<h3>Van welke functionaliteiten uit de GEMMA Voorzieningencatalogus maakt u gebruik?</h3>
<img src="/images/lto2023-functionaliteiten.png" alt="Ledentevredenheidsonderzoek 2023 — welke functionaliteiten worden gebruikt" />
<h3>Opmerkingen en verbetersuggesties</h3>
<ul>
<li>Maak er meer een gegevensknooppunt van. Veel organisaties hebben hun eigen oplossing. Maak het mogelijk vanuit daar te dumpen richting de GEMMA Voorzieningencatalogus.</li>
<li>Misschien voor in de toekomst de mogelijkheid tot REST-API toegang tot de gegevens om te importeren in eigen overzichten.</li>
<li>Meer integratiemogelijkheden. Mogelijkheid van filtering bij genereren van platen.</li>
<li>Voor ons is het belangrijk om een compleet beeld te hebben van onze hardware, applicaties en koppelingen. Deze drie aspecten integreren in de voorzieningencatalogus.</li>
<li>De interface zou wel een keer een opfrisbeurt kunnen gebruiken en meer aansluiten bij wat tegenwoordig mogelijk is in een webinterface.</li>
<li>Common Ground principes meenemen zodat we ook van elkaar kunnen zien welke Common Ground activiteiten er zijn uitgerold per gemeente.</li>
<li>Online cursussen aanbieden.</li>
<li>Meer aansluiten op de behoeften van de gemeente.</li>
</ul>`,
  },
  {
    slug: "gebruikersonderzoek-2021",
    titel: "Gebruikersonderzoek 2021",
    inhoud: `<h2>Gebruikersonderzoek 2021</h2>
<p>In november 2021 is er een onderzoek uitgevoerd onder de gemeentelijke gebruikers van de voorzieningencatalogus. Het doel van het gebruikersonderzoek is om te onderzoeken hoe de voorzieningencatalogus door gemeenten en samenwerkingen wordt gebruikt en of ze makkelijker is te onderhouden.</p>
<p>Via 147 (8,4%) ingevulde onderzoeken hebben 118 verschillende gemeenten en samenwerkingen inzicht gegeven in hun gebruik van de voorzieningencatalogus en gerelateerde oplossingen. 60% staat open voor het beantwoorden van vragen over de antwoorden.</p>
<h3>1. Voor welke doelen wordt de GEMMA Voorzieningencatalogus binnen uw gemeente gebruikt?</h3>
<table>
<tr><th>Top 5 antwoorden</th><th>Reacties %</th></tr>
<tr><td>Het applicatielandschap van de organisatie relateren aan de GEMMA-referentiearchitectuur.</td><td>53%</td></tr>
<tr><td>Overzicht creëren van pakketten die in gebruik zijn bij de organisatie.</td><td>46%</td></tr>
<tr><td>Marktonderzoek naar leveranciers, pakketten en/of koppelingen.</td><td>45%</td></tr>
<tr><td>Overzicht creëren van koppelingen die in gebruik zijn bij de organisatie.</td><td>30%</td></tr>
<tr><td>Vergelijken van het applicatielandschap van onze organisatie met andere organisaties.</td><td>29%</td></tr>
</table>
<img src="/images/go2021-vraag1.png" alt="Gebruikersonderzoek 2021 — vraag 1: doelen" />
<h3>2. Wat gebruikt uw gemeente voor het werken met architectuurmodellen?</h3>
<img src="/images/go2021-vraag2.png" alt="Gebruikersonderzoek 2021 — vraag 2: architectuurmodellen" />
<h3>3. Waarin registreert uw gemeente software (CMDB)?</h3>
<img src="/images/go2021-vraag3.png" alt="Gebruikersonderzoek 2021 — vraag 3: CMDB registratie" />
<h3>4. Wat gebruikt uw gemeente voor het contractbeheer en service level management van software?</h3>
<img src="/images/go2021-vraag4.png" alt="Gebruikersonderzoek 2021 — vraag 4: contractbeheer en SLM" />
<h3>5. Wie van uw gemeente gebruikt de GEMMA Voorzieningencatalogus?</h3>
<img src="/images/go2021-vraag4.png" alt="Gebruikersonderzoek 2021 — vraag 5: wie gebruikt de catalogus (woordwolk)" />
<h3>6. Heeft u nog opmerkingen of suggesties voor de GEMMA Voorzieningencatalogus?</h3>
<p>Hieronder staat een overzicht met de meest voorkomende opmerkingen of suggesties. In totaal zijn er 44 opmerkingen of suggesties ingevuld.</p>
<ul>
<li>Componentencatalogus en voorzieningencatalogus integreren</li>
<li>Koppeling tussen voorzieningencatalogus en andere oplossingen</li>
<li>Leveranciers worden gemist</li>
<li>Informatie van leveranciers is niet bijgewerkt</li>
<li>Koppelingen automatisch bijwerken bij een nieuwe versie van pakket</li>
<li>Handleidingen over werken met Archi-model</li>
<li>Sneller nieuwe (API) standaarden opnemen</li>
<li>Gebruiksvriendelijker en laagdrempeliger maken</li>
<li>Sterren systeem aanpassen of opheffen</li>
</ul>`,
  },
  {
    slug: "homepage-nieuws",
    titel: "Nieuws",
    inhoud: `<p><a href="https://formulieren.vngrealisatie.nl/nieuwsbrief-anders" target="_blank">Aanmelden voor de voorzieningencatalogus nieuwsbrief.</a></p>
<p><strong>Beheertips voor gemeenten en leveranciers!</strong></p>
<p><strong>Tips voor gemeenten en samenwerkingen</strong></p>
<ul>
<li>Zoek eerst of een pakket door een leverancier geregistreerd is of niet, voordat je het pakket zelf registreert.</li>
<li>Indien een pakket of versie er niet in staat meldt dit dan aan de leverancier.</li>
<li>Controleer of alle gebruikers nog werkzaam zijn bij de gemeente of samenwerking.</li>
</ul>
<p><strong>Tips voor Leveranciers:</strong></p>
<ul>
<li>Controleer de URL's bij het pakket.</li>
<li>Vul de referentiecomponenten in voor uw pakketversies.</li>
</ul>`,
  },
  {
    slug: "homepage-doel",
    titel: "Doel van de voorzieningencatalogus",
    inhoud: `<p><em>Gemeenten kennis en informatie uit laten wisselen en de gebruikte software te laten vergelijken met andere gemeenten. Daarnaast geeft de voorzieningencatalogus inzicht in het huidige en toekomstige softwareaanbod van de aangemelde ICT-leveranciers.</em></p>
<p>Gemeenten gebruiken de GEMMA Voorzieningencatalogus bij ICT-vervangings- of investeringsvraagstukken:</p>
<ul>
<li>Marktoriëntatie voor nieuwe of vervangende software;</li>
<li>Vergelijken met andere gemeenten;</li>
<li>Contact leggen met gemeenten met vergelijkbaar of interessant productportfolio;</li>
<li>Inzicht in het huidig en toekomstig softwareaanbod.</li>
</ul>`,
  },
];

async function main() {
  await p.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Pagina" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
      "slug" TEXT NOT NULL,
      "titel" TEXT NOT NULL,
      "inhoud" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Pagina_pkey" PRIMARY KEY ("id")
    )
  `);
  await p.$executeRawUnsafe(
    'CREATE UNIQUE INDEX IF NOT EXISTS "Pagina_slug_key" ON "Pagina"("slug")'
  );

  for (const page of PAGES) {
    await p.pagina.upsert({
      where: { slug: page.slug },
      update: { titel: page.titel, inhoud: page.inhoud },
      create: page,
    });
    console.log(`  ✓ ${page.slug}`);
  }

  const total = await p.pagina.count();
  console.log(`\nDone: ${total} pages in database`);
  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
