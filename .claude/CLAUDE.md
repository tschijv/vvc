# VNG Voorzieningencatalogus — Claude Code Guardrails

## Architectuurregels
- Geen `@ts-nocheck` toevoegen — los type-errors op
- Nieuwe Prisma modellen altijd via migraties, niet `db push` in productie
- Server components waar mogelijk, client components alleen waar interactiviteit nodig is
- Geen hardcoded waarden — gebruik environment variables of database config (AppSetting)
- Elke nieuwe pagina heeft een `loading.tsx` skeleton
- Services in `lib/services/` — één bestand per domein
- API routes in `app/api/` — volg bestaande patronen (auth check, error handling, rate limiting)

## Naamgeving
- Nederlandse UI-teksten, Engelse code (variabelen, functies, comments)
- Prisma modellen: PascalCase (`Pakketversie`, niet `pakketVersie`)
- Routes: kebab-case (`/pakketversies`, niet `/pakketVersies`)
- Componenten: PascalCase bestandsnamen (`ShareButton.tsx`)
- URL-parameter in Next.js routes heet `[slug]` — dit is de URL-vriendelijke versie van een naam

## Data & Privacy
- Geen echte persoonsgegevens in seed scripts of demo-data
- Contactgegevens gemeenten zijn gevoelig — niet in RDF/API zonder authenticatie
- Audit log bij elke mutatie (AuditLog model)
- Anonimisatie beschikbaar via admin panel voor demo-doeleinden

## Styling
- Tailwind classes, geen inline styles
- Brand kleuren: `#1a6ca8` (blauw), `#e35b10` (oranje), `#c44b0a` (donker oranje voor icoon-blokken)
- Card-styling: `bg-white border border-gray-200 rounded-lg overflow-hidden`
- KPI-cards: oranje kopje, oranje icoon-blok rechts, groen blokje met aantal
- Dark mode: altijd `dark:` variant meegeven op nieuwe componenten
- Geen CSS hacks (`.print\\:hidden` werkt niet in gewone CSS — gebruik Tailwind `print:hidden` class)
- Filterlijsten: uitklapbaar met "Meer tonen..." link (max 5 initieel), gebruik `CollapsibleFilterList` component

## Testing & Deploy
- TypeScript moet compileren voor deploy (geen `--skipLibCheck` trucs)
- Playwright tests uitsluiten van tsconfig (`exclude: ["tests", "playwright.config.ts"]`)
- Vercel env vars: geen newlines/whitespace in waarden (veroorzaakt auth-loops)
- Deploy via `npx vercel --prod --yes` of via Deploy-knop op admin pagina
- Na schema-wijzigingen: `npx prisma db push && npx prisma generate`

## Workflow
- Lees ALTIJD bestaande bestanden voordat je wijzigt
- Bij schema-wijzigingen: eerst schema aanpassen, dan db push, dan code
- Bij meerdere agents: geen overlappende bestanden bewerken
- Na elke grote wijziging: lokaal testen voor deploy
- Documentatie bijwerken bij nieuwe features:
  - Demo draaiboek (`app/admin/demo/page.tsx`)
  - PvE-analyse (`app/admin/pve-analyse/pve-data.ts`)
  - Datamodel MIM (`app/admin/datamodel/page.tsx`)
  - Regeneratie-prompt (`app/admin/prompt/page.tsx`)
  - Admin pagina badges/counts (`app/admin/page.tsx`)

## Wat NIET doen
- Geen npm packages installeren zonder te vragen
- Geen bestaande functionaliteit verwijderen zonder bevestiging
- Geen seed scripts die productie-data overschrijven
- Geen force push of destructieve git operaties
- Geen API keys of credentials in code committen
- Geen dubbele pagina's voor dezelfde data (bijv. apart Overzicht-tab en Pakketten-tab)

## VVC-specifiek
- GEMMA als bron: data bij voorkeur live ophalen (zoals begrippen via SKOSMOS), niet importeren
- Begrippen: via SKOSMOS API met caching, configureerbare vocabulaires via admin panel
- Linked Data: JSON-LD, Turtle, RDF/XML via content negotiation (`Accept` header of `?format=` parameter)
- Gemeente detailpagina: Dashboard is het hoofd-tab (niet Overzicht)
- Alle lijstpagina's: zoeken, filteren, pagineren (25 per pagina), CSV export
- Vergelijkbare gemeenten: Jaccard-similariteit, met info-icoon uitleg, volledige pagina op /gemeenten/[slug]/vergelijkbaar (sorteerbare tabel, tot 500 gemeenten)
- Softwarecatalogus.nl als referentie voor originele structuur (pakketten vs pakketversies, leveranciers vs addenda)

## Herbruikbaarheid & DRY
- Hergebruik bestaande componenten voordat je nieuwe maakt — check eerst `components/`
- Gedeelde UI-patronen als component extraheren (bijv. `CollapsibleFilterList`, `ShareButton`, `FavorietButton`, `QRCode`)
- Database queries in services (`lib/services/`), nooit direct Prisma calls in page components
- Gedeelde types exporteren vanuit services, niet opnieuw definiëren in componenten
- Utility functies in `lib/` (bijv. `lib/rate-limit.ts`, `lib/progress.ts`)
- Bij 3+ plekken met dezelfde logica: extraheer naar een gedeelde functie of component
- Menu-items centraal in `lib/menu-items.ts` — niet hardcoded in layout of navigatie
- Prisma `include` patronen hergebruiken — maak named includes voor veelvoorkomende queries

## Performance
- Server components als default — client components alleen voor interactiviteit (useState, onClick, etc.)
- Database queries: altijd `select` of `include` specificeren, nooit hele records ophalen als je maar 2 velden nodig hebt
- Paginering verplicht op lijstpagina's (25 per pagina) — nooit alle records in één keer laden
- Externe API calls (SKOSMOS, GEMMA Online): altijd cachen (minimaal 1 uur)
- Zware berekeningen (Jaccard-similariteit, dashboard stats): cachen of lazy loaden per tab
- Afbeeldingen: Next.js `<Image>` component met lazy loading
- Geen onnodige re-renders: memo/useMemo voor dure berekeningen in client components
- Database indexes: voeg toe bij veelgebruikte WHERE/ORDER BY kolommen
- `loading.tsx` skeletons op elke pagina zodat de gebruiker direct feedback krijgt
- Zware client-componenten: lazy-loaden via `next/dynamic` (bijv. KaartViewer, RichTextEditor)
- Afbeeldingen in WebP formaat waar mogelijk (niet PNG/JPG voor grote bestanden)
- Parallelle data-ophaling: gebruik `Promise.all` in plaats van sequentiële awaits waar queries onafhankelijk zijn
- Vermijd N+1 queries — gebruik Prisma `include` of batch queries

## Security
- Authenticatie: check `getSessionUser()` aan het begin van elke beschermde pagina en API route
- Autorisatie: check `user.role` voor rolgebonden functionaliteit (ADMIN, GEMEENTE, LEVERANCIER)
- API routes: altijd auth check + input validatie vóór database operaties
- Rate limiting: pas `withRateLimit()` toe op alle publieke API endpoints
  - `/api/v1/*`: 100 requests/min
  - `/api/auth/*`: 10 requests/min
  - `/api/admin/*`: 30 requests/min
- SQL injection: gebruik altijd Prisma parameterized queries, nooit raw SQL met string concatenation
- XSS: geen `dangerouslySetInnerHTML` tenzij content is gesanitized (DOMPurify)
- CSRF: NextAuth handelt dit af via tokens
- Secrets: nooit in code, altijd via `.env` / Vercel environment variables
- Wachtwoorden: altijd gehasht opslaan (bcrypt via NextAuth)
- CORS: standaard restrictief, alleen eigen domein
- HTTP headers: Vercel voegt standaard security headers toe (X-Frame-Options, etc.)
- Foutmeldingen: toon nooit stack traces of interne details aan eindgebruikers
- Dependency updates: controleer regelmatig op bekende kwetsbaarheden (`npm audit`)

## Schaalbaarheid & Onderhoudbaarheid
- Gelaagde architectuur: Pages → Services → Prisma (nooit pages direct naar database)
- Configuratie in database (AppSetting) of environment variables, niet in code
- Feature flags via AppSetting voor geleidelijke uitrol
- Logging: gebruik `console.error` voor fouten, niet `console.log` voor debug in productie
- Error handling: altijd try/catch in API routes, nooit `.catch(() => {})` (fouten niet stilletjes negeren)
- Migraties: bij productie altijd `prisma migrate deploy`, niet `db push`
- Database connectie pooling: Neon serverless driver voor Vercel Edge
- Modulaire structuur: nieuwe domeinen als aparte service + route + pagina

## Toegankelijkheid (WCAG)
- Semantische HTML: `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`
- ARIA labels op interactieve elementen: `aria-label`, `aria-current`, `aria-expanded`
- Keyboard navigeerbaar: alle klikbare elementen bereikbaar via Tab, activeerbaar via Enter
- Kleurcontrast: minimaal 4.5:1 voor tekst, 3:1 voor grote tekst
- Focus indicators: zichtbare focus-ring op interactieve elementen
- Alt-teksten op afbeeldingen
- Formulieren: labels gekoppeld aan inputs, foutmeldingen bij velden
- Responsief: werkt op mobile (375px) tot desktop (1920px+)
- Print stylesheet: navigatie/buttons verborgen, tabellen leesbaar

## Technologie Stack
- Next.js 16 (App Router, Turbopack)
- TypeScript (strict mode)
- Prisma ORM met PostgreSQL (Neon)
- Tailwind CSS v4
- NextAuth.js voor authenticatie
- Vercel voor hosting
- Claude API voor AI-adviseur
- N3.js voor RDF serialisatie
- Playwright voor E2E tests
- Vitest voor unit tests
- Zod voor input validatie

## Golden Rulebook — Verplichte regels (rwrw01/golden-rulebook)

### Code-kwaliteit (elke wijziging)
- Max 300 regels per bestand — refactor bij >300
- Max 40 regels per functie — extraheer helpers
- Geen `any` types — gebruik `unknown` + type guards
- Geen `@ts-ignore` zonder linked issue nummer
- Geen bare `try/catch` die fouten slikt — altijd loggen of retourneren
- Zod schema voor ALLE externe input (API requests, CSV imports, env vars, URL params)
- Bestanden coloceren: `{module}.test.ts` naast bronbestand, niet in aparte `__tests__/`
- Error messages: Nederlands (gebruiker), Engels (logs)
- Geen TODO/FIXME zonder linked issue nummer
- Nieuwe functies: JSDoc met `@param` en `@returns`

### API & Architectuur
- Gelaagde afhankelijkheden: Pages → Services → Prisma (nooit omhoog of lagen overslaan)
- REST per NL API Strategy: versioned URLs (`/api/v1/`), RFC 9457 problem details
- Zod schema VOOR de handler schrijven — schema IS de documentatie
- Server valideert ALTIJD onafhankelijk van client
- RBAC check VOOR business logic, niet erna
- Deny by default — log elke autorisatie-failure

### Testen (quality gates)
- Unit tests: 80% line coverage op services + data-laag
- Integratie tests: elke API endpoint minimaal 1 happy + 1 error path
- E2E tests: alle kritische user journeys (login, CRUD, export)
- WCAG 2.2 AA: 0 errors bij UI-wijzigingen (axe-core audit)
- Geen test-afhankelijkheden — elke test eigen setup en teardown
- Mock externe services op integration boundary, niet binnen services

### Container & Portabiliteit
- Multi-stage Dockerfile — geen build tools in final image
- Non-root user (`USER 1001`)
- Geen secrets in image — runtime env of mounted secrets
- `.dockerignore`: `.git`, `node_modules`, `.env*`, `*.md`, `tests/`
- Health endpoints: `/api/health` (liveness), `/api/readyz` (readiness)
- Graceful shutdown op SIGTERM
- Haven compliance: Helm chart in `helm/`, resource limits verplicht

### 12-Factor App
- Config via env vars — geen hardcoded URLs/ports/credentials
- Stateless processen — geen lokale bestandsopslag voor user data
- Logs naar stdout/stderr — nooit log files
- Startup <5s, graceful shutdown met SIGTERM
- Dev/prod parity: Docker Compose spiegelt productie

### Naamgeving (Golden Rulebook)
- Bestanden/directories: kebab-case, Engels (`user-profile.ts`)
- Variabelen/functies: camelCase, Engels (`getUserProfile()`)
- Classes/interfaces: PascalCase, Engels (`UserProfile`)
- Constanten: UPPER_SNAKE (`MAX_RETRY_COUNT`)
- DB tabellen: snake_case via Prisma `@@map()`
- UI labels: Nederlands (`"Gebruikersprofiel"`)
- Log messages: Engels (`"Failed to load user profile"`)
- Commits: Engels

### Performance baselines
- API: p95 <200ms reads, p95 <500ms writes
- Lighthouse: Accessibility >95
- DB queries: geen N+1, `EXPLAIN` op nieuwe queries met joins
- Container startup: <5s to healthy
