# VNG Voorzieningencatalogus (VC)

Een open-source herimplementatie van de [Voorzieningencatalogus](https://www.softwarecatalogus.nl/) van KING/VNG, gebouwd met moderne webtechnologie.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Server Components)
- **Database**: PostgreSQL (Neon) via Prisma 7 + PrismaPg adapter
- **Styling**: Tailwind CSS 4
- **Taal**: TypeScript

## Architectuur

```
┌─────────────────────────────────────────────┐
│  UI Layer (app/)                            │
│  Server Components + Client Components      │
└──────────────┬──────────────────────────────┘
               │ importeert
┌──────────────▼──────────────────────────────┐
│  Service Layer (lib/services/)              │
│  gemeente, pakket, leverancier, standaard,  │
│  referentiecomponent, samenwerking,         │
│  gemma, kaart, export                       │
└──────────────┬──────────────────────────────┘
               │ importeert
┌──────────────▼──────────────────────────────┐
│  Data Layer (lib/prisma.ts)                 │
│  Prisma Client — PostgreSQL (Neon)          │
└─────────────────────────────────────────────┘
```

## Pagina's

| Route | Beschrijving |
|-------|-------------|
| `/` | Homepagina met statistieken |
| `/gemeenten` | Overzicht van alle gemeenten |
| `/gemeenten/[slug]` | Gemeente detail |
| `/pakketten` | Overzicht van alle pakketten |
| `/pakketten/[slug]` | Pakket detail |
| `/leveranciers` | Overzicht van alle leveranciers |
| `/leveranciers/[slug]` | Leverancier detail |
| `/referentiecomponenten` | GEMMA referentiecomponenten |
| `/standaarden` | Standaarden overzicht |
| `/samenwerkingen` | Samenwerkingsverbanden |
| `/samenwerkingen/[id]` | Samenwerking detail (dashboard) |
| `/dashboard` | Gemeentelijk dashboard (pakketten, koppelingen, kaart) |

## Data Model

De belangrijkste entiteiten:

- **Gemeente** — Nederlandse gemeente met CBS-code
- **Leverancier** — Softwareleverancier
- **Pakket** — Softwarepakket van een leverancier
- **Pakketversie** — Specifieke versie van een pakket
- **GemeentePakket** — Koppeling gemeente ↔ pakketversie (applicatieportfolio)
- **Koppeling** — Integratie tussen twee pakketten/externe systemen bij een gemeente
- **ExternPakket** — Pakket dat niet in de catalogus staat (bv. landelijke voorzieningen)
- **Samenwerking** — Samenwerkingsverband tussen gemeenten
- **Referentiecomponent** — GEMMA referentiecomponent
- **Standaard** / **Standaardversie** — Standaarden die pakketten ondersteunen

## Ontwikkeling

### Vereisten

- Node.js 20+
- PostgreSQL database (of Neon account)

### Setup

```bash
# Installeer dependencies
npm install

# Configureer database
cp .env.example .env  # pas DATABASE_URL aan

# Push schema naar database
npx prisma db push

# Seed basisdata (leveranciers, pakketten, referentiecomponenten)
npx tsx scripts/import/seed.ts

# Start development server
npm run dev
```

### Data Importeren

De data wordt geïmporteerd vanuit CSV-exports van de officiële SWC. De import scripts staan in `scripts/import/`:

```bash
# 1. Basis seed (leveranciers, pakketten met correcte pakketversie UUIDs)
npx tsx scripts/import/seed.ts --skip-portfolio

# 2. Gemeenten importeren uit samenwerkingen/koppelingen CSVs
npx tsx scripts/import/import-gemeenten-from-csvs.ts

# 3. Applicatieportfolio importeren (gemeente ↔ pakketversie koppelingen)
npx tsx scripts/import/import-portfolio.ts

# 4. Samenwerkingen importeren
npx tsx scripts/import/import-samenwerkingen.ts

# 5. Koppelingen importeren (integraties tussen pakketten)
npx tsx scripts/import/import-koppelingen.ts
```

### Import Scripts

| Script | Beschrijving | Bron CSV |
|--------|-------------|----------|
| `seed.ts` | Leveranciers, pakketten, pakketversies, referentiecomponenten, standaarden | `leveranciers.csv`, `Pakketten.csv`, `leveranciers_pakketten.csv` |
| `import-gemeenten-from-csvs.ts` | Gemeenten extraheren uit andere CSVs | Samenwerkingen + Koppelingen CSVs |
| `import-portfolio.ts` | Applicatieportfolio (welke gemeente welk pakket gebruikt) | `Gemeenten_applicatieportfolio_*.csv` |
| `import-samenwerkingen.ts` | Samenwerkingsverbanden met gemeente-links | `Samenwerkingen_*.csv` |
| `import-koppelingen.ts` | Integraties/koppelingen tussen pakketten | `Koppelingen_*.csv` |

### GEMMA Sync

Referentiecomponenten, applicatiefuncties en standaarden worden gesynchroniseerd vanuit de GEMMA Semantic MediaWiki:

```bash
# Via admin panel: /api/admin/sync-gemma
```

## Service Layer

Alle database queries zijn geabstraheerd in `lib/services/`:

| Service | Functies |
|---------|----------|
| `gemeente.ts` | `getGemeenten()`, `getGemeenteById()`, `getGemeentePakketten()`, `getGemeenteKoppelingen()`, `getGemeenteDashboardStats()` |
| `pakket.ts` | `getPakketten()`, `getPakketBySlug()`, `getPakketCount()` |
| `leverancier.ts` | `getLeveranciers()`, `getLeverancierBySlug()` |
| `samenwerking.ts` | `getSamenwerkingById()`, `getSamenwerkingPakketten()`, `getSamenwerkingKoppelingen()` |
| `referentiecomponent.ts` | `getReferentiecomponenten()` |
| `standaard.ts` | `getStandaarden()` |
| `gemma.ts` | `runFullSync()`, `smwQuery()` |
| `kaart.ts` | `genereerKaartSvg()` |
| `export.ts` | Excel/CSV export functionaliteit |
