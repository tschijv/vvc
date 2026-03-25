/* ── Types ── */
export type Prio = "eis" | "wens" | "could" | "nvt";
export type Status = "yes" | "partial" | "no" | "nvt" | "extra";

export interface PveRow {
  id: string;
  naam: string;
  prio: Prio;
  status: Status;
  toelichting: string;
  peter?: string;
  link?: string;
  linkTitle?: string;
}

export interface PveSection {
  title: string;
  subtitle?: string;
  rows: PveRow[];
}

/* ── Alle eisen en wensen ── */
export const sections: PveSection[] = [
  {
    title: "1. Aanbod (Functioneel)",
    subtitle: "Eisen",
    rows: [
      { id: "1", naam: "Zoeken/filteren op standaarden", prio: "eis", status: "yes", toelichting: "Standaardenpagina met versies en pakketfiltering. Compliancy-monitor toont compliance per standaard.", link: "/standaarden", linkTitle: "Standaarden" },
      { id: "2", naam: "Zoeken/filteren op referentiecomponenten", prio: "eis", status: "yes", toelichting: "Referentiecomponentenpagina met zoekfunctie en pakkettellingen. Inkoop-pagina filtert op referentiecomponent.", link: "/referentiecomponenten", linkTitle: "Referentiecomponenten" },
      { id: "3", naam: "Registreren pakketten", prio: "eis", status: "yes", toelichting: "Upload-functie voor leveranciers (CSV/JSON/Excel). Admin kan ook pakketten beheren.", link: "/upload", linkTitle: "Data importeren" },
      { id: "4", naam: "Registreren koppelingen bij pakket", prio: "eis", status: "yes", toelichting: "Koppelingen-systeem met bron/doel, richting, protocol, standaard. Ondersteunt externe pakketten en tussenliggende systemen.", link: "/koppelingen", linkTitle: "Koppelingen" },
      { id: "5", naam: "Beheren content & configuratie", prio: "eis", status: "yes", toelichting: "CMS-systeem (Pagina model) met TipTap editor. Admin kan pagina's aanmaken en bewerken.", link: "/info/handleiding", linkTitle: "CMS-pagina" },
      { id: "6", naam: "Data-migratie", prio: "eis", status: "partial", toelichting: "Import-functionaliteit aanwezig (CSV/JSON/Excel upload), maar specifieke migratie van oude softwarecatalogus-data is niet als aparte feature gebouwd.", link: "/upload", linkTitle: "Upload / import" },
    ],
  },
  {
    title: "",
    subtitle: "Wensen",
    rows: [
      { id: "7", naam: "Registreren dienstverleners", prio: "wens", status: "no", toelichting: "Placeholder-pagina aanwezig. Nog niet geimplementeerd.", link: "/dienstverleners", linkTitle: "Dienstverleners (placeholder)" },
      { id: "8", naam: "Registreren cloud-providers", prio: "wens", status: "no", toelichting: "Placeholder-pagina aanwezig. Nog niet geimplementeerd.", link: "/cloudproviders", linkTitle: "Cloud-providers (placeholder)" },
      { id: "9", naam: "Raadplegen review scores", prio: "wens", status: "no", toelichting: "Geen review/score-systeem voor pakketten." },
    ],
  },
  {
    title: "2. Aanbod en Gebruik Wensen",
    rows: [
      { id: "10", naam: "AI-advisering", prio: "wens", status: "yes", toelichting: "AI-adviseur op gemeente-detailpagina \u00e9n als eigen tabblad in het dashboard ('Voortgang verbeteren (AI)'). 5 voorgestelde vragen + vrije invoer. Antwoorden in opgemaakte HTML met tabellen, statusindicatoren en kopjes. Aangedreven door Claude API.", link: "/dashboard?tab=ai-adviseur", linkTitle: "Dashboard AI-adviseur" },
      { id: "11", naam: "Registreren business rules", prio: "wens", status: "no", toelichting: "Geen business rules engine." },
      { id: "12\u201315", naam: "Adviseren Common Ground, SaaS", prio: "wens", status: "no", toelichting: "Geen automatische advisering op basis van CG/SaaS criteria." },
      { id: "16", naam: "Statistieken gebruik", prio: "wens", status: "yes", toelichting: "Admin statistiekenpagina met platformbrede tellingen, top-10 pakketten/leveranciers en recente activiteit.", link: "/admin/statistieken", linkTitle: "Statistieken" },
    ],
  },
  {
    title: "3. Common Ground Wensen",
    rows: [
      { id: "17\u201320", naam: "Common Ground registratie/filtering", prio: "wens", status: "no", toelichting: "Geen CG-laag concept, geen CG-compliance tracking." },
    ],
  },
  {
    title: "4. Gebruik (Functioneel)",
    subtitle: "Eisen",
    rows: [
      { id: "21", naam: "Beheren applicatielandschap gemeente", prio: "eis", status: "yes", toelichting: "Dashboard met pakketoverzicht, upload-functie, koppelingen-beheer.", link: "/dashboard", linkTitle: "Dashboard" },
      { id: "22", naam: "Vergelijken gebruik (gemeente vs gemeente)", prio: "eis", status: "yes", toelichting: "Vergelijkfunctie met side-by-side tabel, gemeenschappelijke/unieke pakketten. Vergelijkbare gemeenten: volledige pagina (/gemeenten/[slug]/vergelijkbaar) met sorteerbare tabel van tot 500 gemeenten op Jaccard-similariteit.", link: "/gemeenten/vergelijk", linkTitle: "Gemeente vergelijken" },
      { id: "23", naam: "Vergelijken gebruik (gemeente vs aanbod)", prio: "eis", status: "partial", toelichting: "Compliancy-monitor vergelijkt gebruik met standaarden. Geen directe vergelijking gemeente-portfolio vs totaal aanbod.", link: "/compliancy", linkTitle: "Compliancy-monitor" },
      { id: "24", naam: "Exporteren gebruik", prio: "eis", status: "yes", toelichting: "Export-API met CSV, IBD-foto en AMEFF XML formaten.", link: "/dashboard", linkTitle: "Dashboard (export)" },
      { id: "25", naam: "Ontsluiten gebruik", prio: "eis", status: "yes", toelichting: "Gemeente-detailpagina toont portfolio, koppelingen, voortgang. Rolgebaseerde zichtbaarheid.", link: "/gemeenten", linkTitle: "Gemeenten" },
      { id: "26", naam: "Raadplegen gebruik", prio: "eis", status: "yes", toelichting: "Gemeenten-overzicht met zoek/filter, sterren-systeem, paginering.", link: "/gemeenten", linkTitle: "Gemeenten" },
    ],
  },
  {
    title: "",
    subtitle: "Wensen",
    rows: [
      { id: "27", naam: "Registreren maatwerk bij pakket", prio: "wens", status: "yes", toelichting: "GemeentePakket heeft maatwerk-veld. Zichtbaar op gemeente-detailpagina.", link: "/gemeenten", linkTitle: "Gemeenten (detail)" },
      { id: "28", naam: "Registreren verantwoordelijke bij pakket", prio: "wens", status: "yes", toelichting: "GemeentePakket heeft verantwoordelijke-veld. Zichtbaar op gemeente-detailpagina.", link: "/gemeenten", linkTitle: "Gemeenten (detail)" },
      { id: "29", naam: "Registreren licentievorm bij pakket", prio: "wens", status: "yes", toelichting: "GemeentePakket heeft licentievorm-veld. Zichtbaar op gemeente-detailpagina.", link: "/gemeenten", linkTitle: "Gemeenten (detail)" },
      { id: "30", naam: "Registreren gebruikersaantallen", prio: "wens", status: "yes", toelichting: "GemeentePakket heeft aantalGebruikers-veld. Zichtbaar op gemeente-detailpagina.", link: "/gemeenten", linkTitle: "Gemeenten (detail)" },
      { id: "31", naam: "Wijzigingshistorie bijhouden", prio: "wens", status: "yes", toelichting: "AuditLog registreert portfolio-wijzigingen (upload, replace, merge). Historie zichtbaar op gemeente-detailpagina. Wijzigingshistorie-tijdlijn op pakketdetailpagina's.", link: "/gemeenten", linkTitle: "Gemeenten (detail)" },
    ],
  },
  {
    title: "5. GT Inkoop Wensen",
    rows: [
      { id: "32\u201335", naam: "Contractbeheer, verloopdatums, BIO compliance", prio: "wens", status: "no", toelichting: "Geen contractbeheerfunctionaliteit. Inkoop-pagina bevat alleen referentiecomponent-selectie en GEMMA/GIBIT richtlijnen.", link: "/inkoop", linkTitle: "Inkoopondersteuning" },
      { id: "36", naam: "Exporteren inkoop-gegevens", prio: "wens", status: "no", toelichting: "Geen specifieke inkoop-export." },
    ],
  },
  {
    title: "6. IBD Wensen",
    rows: [
      { id: "37\u201344", naam: "BIO compliance, DPIA verplichting, SLA-criteria", prio: "wens", status: "no", toelichting: "Geen BIO/DPIA/SLA tracking." },
      { id: "45\u201348", naam: "Pen-test resultaten, DigiD-assessments", prio: "wens", status: "no", toelichting: "Geen beveiligingsbeoordelingen-module." },
      { id: "49\u201353", naam: "Verklaringen/overeenkomsten delen en fiatteren", prio: "wens", status: "no", toelichting: "Geen document-sharing/fiatteringsworkflow." },
      { id: "54\u201355", naam: "Register van verwerkingen genereren", prio: "wens", status: "no", toelichting: "Geen AVG register. Vereist ook GEMMA-uitbreiding." },
      { id: "56\u201358", naam: "Kwetsbaarheden notificatie, NIST CVE", prio: "wens", status: "partial", toelichting: "Notificatiesysteem aanwezig (bel in header, /notificaties pagina). Geen specifieke NIST CVE-integratie, maar notificatie-infrastructuur is beschikbaar.", link: "/notificaties", linkTitle: "Notificaties" },
    ],
  },
  {
    title: "7. Management Informatie",
    rows: [
      { id: "59", naam: "Database-toegang voor rapportages", prio: "eis", status: "partial", toelichting: "Database is PostgreSQL en technisch toegankelijk. Data via REST API en CSV-export (pakketten, leveranciers, gemeenten) beschikbaar. Linked Data (RDF) voor machine-readable publicatie.", link: "/api/v1/docs", linkTitle: "API documentatie" },
    ],
  },
  {
    title: "8. Organisatie",
    subtitle: "Eisen",
    rows: [
      { id: "60", naam: "Zelf organisatiegegevens registreren (concept)", prio: "eis", status: "yes", toelichting: "Publieke registratiepagina. Registraties landen als concept (actief=false) en worden door admin beoordeeld.", link: "/auth/registreren", linkTitle: "Registreren" },
      { id: "61", naam: "Fiatteren concept-organisaties", prio: "eis", status: "yes", toelichting: "Admin-goedkeuringsworkflow. Goedkeuren (rollen + organisatie toewijzen) en afwijzen (met reden).", link: "/admin/registraties", linkTitle: "Registraties beheren" },
      { id: "62", naam: "Samenvoegen organisaties (herindeling)", prio: "eis", status: "yes", toelichting: "Admin kan gemeenten samenvoegen. Portfolio, gebruikers, koppelingen en samenwerkingen worden automatisch overgenomen. Preview toont impact.", link: "/admin/gemeenten/samenvoegen", linkTitle: "Gemeenten samenvoegen" },
      { id: "63", naam: "Aanmaken organisaties + accounts", prio: "eis", status: "yes", toelichting: "Admin kan gebruikers aanmaken met gemeente/leverancier-koppeling.", link: "/admin/gebruikers", linkTitle: "Gebruikersbeheer" },
      { id: "64", naam: "Gebruik-beheerder registreert aanbieder", prio: "eis", status: "partial", toelichting: "Niet direct mogelijk; admin moet leverancier aanmaken. Upload-functie accepteert wel nieuwe namen." },
      { id: "65", naam: "Overzicht aanbiedende organisaties", prio: "eis", status: "yes", toelichting: "Leveranciers-pagina met zoek/filter en paginering.", link: "/leveranciers", linkTitle: "Leveranciers" },
      { id: "66", naam: "Overzicht gebruikende organisaties", prio: "eis", status: "yes", toelichting: "Gemeenten-pagina met zoek/filter, sterren, paginering.", link: "/gemeenten", linkTitle: "Gemeenten", peter: "Peter: gemeenten zien elkaars landschappen; leveranciers alleen hun eigen pakketten." },
      { id: "67", naam: "Contactpersonen per pakket", prio: "eis", status: "yes", toelichting: "PakketContact model: meerdere contactpersonen per pakket met naam, e-mail, telefoon en rol.", link: "/pakketten", linkTitle: "Pakketten (detail)" },
      { id: "68", naam: "Aanvullende organisatie-info, links", prio: "eis", status: "yes", toelichting: "Leverancier heeft diensten-omschrijving, supportportaal, documentatie- en kennisbank-URL's.", link: "/leveranciers", linkTitle: "Leveranciers (detail)" },
    ],
  },
  {
    title: "9. Referentiearchitectuur",
    rows: [
      { id: "69", naam: "Exporteren ArchiMate (AMEFF)", prio: "eis", status: "yes", toelichting: "AMEFF XML export beschikbaar via /api/export?format=ameff.", link: "/dashboard", linkTitle: "Dashboard (export)" },
      { id: "70", naam: "Importeren ArchiMate", prio: "eis", status: "yes", toelichting: "GEMMA sync via admin panel. Import van ArchiMate model.", link: "/admin", linkTitle: "Beheer (GEMMA sync)" },
      { id: "71", naam: "Ontsluiten architectuurconcepten", prio: "eis", status: "yes", toelichting: "Referentiecomponenten, standaarden, applicatiefuncties. GEMMA Views met domein/volgorde.", link: "/referentiecomponenten", linkTitle: "Referentiecomponenten" },
      { id: "72", naam: "GEMMA-concepten uitleggen (Glossary)", prio: "eis", status: "yes", toelichting: "Begrippen live van SKOSMOS API (configureerbare vocabulaires via AppSetting). GlossaryHighlighter markeert termen automatisch. Begrippen als SKOS Linked Data beschikbaar.", link: "/begrippen", linkTitle: "Begrippenkader" },
      { id: "73", naam: "Doorverwijzen naar GEMMA online", prio: "eis", status: "yes", toelichting: "Deep-links naar GEMMA Online vanuit referentiecomponenten (via GUID). Begrippen hebben externe URI's.", link: "/referentiecomponenten", linkTitle: "Referentiecomponenten" },
      { id: "74", naam: "Plotten op GEMMA views (SVG download)", prio: "eis", status: "yes", toelichting: "Kaart-functionaliteit met GEMMA Views, interactief.", link: "/kaart", linkTitle: "Kaart / GEMMA views" },
    ],
  },
  {
    title: "10. Toegangsbeveiliging",
    subtitle: "Eisen",
    rows: [
      { id: "75", naam: "Collega's toegang geven (beheerder)", prio: "eis", status: "partial", toelichting: "Admin kan gebruikers aanmaken. Organisatie-beheerders kunnen dit niet zelf.", link: "/admin/gebruikers", linkTitle: "Gebruikersbeheer" },
      { id: "76", naam: "Meerdere gebruikersrollen met rechten", prio: "eis", status: "yes", toelichting: "10 rollen gedefinieerd (ADMIN, LEVERANCIER, GEMEENTE_BEHEERDER, etc.). Rolgebaseerde toegangscontrole.", link: "/admin/gebruikers", linkTitle: "Gebruikersbeheer" },
      { id: "77", naam: "Eerste account aanmaken/fiatteren", prio: "eis", status: "yes", toelichting: "Admin maakt eerste account aan voor organisatie.", link: "/admin/gebruikers", linkTitle: "Gebruikersbeheer" },
      { id: "78", naam: "Gebruiker gekoppeld aan organisatie", prio: "eis", status: "yes", toelichting: "User model heeft gemeenteId en leverancierId. Ongekoppelde gebruiker = bezoeker.", link: "/admin/gebruikers", linkTitle: "Gebruikersbeheer" },
      { id: "79", naam: "Nieuwe gebruikers aanmelden bij organisatie", prio: "eis", status: "no", toelichting: "Geen zelf-aanmeldflow met fiatteringsproces." },
      { id: "80", naam: "Multi-organisatie toegang", prio: "eis", status: "no", toelichting: "User heeft een gemeenteId. Kan niet schakelen tussen meerdere organisaties." },
      { id: "81", naam: "Leveranciers zien geen gemeente-landschappen", prio: "eis", status: "yes", toelichting: "filterGemeentePakketten() filtert leveranciers tot alleen hun eigen pakketten.", link: "/gemeenten", linkTitle: "Gemeenten", peter: "Peter bevestigt: leveranciers zien alleen hun eigen aanbod en gebruik." },
    ],
  },
  {
    title: "",
    subtitle: "Wensen",
    rows: [
      { id: "82", naam: "Impersonatie (functioneel beheerder)", prio: "wens", status: "yes", toelichting: "Admin kan als andere gebruiker inloggen via gebruikersbeheer. Amber banner toont impersonatie-status.", link: "/admin/gebruikers", linkTitle: "Gebruikersbeheer" },
    ],
  },
  {
    title: "11. API's (Functioneel)",
    rows: [
      { id: "100", naam: "Raadplegen aanbod API", prio: "eis", status: "yes", toelichting: "Publieke API v1 met leveranciers, pakketten, standaarden, begrippen. OpenAPI documentatie. Rate limiting (100/min API, 10/min auth, 30/min admin). RSS/Atom feed via /api/feed.", link: "/api/v1/docs", linkTitle: "API documentatie" },
      { id: "101", naam: "Raadplegen gebruik API", prio: "wens", status: "yes", toelichting: "API v1 endpoints voor gemeenten en hun pakketten. Beveiligd met rolcontrole.", link: "/api/v1/docs", linkTitle: "API documentatie" },
      { id: "102", naam: "Registreren aanbod API", prio: "could", status: "no", toelichting: "Geen write-API voor aanbod. Alleen upload via UI." },
      { id: "103", naam: "Registreren gebruik API", prio: "could", status: "no", toelichting: "Geen write-API voor gebruik. Alleen upload via UI." },
    ],
  },
  {
    title: "12. Non-functionele Eisen",
    rows: [
      { id: "83", naam: "API standaarden (OpenAPI, REST, Linked Data)", prio: "eis", status: "yes", toelichting: "OpenAPI spec, REST endpoints, Swagger UI. Linked Data (RDF) publicatie in JSON-LD, Turtle en RDF/XML via content negotiation. DCAT-catalogus voor machine-readable metadata.", link: "/api/v1/docs", linkTitle: "Swagger UI" },
      { id: "84", naam: "Betrouwbaarheid / beheerorganisatie", prio: "wens", status: "nvt", toelichting: "Organisatorische eis, niet technisch." },
      { id: "85", naam: "Gebruikersvriendelijkheid", prio: "eis", status: "yes", toelichting: "Intuitive UI, formuliervalidatie, foutmeldingen, loading skeletons, breadcrumbs, keyboard shortcuts (/ voor zoeken). Mobiel responsive. Favorieten (hart-icoon), notificatiebel, QR-codes op detailpagina's, share-button, snelzoekbalk op homepage. Inklapbare filterlijsten (CollapsibleFilterList) met 'Meer tonen...' link.", link: "/", linkTitle: "Homepage" },
      { id: "86", naam: "Digitoegankelijkheid", prio: "eis", status: "yes", toelichting: "Skip-link, landmark roles, aria-labels, role=\"search\", keyboard shortcuts, breadcrumb-navigatie. Semantic HTML. Volledig afgewerkte dark mode met systeemvoorkeur-detectie en voldoende contrast. Print-styles voor afdrukken.", link: "/", linkTitle: "Homepage" },
      { id: "87", naam: "Logging activiteiten", prio: "wens", status: "yes", toelichting: "AuditLog model met registratie van logins, merges en admin-acties.", link: "/admin/auditlog", linkTitle: "Audit log" },
      { id: "88", naam: "Internetstandaarden (nl.internet.nl 100%)", prio: "eis", status: "partial", toelichting: "Afhankelijk van hosting-configuratie. Applicatie gebruikt HTTPS." },
      { id: "89", naam: "2FA / RBAC", prio: "eis", status: "partial", toelichting: "RBAC is geimplementeerd (10 rollen). API rate limiting (100/min API, 10/min auth, 30/min admin). 2FA/TOTP is NIET geimplementeerd. Alleen email+wachtwoord.", link: "/admin/gebruikers", linkTitle: "Gebruikersbeheer (rollen)" },
      { id: "90", naam: "Informatiemodel voorzieningencatalogus", prio: "eis", status: "partial", toelichting: "Prisma schema volgt conceptueel het informatiemodel maar wijkt mogelijk af in details.", link: "/admin/datamodel", linkTitle: "Datamodel (MIM)", peter: "Peter: naam wordt \"Voorzieningencatalogus\"." },
      { id: "91", naam: "E-mail standaarden (DKIM/DMARC)", prio: "eis", status: "yes", toelichting: "E-mailfunctionaliteit via Resend (registratie-notificaties, goedkeuring/afwijzing, wachtwoord-reset).", link: "/auth/wachtwoord-vergeten", linkTitle: "Wachtwoord vergeten" },
      { id: "92", naam: "Open source (EUPL licentie)", prio: "eis", status: "yes", toelichting: "Broncode in git repository met EUPL v1.2 licentie." },
      { id: "93", naam: "Modulariteit", prio: "eis", status: "yes", toelichting: "Next.js App Router structuur, gescheiden API/UI, Prisma als data-laag. Lazy-loading van zware componenten (KaartViewer -170KB, RichTextEditor -150KB) via Next.js dynamic imports. Select clauses in services voor efficiënte data-ophaling.", link: "/admin/datamodel", linkTitle: "Datamodel" },
      { id: "94", naam: "Webstatistieken (Matomo)", prio: "eis", status: "yes", toelichting: "Matomo-integratie ingebouwd. Tracking wordt automatisch geladen wanneer MATOMO_URL en MATOMO_SITE_ID zijn geconfigureerd." },
      { id: "95", naam: "Toekomstvaste techniek", prio: "eis", status: "yes", toelichting: "Next.js 16, TypeScript, React, Tailwind CSS, PostgreSQL \u2014 mainstream stack. Performance-geoptimaliseerd: 15 database-indexes op FK-lookups, Promise.all parallellisatie, WebP-beeldcompressie (889KB\u2192335KB, -62%), select clauses in key services.", link: "/admin/prompt", linkTitle: "Regeneratie-prompt" },
      { id: "96", naam: "Open source componenten", prio: "wens", status: "yes", toelichting: "Volledig gebouwd op open source: Next.js, Prisma, PostgreSQL, Tailwind." },
      { id: "97", naam: "Containerisatie / CI/CD", prio: "eis", status: "yes", toelichting: "Dockerfile met multi-stage build (Node 22 Alpine). Standalone output geconfigureerd." },
      { id: "98", naam: "OTAP omgevingen", prio: "eis", status: "no", toelichting: "Geen meervoudige omgevingen geconfigureerd." },
      { id: "99", naam: "Foutmeldingen", prio: "eis", status: "yes", toelichting: "Error handling, formuliervalidatie, lege-staat berichten.", link: "/", linkTitle: "Homepage" },
      { id: "100", naam: "Testen", prio: "eis", status: "yes", toelichting: "26 end-to-end Playwright tests. Dekking van alle belangrijke gebruikersflows.", link: "/admin", linkTitle: "Beheer" },
    ],
  },
  {
    title: "Extra gerealiseerde functionaliteit",
    subtitle: "Niet in PvE, wel gebouwd",
    rows: [
      { id: "E1", naam: "Dark mode", prio: "nvt", status: "extra", toelichting: "Volledig afgewerkte dark mode met systeemvoorkeur-detectie. Alle componenten hebben dark: varianten.", link: "/", linkTitle: "Homepage" },
      { id: "E2", naam: "Linked Data (RDF)", prio: "nvt", status: "extra", toelichting: "Publicatie als JSON-LD, Turtle en RDF/XML via content negotiation. DCAT-catalogus. Begrippen als SKOS-concepten. Admin Linked Data explorer.", link: "/admin/linked-data", linkTitle: "Linked Data explorer" },
      { id: "E3", naam: "Favorieten", prio: "nvt", status: "extra", toelichting: "Hart-icoon op alle detailpagina's. Persoonlijk favorieten-overzicht op /favorieten.", link: "/favorieten", linkTitle: "Favorieten" },
      { id: "E4", naam: "Notificatiesysteem", prio: "nvt", status: "extra", toelichting: "Notificatiebel in header met badge. Overzichtspagina /notificaties met markeren als gelezen.", link: "/notificaties", linkTitle: "Notificaties" },
      { id: "E5", naam: "QR-codes", prio: "nvt", status: "extra", toelichting: "QR-code op alle detailpagina's voor eenvoudig delen via mobiel.", link: "/pakketten", linkTitle: "Pakket detail" },
      { id: "E6", naam: "Share-button", prio: "nvt", status: "extra", toelichting: "Kopieer-link knop op alle detailpagina's.", link: "/pakketten", linkTitle: "Pakket detail" },
      { id: "E7", naam: "RSS/Atom feed", prio: "nvt", status: "extra", toelichting: "Syndication feed op /api/feed. Ondersteunt RSS 2.0 en Atom formaat.", link: "/api/feed", linkTitle: "RSS Feed" },
      { id: "E8", naam: "Compliancy-monitor", prio: "nvt", status: "extra", toelichting: "Matrix van pakketten vs standaarden met vinkjes/kruisjes. Filtert op compliancyMonitor-standaarden.", link: "/compliancy", linkTitle: "Compliancy-monitor" },
      { id: "E9", naam: "Inkoopondersteuning", prio: "nvt", status: "extra", toelichting: "Selecteer applicatiefuncties, vergelijk geschikte pakketten. GEMMA en GIBIT richtlijnen.", link: "/inkoop", linkTitle: "Inkoopondersteuning" },
      { id: "E10", naam: "Vergelijkbare gemeenten (Jaccard)", prio: "nvt", status: "extra", toelichting: "Volledige pagina met sorteerbare tabel van tot 500 gemeenten op basis van Jaccard-similariteit. Info-icoon met uitleg algoritme.", link: "/gemeenten", linkTitle: "Gemeenten (vergelijkbaar)" },
      { id: "E11", naam: "Bulk-vergelijking gemeenten", prio: "nvt", status: "extra", toelichting: "Tot 4 gemeenten tegelijk vergelijken met side-by-side tabel. Gemeenschappelijke en unieke pakketten.", link: "/gemeenten/vergelijk", linkTitle: "Vergelijken" },
      { id: "E12", naam: "Keyboard shortcuts", prio: "nvt", status: "extra", toelichting: "/ voor zoeken, breadcrumb-navigatie, sneltoetsen in demo-speler.", link: "/", linkTitle: "Homepage" },
      { id: "E13", naam: "Homepage zoekbalk", prio: "nvt", status: "extra", toelichting: "Snelzoeken bovenaan homepage doorzoekt pakketten, leveranciers en gemeenten.", link: "/", linkTitle: "Homepage" },
      { id: "E14", naam: "Print styles", prio: "nvt", status: "extra", toelichting: "CSS print stylesheet verbergt navigatie/buttons, maakt tabellen leesbaar op papier." },
      { id: "E15", naam: "Geautomatiseerde demo", prio: "nvt", status: "extra", toelichting: "In-app DemoPlayer met Nederlandse spraaksynthese en ondertiteling. CLI-alternatief via Playwright. 22 secties, single source of truth.", link: "/admin/demo", linkTitle: "Demo draaiboek" },
      { id: "E16", naam: "Deploy-knop (admin)", prio: "nvt", status: "extra", toelichting: "Eén-klik deploy naar Vercel met live terminal streaming vanuit het admin panel.", link: "/admin", linkTitle: "Beheer" },
      { id: "E17", naam: "Regeneratie-prompt", prio: "nvt", status: "extra", toelichting: "Volledige prompt om de applicatie opnieuw te genereren met AI. Inclusief guardrails en architectuurregels.", link: "/admin/prompt", linkTitle: "Regeneratie-prompt" },
      { id: "E18", naam: "PvE-analyse", prio: "nvt", status: "extra", toelichting: "Deze pagina: automatische analyse van alle eisen en wensen vs. gerealiseerde functionaliteit.", link: "/admin/pve-analyse", linkTitle: "PvE-analyse" },
      { id: "E19", naam: "Datamodel MIM-visualisatie", prio: "nvt", status: "extra", toelichting: "Interactieve visualisatie van het informatiemodel conform MIM-standaard.", link: "/admin/datamodel", linkTitle: "Datamodel (MIM)" },
      { id: "E20", naam: "GlossaryHighlighter", prio: "nvt", status: "extra", toelichting: "Automatische markering van GEMMA-begrippen in tekst met tooltips. Begrippen live van SKOSMOS API.", link: "/begrippen", linkTitle: "Begrippenkader" },
      { id: "E21", naam: "Testrapporten", prio: "nvt", status: "extra", toelichting: "Status-badges bij pakketversies voor testresultaten.", link: "/pakketten", linkTitle: "Pakketten" },
      { id: "E22", naam: "Loading skeletons", prio: "nvt", status: "extra", toelichting: "Skeleton placeholders op alle overzichtspagina's voor directe visuele feedback." },
      { id: "E23", naam: "Anonimisatie demo-data", prio: "nvt", status: "extra", toelichting: "Admin-functie om persoonsgegevens te anonimiseren voor demonstratiedoeleinden.", link: "/admin", linkTitle: "Beheer" },
      { id: "E24", naam: "Wachtwoordbeveiliging (Basic Auth)", prio: "nvt", status: "extra", toelichting: "Optionele Basic Auth op Vercel met eenmalige login via cookie. Beschermt de gehele applicatie tijdens ontwikkeling.", link: "/admin", linkTitle: "Beheer" },
      { id: "E25", naam: "Marktverdeling", prio: "nvt", status: "extra", toelichting: "Scatterplot van leveranciers: verticaal klanten, horizontaal referentiecomponenten, bolgrootte = aantal pakketten. Pure SVG, geen externe libraries.", link: "/marktverdeling", linkTitle: "Marktverdeling" },
      { id: "E26", naam: "Npm-health panel", prio: "nvt", status: "extra", toelichting: "Admin-panel voor npm audit (kwetsbaarheden), ongebruikte packages detectie en npm fix functionaliteit.", link: "/admin", linkTitle: "Beheer (Npm Health)" },
      { id: "E27", naam: "Inline bewerken gemeente", prio: "nvt", status: "extra", toelichting: "Contactgegevens van een gemeente inline bewerkbaar via edit-knop. Alleen voor GEMEENTE_BEHEERDER en ADMIN.", link: "/gemeenten", linkTitle: "Gemeente detail" },
      { id: "E28", naam: "Zoeken multi-filter", prio: "nvt", status: "extra", toelichting: "Zoekpagina ondersteunt meerdere type-filters tegelijk. Counts per type altijd zichtbaar, toggle-gedrag.", link: "/zoeken", linkTitle: "Zoeken" },
      { id: "E29", naam: "Demo audio (HD)", prio: "nvt", status: "extra", toelichting: "Pre-generated OpenAI TTS (nova stem) MP3-bestanden voor alle 22 demo-secties. DemoPlayer speelt MP3 af met fallback naar browser spraaksynthese.", link: "/admin/demo", linkTitle: "Demo draaiboek" },
    ],
  },
  {
    title: "Golden Rulebook Compliance",
    subtitle: "Common Ground architectuurstandaarden",
    rows: [
      { id: "GR1", naam: "5-lagenmodel (Common Ground)", prio: "eis", status: "yes", toelichting: "src/ui, src/process, src/integration, src/service, src/data. Dependency direction strict downward." },
      { id: "GR2", naam: "API-First (OpenAPI → types)", prio: "eis", status: "yes", toelichting: "OpenAPI 3.0 spec als bron, openapi-typescript genereert types, alle v1 routes gebruiken gegenereerde types." },
      { id: "GR3", naam: "Dependency direction", prio: "eis", status: "yes", toelichting: "UI → Process → Integration → Service → Data. Nooit omhoog importeren." },
      { id: "GR4", naam: "Portability (Docker + Helm + Haven)", prio: "eis", status: "yes", toelichting: "Dockerfile (multi-stage), Helm chart (deployment, service, ingress), publiccode.yml.", link: "/admin", linkTitle: "Beheer" },
      { id: "GR5", naam: "Database migrations (versiebeheerd)", prio: "eis", status: "yes", toelichting: "Prisma migrations in prisma/migrations/. Geen db push in productie." },
      { id: "GR6", naam: "Bestanden < 300 regels", prio: "eis", status: "yes", toelichting: "Grootste pagina gesplitst van 1339 naar 8 bestanden, alle < 300 regels." },
      { id: "GR7", naam: "Barrel exports (index.ts)", prio: "wens", status: "yes", toelichting: "Index.ts bestanden per laag: service/, process/, integration/, ui/components/." },
      { id: "GR8", naam: "Zod input validation", prio: "eis", status: "yes", toelichting: "Zod schemas op 10 API routes. Gedeelde schemas in process/validation.ts." },
      { id: "GR9", naam: "Geen @ts-nocheck", prio: "eis", status: "yes", toelichting: "Verwijderd uit alle bestanden, type-errors opgelost." },
      { id: "GR10", naam: "CSP security headers", prio: "eis", status: "yes", toelichting: "7 headers: X-XSS-Protection, X-Frame-Options, HSTS, CSP, Referrer-Policy, Permissions-Policy, X-Content-Type-Options." },
      { id: "GR11", naam: "Rate limiting", prio: "eis", status: "yes", toelichting: "withRateLimit() op alle publieke API endpoints. 100/min API, 10/min auth, 30/min admin." },
      { id: "GR12", naam: "Unit tests", prio: "eis", status: "yes", toelichting: "264 tests in 18 bestanden. Coverage 89.76% (>80% drempel)." },
      { id: "GR13", naam: "E2E tests", prio: "wens", status: "yes", toelichting: "49 Playwright tests. Happy paths + sad paths (404's, auth, input validation, protected pages)." },
      { id: "GR14", naam: "WCAG 2.1 AA", prio: "eis", status: "yes", toelichting: "axe-core audit: 0 violations. Click-based dropdowns voor touch devices." },
      { id: "GR15", naam: "License audit", prio: "wens", status: "yes", toelichting: "Dependency analysis pagina op /admin/dependencies met licentie-overzicht.", link: "/admin/dependencies", linkTitle: "Dependencies" },
      { id: "GR16", naam: "No vendor lock-in", prio: "wens", status: "partial", toelichting: "Vercel-specifieke middleware en deploy. Docker + Helm beschikbaar als alternatief." },
      { id: "GR17", naam: "NEN 7510 security audit", prio: "eis", status: "no", toelichting: "Externe audit nodig, niet technisch op te lossen." },
      { id: "GR18", naam: "Feature-based directories", prio: "wens", status: "partial", toelichting: "Route-based (Next.js conventie). Feature-specifieke componenten co-located bij pagina's. Barrel exports aanwezig." },
    ],
  },
];

/* ── Stats computation ── */
export interface PveStats {
  total: number;
  yes: number;
  partial: number;
  no: number;
  extra: number;
  eisTotal: number;
  eisYes: number;
  eisPartial: number;
  eisNo: number;
  wensTotal: number;
  wensYes: number;
  wensPartial: number;
  wensNo: number;
  couldTotal: number;
  couldYes: number;
  couldPartial: number;
  couldNo: number;
  /** Percentage of all requirements that are yes or partial (rounded, no decimals) */
  coveragePercent: number;
  /** Golden Rulebook stats */
  grTotal: number;
  grYes: number;
  grPartial: number;
  grNo: number;
  grPercent: number;
}

export function computePveStats(): PveStats {
  const allRows = sections.flatMap((s) => s.rows);
  // Exclude "nvt" and "extra" status rows from PvE counting
  const countable = allRows.filter((r) => r.status !== "nvt" && r.status !== "extra");
  const extra = allRows.filter((r) => r.status === "extra").length;

  const total = countable.length;
  const yes = countable.filter((r) => r.status === "yes").length;
  const partial = countable.filter((r) => r.status === "partial").length;
  const no = countable.filter((r) => r.status === "no").length;

  const eisen = countable.filter((r) => r.prio === "eis");
  const wensen = countable.filter((r) => r.prio === "wens");
  const coulds = countable.filter((r) => r.prio === "could");

  const countByStatus = (rows: typeof countable) => ({
    total: rows.length,
    yes: rows.filter((r) => r.status === "yes").length,
    partial: rows.filter((r) => r.status === "partial").length,
    no: rows.filter((r) => r.status === "no").length,
  });

  const eisStats = countByStatus(eisen);
  const wensStats = countByStatus(wensen);
  const couldStats = countByStatus(coulds);

  const coveragePercent = total > 0 ? Math.round(((yes + partial) / total) * 100) : 0;

  // Golden Rulebook stats (rows with id starting with "GR")
  const grRows = allRows.filter((r) => r.id.startsWith("GR"));
  const grTotal = grRows.length;
  const grYes = grRows.filter((r) => r.status === "yes").length;
  const grPartial = grRows.filter((r) => r.status === "partial").length;
  const grNo = grRows.filter((r) => r.status === "no").length;
  const grPercent = grTotal > 0 ? Math.round(((grYes + grPartial) / grTotal) * 100) : 0;

  return {
    total,
    yes,
    partial,
    no,
    extra,
    eisTotal: eisStats.total,
    eisYes: eisStats.yes,
    eisPartial: eisStats.partial,
    eisNo: eisStats.no,
    wensTotal: wensStats.total,
    wensYes: wensStats.yes,
    wensPartial: wensStats.partial,
    wensNo: wensStats.no,
    couldTotal: couldStats.total,
    couldYes: couldStats.yes,
    couldPartial: couldStats.partial,
    couldNo: couldStats.no,
    coveragePercent,
    grTotal,
    grYes,
    grPartial,
    grNo,
    grPercent,
  };
}
