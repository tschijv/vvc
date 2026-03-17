# Regeneratie-prompt: Voorzieningencatalogus

> Gebruik deze prompt om de volledige applicatie opnieuw te genereren met Claude Code of een vergelijkbare AI-assistent. Kopieer de relevante secties als context bij het starten van een nieuw project.

---

## Opdracht

Bouw een **Voorzieningencatalogus** voor de Nederlandse gemeentelijke sector. Dit is een webapplicatie waarmee gemeenten hun softwarepakketten, leveranciers, standaarden en koppelingen kunnen beheren en vergelijken. De applicatie is gebaseerd op het GEMMA-referentiemodel van VNG.

## Technische stack

- **Framework**: Next.js 16 (App Router, Server Components)
- **Taal**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL (Neon) via Prisma 7 met PrismaPg adapter
- **Authenticatie**: NextAuth v5 (credentials provider, bcrypt)
- **E-mail**: Resend
- **Rich text editor**: TipTap
- **Kaarten**: Leaflet / React-Leaflet
- **CSV/Excel**: csv-parse, xlsx
- **Document generatie**: docx (voor Word-documenten)
- **Deployment**: Vercel (Hobby tier)
- **Tests**: Vitest

## Datamodel (Prisma schema)

Maak de volgende entiteiten aan:

### Kern-entiteiten
1. **Leverancier** - Softwareleveranciers met contactgegevens, convenant-status, logo, support/documentatie URLs
2. **Pakket** - Softwarepakketten van leveranciers (naam, slug, beschrijving, productpagina URL)
3. **Pakketversie** - Versies van pakketten met status (in ontwikkeling/test/distributie), start-datums per fase
4. **PakketContact** - Contactpersonen per pakket
5. **ExternPakket** - Externe pakketten buiten de catalogus (voor koppelingen)

### GEMMA-domein
6. **Referentiecomponent** - GEMMA referentiecomponenten (gesynchroniseerd via API)
7. **Standaard** - Standaarden (bijv. StUF, API's)
8. **Standaardversie** - Versies van standaarden met compliancyMonitor vlag
9. **Applicatiefunctie** - Applicatiefuncties uit GEMMA
10. **GemmaView** - Views/diagrammen uit het GEMMA ArchiMate-model

### Gemeente-domein
11. **Gemeente** - Alle Nederlandse gemeenten met CBS-code, contactgegevens, voortgang
12. **Samenwerking** - Samenwerkingsverbanden tussen gemeenten
13. **SamenwerkingGemeente** - Koppeltabel Samenwerking-Gemeente

### Integratie-domein
14. **Koppeling** - Koppelingen/integraties tussen systemen bij een gemeente (bron, doel, richting, standaard, protocol)
15. **Addendum** - Addenda bij convenanten
16. **LeverancierAddendum** - Koppeltabel Leverancier-Addendum

### Koppeltabellen met attributen
17. **GemeentePakket** - Welk pakket een gemeente gebruikt (status, licentievorm, technologie, aantal gebruikers)
18. **PakketversieReferentiecomponent** - Welke referentiecomponenten een pakketversie implementeert (type: leverancier/gemeente)
19. **PakketversieStandaard** - Compliancy van pakketversie aan standaardversie (incl. testrapport URL)
20. **PakketversieApplicatiefunctie** - Welke applicatiefuncties een pakketversie ondersteunt
21. **PakketversieTechnologie** - Technologieen per pakketversie

### Gebruikers & Content
22. **User** - Gebruikers met rollen (enum: GEVERIFIEERD, GEMEENTE_RAADPLEGER/BEHEERDER, SAMENWERKING_BEHEERDER, LEVERANCIER, REDACTEUR, KING_RAADPLEGER/BEHEERDER, ADMIN, API_USER), gekoppeld aan gemeente of leverancier
23. **PasswordResetToken** - Wachtwoord-reset tokens
24. **Pagina** - CMS-pagina's (slug, titel, rich-text inhoud)
25. **Begrip** - Begrippen/termen conform NL-SBB/SKOS (term, definitie, URI, synoniemen, vocabulaire, status)
26. **AuditLog** - Audit logging (actie, entiteit, details, IP-adres)

## Pagina's en routes

### Publieke pagina's
- **`/`** - Homepage met tegelmenu in 3 groepen:
  - Oranje: Pakketten, Leveranciers
  - Blauw: Gemeenten, Standaarden, Referentiecomponenten, Samenwerkingen
  - Groen: Dienstverleners, Cloud-providers
- **`/pakketten`** - Overzicht alle pakketten met zoeken en filteren op leverancier
- **`/pakketten/[slug]`** - Pakketdetail met versies, referentiecomponenten, standaarden, applicatiefuncties, gemeenten
- **`/leveranciers`** - Overzicht alle leveranciers met zoeken, convenant-filter
- **`/leveranciers/[slug]`** - Leverancierdetail met pakketten, contactinfo, addenda
- **`/gemeenten`** - Overzicht alle gemeenten met voortgangsindicator, zoeken
- **`/gemeenten/[slug]`** - Gemeentedetail met applicatieportfolio, koppelingen
- **`/gemeenten/vergelijk`** - Vergelijk twee gemeenten qua pakketgebruik
- **`/standaarden`** - Overzicht standaarden met versies en compliancy-percentages
- **`/referentiecomponenten`** - Overzicht referentiecomponenten met pakketdekking
- **`/samenwerkingen`** - Overzicht samenwerkingsverbanden
- **`/samenwerkingen/[id]`** - Detail met deelnemende gemeenten
- **`/koppelingen`** - Overzicht koppelingen per gemeente
- **`/compliancy`** - Compliancy-monitor: matrix van pakketten vs standaarden
- **`/begrippen`** - Begrippenkader met zoeken (NL-SBB/SKOS vocabulaire)
- **`/kaart`** - Interactieve kaart (Leaflet) met gemeenten
- **`/kaart/nederland`** - SVG-kaart van Nederland met gemeenten ingekleurd
- **`/inkoop`** - Inkoopondersteuning: selecteer applicatiefuncties, vergelijk pakketten
- **`/zoeken`** - Globale zoekfunctie over alle entiteiten
- **`/dashboard`** - Dashboard met statistieken en grafieken
- **`/info/[slug]`** - CMS-pagina's (handleidingen, nieuws)
- **`/dienstverleners`** - Placeholder (nog niet geimplementeerd)
- **`/cloudproviders`** - Placeholder (nog niet geimplementeerd)

### Authenticatie
- **`/auth/login`** - Inlogpagina
- **`/auth/registreren`** - Registratie (met organisatietype-keuze)
- **`/auth/wachtwoord-vergeten`** - Wachtwoord vergeten
- **`/auth/wachtwoord-reset`** - Wachtwoord resetten

### Beheerpagina's (ADMIN-rol)
- **`/admin`** - Beheerdashboard met links naar alle beheermodules
- **`/admin/gebruikers`** - Gebruikersbeheer (overzicht, rollen wijzigen)
- **`/admin/gebruikers/[id]`** - Gebruiker bewerken
- **`/admin/registraties`** - Nieuwe registraties goedkeuren/afwijzen
- **`/admin/registraties/[id]`** - Registratie beoordelen
- **`/admin/gemeenten/samenvoegen`** - Gemeenten samenvoegen (herindeling)
- **`/admin/auditlog`** - Audit log bekijken
- **`/admin/statistieken`** - Platform statistieken
- **`/admin/pve-analyse`** - PvE-analyse (104 eisen en wensen)
- **`/admin/datamodel`** - MIM-informatiemodel (UML-diagram)
- **`/upload`** - Data importeren (CSV, JSON, Excel)

### Admin panels (componenten op /admin)
- **GemmaSyncPanel** - Synchroniseer referentiecomponenten en standaarden vanuit GEMMA ArchiMate API
- **BegrippenSyncPanel** - Synchroniseer begrippen vanuit NL-SBB SKOS/Skosmos API
- **ApiDocPanel** - Link naar API-documentatie
- **DeployPanel** - Deploy naar Vercel (alleen in development)

### REST API (v1)
- **`/api/v1/gemeenten`** - GET gemeenten (paginatie, zoeken, include pakketten)
- **`/api/v1/gemeenten/[id]`** - GET gemeente detail
- **`/api/v1/gemeenten/[id]/pakketten`** - GET pakketten van gemeente
- **`/api/v1/leveranciers`** - GET leveranciers (paginatie, zoeken)
- **`/api/v1/leveranciers/[id]`** - GET leverancier detail
- **`/api/v1/leveranciers/[id]/pakketten`** - GET pakketten van leverancier
- **`/api/v1/referentiecomponenten`** - GET referentiecomponenten
- **`/api/v1/standaarden`** - GET standaarden
- **`/api/v1/begrippen`** - GET begrippen (zoeken, vocabulaire filter)
- **`/api/v1/openapi`** - OpenAPI 3.0 specificatie (JSON)
- **`/api/v1/docs`** - Swagger UI

### Interne API's
- **`/api/admin/sync-gemma`** - POST synchroniseer GEMMA data
- **`/api/admin/sync-begrippen`** - POST synchroniseer begrippen
- **`/api/admin/deploy`** - POST deploy naar Vercel
- **`/api/admin/users`** - GET/POST gebruikers
- **`/api/admin/users/[id]`** - PATCH/DELETE gebruiker
- **`/api/admin/registraties`** - GET registraties
- **`/api/admin/registraties/[id]`** - PATCH registratie (goedkeuren/afwijzen)
- **`/api/admin/gemeenten/samenvoegen`** - POST gemeenten samenvoegen
- **`/api/admin/gemeenten/samenvoegen/preview`** - POST preview samenvoegen
- **`/api/auth/registreren`** - POST nieuwe registratie
- **`/api/auth/wachtwoord-vergeten`** - POST wachtwoord-vergeten email
- **`/api/auth/wachtwoord-reset`** - POST wachtwoord resetten
- **`/api/begrippen`** - GET begrippen voor GlossaryProvider
- **`/api/export`** - GET export data als CSV/JSON
- **`/api/inkoop`** - POST inkoop-vergelijking
- **`/api/kaart`** - GET kaartdata
- **`/api/kaart/gemeenten`** - GET gemeenten voor kaart
- **`/api/views`** - GET GEMMA views
- **`/api/upload/gemeente-portfolio`** - POST import gemeente portfolio
- **`/api/upload/leverancier-pakketten`** - POST import leverancier pakketten
- **`/api/upload/templates`** - GET download import templates

## Shared componenten
- **GlossaryHighlighter** - Markeert begrippen in tekst met tooltips (event delegation, onMouseOver/onMouseLeave)
- **GlossaryProvider** - Client-side context provider die begrippen laadt
- **AuthButton** - Login/logout knop met gebruikersnaam
- **MobileNav** - Mobiel navigatiemenu
- **MobileFilterToggle** - Toggle voor filters op mobiel
- **RichTextEditor** - TipTap rich-text editor voor CMS-pagina's
- **KaartViewer** - Leaflet kaartcomponent
- **Spinner** - Laad-indicator
- **ThemeToggle** - Dark/light mode toggle
- **ErrorAlert** - Foutmelding component
- **DashboardExportBar** - Export-balk op dashboard
- **DashboardKaartBar** - Kaart-balk op dashboard
- **GemeenteSelector** - Gemeente-selectie dropdown
- **Providers** - SessionProvider wrapper

## Services (lib/services/)
- **audit.ts** - Audit logging
- **begrippen.ts** - Begrippen CRUD + NL-SBB sync
- **export.ts** - Data export (CSV, JSON)
- **gemeente.ts** - Gemeente CRUD
- **gemma.ts** - GEMMA API sync (referentiecomponenten, standaarden, views)
- **kaart.ts** - Kaartdata queries
- **leverancier.ts** - Leverancier CRUD
- **pakket.ts** - Pakket CRUD
- **referentiecomponent.ts** - Referentiecomponent queries
- **samenwerking.ts** - Samenwerking CRUD
- **standaard.ts** - Standaard queries
- **upload.ts** - Import CSV/Excel
- **upload-templates.ts** - Download import templates
- **user.ts** - User CRUD, registraties

## Lib utilities
- **auth.ts** - NextAuth configuratie
- **auth-helpers.ts** - Session helpers (getSessionUser)
- **email.ts** - Resend email verzending
- **email-templates.ts** - Email templates (welkom, wachtwoord-reset)
- **menu-items.ts** - Navigatiemenu structuur
- **openapi.ts** - OpenAPI specificatie generator
- **prisma.ts** - Prisma client singleton
- **progress.ts** - Voortgangsberekening voor gemeenten

## GEMMA synchronisatie
De applicatie synchroniseert data uit externe bronnen:
- **GEMMA ArchiMate Model API** (gemmaonline.nl): Referentiecomponenten, standaarden, applicatiefuncties, views
- **NL-SBB SKOS/Skosmos API** (begrippenxl.nl): Begrippen/termen voor het begrippenkader

## Stijl en UX
- Kleurenpalet: VNG-blauw (#1a6ca8), oranje voor leveranciers/pakketten, groen voor dienstverleners
- Responsive design (mobile-first)
- Compacte tabellen met hover-effects
- Glassmorphism-achtig design op sommige elementen
- Zoekfunctionaliteit op de meeste overzichtspagina's
- Breadcrumb-achtige navigatie
- Dark mode ondersteuning (ThemeToggle)

## Data import
De applicatie ondersteunt import van:
- **CSV**: Gemeenten, pakketten, portfolio, samenwerkingen
- **Excel (.xlsx)**: Pakketten, portfolio
- **JSON**: Diverse datasets
- Import scripts staan in `scripts/import/`

## Environment variabelen
```
DATABASE_URL=postgresql://...@neon.tech/...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
RESEND_API_KEY=...
VERCEL_TOKEN=... (voor deploy functionaliteit)
```

## Documentatie-generatie
In `docs/` staan scripts voor het genereren van Word-documenten:
- **generate-advies.cjs** - Adviesdocument voor VNG (ArchiXL branding, kosteninschattingen, scenario's)
- MIM-informatiemodel als PlantUML bronbestand

## Bijzonderheden
- Het begrippenkader gebruikt de GlossaryHighlighter component die automatisch termen in tekst herkent en tooltips toont
- De compliancy-monitor toont een matrix van pakketten vs standaarden met vinkjes/kruisjes
- De inkoopondersteuning laat gebruikers applicatiefuncties selecteren en vergelijkt welke pakketten deze ondersteunen
- De kaart-pagina toont gemeenten op een interactieve Leaflet-kaart EN een statische SVG-kaart van Nederland
- Gemeenten kunnen worden samengevoegd bij herindelingen (met data-migratie)
- De PvE-analyse pagina toont 104 eisen en wensen uit het programma van eisen
- Er is een audit log die alle mutaties bijhoudt
- API-authenticatie via API_USER rol met bearer tokens
