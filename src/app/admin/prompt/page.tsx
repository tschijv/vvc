import { redirect } from "next/navigation";
import { getSessionUser } from "@/process/auth-helpers";
import Link from "next/link";
import Breadcrumbs from "@/ui/components/Breadcrumbs";
import CopyButton from "./CopyButton";
import { aantalEntiteiten } from "@/app/admin/datamodel/datamodel-data";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-gray-900 mb-2 border-b border-gray-200 pb-1">{title}</h2>
      {children}
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-bold text-gray-700 mb-1">{title}</h3>
      {children}
    </div>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return <li className="text-sm text-gray-600 leading-relaxed">{children}</li>;
}

function Code({ children }: { children: React.ReactNode }) {
  return <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>;
}

function Bold({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold text-gray-800">{children}</strong>;
}

export default async function PromptPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  const promptText = `# Regeneratie-prompt: Voorzieningencatalogus

> Gebruik deze prompt om de volledige applicatie opnieuw te genereren met Claude Code of een vergelijkbare AI-assistent.

## Opdracht

Bouw een Voorzieningencatalogus voor de Nederlandse gemeentelijke sector. Dit is een webapplicatie waarmee gemeenten hun softwarepakketten, leveranciers, standaarden en koppelingen kunnen beheren en vergelijken. De applicatie is gebaseerd op het GEMMA-referentiemodel van VNG.

## Technische stack

- Framework: Next.js 16 (App Router, Server Components)
- Taal: TypeScript
- Styling: Tailwind CSS v4
- Database: PostgreSQL (Neon) via Prisma 7 met PrismaPg adapter
- Authenticatie: NextAuth v5 (credentials provider, bcrypt)
- E-mail: Resend
- Rich text editor: TipTap
- Kaarten: Leaflet / React-Leaflet
- CSV/Excel: csv-parse, xlsx
- Document generatie: docx (voor Word-documenten)
- Deployment: Vercel
- Tests: Vitest + Playwright (26 E2E tests)
- Demo: Playwright script + in-app DemoPlayer met spraaksynthese

## Datamodel — ${aantalEntiteiten} entiteiten

### Kern-entiteiten
1. Leverancier — contactgegevens, convenant-status, logo, support/documentatie URLs
2. Pakket — softwarepakketten van leveranciers (naam, slug, beschrijving)
3. Pakketversie — versies met status (in ontwikkeling/test/distributie)
4. PakketContact — contactpersonen per pakket
5. ExternPakket — externe pakketten buiten de catalogus
6. Testrapport — testrapporten bij pakketversies met status-badges

### GEMMA-domein
7. Referentiecomponent — GEMMA referentiecomponenten
8. Standaard — standaarden (bijv. StUF, API's)
9. Standaardversie — versies met compliancyMonitor vlag
10. Applicatiefunctie — applicatiefuncties uit GEMMA
11. GemmaView — views/diagrammen uit GEMMA ArchiMate-model

### Gemeente-domein
12. Gemeente — alle gemeenten met CBS-code, voortgang
13. Samenwerking — samenwerkingsverbanden
14. SamenwerkingGemeente — koppeltabel

### Integratie-domein
15. Koppeling — integraties tussen systemen (bron, doel, richting, standaard)
16. Addendum — addenda bij convenanten
17. LeverancierAddendum — koppeltabel

### Koppeltabellen met attributen
18. GemeentePakket — welk pakket een gemeente gebruikt
19. PakketReferentiecomponent — implementatie referentiecomponenten
20. PakketStandaard — compliancy aan standaardversies
21. PakketApplicatiefunctie — ondersteunde functies
22. PakketTechnologie — technologieën per pakket

### Gebruikers & Content
23. User — met rollen (10 rollen), gekoppeld aan gemeente/leverancier
24. PasswordResetToken
25. Pagina — CMS-pagina's (slug, titel, rich-text)
26. Begrip — NL-SBB/SKOS begrippen
27. AuditLog — audit logging
28. AppSetting — key-value configuratie (bijv. SKOSMOS vocabulaires)
29. Notificatie — notificaties per gebruiker (type, titel, bericht, gelezen)
30. Favoriet — favorieten per gebruiker (entiteitType, entiteitId)

## Pagina's — 50+ routes

Publiek: /, /pakketten, /pakketversies, /leveranciers, /gemeenten, /standaarden, /referentiecomponenten, /applicatiefuncties, /addenda, /samenwerkingen, /koppelingen, /compliancy, /begrippen, /kaart, /inkoop, /zoeken, /dashboard, /favorieten, /notificaties, /marktverdeling, /info/[slug], /dienstverleners, /cloudproviders
Auth: /auth/login, /auth/registreren, /auth/wachtwoord-vergeten, /auth/wachtwoord-reset
Admin: /admin, /admin/gebruikers, /admin/registraties, /admin/gemeenten/samenvoegen, /admin/auditlog, /admin/statistieken, /admin/pve-analyse, /admin/datamodel, /admin/linked-data, /admin/prompt, /admin/demo, /upload
API v1: /api/v1/gemeenten, /api/v1/leveranciers, /api/v1/referentiecomponenten, /api/v1/standaarden, /api/v1/begrippen, /api/v1/openapi, /api/v1/docs, /api/feed

## GEMMA synchronisatie
- GEMMA ArchiMate Model API (gemmaonline.nl)
- NL-SBB SKOS/Skosmos API (begrippenxl.nl) — begrippen worden live opgehaald, niet uit database

## Linked Data (RDF)
- Publicatie van catalogusdata als JSON-LD, Turtle en RDF/XML
- Content negotiation via Accept header of ?format= parameter
- DCAT-catalogus voor machine-readable metadata
- Begrippen als SKOS-concepten
- Privacy-bewust: gemeente-pakket relaties niet openbaar
- Admin Linked Data explorer pagina (/admin/linked-data)

## CSV Export
- CSV-export endpoints voor pakketten, leveranciers en gemeenten
- Gefilterd exporteren vanuit overzichtspagina's

## Performance-optimalisaties
- 15 database-indexes op foreign key lookups in Prisma schema
- Promise.all parallellisatie op gemeente-detailpagina (was sequentieel, nu parallel)
- Lazy-loading van zware componenten via Next.js dynamic imports: KaartViewer (-170KB), RichTextEditor (-150KB)
- WebP-beeldcompressie: 3 grote PNG's geconverteerd (889KB → 335KB, -62%)
- Select clauses in 3 key services (gemeente, leverancier, favorieten) voor efficiënte data-ophaling
- Dashboard is hoofd-tab op gemeente-detailpagina (Overzicht-tab verwijderd)

## UX & Toegankelijkheid
- Loading skeletons op alle overzichtspagina's
- Keyboard shortcuts (/ voor zoeken)
- Breadcrumb-navigatie op detailpagina's
- AppSetting model voor configureerbare vocabulaires (SKOSMOS)

## Bijzonderheden
- GlossaryHighlighter: automatische begrippen-tooltips
- Compliancy-monitor: matrix pakketten vs standaarden
- Inkoopondersteuning: selecteer functies, vergelijk pakketten
- Kaart: Leaflet + SVG-kaart van Nederland
- Gemeente samenvoegen bij herindelingen
- PvE-analyse: 104 eisen en wensen
- Audit log voor alle mutaties
- API-authenticatie via API_USER rol
- Notificatiesysteem: bel in header, /notificaties pagina
- Favorieten: hart-icoon op detailpagina's, /favorieten overzicht
- Dark mode: volledig afgewerkt met systeemvoorkeur-detectie
- QR-codes: op alle detailpagina's voor eenvoudig delen
- Share-button: kopieer-link op detailpagina's
- Testrapporten: status-badges bij pakketversies
- Wijzigingshistorie: tijdlijn op pakketdetailpagina
- Pakketversies pagina: /pakketversies met status-filter
- Addenda pagina: /addenda met sidebar checkboxes en bewerkmodal
- Applicatiefuncties pagina: /applicatiefuncties uit GEMMA
- Homepage zoekbalk: snelzoeken bovenaan homepage
- Laatste wijzigingen: feed op homepage
- Vergelijkbare gemeenten: Jaccard-similariteit, volledige pagina (/gemeenten/[slug]/vergelijkbaar) met sorteerbare tabel (tot 500 gemeenten)
- Bulk-vergelijking: tot 4 gemeenten vergelijken
- CollapsibleFilterList: inklapbare sidebar-filters met "Meer tonen..." link, werkende URL-parameter filters
- Geautomatiseerde demo: DemoPlayer (in-app) + Playwright CLI script met Nederlandse spraaksynthese en ondertiteling
- Demo-secties: single source of truth in lib/demo-sections.ts (22 secties, gebruikt door pagina + scripts)
- API rate limiting: 100/min API, 10/min auth, 30/min admin
- RSS/Atom feed: /api/feed
- Print styles: CSS voor nette afdrukken
- E2E tests: 26 Playwright tests
- Marktverdeling: scatterplot van leveranciers (klanten vs referentiecomponenten vs pakketten), pure SVG
- Npm-health panel: admin pagina voor npm audit, ongebruikte packages, kwetsbaarheden fixen
- Inline bewerken: gemeente contactgegevens bewerkbaar via edit-knop (GEMEENTE_BEHEERDER/ADMIN)
- Zoeken multi-filter: meerdere type-filters tegelijk selecteren, counts per type altijd zichtbaar
- Pre-generated demo audio: OpenAI TTS (HD) MP3's met fallback naar browser spraaksynthese

## Guardrails — Architectuur & Code-conventies

### Architectuurregels
- Server Components als default, Client Components alleen voor interactiviteit (useState, onClick)
- Geen @ts-nocheck — los type-errors op
- Nieuwe Prisma-modellen altijd via migraties, niet db push in productie
- Geen hardcoded waarden — gebruik environment variables of database config (AppSetting)
- Elke nieuwe pagina heeft een loading.tsx skeleton
- Services in lib/services/ — één bestand per domein
- API routes in app/api/ — altijd auth check + input validatie + rate limiting
- Gelaagde architectuur: Pages → Services → Prisma (nooit pages direct naar database)

### Naamgeving
- Nederlandse UI-teksten, Engelse code (variabelen, functies, comments)
- Prisma modellen: PascalCase (Pakketversie, niet pakketVersie)
- Routes: kebab-case (/pakketversies, niet /pakketVersies)
- Componenten: PascalCase bestandsnamen (ShareButton.tsx)
- URL-parameter in Next.js routes: [slug] — URL-vriendelijke versie van een naam

### Styling
- Tailwind classes, geen inline styles
- Brand kleuren: #1a6ca8 (blauw), #e35b10 (oranje), #c44b0a (donker oranje)
- Card-styling: bg-white border border-gray-200 rounded-lg overflow-hidden
- KPI-cards: oranje kopje, oranje icoon-blok rechts, groen blokje met aantal
- Dark mode: altijd dark: variant meegeven op nieuwe componenten
- Filterlijsten: uitklapbaar met "Meer tonen..." (max 5 initieel), CollapsibleFilterList component

### Security
- Authenticatie: getSessionUser() aan begin van elke beschermde pagina en API route
- Autorisatie: user.role check voor rolgebonden functionaliteit (ADMIN, GEMEENTE, LEVERANCIER)
- Rate limiting: withRateLimit() op alle publieke API endpoints (100/min API, 10/min auth, 30/min admin)
- Altijd Prisma parameterized queries, nooit raw SQL met string concatenation
- Geen dangerouslySetInnerHTML tenzij content gesanitized (DOMPurify)
- Secrets alleen via .env / Vercel environment variables
- Contactgegevens gemeenten niet in RDF/API zonder authenticatie
- Audit log bij elke mutatie (AuditLog model)

### Performance
- Database queries: altijd select of include specificeren, nooit hele records ophalen
- Paginering verplicht op lijstpagina's (25 per pagina)
- Externe API calls (SKOSMOS, GEMMA Online): altijd cachen (minimaal 1 uur)
- Afbeeldingen: Next.js Image component met lazy loading, WebP waar mogelijk
- Zware client-componenten: lazy-loaden via next/dynamic
- Promise.all voor parallelle onafhankelijke database queries
- Vermijd N+1 queries — gebruik Prisma include of batch queries
- 15 database-indexes op foreign key lookups

### Toegankelijkheid (WCAG)
- Semantische HTML: nav, main, article, section, aside
- ARIA labels op interactieve elementen
- Keyboard navigeerbaar: alle klikbare elementen via Tab, activeerbaar via Enter
- Kleurcontrast: minimaal 4.5:1 voor tekst, 3:1 voor grote tekst
- Focus indicators: zichtbare focus-ring op interactieve elementen
- Alt-teksten op afbeeldingen
- Formulieren: labels gekoppeld aan inputs, foutmeldingen bij velden
- Responsief: 375px (mobile) tot 1920px+ (desktop)

### Herbruikbaarheid (DRY)
- Hergebruik bestaande componenten — check eerst components/
- Gedeelde UI-patronen als component (CollapsibleFilterList, ShareButton, FavorietButton, QRCode)
- Database queries in services (lib/services/), nooit direct Prisma in pages
- Gedeelde types exporteren vanuit services
- Menu-items centraal in lib/menu-items.ts
- Bij 3+ plekken met dezelfde logica: extraheer naar gedeelde functie of component`;

  return (
    <div>
      <Breadcrumbs items={[
        { label: "Beheer", href: "/admin" },
        { label: "Regeneratie-prompt", href: "/admin/prompt" },
      ]} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Regeneratie-prompt</h1>
          <p className="text-sm text-gray-500 mt-1">Prompt om de applicatie opnieuw te genereren met AI</p>
        </div>
      </div>

      {/* Kopieer-blok */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Volledige prompt (kopieerbaar)</h2>
          <CopyButton text={promptText} />
        </div>
        <pre className="bg-gray-50 border border-gray-100 rounded p-4 text-xs text-gray-700 font-mono whitespace-pre-wrap max-h-[400px] overflow-y-auto leading-relaxed">
          {promptText}
        </pre>
      </div>

      {/* Leesbare versie */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            Gebruik deze prompt om de volledige applicatie opnieuw te genereren met <Bold>Claude Code</Bold> of
            een vergelijkbare AI-assistent. Kopieer de volledige prompt hierboven of gebruik de leesbare versie
            hieronder als referentie.
          </p>
        </div>

        <Section title="Opdracht">
          <p className="text-sm text-gray-600">
            Bouw een <Bold>Voorzieningencatalogus</Bold> voor de Nederlandse gemeentelijke sector.
            Een webapplicatie waarmee gemeenten hun softwarepakketten, leveranciers, standaarden en
            koppelingen kunnen beheren en vergelijken, gebaseerd op het GEMMA-referentiemodel van VNG.
          </p>
        </Section>

        <Section title="Technische stack">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              ["Framework", "Next.js 16"],
              ["Taal", "TypeScript"],
              ["Styling", "Tailwind CSS v4"],
              ["Database", "PostgreSQL (Neon) + Prisma 7"],
              ["Auth", "NextAuth v5"],
              ["E-mail", "Resend"],
              ["Editor", "TipTap"],
              ["Kaarten", "Leaflet"],
              ["Import", "csv-parse, xlsx"],
              ["Docs", "docx"],
              ["Deploy", "Vercel"],
              ["Tests", "Vitest + Playwright"],
              ["Demo", "Playwright + DemoPlayer"],
            ].map(([label, value]) => (
              <div key={label} className="bg-gray-50 rounded px-3 py-2">
                <div className="text-xs text-gray-400">{label}</div>
                <div className="text-sm font-medium text-gray-800">{value}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title={`Datamodel (${aantalEntiteiten} entiteiten)`}>
          {[
            {
              groep: "Kern-entiteiten",
              kleur: "bg-orange-50 border-orange-200",
              items: ["Leverancier", "Pakket", "Pakketversie", "PakketContact", "ExternPakket", "Testrapport"],
            },
            {
              groep: "GEMMA-domein",
              kleur: "bg-blue-50 border-blue-200",
              items: ["Referentiecomponent", "Standaard", "Standaardversie", "Applicatiefunctie", "GemmaView"],
            },
            {
              groep: "Gemeente-domein",
              kleur: "bg-green-50 border-green-200",
              items: ["Gemeente", "Samenwerking", "SamenwerkingGemeente"],
            },
            {
              groep: "Integratie-domein",
              kleur: "bg-amber-50 border-amber-200",
              items: ["Koppeling", "Addendum", "LeverancierAddendum"],
            },
            {
              groep: "Koppeltabellen",
              kleur: "bg-purple-50 border-purple-200",
              items: ["GemeentePakket", "PvReferentiecomponent", "PvStandaard", "PvApplicatiefunctie", "PvTechnologie"],
            },
            {
              groep: "Gebruikers & Content",
              kleur: "bg-teal-50 border-teal-200",
              items: ["User", "PasswordResetToken", "Pagina", "Begrip", "AuditLog", "AppSetting", "Notificatie", "Favoriet"],
            },
          ].map((g) => (
            <div key={g.groep} className={`border rounded px-3 py-2 mb-2 ${g.kleur}`}>
              <span className="text-xs font-semibold text-gray-600">{g.groep}: </span>
              <span className="text-xs text-gray-500">
                {g.items.map((item, i) => (
                  <span key={item}>
                    <Code>{item}</Code>
                    {i < g.items.length - 1 && ", "}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </Section>

        <Section title="Pagina's en routes (50+)">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SubSection title="Publiek">
              <ul className="space-y-0.5 list-none">
                {["/", "/pakketten", "/pakketversies", "/leveranciers", "/gemeenten",
                  "/standaarden", "/referentiecomponenten", "/applicatiefuncties",
                  "/addenda", "/samenwerkingen", "/koppelingen",
                  "/compliancy", "/begrippen", "/kaart", "/inkoop", "/zoeken",
                  "/dashboard", "/favorieten", "/notificaties", "/marktverdeling", "/info/[slug]"].map((r) => (
                  <Li key={r}><Code>{r}</Code></Li>
                ))}
              </ul>
            </SubSection>
            <SubSection title="Beheer (ADMIN)">
              <ul className="space-y-0.5 list-none">
                {["/admin", "/admin/gebruikers", "/admin/registraties",
                  "/admin/gemeenten/samenvoegen", "/admin/auditlog",
                  "/admin/statistieken", "/admin/pve-analyse",
                  "/admin/datamodel", "/admin/linked-data",
                  "/admin/prompt", "/admin/demo", "/upload"].map((r) => (
                  <Li key={r}><Code>{r}</Code></Li>
                ))}
              </ul>
            </SubSection>
            <SubSection title="REST API (v1)">
              <ul className="space-y-0.5 list-none">
                {["/api/v1/gemeenten", "/api/v1/leveranciers",
                  "/api/v1/referentiecomponenten", "/api/v1/standaarden",
                  "/api/v1/begrippen", "/api/v1/openapi", "/api/v1/docs",
                  "/api/feed"].map((r) => (
                  <Li key={r}><Code>{r}</Code></Li>
                ))}
              </ul>
            </SubSection>
          </div>
        </Section>

        <Section title="Externe integraties">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded p-3">
              <div className="text-sm font-semibold text-gray-700">GEMMA ArchiMate API</div>
              <div className="text-xs text-gray-500">gemmaonline.nl &mdash; Referentiecomponenten, standaarden, applicatiefuncties, views</div>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <div className="text-sm font-semibold text-gray-700">NL-SBB SKOS/Skosmos API</div>
              <div className="text-xs text-gray-500">begrippenxl.nl &mdash; Begrippen/termen voor het begrippenkader</div>
            </div>
          </div>
        </Section>

        <Section title="Performance-optimalisaties">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              ["Database-indexes", "15 indexes op FK-lookups in Prisma schema"],
              ["Promise.all", "Parallellisatie op gemeente-detailpagina (was sequentieel)"],
              ["Lazy-loading", "KaartViewer (-170KB) en RichTextEditor (-150KB) via dynamic imports"],
              ["WebP-compressie", "3 PNG's geconverteerd (889KB → 335KB, -62%)"],
              ["Select clauses", "In gemeente-, leverancier- en favorieten-services"],
              ["Dashboard hoofd-tab", "Overzicht-tab verwijderd op gemeente-detailpagina"],
            ].map(([title, desc]) => (
              <div key={title} className="flex gap-2 text-sm">
                <span className="text-[#1a6ca8] font-semibold whitespace-nowrap">{title}:</span>
                <span className="text-gray-500">{desc}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Bijzonderheden">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              ["Begrippen-tooltips", "GlossaryHighlighter markeert automatisch termen in tekst"],
              ["Compliancy-monitor", "Matrix van pakketten vs standaarden met vinkjes/kruisjes"],
              ["Inkoopondersteuning", "Selecteer applicatiefuncties, vergelijk pakketten"],
              ["Kaartweergave", "Leaflet + SVG-kaart van Nederland"],
              ["Gemeente samenvoegen", "Data-migratie bij herindelingen"],
              ["PvE-analyse", "104 eisen en wensen geanalyseerd"],
              ["Audit log", "Alle mutaties worden bijgehouden"],
              ["API-authenticatie", "Bearer tokens via API_USER rol + rate limiting"],
              ["Linked Data (RDF)", "JSON-LD, Turtle, RDF/XML via content negotiation + DCAT-catalogus"],
              ["CSV-export", "Gefilterd exporteren van pakketten, leveranciers en gemeenten"],
              ["Loading skeletons", "Skeleton placeholders op alle overzichtspagina's"],
              ["Keyboard shortcuts", "/ voor zoeken, breadcrumb-navigatie"],
              ["SKOSMOS integratie", "Begrippen live van SKOSMOS, configureerbare vocabulaires"],
              ["Notificaties", "Bel in header, /notificaties pagina met overzicht meldingen"],
              ["Favorieten", "Hart-icoon op detailpagina's, /favorieten overzicht"],
              ["Dark mode", "Volledig afgewerkt met systeemvoorkeur-detectie"],
              ["QR-codes", "Op alle detailpagina's voor eenvoudig delen"],
              ["Share-button", "Kopieer-link op detailpagina's"],
              ["Testrapporten", "Status-badges bij pakketversies"],
              ["Wijzigingshistorie", "Tijdlijn op pakketdetailpagina"],
              ["Pakketversies", "/pakketversies met status-filter"],
              ["Addenda", "/addenda met sidebar checkboxes en bewerkmodal"],
              ["Applicatiefuncties", "/applicatiefuncties uit GEMMA"],
              ["Homepage zoekbalk", "Snelzoeken bovenaan homepage"],
              ["Laatste wijzigingen", "Feed op homepage"],
              ["Bulk-vergelijking", "Tot 4 gemeenten, Jaccard-similariteit"],
              ["Vergelijkbare gemeenten", "Volledige pagina met sorteerbare tabel (tot 500 gemeenten)"],
              ["CollapsibleFilterList", "Inklapbare sidebar-filters met werkende URL-parameter filtering"],
              ["Geautomatiseerde demo", "In-app DemoPlayer + CLI script met Nederlandse spraaksynthese en ondertiteling"],
              ["Demo draaiboek", "/admin/demo met startknop, toetsenbordbediening en onderhoudsinstructies"],
              ["RSS/Atom feed", "/api/feed voor syndication"],
              ["Print styles", "CSS voor nette afdrukken"],
              ["E2E tests", "26 Playwright tests voor alle gebruikersflows"],
              ["Marktverdeling", "Scatterplot leveranciers: klanten vs referentiecomponenten vs pakketten (pure SVG)"],
              ["Npm-health panel", "Admin: npm audit, ongebruikte packages detectie, kwetsbaarheden fixen"],
              ["Inline bewerken", "Gemeente contactgegevens bewerkbaar via edit-knop"],
              ["Zoeken multi-filter", "Meerdere type-filters tegelijk, counts per type zichtbaar"],
              ["Demo audio (HD)", "OpenAI TTS MP3's met fallback naar browser spraaksynthese"],
            ].map(([title, desc]) => (
              <div key={title} className="flex gap-2 text-sm">
                <span className="text-[#1a6ca8] font-semibold whitespace-nowrap">{title}:</span>
                <span className="text-gray-500">{desc}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Guardrails — Architectuur & Conventies">
          <div className="space-y-4">
            <SubSection title="Architectuurregels">
              <ul className="space-y-0.5 list-disc list-inside">
                <Li>Server Components als default, Client Components alleen voor interactiviteit</Li>
                <Li>Geen <Code>@ts-nocheck</Code> — los type-errors op</Li>
                <Li>Prisma-migraties voor productie, niet <Code>db push</Code></Li>
                <Li>Geen hardcoded waarden — environment variables of <Code>AppSetting</Code></Li>
                <Li>Elke pagina: <Code>loading.tsx</Code> skeleton</Li>
                <Li>Services in <Code>lib/services/</Code> — één bestand per domein</Li>
                <Li>Gelaagde architectuur: Pages → Services → Prisma</Li>
              </ul>
            </SubSection>

            <SubSection title="Naamgeving">
              <ul className="space-y-0.5 list-disc list-inside">
                <Li>Nederlandse UI-teksten, Engelse code (variabelen, functies, comments)</Li>
                <Li>Prisma modellen: PascalCase (<Code>Pakketversie</Code>)</Li>
                <Li>Routes: kebab-case (<Code>/pakketversies</Code>)</Li>
                <Li>Componenten: PascalCase (<Code>ShareButton.tsx</Code>)</Li>
                <Li>URL-parameter: <Code>[slug]</Code> — URL-vriendelijke naam</Li>
              </ul>
            </SubSection>

            <SubSection title="Styling">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  ["Tailwind classes", "Geen inline styles"],
                  ["Brand blauw", "#1a6ca8"],
                  ["Brand oranje", "#e35b10 / #c44b0a"],
                  ["Dark mode", "Altijd dark: variant meegeven"],
                  ["Cards", "bg-white border border-gray-200 rounded-lg"],
                  ["Filters", "CollapsibleFilterList, max 5 initieel"],
                ].map(([label, value]) => (
                  <div key={label} className="flex gap-2 text-sm">
                    <span className="text-[#1a6ca8] font-semibold whitespace-nowrap">{label}:</span>
                    <span className="text-gray-500">{value}</span>
                  </div>
                ))}
              </div>
            </SubSection>

            <SubSection title="Security">
              <ul className="space-y-0.5 list-disc list-inside">
                <Li><Code>getSessionUser()</Code> aan begin van elke beschermde pagina en API route</Li>
                <Li><Code>user.role</Code> check: ADMIN, GEMEENTE, LEVERANCIER</Li>
                <Li><Code>withRateLimit()</Code> op alle publieke API endpoints</Li>
                <Li>Altijd Prisma parameterized queries, nooit raw SQL</Li>
                <Li>Geen <Code>dangerouslySetInnerHTML</Code> tenzij gesanitized (DOMPurify)</Li>
                <Li>Secrets alleen via <Code>.env</Code> / Vercel environment variables</Li>
                <Li>Audit log bij elke mutatie</Li>
                <Li>Contactgegevens niet in RDF/API zonder authenticatie</Li>
              </ul>
            </SubSection>

            <SubSection title="Performance">
              <ul className="space-y-0.5 list-disc list-inside">
                <Li>Altijd <Code>select</Code> of <Code>include</Code> specificeren in queries</Li>
                <Li>Paginering verplicht (25 per pagina)</Li>
                <Li>Externe API calls: cachen (minimaal 1 uur)</Li>
                <Li>Next.js <Code>Image</Code> met lazy loading, WebP waar mogelijk</Li>
                <Li>Zware componenten: <Code>next/dynamic</Code> lazy-loading</Li>
                <Li><Code>Promise.all</Code> voor parallelle onafhankelijke queries</Li>
                <Li>Vermijd N+1 queries — Prisma <Code>include</Code> of batch queries</Li>
              </ul>
            </SubSection>

            <SubSection title="Toegankelijkheid (WCAG)">
              <ul className="space-y-0.5 list-disc list-inside">
                <Li>Semantische HTML: <Code>nav</Code>, <Code>main</Code>, <Code>article</Code>, <Code>section</Code></Li>
                <Li>ARIA labels op interactieve elementen</Li>
                <Li>Keyboard navigeerbaar (Tab + Enter)</Li>
                <Li>Kleurcontrast: minimaal 4.5:1 tekst, 3:1 grote tekst</Li>
                <Li>Focus indicators op interactieve elementen</Li>
                <Li>Alt-teksten, labels bij inputs, foutmeldingen bij velden</Li>
                <Li>Responsief: 375px (mobile) tot 1920px+ (desktop)</Li>
              </ul>
            </SubSection>

            <SubSection title="Herbruikbaarheid (DRY)">
              <ul className="space-y-0.5 list-disc list-inside">
                <Li>Hergebruik bestaande componenten — check eerst <Code>components/</Code></Li>
                <Li>Database queries in <Code>lib/services/</Code>, nooit direct Prisma in pages</Li>
                <Li>Types exporteren vanuit services, niet opnieuw definiëren</Li>
                <Li>Menu-items centraal in <Code>lib/menu-items.ts</Code></Li>
                <Li>Bij 3+ plekken: extraheer naar gedeelde functie of component</Li>
              </ul>
            </SubSection>
          </div>
        </Section>

        <div className="border-t border-gray-200 pt-4 mt-6">
          <p className="text-xs text-gray-400">
            Bronbestand: <Code>PROMPT.md</Code> in de project root.
            Zie ook <Link href="/admin/datamodel" className="text-[#1a6ca8] hover:underline">Datamodel (MIM)</Link> voor
            het volledige informatiemodel en <Link href="/admin/demo" className="text-[#1a6ca8] hover:underline">Demo draaiboek</Link> voor
            de geautomatiseerde demo.
          </p>
        </div>
      </div>
    </div>
  );
}

