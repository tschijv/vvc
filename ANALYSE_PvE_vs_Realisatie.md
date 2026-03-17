
# Analyse Programma van Eisen vs. Gerealiseerde Functionaliteit
## Voorzieningencatalogus (voorheen Softwarecatalogus)

**Datum:** 16 maart 2026
**Gebaseerd op:** Bijlage 1.2 - Programma van Eisen (ontvangen van Peter Makkes)
**Vergeleken met:** Huidige applicatie (GEMMA Softwarecatalogus, Next.js/Prisma/PostgreSQL)

---

## Samenvatting

| Categorie | Aantal | Gerealiseerd ✅ | Deels ✅⚠ | Niet gerealiseerd ❌ |
|-----------|--------|----------------|-----------|---------------------|
| **Eisen (must have)** | 68 | 30 | 15 | 23 |
| **Wensen (nice to have)** | 34 | 4 | 5 | 25 |
| **Could have** | 2 | 0 | 0 | 2 |
| **Totaal** | 104 | 34 (33%) | 20 (19%) | 50 (48%) |

**Conclusie:** Circa 52% van alle eisen en wensen is geheel of gedeeltelijk gerealiseerd. Van de 68 harde eisen is 66% (45 van 68) geheel of deels gerealiseerd.

---

## Legenda

- ✅ **Gerealiseerd** — Functionaliteit is aanwezig en werkt
- ⚠ **Deels gerealiseerd** — Basisfunctionaliteit aanwezig, maar niet volledig conform PvE
- ❌ **Niet gerealiseerd** — Functionaliteit ontbreekt
- 📌 **Opmerking Peter** — Relevante context uit mail van Peter Makkes

---

## 1. AANBOD (Functioneel)

### Eisen

| ID | Functionaliteit | Prioriteit | Status | Toelichting |
|----|----------------|------------|--------|-------------|
| 1 | Zoeken/filteren op standaarden | Eis | ✅ | Standaardenpagina met versies en pakketfiltering aanwezig. Compliancy-monitor toont compliance per standaard. |
| 2 | Zoeken/filteren op referentiecomponenten | Eis | ✅ | Referentiecomponentenpagina met zoekfunctie en pakkettellingen. Inkoop-pagina filtert op referentiecomponent. |
| 3 | Registreren pakketten | Eis | ✅ | Upload-functie voor leveranciers (CSV/JSON/Excel). Admin kan ook pakketten beheren. |
| 4 | Registreren koppelingen bij pakket | Eis | ✅ | Koppelingen-systeem met bron/doel, richting, protocol, standaard. Ondersteunt externe pakketten en tussenliggende systemen. |
| 5 | Beheren content & configuratie | Eis | ✅ | CMS-systeem (Pagina model) met TipTap editor. Admin kan pagina's aanmaken en bewerken. |
| 6 | Data-migratie | Eis | ⚠ | Import-functionaliteit aanwezig (CSV/JSON/Excel upload), maar specifieke migratie van oude softwarecatalogus-data is niet als aparte feature gebouwd. Handmatige import is mogelijk. |

### Wensen

| ID | Functionaliteit | Status | Toelichting |
|----|----------------|--------|-------------|
| 7 | Registreren dienstverleners | ❌ | Geen apart concept voor "dienstverleners" naast leveranciers. |
| 8 | Registreren cloud-providers | ❌ | Geen cloud-provider registratie. |
| 9 | Raadplegen review scores | ❌ | Geen review/score-systeem voor pakketten. |

---

## 2. AANBOD EN GEBRUIK WENSEN

| ID | Functionaliteit | Status | Toelichting |
|----|----------------|--------|-------------|
| 10 | AI-advisering | ❌ | Geen AI-gebaseerde adviesfunctionaliteit. |
| 11 | Registreren business rules | ❌ | Geen business rules engine. |
| 12-15 | Adviseren Common Ground, SaaS | ❌ | Geen automatische advisering op basis van CG/SaaS criteria. |
| 16 | Statistieken gebruik | ⚠ | Dashboard toont basisstatistieken (aantal pakketten, gemeenten, etc.). Geen uitgebreide gebruiksstatistieken per pakket. |

---

## 3. COMMON GROUND WENSEN

| ID | Functionaliteit | Status | Toelichting |
|----|----------------|--------|-------------|
| 17-20 | Common Ground registratie/filtering | ❌ | Geen CG-laag concept, geen CG-compliance tracking. |

---

## 4. GEBRUIK (Functioneel)

### Eisen

| ID | Functionaliteit | Status | Toelichting |
|----|----------------|--------|-------------|
| 21 | Beheren applicatielandschap gemeente | ✅ | Dashboard met pakketoverzicht, upload-functie, koppelingen-beheer. |
| 22 | Vergelijken gebruik (gemeente vs gemeente) | ✅ | Vergelijkfunctie op /gemeenten/vergelijk met side-by-side tabel, gemeenschappelijke/unieke pakketten, voortgangspercentages. |
| 23 | Vergelijken gebruik (gemeente vs aanbod) | ⚠ | Compliancy-monitor vergelijkt gebruik met standaarden. Geen directe vergelijking gemeente-portfolio vs totaal aanbod. |
| 24 | Exporteren gebruik | ✅ | Export-API met CSV, IBD-foto en AMEFF XML formaten. |
| 25 | Ontsluiten gebruik | ✅ | Gemeente-detailpagina toont portfolio, koppelingen, voortgang. Rolgebaseerde zichtbaarheid. |
| 26 | Raadplegen gebruik | ✅ | Gemeenten-overzicht met zoek/filter, sterren-systeem, paginering. |

### Wensen

| ID | Functionaliteit | Status | Toelichting |
|----|----------------|--------|-------------|
| 27 | Registreren maatwerk bij pakket | ❌ | Geen maatwerk-registratie per gemeente. |
| 28 | Registreren verantwoordelijke bij pakket | ❌ | Geen verantwoordelijke-veld per pakket per gemeente. |
| 29 | Registreren licentievorm bij pakket | ❌ | Geen licentievorm-registratie. |
| 30 | Registreren gebruikersaantallen | ❌ | Geen gebruikersaantallen per pakket per gemeente. |
| 31 | Wijzigingshistorie bijhouden | ❌ | Geen audit trail/wijzigingshistorie op pakketgebruik. |

---

## 5. GT INKOOP WENSEN

| ID | Functionaliteit | Status | Toelichting |
|----|----------------|--------|-------------|
| 32-35 | Contractbeheer, verloopdatums, BIO compliance | ❌ | Geen contractbeheerfunctionaliteit. Inkoop-pagina bestaat wel maar bevat alleen referentiecomponent-selectie en GEMMA/GIBIT richtlijnen. |
| 36 | Exporteren inkoop-gegevens | ❌ | Geen specifieke inkoop-export. |

---

## 6. IBD WENSEN

| ID | Functionaliteit | Status | Toelichting |
|----|----------------|--------|-------------|
| 37-44 | BIO compliance, DPIA verplichting, SLA-criteria | ❌ | Geen BIO/DPIA/SLA tracking. |
| 45-48 | Pen-test resultaten, DigiD-assessments | ❌ | Geen beveiligingsbeoordelingen-module. |
| 49-53 | Verklaringen/overeenkomsten delen en fiatteren | ❌ | Geen document-sharing/fiatteringsworkflow. |
| 54-55 | Register van verwerkingen genereren | ❌ | Geen AVG register. Vereist ook GEMMA-uitbreiding. |
| 56-58 | Kwetsbaarheden notificatie, NIST CVE | ❌ | Geen vulnerability tracking/notification. |

---

## 7. MANAGEMENT INFORMATIE

| ID | Functionaliteit | Status | Toelichting |
|----|----------------|--------|-------------|
| 59 | Database-toegang voor rapportages | Eis | ⚠ | Database is PostgreSQL en technisch toegankelijk. Geen specifieke rapportage-interface, maar data is via API beschikbaar. Admin-console aanwezig. |

---

## 8. ORGANISATIE

### Eisen

| ID | Functionaliteit | Status | Toelichting |
|----|----------------|--------|-------------|
| 60 | Zelf organisatiegegevens registreren (concept) | ❌ | Geen zelf-registratie met concept-status. Admin maakt organisaties aan. |
| 61 | Fiatteren concept-organisaties | ❌ | Geen fiatteringsworkflow voor organisaties. |
| 62 | Samenvoegen organisaties (herindeling) | ❌ | Geen samenvoeging-functionaliteit. |
| 63 | Aanmaken organisaties + accounts | ✅ | Admin kan gebruikers aanmaken met gemeente/leverancier-koppeling. |
| 64 | Gebruik-beheerder registreert aanbieder | ⚠ | Niet direct mogelijk; admin moet leverancier aanmaken. Upload-functie accepteert wel nieuwe leveranciersnamen. |
| 65 | Overzicht aanbiedende organisaties | ✅ | Leveranciers-pagina met zoek/filter en paginering. |
| 66 | Overzicht gebruikende organisaties | ✅ | Gemeenten-pagina met zoek/filter, sterren, paginering. 📌 Peter: gemeenten zien elkaars landschappen; leveranciers alleen hun eigen pakketten. Dit is geïmplementeerd via filterGemeentePakketten(). |
| 67 | Contactpersonen per pakket | ⚠ | Leverancier heeft contactpersoon + email, maar niet meerdere contactpersonen per pakket. |
| 68 | Aanvullende organisatie-info, links | ⚠ | Leverancier heeft basisgegevens (naam, contactpersoon, email, telefoon, website). Geen uitgebreide diensten-omschrijving of support-portal links. |

---

## 9. REFERENTIEARCHITECTUUR

### Eisen

| ID | Functionaliteit | Status | Toelichting |
|----|----------------|--------|-------------|
| 69 | Exporteren ArchiMate (AMEFF) | ✅ | AMEFF XML export beschikbaar via /api/export?format=ameff. |
| 70 | Importeren ArchiMate | ✅ | GEMMA sync via admin panel. Import van ArchiMate model. |
| 71 | Ontsluiten architectuurconcepten | ✅ | Referentiecomponenten, standaarden, applicatiefuncties als aparte entiteiten. GEMMA Views met domein/volgorde. |
| 72 | GEMMA-concepten uitleggen (Glossary) | ✅ | Begrippen-module met NL-SBB/NORA termen. GlossaryHighlighter markeert termen automatisch in content. Tooltip met definitie. |
| 73 | Doorverwijzen naar GEMMA online | ⚠ | Begrippen hebben externe URI's. Geen directe deep-links vanuit referentiecomponenten/standaarden naar GEMMA online pagina's. |
| 74 | Plotten op GEMMA views (SVG download) | ✅ | Kaart-functionaliteit (/kaart) met GEMMA Views, interactief. 📌 Peter verwijst naar https://vng-realisatie.github.io/Over-GEMMA-Archi-repository/?view=id-26040 |

---

## 10. TOEGANGSBEVEILIGING

### Eisen

| ID | Functionaliteit | Status | Toelichting |
|----|----------------|--------|-------------|
| 75 | Collega's toegang geven (beheerder) | ⚠ | Admin kan gebruikers aanmaken. Organisatie-beheerders kunnen dit niet zelf. |
| 76 | Meerdere gebruikersrollen met rechten | ✅ | 10 rollen gedefinieerd: ADMIN, LEVERANCIER, GEMEENTE_BEHEERDER, GEMEENTE_RAADPLEGER, SAMENWERKING_BEHEERDER, REDACTEUR, etc. Rolgebaseerde toegangscontrole op alle pagina's. |
| 77 | Eerste account aanmaken/fiatteren | ✅ | Admin maakt eerste account aan voor organisatie. |
| 78 | Gebruiker gekoppeld aan organisatie | ✅ | User model heeft gemeenteId en leverancierId. Ongekoppelde gebruiker = bezoeker. |
| 79 | Nieuwe gebruikers aanmelden bij organisatie | ❌ | Geen zelf-aanmeldflow met fiatteringsproces. |
| 80 | Multi-organisatie toegang | ❌ | User heeft één gemeenteId. Kan niet schakelen tussen meerdere organisaties. |
| 81 | Leveranciers zien geen gemeente-landschappen | ✅ | filterGemeentePakketten() filtert leveranciers tot alleen hun eigen pakketten. 📌 Peter bevestigt: "Leveranciers zien alleen hun eigen aanbod en gebruik daarvan." |

### Wensen

| ID | Functionaliteit | Status | Toelichting |
|----|----------------|--------|-------------|
| 82 | Impersonatie (functioneel beheerder) | ❌ | Geen impersonatie-functionaliteit. |

---

## 11. API's (Functioneel)

| ID | Functionaliteit | Prioriteit | Status | Toelichting |
|----|----------------|------------|--------|-------------|
| 100 | Raadplegen aanbod API | Eis | ✅ | Publieke API v1 met leveranciers, pakketten, standaarden, referentiecomponenten, begrippen. OpenAPI documentatie. |
| 101 | Raadplegen gebruik API | Wens | ✅ | API v1 endpoints voor gemeenten en hun pakketten. Beveiligd met rolcontrole. |
| 102 | Registreren aanbod API | Could have | ❌ | Geen write-API voor aanbod. Alleen upload via UI. |
| 103 | Registreren gebruik API | Could have | ❌ | Geen write-API voor gebruik. Alleen upload via UI. |

---

## 12. NON-FUNCTIONELE EISEN

| ID | Categorie | Prioriteit | Status | Toelichting |
|----|-----------|------------|--------|-------------|
| 83 | API standaarden (OpenAPI, REST) | Eis | ✅ | OpenAPI spec beschikbaar. REST endpoints. Swagger UI. |
| 84 | Betrouwbaarheid / beheerorganisatie | Wens | n.v.t. | Organisatorische eis, niet technisch. |
| 85 | Gebruikersvriendelijkheid | Eis | ✅ | Intuïtieve UI, validatie op formulieren, foutmeldingen. Mobiel responsive. |
| 86 | Digitoegankelijkheid | Eis | ⚠ | Semantic HTML gebruikt, maar geen formele WCAG audit gedaan. Dark mode ondersteunt contrast. |
| 87 | Logging activiteiten | Wens | ❌ | Geen audit logging geïmplementeerd. |
| 88 | Internetstandaarden (nl.internet.nl 100%) | Eis | ⚠ | Afhankelijk van hosting-configuratie. Applicatie zelf gebruikt HTTPS. |
| 89 | 2FA / RBAC | Eis | ⚠ | RBAC is geïmplementeerd (10 rollen). 2FA/TOTP is NIET geïmplementeerd. Alleen email+wachtwoord. |
| 90 | Informatiemodel voorzieningencatalogus | Eis | ⚠ | Prisma schema volgt conceptueel het informatiemodel maar wijkt mogelijk af in details. 📌 Peter: naam wordt "Voorzieningencatalogus". |
| 91 | E-mail standaarden (DKIM/DMARC) | Eis | ❌ | Geen e-mailfunctionaliteit geïmplementeerd (geen wachtwoord-reset, geen notificaties). |
| 92 | Open source (EUPL licentie) | Eis | ⚠ | Broncode in git repository. Geen EUPL licentie expliciet toegevoegd. |
| 93 | Modulariteit | Eis | ✅ | Next.js App Router structuur, gescheiden API/UI, Prisma als data-laag. |
| 94 | Webstatistieken (Matomo) | Eis | ❌ | Geen analytics/statistieken tool geïntegreerd. |
| 95 | Toekomstvaste techniek | Eis | ✅ | Next.js 16, TypeScript, React, Tailwind CSS, PostgreSQL — mainstream stack met grote community. |
| 96 | Open source componenten | Wens | ✅ | Volledig gebouwd op open source: Next.js, Prisma, PostgreSQL, Tailwind. |
| 97 | Containerisatie / CI/CD | Eis | ⚠ | Geen Dockerfile of CI/CD pipeline aanwezig in repository. Wel geschikt voor containerisatie (standaard Next.js). |
| 98 | OTAP omgevingen | Eis | ❌ | Geen meervoudige omgevingen geconfigureerd. Alleen lokale dev-omgeving. |
| 99 | Foutmeldingen | Eis | ✅ | Error handling op pagina's, formuliervalidatie, lege-staat berichten. |
| 100 | Testen | Eis | ❌ | Geen geautomatiseerde tests (unit/integration/e2e) aanwezig. |

---

## Opmerkingen naar aanleiding van mail Peter Makkes

1. **Naamswijziging**: De applicatie heet nu "GEMMA Softwarecatalogus" en moet hernoemd worden naar **"Voorzieningencatalogus"**. Dit raakt layout, metadata, OG-image, en alle referenties in de code.

2. **Rollenmodel**: Peter beschrijft drie hoofdrollen:
   - **Aanbod-beheerder** (leveranciers) — Grotendeels geïmplementeerd als LEVERANCIER rol
   - **Gebruik-beheerder** (gemeenten/samenwerkingen) — Geïmplementeerd als GEMEENTE_BEHEERDER
   - **Gebruik-raadpleger** — Geïmplementeerd als GEMEENTE_RAADPLEGER
   De huidige implementatie matcht redelijk maar mist het zelf-registratie en fiatteringsproces.

3. **Autorisatie**: Peter bevestigt:
   - Gemeenten zien alles inclusief elkaars landschappen → ✅ Geïmplementeerd
   - Leveranciers zien alleen hun eigen aanbod en gebruik → ✅ Geïmplementeerd via filterGemeentePakketten()
   - Bezoekers zien alleen openbare info → ✅ Geïmplementeerd

4. **Suite-concept**: Peter geeft aan dat het suite-concept voorlopig is losgelaten. Geen actie nodig.

5. **GEMMA Views**: Peter verwijst naar https://vng-realisatie.github.io/Over-GEMMA-Archi-repository/?view=id-26040 — De kaart-functionaliteit (/kaart) biedt al GEMMA views, maar de specifieke view-structuur zou gevalideerd moeten worden tegen dit model.

---

## Conclusies

### Sterke punten (goed gerealiseerd)
1. **Kernfunctionaliteit aanbod & gebruik** — Pakketten, leveranciers, gemeenten, standaarden, referentiecomponenten zijn volledig uitgewerkt met CRUD, zoek/filter en paginering.
2. **GEMMA-integratie** — Referentiearchitectuur, views, begrippen/glossary, AMEFF export/import zijn sterk.
3. **Autorisatiemodel** — Rolgebaseerde toegang met 10 rollen, correct filteren van gemeente-data voor leveranciers.
4. **API** — Publieke REST API met OpenAPI documentatie.
5. **Vergelijkfunctie** — Side-by-side gemeente-vergelijking recent toegevoegd.
6. **Fuzzy search** — Typfouten-tolerante zoekfunctie (pg_trgm).
7. **Responsiveness & Dark mode** — Recent toegevoegd.

### Belangrijkste gaps (niet gerealiseerd, hoge prioriteit)
1. **Zelf-registratie & fiatteringsworkflow** (eisen 60-61, 79) — Organisaties en gebruikers kunnen zich niet zelf aanmelden. Alles gaat via admin.
2. **2FA/TOTP** (eis 89) — Geen tweefactorauthenticatie. Alleen email+wachtwoord.
3. **Multi-organisatie toegang** (eis 80) — Gebruiker kan maar bij één organisatie horen.
4. **Organisatie-samenvoegen** (eis 62) — Essentieel voor gemeentelijke herindelingen.
5. **Geautomatiseerde tests** (eis 100) — Geen tests aanwezig.
6. **OTAP / CI/CD** (eisen 97-98) — Geen deployment pipeline of meervoudige omgevingen.
7. **Webstatistieken** (eis 94) — Geen Matomo of vergelijkbaar.
8. **E-mailfunctionaliteit** (eis 91) — Geen wachtwoord-reset, geen notificaties.

### IBD-wensen: volledig open terrein
Alle IBD-gerelateerde wensen (BIO compliance, DPIA, pen-tests, DigiD, kwetsbaarheden, register van verwerkingen) zijn niet gerealiseerd. Dit is een groot functioneel domein dat aanzienlijke ontwikkeltijd vergt en deels afhankelijk is van GEMMA-uitbreidingen.

### Aanbeveling
De huidige applicatie dekt de **kernfunctionaliteit** goed af (aanbod, gebruik, architectuur, API). De grootste gaps zitten in:
1. **Gebruikersbeheer-workflows** (zelf-registratie, fiattering, multi-org)
2. **Beveiligingseisen** (2FA, audit logging)
3. **DevOps** (testen, CI/CD, OTAP)
4. **IBD/compliance domein** (volledig nieuw te bouwen)

Prioritering zou moeten liggen bij de harde eisen die nog niet gerealiseerd zijn, met name de gebruikersbeheer-workflows en beveiligingseisen, aangezien deze randvoorwaardelijk zijn voor productie-gebruik.
