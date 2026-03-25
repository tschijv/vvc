# Bijdragen aan de Voorzieningencatalogus

## Vereisten

- Node.js 22+
- npm 10+
- Git
- VS Code (aanbevolen) of een andere editor
- GitHub account met toegang tot de repos

## Eerste keer opzetten

```bash
# 1. Clone de repository
git clone https://github.com/tschijv/vvc.git
cd vvc

# 2. Draai het setup script
./setup.sh

# 3. Start de dev server
npm run dev
# Open http://localhost:3000
```

## Branching strategie

```
main          ← productie (deploy via Vercel)
├── feature/* ← nieuwe functionaliteit
├── fix/*     ← bug fixes
└── chore/*   ← onderhoud, refactoring
```

**Werkwijze:**
1. Maak een branch: `git checkout -b feature/mijn-feature`
2. Maak je wijzigingen
3. Test lokaal: `npm run build && npx vitest run`
4. Commit: `git commit -m "Beschrijving van de wijziging"`
5. Push: `git push origin feature/mijn-feature`
6. Maak een Pull Request op GitHub
7. Na review → merge naar `main` → automatische deploy

## Mapstructuur (5-lagenmodel)

```
src/
├── app/           ← Next.js pages + API routes (UI laag)
├── ui/            ← Gedeelde componenten
│   └── components/
├── process/       ← Auth, validatie, rate limiting
├── service/       ← Business logic (domein services)
├── data/          ← Database (Prisma client)
└── integration/   ← Externe integraties (RDF, email, OpenAPI)
```

**Dependency richting:** UI → Process → Service → Data (nooit omhoog)

## Code conventies

- **Taal:** Nederlandse UI-teksten, Engelse code
- **Styling:** Tailwind CSS, altijd `dark:` variant meegeven
- **Types:** Geen `any`, geen `@ts-nocheck`
- **Bestanden:** Max 300 regels per bestand
- **Input validatie:** Zod op alle API input
- **Auth:** `getSessionUser()` op elke beschermde route
- **Tests:** Unit tests naast bronbestand (`*.test.ts`)

## Veelgebruikte commando's

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Productie build
npx vitest run       # Unit tests
npx playwright test  # E2E tests
npx prisma generate  # Prisma client regenereren
npx prisma db push   # Schema naar database pushen
npx prisma studio    # Database browser
```

## Database wijzigingen

1. Bewerk `prisma/schema.prisma`
2. `npx prisma generate` (client regenereren)
3. `npx prisma db push` (naar dev database)
4. Test of alles werkt
5. Bij productie: `npx prisma migrate dev --name beschrijving`

## Gedeelde library (@tschijv/gvc)

Generieke code zit in het `@tschijv/gvc` npm package. Wijzigingen:

```bash
cd ~/claude/gvc
# ... wijzig bestanden ...
npm version patch     # Versie ophogen
npm publish           # Publiceer naar GitHub Packages
cd ~/claude/vvc
npm update @tschijv/gvc  # Update in VVC
```

## Hulp nodig?

- Technische handleiding: `/admin/handleiding` (in de applicatie)
- Datamodel: `/admin/datamodel`
- API docs: `/api/v1/docs`
- Guardrails: `CLAUDE.md`
