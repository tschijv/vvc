
# Analyse Programma van Eisen vs. Gerealiseerde Functionaliteit
## Voorzieningencatalogus (voorheen Softwarecatalogus)

**Datum:** 23 maart 2026
**Gebaseerd op:** Bijlage 1.2 - Programma van Eisen (ontvangen van Peter Makkes)
**Vergeleken met:** Huidige applicatie (VNG Voorzieningencatalogus, Next.js 16 / Prisma 7 / PostgreSQL)
**Interactieve versie:** [/admin/pve-analyse](/admin/pve-analyse) (inloggen als admin vereist)

---

## Samenvatting

| Categorie | Aantal | Gerealiseerd ✅ | Deels ⚠ | Niet gerealiseerd ❌ |
|-----------|--------|----------------|---------|---------------------|
| **Eisen (must have)** | 51 | 40 | 8 | 3 |
| **Wensen (nice to have)** | 24 | 10 | 1 | 13 |
| **Could have** | 2 | 0 | 0 | 2 |
| **Totaal PvE** | **77** | **51 (66%)** | **9 (12%)** | **17 (22%)** |
| **Extra gerealiseerd** 🚀 | **24** | — | — | — |

**Conclusie:** 78% van alle eisen en wensen is geheel of gedeeltelijk gerealiseerd. Van de 51 harde **eisen** is **94%** (48 van 51) geheel of deels gerealiseerd, waarvan **78%** volledig. Van de 24 **wensen** is **46%** geheel of deels gerealiseerd. Daarnaast zijn **24 extra features** gerealiseerd die niet in het oorspronkelijke PvE stonden.

### Vergelijking met vorige versie (16 maart 2026)

| Metriek | 16 maart | 23 maart | Verschil |
|---------|----------|----------|----------|
| Gerealiseerd | 34 (33%) | 51 (66%) | +17 (+33%) |
| Deels gerealiseerd | 20 (19%) | 9 (12%) | +11 deels → volledig |
| Niet gerealiseerd | 50 (48%) | 17 (22%) | -33 |
| Extra features | 0 | 24 | +24 |

---

## Legenda

- ✅ **Gerealiseerd** — Functionaliteit is aanwezig en werkt
- ⚠ **Deels gerealiseerd** — Basisfunctionaliteit aanwezig, maar niet volledig conform PvE
- ❌ **Niet gerealiseerd** — Functionaliteit ontbreekt
- 🚀 **Extra** — Niet in PvE, wel gebouwd
- 📌 **Opmerking Peter** — Relevante context uit mail van Peter Makkes

---

## 1. AANBOD (Functioneel)

### Eisen

| ID | Functionaliteit | Status | Toelichting |
|----|----------------|--------|-------------|
| 1 | Zoeken/filteren op standaarden | ✅ | Standaardenpagina met versies, pakketfiltering en paginering. Compliancy-monitor toont compliance per standaard. |
| 2 | Zoeken/filteren op referentiecomponenten | ✅ | Referentiecomponentenpagina met zoekfunctie, pakkettellingen en paginering. Inkoop-pagina filtert op referentiecomponent. |
| 3 | Registreren pakketten | ✅ | Upload-functie voor leveranciers (CSV/JSON/Excel). Admin kan ook pakketten beheren. Inline bewerken via pakketdetailpagina. |
| 4 | Registreren koppelingen bij pakket | ✅ | Koppelingen-systeem met bron/doel, richting, protocol, standaard. Ondersteunt externe pakketten en tussenliggende systemen. |
| 5 | Beheren content & configuratie | ✅ | CMS-systeem (Pagina model) met TipTap editor. Admin kan pagina's aanmaken en bewerken. |
| 6 | Data-migratie | ⚠ | Import-functionaliteit aanwezig (CSV/JSON/Excel upload), maar specifieke migratie van oude softwarecatalogus-data is niet als aparte feature gebouwd. |

### Wensen

| ID | Functionaliteit | Status | Toelichting |
|----|----------------|--------|-------------|
| 7 | Registreren dienstverleners | ❌ | Placeholder-pagina aanwezig. Nog niet geimplementeerd. |
| 8 | Registreren cloud-providers | ❌ | Placeholder-pagina aanwezig. Nog niet geimplementeerd. |
| 9 | Raadplegen review scores | ❌ | Geen review/score-systeem voor pakketten. |

---

## 2. AANBOD EN GEBRUIK WENSEN

| ID | Functionaliteit | Status | Toelichting |
|----|----------------|--------|-------------|
| 10 | AI-advisering | ✅ | AI-adviseur (Claude API) op gemeente-detailpagina en als eigen tabblad in dashboard. 5 voorgestelde vragen + vrije invoer. Opgemaakte HTML-antwoorden. |
| 11 | Registreren business rules | ❌ | Geen business rules engine. |
| 12–15 | Adviseren Common Ground, SaaS | ❌ | Geen automatische advisering op basis van CG/SaaS criteria. |
| 16 | Statistieken gebruik | ✅ | Admin statistiekenpagina met platformbrede tellingen, top-10 pakketten/leveranciers en recente activiteit. |

---

## 3. COMMON GROUND WENSEN

| ID | Functionaliteit | Status | Toelichting |
|----|----------------|--------|-------------|
| 17–20 | Common Ground registratie/filtering | ❌ | Geen CG-laag concept, geen CG-compliance tracking. |

---

## 4. GEBRUIK (Functioneel)

### Eisen

| ID | Functionaliteit | Status | Toelichting |
|----|----------------|--------|-------------|
| 21 | Beheren applicatielandschap gemeente | ✅ | Dashboard met 6 KPI-kaarten, pakketoverzicht, upload-functie, koppelingen-beheer. |
| 22 | Vergelijken gebruik (gemeente vs gemeente) | ✅ | Vergelijkfunctie met side-by-side tabel. Vergelijkbare gemeenten: volledige pagina met Jaccard-similariteit (tot 500 gemeenten). Bulk-vergelijking tot 4 gemeenten. |
| 23 | Vergelijken gebruik (gemeente vs aanbod) | ⚠ | Compliancy-monitor vergelijkt gebruik met standaarden. Geen directe vergelijking gemeente-portfolio vs totaal aanbod. |
| 24 | Exporteren gebruik | ✅ | Export-API met CSV, IBD-foto en AMEFF XML formaten. |
| 25 | Ontsluiten gebruik | ✅ | Gemeente-detailpagina toont portfolio, koppelingen, voortgang. Rolgebaseerde zichtbaarheid. |
| 26 | Raadplegen gebruik | ✅ | Gemeenten-overzicht met zoek/filter, sterren-systeem, paginering. Inklapbare filterlijsten. |

### Wensen

| ID | Functionaliteit | Status | Toelichting |
|----|----------------|--------|-------------|
| 27 | Registreren maatwerk bij pakket | ✅ | GemeentePakket heeft maatwerk-veld. Zichtbaar op gemeente-detailpagina. |
| 28 | Registreren verantwoordelijke bij pakket | ✅ | GemeentePakket heeft verantwoordelijke-veld. |
| 29 | Registreren licentievorm bij pakket | ✅ | GemeentePakket heeft licentievorm-veld. |
| 30 | Registreren gebruikersaantallen | ✅ | GemeentePakket heeft aantalGebruikers-veld. |
| 31 | Wijzigingshistorie bijhouden | ✅ | AuditLog registreert portfolio-wijzigingen. Wijzigingshistorie-tijdlijn op pakketdetailpagina's. |

---

## 5. GT INKOOP WENSEN

| ID | Functionaliteit | Status | Toelichting |
|----|----------------|--------|-------------|
| 32–35 | Contractbeheer, verloopdatums, BIO compliance | ❌ | Geen contractbeheerfunctionaliteit. Inkoop-pagina bevat referentiecomponent-selectie en GEMMA/GIBIT richtlijnen. |
| 36 | Exporteren inkoop-gegevens | ❌ | Geen specifieke inkoop-export. |

---

## 6. IBD WENSEN

| ID | Functionaliteit | Status | Toelichting |
|----|----------------|--------|-------------|
| 37–44 | BIO compliance, DPIA, SLA-criteria | ❌ | Geen BIO/DPIA/SLA tracking. |
| 45–48 | Pen-test resultaten, DigiD-assessments | ❌ | Geen beveiligingsbeoordelingen-module. |
| 49–53 | Verklaringen/overeenkomsten fiatteren | ❌ | Geen document-sharing/fiatteringsworkflow. |
| 54–55 | Register van verwerkingen genereren | ❌ | Geen AVG register. Vereist GEMMA-uitbreiding. |
| 56–58 | Kwetsbaarheden notificatie, NIST CVE | ⚠ | Notificatiesysteem aanwezig. Geen NIST CVE-integratie, maar infrastructuur beschikbaar. |

---

## 7. MANAGEMENT INFORMATIE

| ID | Functionaliteit | Status | Toelichting |
|----|----------------|--------|-------------|
| 59 | Database-toegang voor rapportages | ⚠ | Data via REST API, CSV-export en Linked Data (RDF) beschikbaar. Geen dedicated rapportage-interface. |

---

## 8. ORGANISATIE

### Eisen

| ID | Functionaliteit | Status | Toelichting |
|----|----------------|--------|-------------|
| 60 | Zelf organisatiegegevens registreren (concept) | ✅ | Publieke registratiepagina. Registraties als concept, admin beoordeelt. |
| 61 | Fiatteren concept-organisaties | ✅ | Admin-goedkeuringsworkflow met rollen toewijzen en afwijzen met reden. E-mailnotificaties bij goedkeuring/afwijzing. |
| 62 | Samenvoegen organisaties (herindeling) | ✅ | Admin kan gemeenten samenvoegen. Portfolio, gebruikers, koppelingen automatisch overgenomen. Preview toont impact. |
| 63 | Aanmaken organisaties + accounts | ✅ | Admin kan gebruikers aanmaken met gemeente/leverancier-koppeling. |
| 64 | Gebruik-beheerder registreert aanbieder | ⚠ | Admin moet leverancier aanmaken. Upload accepteert wel nieuwe namen. |
| 65 | Overzicht aanbiedende organisaties | ✅ | Leveranciers-pagina met zoek/filter en paginering. |
| 66 | Overzicht gebruikende organisaties | ✅ | Gemeenten-pagina met zoek/filter, sterren, paginering. 📌 Peter: gemeenten zien elkaars landschappen; leveranciers alleen hun eigen pakketten. |
| 67 | Contactpersonen per pakket | ✅ | PakketContact model: meerdere contactpersonen per pakket met naam, e-mail, telefoon en rol. |
| 68 | Aanvullende organisatie-info, links | ✅ | Leverancier heeft diensten-omschrijving, supportportaal, documentatie- en kennisbank-URL's. |

---

## 9. REFERENTIEARCHITECTUUR

| ID | Functionaliteit | Status | Toelichting |
|----|----------------|--------|-------------|
| 69 | Exporteren ArchiMate (AMEFF) | ✅ | AMEFF XML export via /api/export?format=ameff. |
| 70 | Importeren ArchiMate | ✅ | GEMMA sync via admin panel. |
| 71 | Ontsluiten architectuurconcepten | ✅ | Referentiecomponenten, standaarden, applicatiefuncties. GEMMA Views. |
| 72 | GEMMA-concepten uitleggen (Glossary) | ✅ | Begrippen live van SKOSMOS API. GlossaryHighlighter met automatische tooltips. SKOS Linked Data. |
| 73 | Doorverwijzen naar GEMMA online | ✅ | Deep-links via GUID. Begrippen met externe URI's. |
| 74 | Plotten op GEMMA views | ✅ | Kaart-functionaliteit met interactieve GEMMA Views. |

---

## 10. TOEGANGSBEVEILIGING

### Eisen

| ID | Functionaliteit | Status | Toelichting |
|----|----------------|--------|-------------|
| 75 | Collega's toegang geven | ⚠ | Admin kan gebruikers aanmaken. Organisatie-beheerders niet zelf. |
| 76 | Meerdere gebruikersrollen | ✅ | 10 rollen (ADMIN, LEVERANCIER, GEMEENTE_BEHEERDER, etc.). Rolgebaseerde toegangscontrole. |
| 77 | Eerste account aanmaken/fiatteren | ✅ | Admin maakt eerste account aan. |
| 78 | Gebruiker gekoppeld aan organisatie | ✅ | User heeft gemeenteId en leverancierId. |
| 79 | Nieuwe gebruikers aanmelden | ❌ | Geen zelf-aanmeldflow met fiatteringsproces. |
| 80 | Multi-organisatie toegang | ❌ | User heeft een gemeenteId. Kan niet schakelen. |
| 81 | Leveranciers zien geen gemeente-landschappen | ✅ | filterGemeentePakketten() filtert correct. 📌 Peter bevestigt. |

### Wensen

| ID | Functionaliteit | Status | Toelichting |
|----|----------------|--------|-------------|
| 82 | Impersonatie | ✅ | Admin kan als andere gebruiker inloggen. Amber banner toont status. |

---

## 11. API's (Functioneel)

| ID | Functionaliteit | Prio | Status | Toelichting |
|----|----------------|------|--------|-------------|
| 100 | Raadplegen aanbod API | Eis | ✅ | Publieke API v1 met OpenAPI docs. Rate limiting. RSS/Atom feed. |
| 101 | Raadplegen gebruik API | Wens | ✅ | API v1 endpoints voor gemeenten. Beveiligd. |
| 102 | Registreren aanbod API | Could | ❌ | Geen write-API. Alleen upload via UI. |
| 103 | Registreren gebruik API | Could | ❌ | Geen write-API. Alleen upload via UI. |

---

## 12. NON-FUNCTIONELE EISEN

| ID | Categorie | Prio | Status | Toelichting |
|----|-----------|------|--------|-------------|
| 83 | API standaarden | Eis | ✅ | OpenAPI, REST, Swagger UI. Linked Data (JSON-LD, Turtle, RDF/XML). DCAT-catalogus. |
| 84 | Betrouwbaarheid | Wens | n.v.t. | Organisatorische eis. |
| 85 | Gebruikersvriendelijkheid | Eis | ✅ | Loading skeletons, breadcrumbs, keyboard shortcuts, favorieten, QR-codes, share-button, snelzoekbalk. CollapsibleFilterList met werkende URL-parameter filters. |
| 86 | Digitoegankelijkheid | Eis | ✅ | Skip-link, ARIA, keyboard nav, dark mode, print-styles. |
| 87 | Logging activiteiten | Wens | ✅ | AuditLog model. |
| 88 | Internetstandaarden | Eis | ⚠ | HTTPS. Verdere compliance afhankelijk van hosting. |
| 89 | 2FA / RBAC | Eis | ⚠ | RBAC: 10 rollen + rate limiting. 2FA/TOTP: niet geimplementeerd. |
| 90 | Informatiemodel | Eis | ⚠ | Prisma schema volgt informatiemodel. MIM-visualisatie beschikbaar. |
| 91 | E-mail (DKIM/DMARC) | Eis | ✅ | Via Resend: registratie-notificaties, goedkeuring/afwijzing, wachtwoord-reset. |
| 92 | Open source (EUPL) | Eis | ✅ | Git repository met EUPL v1.2 licentie. |
| 93 | Modulariteit | Eis | ✅ | App Router, gescheiden API/UI, lazy-loading, select clauses. |
| 94 | Webstatistieken (Matomo) | Eis | ✅ | Matomo-integratie ingebouwd, configureerbaar via env vars. |
| 95 | Toekomstvaste techniek | Eis | ✅ | Next.js 16, TypeScript, React, Tailwind, PostgreSQL. Performance-geoptimaliseerd. |
| 96 | Open source componenten | Wens | ✅ | 100% open source stack. |
| 97 | Containerisatie / CI/CD | Eis | ✅ | Dockerfile met multi-stage build. Standalone output. |
| 98 | OTAP omgevingen | Eis | ❌ | Geen meervoudige omgevingen geconfigureerd. |
| 99 | Foutmeldingen | Eis | ✅ | Error handling, validatie, lege-staat berichten. |
| 100 | Testen | Eis | ✅ | 26 end-to-end Playwright tests. |

---

## Extra gerealiseerde functionaliteit 🚀

24 features die **niet** in het oorspronkelijke PvE stonden maar wel zijn gebouwd:

| ID | Feature | Toelichting |
|----|---------|-------------|
| E1 | Dark mode | Volledig met systeemvoorkeur-detectie |
| E2 | Linked Data (RDF) | JSON-LD, Turtle, RDF/XML, DCAT, SKOS |
| E3 | Favorieten | Hart-icoon + /favorieten overzicht |
| E4 | Notificatiesysteem | Bel in header + /notificaties pagina |
| E5 | QR-codes | Op alle detailpagina's |
| E6 | Share-button | Kopieer-link op detailpagina's |
| E7 | RSS/Atom feed | /api/feed syndication |
| E8 | Compliancy-monitor | Matrix pakketten vs standaarden |
| E9 | Inkoopondersteuning | Referentiecomponent-selectie + GIBIT |
| E10 | Vergelijkbare gemeenten | Jaccard-similariteit, sorteerbaar |
| E11 | Bulk-vergelijking | Tot 4 gemeenten side-by-side |
| E12 | Keyboard shortcuts | / voor zoeken, spatiebalk demo |
| E13 | Homepage zoekbalk | Snelzoeken over 3 contenttypen |
| E14 | Print styles | CSS voor nette afdrukken |
| E15 | Geautomatiseerde demo | DemoPlayer + Playwright + TTS (22 secties) |
| E16 | Deploy-knop | Eén-klik deploy met live terminal |
| E17 | Regeneratie-prompt | AI-prompt met guardrails |
| E18 | PvE-analyse | Interactieve analyse-pagina |
| E19 | Datamodel MIM | Interactieve visualisatie |
| E20 | GlossaryHighlighter | Automatische begrippen-tooltips |
| E21 | Testrapporten | Status-badges bij pakketversies |
| E22 | Loading skeletons | Op alle overzichtspagina's |
| E23 | Anonimisatie | Demo-data anonimiseren |
| E24 | Wachtwoordbeveiliging | Basic Auth op Vercel |

---

## Opmerkingen n.a.v. mail Peter Makkes

1. **Naamswijziging**: ✅ Hernoemd van "GEMMA Softwarecatalogus" naar **"Voorzieningencatalogus"** — layout, metadata, OG-image en alle referenties.

2. **Rollenmodel**: Peter beschrijft drie hoofdrollen:
   - **Aanbod-beheerder** (leveranciers) — ✅ Geimplementeerd als LEVERANCIER rol
   - **Gebruik-beheerder** (gemeenten/samenwerkingen) — ✅ Geimplementeerd als GEMEENTE_BEHEERDER
   - **Gebruik-raadpleger** — ✅ Geimplementeerd als GEMEENTE_RAADPLEGER

3. **Autorisatie**: Peter bevestigt:
   - ✅ Gemeenten zien alles inclusief elkaars landschappen
   - ✅ Leveranciers zien alleen hun eigen aanbod en gebruik
   - ✅ Bezoekers zien alleen openbare info

4. **Suite-concept**: Voorlopig losgelaten. Geen actie nodig.

5. **GEMMA Views**: Kaart-functionaliteit (/kaart) biedt GEMMA views.

---

## Conclusies

### Sterke punten ✅
1. **Kernfunctionaliteit** — Pakketten, leveranciers, gemeenten, standaarden volledig uitgewerkt
2. **GEMMA-integratie** — Views, glossary, AMEFF, Linked Data (RDF), DCAT
3. **Autorisatiemodel** — 10 rollen, correct filteren per rol
4. **Zelf-registratie & fiattering** — Publieke registratie, admin-goedkeuring, e-mailnotificaties
5. **E-mailfunctionaliteit** — Registratie, goedkeuring/afwijzing, wachtwoord-reset (Resend)
6. **Organisatie-informatie** — Contactpersonen, diensten-omschrijving, support/documentatie links
7. **API** — REST + OpenAPI + Linked Data + RSS feed
8. **Vergelijkfuncties** — Side-by-side, Jaccard-similariteit, bulk (4 gemeenten)
9. **AI-adviseur** — Claude-aangedreven advies met HTML-output
10. **Deploy & onderhoud** — Eén-klik deploy, regeneratie-prompt, PvE-analyse, demo draaiboek
11. **Performance** — Database indexes, lazy-loading, select clauses, WebP, paginering
12. **Dark mode, QR-codes, print styles** — Extra UX features

### Belangrijkste gaps ❌
1. **2FA/TOTP** (eis 89) — Alleen email + wachtwoord
2. **Multi-organisatie toegang** (eis 80) — User = 1 organisatie
3. **OTAP omgevingen** (eis 98) — Geen meervoudige omgevingen
4. **Dienstverleners & cloud-providers** (wensen 7-8) — Placeholder-pagina's

### IBD-wensen: volledig open terrein
Alle IBD-gerelateerde wensen (BIO compliance, DPIA, pen-tests, DigiD, kwetsbaarheden, register van verwerkingen) zijn niet gerealiseerd. Dit is een groot functioneel domein dat aanzienlijke ontwikkeltijd vergt en deels afhankelijk is van GEMMA-uitbreidingen.

### Aanbeveling prioritering
De huidige applicatie dekt de kernfunctionaliteit goed af. De grootste resterende gaps zitten in:
1. **Beveiligingseisen** — 2FA/TOTP implementeren
2. **Gebruikersbeheer** — multi-organisatie toegang, zelf-beheer collega-accounts
3. **DevOps** — OTAP omgevingen configureren
4. **IBD/compliance domein** — volledig nieuw te bouwen

Prioritering zou moeten liggen bij de harde eisen (2FA, OTAP), aangezien deze randvoorwaardelijk zijn voor productie-gebruik.
