# Beheerdocument Voorzieningencatalogus

## 1. Projectstructuur

```
~/claude/
└── vvc/                    ← Hoofdproject (bron voor alle generieke code)
    ├── src/                ← Applicatiecode (5-lagenmodel)
    │   ├── app/            ← Next.js pagina's en API routes
    │   ├── service/        ← Business logic (CRUD, queries)
    │   ├── process/        ← Auth, validatie, rate limiting
    │   ├── integration/    ← Email, RDF, OpenAPI
    │   ├── data/           ← Prisma client
    │   └── ui/             ← Gedeelde componenten
    ├── tenants/            ← Tenant-specifieke configuratie
    │   ├── types.ts        ← TenantConfig interface
    │   ├── vvc.config.ts   ← VNG configuratie
    │   └── hwh.config.ts   ← HWH configuratie
    ├── prisma/             ← Database schema en migraties
    ├── public/             ← Statische bestanden (logo, GeoJSON)
    ├── scripts/            ← Seed, migratie, sync scripts
    ├── tests/              ← E2E tests (Playwright)
    ├── docs/               ← Documentatie
    ├── helm/               ← Kubernetes deployment
    ├── .claude/CLAUDE.md   ← AI guardrails
    ├── PROMPT.md           ← Functionele specificatie
    └── CONTRIBUTING.md     ← Bijdrage-richtlijnen
```

## 2. Twee projecten, één codebase

| | VVC (gemeenten) | HWH (waterschappen) |
|---|---|---|
| **Repository** | github.com/tschijv/vvc | github.com/tschijv/hwh |
| **Productie** | vng-vc.vercel.app | hwh-new-six.vercel.app |
| **Database** | Neon "vvc" | Neon "hwh" |
| **Tenant** | `TENANT=vvc` | `TENANT=hwh` |
| **Lokaal** | localhost:3000 | localhost:3001 |

### Bronbeheer

| Type code | Onderhouden in | Gekopieerd naar |
|---|---|---|
| **Generieke code** (services, components, auth, schema) | VVC | HWH (via sync script) |
| **Tenant config VVC** (`tenants/vvc.config.ts`) | VVC | Nergens |
| **Tenant config HWH** (`tenants/hwh.config.ts`) | HWH | Nergens |
| **HWH-specifiek** (waterschappen GeoJSON, WILMA sync) | HWH | Nergens |
| **VVC-specifiek** (gemeenten GeoJSON, GEMMA sync) | VVC | Nergens |

**Regel:** Wijzig generieke code ALTIJD in VVC, dan sync naar HWH. Wijzig tenant-specifieke code direct in het betreffende project. Nooit dezelfde variabele op twee plekken onderhouden.

## 3. Synchronisatie

### Van VVC naar HWH

```bash
cd ~/claude/vvc
./scripts/sync-to-hwh.sh
```

Dit kopieert alle generieke bestanden naar HWH, behalve:
- `tenants/*.config.ts` (tenant-specifiek)
- `public/data/` (GeoJSON verschilt)
- `.env` (database/secrets verschilt)
- `.vercel/` (Vercel project config)

### Na synchronisatie

```bash
cd ~/claude/hwh
TENANT=hwh npm run build    # Verifieer dat het compileert
git add -A && git commit -m "Sync from VVC" && git push origin main
```

## 4. Lokaal ontwikkelen

### VVC starten
```bash
cd ~/claude/vvc
npm run dev                  # localhost:3000
```

### HWH starten
```bash
cd ~/claude/hwh
TENANT=hwh PORT=3001 npm run dev   # localhost:3001
```

### Beide tegelijk
Gebruik twee terminals. Ze delen geen cache of processen.

## 5. Deployen

### Via CLI
```bash
# VVC
cd ~/claude/vvc
npx vercel --prod --yes

# HWH
cd ~/claude/hwh
NEXT_PUBLIC_TENANT=hwh TENANT=hwh npx vercel build --prod --yes
npx vercel deploy --prebuilt --prod --yes
```

### Via admin pagina
Inloggen als ADMIN → Beheer → klik "Deploy naar productie". De deploy-knop draait een pre-build check voordat er gedeployed wordt.

### Via Git push
Elke push naar `main` triggert een automatische Vercel deploy (mits Git is gekoppeld in Vercel project settings).

## 6. Database beheer

### Schema wijzigen
1. Wijzig `prisma/schema.prisma` in VVC
2. `npx prisma generate` (client regenereren)
3. `npx prisma db push` (schema naar database pushen)
4. Sync naar HWH
5. In HWH: `npx prisma generate && npx prisma db push`

### Migraties (productie)
```bash
npx prisma migrate dev --name beschrijving    # Lokaal
npx prisma migrate deploy                      # Productie
```

### Seed data
```bash
npx tsx scripts/seed-dienstverleners.ts    # Dienstverleners + cloudproviders
npx tsx scripts/seed-reviews.ts            # Pakket reviews
npx tsx scripts/migrate-roles.ts           # Rollen migreren
npx tsx scripts/migrate-multi-org.ts       # Multi-org migreren
```

## 7. Tenant configuratie

De tenant config bepaalt alle domein-specifieke teksten, kleuren en routes:

```typescript
// tenants/vvc.config.ts (voorbeeld)
export const config: TenantConfig = {
  id: "vvc",
  naam: "VNG Voorzieningencatalogus",
  organisatieType: {
    enkelvoud: "gemeente",
    meervoud: "gemeenten",
    capitaal: "Gemeente",
    meervoudCapitaal: "Gemeenten",
  },
  branding: {
    primaryColor: "#1a6ca8",    // Blauw
    headerBg: "#1a6ca8",
    accentColor: "#e35b10",
  },
  architectuur: {
    naam: "GEMMA",
    apiUrl: "https://gemmaonline.nl/...",
    modelId: "2b2b88ba-8efe-46d3-8b40-47af290bc418",
  },
  kaart: {
    geoJsonPath: "/data/gemeenten.geojson",
  },
  routes: {
    organisaties: "/gemeenten",
  },
};
```

### Nieuwe tenant toevoegen
1. Kopieer `tenants/vvc.config.ts` → `tenants/nieuw.config.ts`
2. Pas alle waarden aan
3. Maak een nieuwe Neon database
4. Maak een nieuw Vercel project met `TENANT=nieuw`
5. Deploy

## 8. Architectuur sync (GEMMA/WILMA)

| | VVC | HWH |
|---|---|---|
| **Bron** | gemmaonline.nl | wilmaonline.nl |
| **Model ID** | 2b2b88ba-... | 48af3206-... |
| **Wat het synct** | Referentiecomponenten, applicatiefuncties, standaarden | Idem |

Synchronisatie starten: Admin → Beheer → klik "Synchroniseren".

## 9. Monitoring en troubleshooting

### Vercel logs
- Runtime logs: Vercel dashboard → project → Logs
- Build logs: Vercel dashboard → project → Deployments → klik op deployment

### Veelvoorkomende problemen

| Probleem | Oorzaak | Oplossing |
|---|---|---|
| "Can't resolve 'tailwindcss'" | Parent directory heeft package.json | Verwijder `~/claude/package.json` |
| "prisma.organisatie is undefined" | Prisma client niet gegenereerd | `npx prisma generate` |
| "aantalOrganisaties unknown field" | Schema gewijzigd, db niet gesynct | `npx prisma db push` |
| Login werkt niet | Wachtwoord hash mismatch | `npx tsx scripts/reset-passwords.ts` |
| Deploy blocked | Git author niet in Vercel team | Vercel Settings → Members → Invite |
| ISR cache oud | Vercel serveert gecachte pagina | Redeploy of wacht 1 uur |

## 10. Security

### Test-accounts (alleen development!)
| Rol | VVC | HWH |
|---|---|---|
| Admin | admin@swc.nl / admin2026 | admin@hwh.nl / admin2026 |
| Beheerder | gemeente1@swc.nl / test2026 | waterschap1@hwh.nl / test2026 |
| Leverancier | leverancier1@swc.nl / test2026 | leverancier1@hwh.nl / test2026 |

### Security audit draaien
De admin pagina bevat een Security Audit tab op `/admin/pve-analyse?tab=security`.

### 2FA
Alle gebruikers (inclusief admin) moeten 2FA instellen via Profiel → 2FA.

## 11. Bestanden voor een verse start

Als je de applicatie opnieuw wilt genereren (bijv. met een andere tech stack):

| Bestand | Doel |
|---|---|
| `PROMPT.md` | Functionele specificatie (technologie-onafhankelijk) |
| `.claude/CLAUDE.md` | Guardrails en kwaliteitsregels |
| `tenants/vvc.config.ts` | VNG tenant configuratie |
| `tenants/hwh.config.ts` | HWH tenant configuratie |

---

*Laatste update: maart 2026*
