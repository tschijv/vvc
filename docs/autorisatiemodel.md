# Autorisatiemodel VNG Voorzieningencatalogus

## Context

De VNG Voorzieningencatalogus is een openbaar platform waar gemeenten, leveranciers en andere belanghebbenden softwarepakketten, standaarden en referentiecomponenten kunnen inzien. Het autorisatiemodel regelt wie welke data mag bekijken en bewerken.

**Uitgangspunt:** Iedereen mag alle publieke data zien, maar niemand mag data wijzigen behalve admins.

---

## Rollen

De rollen zijn gebaseerd op het rollenmodel van de originele Voorzieningencatalogus:

| Rol | Omschrijving |
|-----|-------------|
| **Anoniem** | Niet-ingelogde bezoeker |
| **Geverifieerde gebruiker** | Ingelogd, basis lees-rechten |
| **Gemeente raadpleger** | Medewerker van een gemeente, mag portfolio inzien van alle gemeenten |
| **Gemeente beheerder** | Mag het applicatieportfolio van de eigen gemeente bewerken |
| **Samenwerking beheerder** | Mag data van een samenwerkingsverband beheren |
| **Leverancier** | Medewerker van een leverancier, mag eigen pakketgegevens bijwerken |
| **Redacteur** | Mag CMS-pagina's en content bewerken |
| **KING raadpleger** | VNG/KING medewerker, mag alles inzien |
| **KING beheerder** | VNG/KING medewerker, mag alles inzien en bewerken |
| **Administrator** | Volledige systeemtoegang, gebruikersbeheer |
| **API user** | Toegang tot de externe API (v1) |

---

## Toegangsmatrix

| Data | Anoniem | Gemeente | Leverancier | Admin |
|------|---------|----------|-------------|-------|
| Pakketten (lijst + detail) | ✅ Lezen | ✅ Lezen | ✅ Lezen | ✅ Volledig |
| Standaarden | ✅ Lezen | ✅ Lezen | ✅ Lezen | ✅ Volledig |
| Referentiecomponenten | ✅ Lezen | ✅ Lezen | ✅ Lezen | ✅ Volledig |
| Applicatiefuncties | ✅ Lezen | ✅ Lezen | ✅ Lezen | ✅ Volledig |
| Leverancierslijst + detail | ✅ Lezen | ✅ Lezen | ✅ Lezen | ✅ Volledig |
| Gemeentenlijst (naam, voortgang) | ✅ Lezen | ✅ Lezen | ✅ Lezen | ✅ Volledig |
| Gemeente contactgegevens | ❌ | ✅ Lezen | ❌ | ✅ Volledig |
| Gemeente applicatieportfolio | ❌ | ✅ Alle gemeenten | ⚠️ Alleen eigen pakketten | ✅ Volledig |
| Data wijzigen (alle entiteiten) | ❌ | ❌ | ❌ | ✅ |

### Toelichting restricties

**Gemeente applicatieportfolio:**
- Een gemeente-gebruiker mag het applicatielandschap van **alle** gemeenten inzien, inclusief welke pakketten zij gebruiken.
- Een leverancier-gebruiker mag alleen zien bij welke gemeenten **zijn eigen pakketten** in gebruik zijn. De overige pakketten in het portfolio van een gemeente worden niet getoond.
- Anonieme bezoekers zien de gemeente-pagina (naam, voortgang, samenwerkingen) maar niet het applicatieportfolio.

**Gemeente contactgegevens:**
- Contactpersoon en e-mailadres van een gemeente zijn alleen zichtbaar voor gemeente-gebruikers en admins.

---

## Gebruikersmodel (database)

```
User
├── id (UUID)
├── email (uniek)
├── naam
├── passwordHash (bcrypt)
├── role (ANONIEM | GEMEENTE | LEVERANCIER | ADMIN)
├── gemeenteId (optioneel → koppeling met Gemeente)
└── leverancierId (optioneel → koppeling met Leverancier)
```

- Een gebruiker met rol GEMEENTE is gekoppeld aan precies één gemeente via `gemeenteId`.
- Een gebruiker met rol LEVERANCIER is gekoppeld aan precies één leverancier via `leverancierId`.
- De koppeling bepaalt de identiteit, niet de toegang tot alleen die ene gemeente/leverancier.

---

## Authenticatie

- **Methode:** E-mail + wachtwoord (credentials)
- **Framework:** NextAuth.js v5 met Credentials Provider
- **Sessies:** JWT-tokens (stateless, geen database sessions)
- **JWT payload:** userId, role, gemeenteId, leverancierId

---

## Pagina-specifieke autorisatie

### `/gemeenten` (lijst)
- Naam en voortgang: altijd zichtbaar
- Contactgegevens: alleen voor gemeente-users en admins

### `/gemeenten/[slug]` (detail)
- Basis-info (naam, CBS-code, samenwerkingen): altijd zichtbaar
- Contactgegevens: alleen gemeente-users en admins
- Applicatieportfolio:
  - Anoniem → melding "Log in om het applicatieportfolio te bekijken"
  - Gemeente → volledig portfolio
  - Leverancier → gefilterd op eigen pakketten
  - Admin → volledig portfolio

### Alle overige pagina's
- Volledig publiek toegankelijk (read-only)

---

## Test-accounts

| E-mail | Wachtwoord | Rol | Gekoppeld aan |
|--------|-----------|-----|---------------|
| admin@swc.nl | admin2026 | ADMIN | — |
| gemeente1@swc.nl | test2026 | GEMEENTE | (eerste gemeente in DB) |
| gemeente2@swc.nl | test2026 | GEMEENTE | (tweede gemeente in DB) |
| gemeente3@swc.nl | test2026 | GEMEENTE | (derde gemeente in DB) |
| leverancier1@swc.nl | test2026 | LEVERANCIER | (eerste leverancier in DB) |
| leverancier2@swc.nl | test2026 | LEVERANCIER | (tweede leverancier in DB) |
| leverancier3@swc.nl | test2026 | LEVERANCIER | (derde leverancier in DB) |

---

## Toekomstige uitbreidingen (buiten scope)

- Gemeente-gebruikers mogen eigen applicatieportfolio bewerken
- Leverancier-gebruikers mogen eigen pakketgegevens bijwerken
- Self-service registratie met goedkeuring door admin
- SSO/OAuth integratie
- Audit logging van alle wijzigingen
