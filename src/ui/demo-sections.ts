/**
 * Gedeelde demo-secties data.
 *
 * Wordt gebruikt door:
 * - app/admin/demo/page.tsx (de demo-draaiboek pagina)
 * - scripts/run-demo.ts (het geautomatiseerde demo-script met spraak)
 *
 * Bij wijzigingen aan de demo: alleen dit bestand aanpassen.
 */

export type DemoSection = {
  nr: number;
  titel: string;
  duur: string;
  link: string;
  extraLinks?: { label: string; href: string }[];
  toelichting: string;
  actie?: string;
  vereist?: string;
  highlight?: boolean;
};

export const demoSections: DemoSection[] = [
  {
    nr: 1,
    titel: "Homepage & Navigatie",
    duur: "3 min",
    link: "/",
    toelichting:
      "De homepage toont een tegelmenu in drie kleuren: oranje (primaire functies: Mijn Voorzieningencatalogus, Inkoopondersteuning, Compliancy Monitor), blauw (datacatalogi: Pakketten, Leveranciers, Gemeenten, Standaarden, Referentiecomponenten) en groen (Dienstverleners, Cloud-providers). Alle tegels tonen live aantallen uit de database. Bovenaan staat een snelzoekbalk. Onderaan staan de laatste wijzigingen (feed), nieuws, doel van de catalogus en voortgang van gemeenten.",
    actie: "Gebruik de snelzoekbalk op de homepage. Bekijk de feed met laatste wijzigingen. Klik door de tegels om de structuur te laten zien.",
  },
  {
    nr: 2,
    titel: "Pakketten overzicht",
    duur: "5 min",
    link: "/pakketten",
    toelichting:
      "Overzicht van alle softwarepakketten in de catalogus. Bevat een zoekbalk, filter op leverancier en referentiecomponent, paginering (25 per pagina) en CSV-export van het gefilterde resultaat.",
    actie:
      "Zoek op een pakketnaam, filter op een leverancier, en exporteer het resultaat als CSV. Klik door naar een pakketdetailpagina voor versies, referentiecomponenten, standaarden en welke gemeenten het gebruiken.",
  },
  {
    nr: 3,
    titel: "Leveranciers",
    duur: "3 min",
    link: "/leveranciers",
    toelichting:
      "Alle geregistreerde softwareleveranciers met contactpersoon, e-mail, aantal pakketten en addenda. Zoekbaar en gepagineerd.",
    actie:
      "Klik door naar een leverancier om het volledige pakketaanbod te bekijken.",
  },
  {
    nr: 4,
    titel: "Gemeenten & Voortgang",
    duur: "5 min",
    link: "/gemeenten",
    toelichting:
      "Alle 389 Nederlandse gemeenten met voortgangsindicator (sterren). Zoekbaar, filterbaar op pakket met inklapbare filterlijsten ('Meer tonen...' link), gepagineerd. Klik op een gemeente voor de detailpagina: Dashboard is het hoofd-tab met 6 KPI-kaarten, applicatieportfolio, koppelingen en voortgang. Via 'Vergelijkbare gemeenten' link navigeer je naar een volledige pagina (/gemeenten/[slug]/vergelijkbaar) met sorteerbare tabel van tot 500 gemeenten op basis van Jaccard-similariteit.",
    actie:
      "Open een gemeente (bijv. 's-Gravenhage) en bekijk het Dashboard-tab. Klik op 'Vergelijkbare gemeenten' voor de volledige vergelijkingspagina. Toon de inklapbare filterlijsten op het gemeenten-overzicht.",
    vereist: "Ingelogd voor portfolio-weergave",
  },
  {
    nr: 5,
    titel: "AI-adviseur (Voortgang verbeteren)",
    duur: "5 min",
    link: "/dashboard?tab=ai-adviseur",
    toelichting:
      "De AI-adviseur (aangedreven door Claude) is beschikbaar als eigen tabblad in het dashboard én onderaan elke gemeentedetailpagina. Analyseert het volledige applicatieportfolio en geeft intelligent advies in opgemaakte HTML (tabellen, statusindicatoren, kopjes). Bevat 5 voorgestelde vragen: pakketten einde ondersteuning, GEMMA-standaarden vergelijking, ontbrekende standaarden, pakketvervanging, en voortgang verbeteren (sterren-score). Er kan ook een vrije vraag gesteld worden.",
    actie:
      'Ga naar Dashboard → tabblad "Voortgang verbeteren (AI)" → klik op "Voortgang verbeteren" en laat het AI-advies in HTML zien. Stel daarna een eigen vraag.',
    vereist: "Ingelogd als ADMIN, GEMEENTE of LEVERANCIER",
    highlight: true,
  },
  {
    nr: 6,
    titel: "Gemeenten vergelijken",
    duur: "3 min",
    link: "/gemeenten/vergelijk",
    toelichting:
      "Vergelijk tot 4 gemeenten zij-aan-zij op applicatieportfolio (bulk-vergelijking). Toont een samenvatting (gedeelde pakketten, uniek per gemeente), voortgangsbalken naast elkaar, en een gedetailleerde vergelijkingstabel met kleurcodes. Bevat ook een Jaccard-similariteitscore om vergelijkbare gemeenten te vinden.",
    actie: "Selecteer twee of meer gemeenten en bespreek de verschillen. Toon de vergelijkbare-gemeenten functie.",
    vereist: "Ingelogd",
  },
  {
    nr: 7,
    titel: "Dashboard",
    duur: "5 min",
    link: "/dashboard",
    toelichting:
      "Persoonlijk dashboard met 5 tabbladen: Dashboard (6 KPI-kaarten), Pakketten (gefilterde pakketlijst), Koppelingen (koppelingenmatrix), Suggesties (nieuwe pakketten, nieuwe versies, buitengemeentelijke koppelingen + voortgang verbeteren uitleg) en Voortgang verbeteren (AI). Admins kunnen via de gemeenteselector wisselen tussen gemeenten. Deploy naar productie knop met live terminal output.",
    actie: "Loop door alle tabbladen. Laat de Suggesties zien (vergelijk met softwarecatalogus.nl) en het AI-tabblad.",
    vereist: "Ingelogd",
  },
  {
    nr: 8,
    titel: "Compliancy Monitor",
    duur: "3 min",
    link: "/compliancy",
    toelichting:
      "Matrix van pakketten versus standaarden. Per standaardversie wordt getoond welke pakketversies compliant zijn, niet compliant, of onbekend. Samenvatting met ratio per standaard.",
    actie:
      "Laat zien hoe snel je kunt zien welke pakketten aan welke standaarden voldoen.",
  },
  {
    nr: 9,
    titel: "Inkoopondersteuning",
    duur: "3 min",
    link: "/inkoop",
    toelichting:
      "Selecteer gewenste referentiecomponenten en bekijk welke pakketten deze ondersteunen. Inclusief standaardaanbevelingen en GIBIT-richtlijnen.",
    actie:
      "Selecteer een referentiecomponent en toon de gefilterde aanbiedingen.",
  },
  {
    nr: 10,
    titel: "Koppelingen",
    duur: "2 min",
    link: "/koppelingen",
    toelichting:
      "Overzicht van alle systeemintegraties/koppelingen met filters op soort, standaard en status. Toont bron, richting en doel.",
    actie: "Filter op een specifieke standaard of status.",
  },
  {
    nr: 11,
    titel: "Standaarden & Referentiecomponenten",
    duur: "2 min",
    link: "/standaarden",
    extraLinks: [{ label: "Referentiecomponenten", href: "/referentiecomponenten" }],
    toelichting:
      "Standaarden met versies en pakketdekking. Referentiecomponenten gelinkt aan GEMMA Online. Beide zoekbaar.",
    actie: "Zoek een standaard en bekijk de pakketdekking.",
  },
  {
    nr: 12,
    titel: "Zoeken",
    duur: "2 min",
    link: "/zoeken",
    toelichting:
      "Globale fuzzy zoekmachine over 6 contenttypen: pakketten, leveranciers, gemeenten, standaarden, referentiecomponenten en begrippen. Tolereert typefouten (pg_trgm similarity). Filterchips per type.",
    actie:
      "Zoek met een typefout en laat zien dat de juiste resultaten toch gevonden worden.",
  },
  {
    nr: 13,
    titel: "Begrippenkader",
    duur: "2 min",
    link: "/begrippen",
    toelichting:
      "Woordenlijst conform NL-SBB/SKOS met termen, definities, synoniemen en vocabulairebron. Begrippen worden automatisch gemarkeerd in teksten door de GlossaryHighlighter (tooltips).",
    actie: "Zoek een begrip en laat de tooltip zien op een andere pagina.",
  },
  {
    nr: 14,
    titel: "Kaart",
    duur: "1 min",
    link: "/kaart/nederland",
    toelichting:
      "Interactieve kaart van Nederland met gemeenten. Applicatielandschap per regio.",
    vereist: "Ingelogd",
  },
  {
    nr: 15,
    titel: "REST API & Documentatie",
    duur: "2 min",
    link: "/api/v1/docs",
    toelichting:
      "Volledige REST API (OpenAPI 3.0) met endpoints voor gemeenten, leveranciers, pakketten, standaarden, referentiecomponenten en begrippen. Paginatie, zoeken en include-parameters. Rate limiting: 100 requests/min (API), 10/min (auth), 30/min (admin). RSS/Atom feed beschikbaar via /api/feed.",
    actie: "Toon de Swagger UI en voer een voorbeeld-request uit. Laat de RSS feed zien.",
  },
  {
    nr: 16,
    titel: "Admin beheer",
    duur: "5 min",
    link: "/admin",
    toelichting:
      "Beheerdashboard met gebruikersbeheer, registraties, data-import, gemeente samenvoegen, audit log, statistieken, PvE-analyse (104 eisen), datamodel (MIM 1.2, 24 objecttypen), Linked Data (RDF) explorer, datamigratie, regeneratie-prompt, demo draaiboek (dit document) en deploy naar productie met live terminal. Wachtwoordbeveiliging op Vercel via loginpagina.",
    actie:
      "Laat de PvE-analyse zien (realisatiegraad), het datamodel, de Linked Data pagina en het demo draaiboek. Toon de deploy-knop met live terminal.",
    vereist: "Ingelogd als ADMIN",
  },
  {
    nr: 17,
    titel: "Linked Data (RDF)",
    duur: "3 min",
    link: "/admin/linked-data",
    toelichting:
      "Publicatie van catalogusdata als Linked Data in JSON-LD, Turtle en RDF/XML formaten. DCAT-catalogus voor vindbaarheid. Content negotiation via Accept header of ?format= parameter. Privacy-bewust: gemeente-pakket relaties zijn niet openbaar. Begrippen worden als SKOS-concepten gepubliceerd.",
    actie:
      "Open de admin Linked Data pagina, gebruik de RDF Explorer om Turtle output op te halen, toon de JSON-LD context en laat de DCAT catalogus zien.",
    vereist: "Ingelogd als ADMIN",
  },
  {
    nr: 18,
    titel: "Pakketversies & Testrapporten",
    duur: "3 min",
    link: "/pakketversies",
    toelichting:
      "Aparte pakketversiespagina met status-filter (in ontwikkeling, in test, in distributie, uit distributie). Testrapporten met status-badges zijn zichtbaar bij pakketversies. Op de pakketdetailpagina is een wijzigingshistorie-tijdlijn beschikbaar.",
    actie: "Open de pakketversiespagina, filter op status. Bekijk een testrapport en de wijzigingshistorie op een pakketdetailpagina.",
  },
  {
    nr: 19,
    titel: "Addenda & Applicatiefuncties",
    duur: "2 min",
    link: "/addenda",
    extraLinks: [{ label: "Applicatiefuncties", href: "/applicatiefuncties" }],
    toelichting:
      "Addenda-pagina met sidebar checkboxes en bewerkmodal. Applicatiefunctiepagina toont functies uit het GEMMA-model met zoek- en filtermogelijkheden.",
    actie: "Bekijk de addenda met filters. Open de applicatiefunctiepagina en zoek op een functienaam.",
  },
  {
    nr: 20,
    titel: "Notificaties",
    duur: "2 min",
    link: "/notificaties",
    toelichting:
      "Notificatiesysteem met bel-icoon in de header die ongelezen notificaties toont. Aparte /notificaties pagina met overzicht van alle meldingen.",
    actie: "Klik op de notificatiebel in de header. Bekijk de notificatiepagina.",
    vereist: "Ingelogd",
  },
  {
    nr: 21,
    titel: "Favorieten",
    duur: "2 min",
    link: "/favorieten",
    toelichting:
      "Gebruikers kunnen pakketten en leveranciers als favoriet markeren via het hart-icoon op detailpagina's. Aparte /favorieten pagina toont alle opgeslagen favorieten.",
    actie: "Markeer een pakket als favoriet via het hart-icoon. Bekijk de favorieten-pagina.",
    vereist: "Ingelogd",
  },
  {
    nr: 22,
    titel: "Dark mode, QR-codes & Print",
    duur: "2 min",
    link: "/",
    toelichting:
      "Volledig afgewerkte dark mode met systeemvoorkeur-detectie. QR-codes zijn beschikbaar op alle detailpagina's voor eenvoudig delen. Share-button kopieert de link naar het klembord. Print-styles zorgen voor nette afdrukken van pagina's.",
    actie: "Schakel dark mode in. Bekijk een QR-code op een detailpagina. Gebruik de share-button. Druk een pagina af (print preview).",
  },
  {
    nr: 23,
    titel: "Marktverdeling",
    duur: "2 min",
    link: "/marktverdeling",
    toelichting:
      "Scatterplot van leveranciers in de catalogus. De verticale as toont het aantal klanten (gemeenten), de horizontale as het aantal unieke referentiecomponenten dat de pakketten van een leverancier samen ondersteunen. De grootte van het bolletje geeft het aantal pakketten aan. Pure SVG, geen externe charting-library.",
    actie: "Bekijk de marktverdeling. Hover over een bolletje om de leveranciernaam te zien. Vergelijk de marktposities van leveranciers.",
  },
];
