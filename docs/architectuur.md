# Architectuur Voorzieningencatalogus

## Overzicht

De Voorzieningencatalogus (VC) is een open-source herimplementatie van de VNG Voorzieningencatalogus (voorheen Softwarecatalogus). Het doel is gemeenten inzicht te geven in hun softwarelandschap: welke pakketten ze gebruiken, hoe die zich verhouden tot GEMMA referentiecomponenten en standaarden, en welke koppelingen er bestaan tussen systemen.

---

## Technologie Stack

| Component | Technologie |
|-----------|------------|
| Framework | Next.js 16 (App Router) |
| Taal | TypeScript |
| Database | PostgreSQL (Neon serverless) |
| ORM | Prisma 7 met PrismaPg adapter |
| Styling | Tailwind CSS 4 |
| Deployment | Vercel |

---

## Lagen

```
┌─────────────────────────────────────────────┐
│  UI Layer                                   │
│  app/**/*.tsx                               │
│  Server Components + Client Components      │
└──────────────┬──────────────────────────────┘
               │ importeert
┌──────────────▼──────────────────────────────┐
│  Service Layer                              │
│  lib/services/*.ts                          │
│  Business logic + Prisma queries            │
└──────────────┬──────────────────────────────┘
               │ importeert
┌──────────────▼──────────────────────────────┐
│  Data Layer                                 │
│  lib/prisma.ts → Prisma Client              │
│  PostgreSQL (Neon)                          │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Externe API (toekomstig)                   │
│  app/api/v1/**                              │
│  REST endpoints voor IBD/VNG/leveranciers   │
│  ↓ roept dezelfde services aan              │
└─────────────────────────────────────────────┘
```

### UI Layer (`app/`)

Next.js App Router met Server Components als standaard. Client Components worden alleen gebruikt waar interactiviteit nodig is (tabs, filters, zoekbalken).

Belangrijke pagina's:
- **Homepagina** (`/`) — Statistieken overzicht
- **Gemeenten** (`/gemeenten`) — Lijst met zoeken en paginatie
- **Dashboard** (`/dashboard`) — Gemeentelijk applicatielandschap met tabbladen (Pakketten, Koppelingen, Kaart)
- **Pakketten** (`/pakketten`) — Catalogus met filters
- **Leveranciers** (`/leveranciers`) — Met pakketoverzicht
- **Samenwerkingen** (`/samenwerkingen`) — Verbanden met geaggregeerde data
- **Referentiecomponenten** (`/referentiecomponenten`) — GEMMA componenten
- **Standaarden** (`/standaarden`) — Standaarden overzicht

### Service Layer (`lib/services/`)

Alle database queries en business logic zijn geabstraheerd in services. Dit maakt het mogelijk dezelfde logica te hergebruiken vanuit zowel de UI als de (toekomstige) externe API.

| Service | Verantwoordelijkheid |
|---------|---------------------|
| `gemeente.ts` | Gemeenten CRUD, applicatieportfolio, koppelingen, dashboard stats |
| `pakket.ts` | Pakketten zoeken, detail, filters |
| `leverancier.ts` | Leveranciers lijst en detail |
| `samenwerking.ts` | Samenwerkingen met geaggregeerde gemeente-data |
| `referentiecomponent.ts` | GEMMA referentiecomponenten |
| `standaard.ts` | Standaarden en standaardversies |
| `gemma.ts` | Synchronisatie met GEMMA Semantic MediaWiki |
| `kaart.ts` | SVG applicatielandschap generatie |
| `export.ts` | Excel/CSV export van portfolio data |

### Data Layer (`lib/prisma.ts`)

Singleton Prisma Client met PrismaPg adapter voor Neon PostgreSQL. Gebruikt de `@prisma/adapter-pg` driver voor serverless-compatibele verbindingen.

---

## Data Model

### Kern entiteiten

```
Leverancier ──< Pakket ──< Pakketversie >── GemeentePakket >── Gemeente
                                │                                  │
                                ├── PakketversieReferentiecomponent │
                                ├── PakketversieStandaard           │
                                └── PakketversieTechnologie         │
                                                                    │
                              Koppeling >───────────────────────────┘
                              (bron/doel = Pakketversie of ExternPakket)
                                                                    │
                              SamenwerkingGemeente >── Samenwerking  │
                              ────────────────────────────────────────┘
```

### Koppeling model

Een koppeling beschrijft een integratie tussen twee systemen bij een gemeente:
- **Bron**: pakketversie uit catalogus of extern pakket
- **Doel**: pakketversie uit catalogus of extern pakket
- **Richting**: heen (→), weer (←), of beide (↔)
- **Buitengemeentelijk**: koppeling met een landelijke voorziening
- **Standaard**: welke koppelstandaard wordt gebruikt (bv. StUF BG 3.10)
- **Transportprotocol**: bv. Message Queue, REST API
- **Intermediair**: optionele tussenliggende pakketversie

### ExternPakket

Pakketten die niet in de VC-catalogus staan maar wel voorkomen in koppelingen. Typisch landelijke voorzieningen (BRP, BAG) of niche-software.

---

## Data Import

De data wordt geïmporteerd uit CSV-exports van de officiële VNG Voorzieningencatalogus.

### Import volgorde

```
1. seed.ts                    → Leveranciers, pakketten, pakketversies,
                                 referentiecomponenten, standaarden
2. import-gemeenten-from-csvs → Gemeenten uit samenwerkingen/koppelingen CSVs
3. import-portfolio.ts        → Applicatieportfolio (gemeente ↔ pakketversie)
4. import-samenwerkingen.ts   → Samenwerkingsverbanden
5. import-koppelingen.ts      → Koppelingen/integraties
```

### Pakketversie UUID matching

De seed gebruikt de echte VC pakketversie UUIDs door deze op te zoeken in de applicatieportfolio CSV. Dit is cruciaal zodat de portfolio-import later de juiste pakketversies kan matchen. Versies die niet in de portfolio voorkomen krijgen een gegenereerde UUID.

### GEMMA synchronisatie

Referentiecomponenten, applicatiefuncties en standaarden kunnen ook worden gesynchroniseerd vanuit de GEMMA Semantic MediaWiki via de admin sync functie (`/api/admin/sync-gemma`).

---

## Gemeentelijk Dashboard

Het dashboard (`/dashboard`) is de kernfunctionaliteit voor gemeenten. Het biedt:

### Tab: Pakketten
- Tabel met alle pakketten in het portfolio
- Kolommen: Leverancier, Pakket, Versie, Status, Referentiecomponenten, Standaarden
- Filter sidebar: op leverancier, referentiecomponent, standaard, technologie, status
- Export naar Excel/CSV

### Tab: Koppelingen
- Tabel met alle koppelingen/integraties
- Kolommen: Bron, Richting, Doel, Status, Standaard
- Uitklapbaar detailpaneel met: planning datum, transportprotocol, toelichting
- Filter sidebar: soort koppeling (buitengemeentelijk), standaard, pakketversie

### Tab: Kaart (Applicatielandschap)
- SVG-visualisatie gebaseerd op GEMMA views
- Toont welke pakketten welke referentiecomponenten invullen
- Exporteerbaar als PNG

---

## Samenwerkingen

Samenwerkingsverbanden (bv. Drechtsteden, BghU) aggregeren data van alle deelnemende gemeenten. Het samenwerkingsdashboard toont:
- Overzicht met statistieken en deelnemende gemeenten
- Geaggregeerde pakketten (gegroepeerd per gemeente)
- Geaggregeerde koppelingen (gegroepeerd per gemeente)

---

## Toekomstige onderdelen

- **Externe API** (`/api/v1/`) — REST endpoints voor IBD/VNG en leveranciers
- **Authenticatie** — NextAuth.js met rollen-gebaseerde autorisatie (zie autorisatiemodel.md)
- **Gebruikersbeheer** — Admin panel voor accounts en rollen
- **Self-service** — Gemeenten beheren eigen portfolio, leveranciers beheren eigen pakketten
