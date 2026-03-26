# Functionele Specificatie: Voorzieningencatalogus

> Technologie-onafhankelijke specificatie. Gebruik dit als basis om de applicatie te bouwen in elke stack (PHP, Python, Java, .NET, etc.).

## Opdracht

Bouw een Voorzieningencatalogus voor de Nederlandse publieke sector. Een webapplicatie waarmee organisaties (gemeenten, waterschappen, etc.) hun softwarepakketten, leveranciers, standaarden en koppelingen kunnen beheren en vergelijken.

De applicatie moet **multi-tenant** zijn: dezelfde codebase bedient meerdere domeinen (bijv. gemeenten en waterschappen) via configuratie.

---

## Datamodel — 34 entiteiten

### Kern-entiteiten
1. **Leverancier** — naam, slug, contactpersoon, email, telefoon, website, logo, convenant-status
2. **Pakket** — naam, slug, beschrijving, leverancier (FK), aantalOrganisaties (cache-telling)
3. **Pakketversie** — naam, status (in ontwikkeling/test/distributie/uit distributie), pakket (FK)
4. **PakketContact** — naam, email, telefoon, rol, pakket (FK)
5. **ExternPakket** — naam, versie (pakketten buiten de catalogus)
6. **Testrapport** — pakketversie (FK), status, datum, toelichting

### Referentie-architectuur
7. **Referentiecomponent** — naam, GUID (koppeling met externe architectuur-API)
8. **Standaard** — naam (bijv. StUF BG, ZDS, API's)
9. **Standaardversie** — naam, standaard (FK), compliancyMonitor flag
10. **Applicatiefunctie** — naam, beschrijving
11. **ArchitectuurView** — views/diagrammen uit extern ArchiMate-model

### Organisatie-domein
12. **Organisatie** — naam, slug, CBS-code, contactpersoon, email, telefoon, voortgang (%)
13. **Samenwerking** — samenwerkingsverbanden tussen organisaties
14. **SamenwerkingOrganisatie** — koppeltabel

### Integratie-domein
15. **Koppeling** — bron (pakketversie), doel (pakketversie of extern), richting, standaard, status
16. **Addendum** — addenda bij leveranciersconvenanten
17. **LeverancierAddendum** — koppeltabel met deadline, ondertekeningsdatum

### Pakket-relaties (op Pakket-niveau, niet Pakketversie)
18. **PakketReferentiecomponent** — pakket ↔ referentiecomponent
19. **PakketStandaard** — pakket ↔ standaardversie (compliancy)
20. **PakketApplicatiefunctie** — pakket ↔ applicatiefunctie
21. **PakketTechnologie** — pakket ↔ technologie-tag

### Gebruik
22. **OrganisatiePakket** — welke pakketversie een organisatie gebruikt + status, maatwerk, verantwoordelijke

### Dienstverleners & Cloud
23. **Dienstverlener** — naam, type (Advies/Implementatie/Beheer/Hosting/Training), specialisaties, regio
24. **DienstverlenerPakket** — koppeltabel
25. **DienstverlenerOrganisatie** — klantrelaties
26. **Cloudprovider** — naam, type (IaaS/PaaS/SaaS/Hosting), certificeringen, datacenterlocatie
27. **CloudproviderPakket** — koppeltabel

### Reviews
28. **PakketReview** — score (1-5), 4 subscores, toelichting, anoniem flag, per organisatie per pakket

### Gebruikers & Systeem
29. **User** — email, wachtwoord (gehasht), rollen (array), organisatieId (FK), leverancierId (FK), 2FA velden
30. **UserOrganisatie** — multi-organisatie toegang (many-to-many met rol)
31. **PasswordResetToken** — token, userId, verlooptijd
32. **Pagina** — CMS-pagina's (slug, titel, rich-text body)
33. **AuditLog** — userId, actie, entiteitType, entiteitId, details, timestamp
34. **AppSetting** — key-value configuratie
35. **Notificatie** — type, titel, bericht, gelezen, userId
36. **Favoriet** — entiteitType, entiteitId, userId

---

## Rollen & Autorisatie

| Rol | Rechten |
|---|---|
| **ADMIN** | Alles — gebruikersbeheer, data-import, deploy, configuratie |
| **ORGANISATIE_BEHEERDER** | Eigen portfolio bewerken, pakketten toevoegen/verwijderen, koppelingen beheren |
| **ORGANISATIE_RAADPLEGER** | Alle data bekijken, AI-adviseur gebruiken |
| **LEVERANCIER** | Eigen pakketten beheren, addenda bewerken, eigen data zien |
| **API_USER** | Lees/schrijf via REST API met Bearer token |
| **PUBLIEK** | Alleen openbare pagina's (pakketten, leveranciers, standaarden) |

---

## Pagina's — 60+ routes

### Publiek (geen login vereist)
- **Homepage** — tegelmenu met live aantallen, snelzoekbalk, laatste wijzigingen feed
- **Pakketten** — zoeken, filteren op leverancier/referentiecomponent, paginering (25/p), CSV export
- **Pakketversies** — status-filter, paginering
- **Pakket detail** — versies, referentiecomponenten, standaarden, reviews (radar chart), contactpersonen
- **Leveranciers** — zoeken, paginering, CSV export
- **Leverancier detail** — pakketaanbod, addenda, contactgegevens
- **Organisaties** — zoeken, filteren op pakket, voortgangsindicator (sterren), paginering
- **Organisatie detail** — dashboard (KPI-cards), pakketten-tab, koppelingen-tab, suggesties-tab, AI-adviseur-tab
- **Standaarden** — met versies en pakketdekking, paginering
- **Referentiecomponenten** — met link naar externe architectuur-site, paginering
- **Applicatiefuncties** — paginering
- **Begrippen** — live van externe SKOS API, zoekbaar
- **Koppelingen** — filters op soort, standaard, status
- **Compliancy-monitor** — matrix pakketten vs standaarden
- **Inkoopondersteuning** — selecteer applicatiefuncties, vergelijk pakketten
- **Marktverdeling** — scatterplot (klanten vs referentiecomponenten vs pakketten per leverancier)
- **Zoeken** — fuzzy search over 6 contenttypen, multi-filter
- **Kaart** — interactieve kaart van Nederland met organisaties, voortgang per regio
- **Samenwerkingsverbanden kaart** — alle samenwerkingen op kaart met aggregeerde stats
- **Organisaties vergelijken** — tot 4 organisaties side-by-side
- **Vergelijkbare organisaties** — Jaccard-similariteit, sorteerbare tabel
- **Dienstverleners** — zoeken, type-filter, paginering
- **Cloudproviders** — zoeken, type-filter, certificeringen-badges
- **Help/handleiding** — gebruikershulp

### Authenticatie
- **Login** — email + wachtwoord + optioneel TOTP (2FA)
- **Registratie** — organisatie of leverancier, concept-status tot admin goedkeurt
- **Wachtwoord vergeten/reset** — email-based flow

### Dashboard (ingelogd)
- **Dashboard** — 6 KPI-cards, portfolio, koppelingen, suggesties, AI-adviseur
- **Favorieten** — opgeslagen pakketten/leveranciers
- **Notificaties** — meldingen met gelezen/ongelezen
- **Profiel** — bewerken, 2FA setup/disable

### Admin
- **Beheer** — overzicht met links naar alle admin-functies
- **Gebruikersbeheer** — CRUD, multi-organisatie toewijzing
- **Registraties** — goedkeuren/afwijzen van concept-registraties
- **Organisaties samenvoegen** — herindeling met data-migratie
- **Audit log** — alle mutaties
- **Statistieken** — platformbrede tellingen, top-10 lijsten
- **PvE-analyse** — eisen vs realisatie met percentages
- **Datamodel** — MIM-diagram met relaties
- **Linked Data** — RDF explorer
- **Regeneratie-prompt** — deze specificatie
- **Demo draaiboek** — 22 secties met spraak
- **Data import** — CSV/Excel/JSON upload
- **Dependencies** — npm/composer audit
- **Deploy** — productie-deploy met live output

### REST API (v1)
- GET/POST `/api/v1/pakketten` — lezen + aanmaken
- GET/PUT/DELETE `/api/v1/pakketten/:id` — detail + bewerken + verwijderen
- POST `/api/v1/pakketten/:id/versies` — versie toevoegen
- GET/POST `/api/v1/leveranciers` — lezen + aanmaken
- GET `/api/v1/organisaties` + `/:id` + `/:id/pakketten`
- POST/DELETE `/api/v1/organisaties/:id/pakketten` — portfolio beheren
- POST `/api/v1/organisaties/:id/koppelingen` — koppeling toevoegen
- GET `/api/v1/standaarden`, `/api/v1/referentiecomponenten`, `/api/v1/begrippen`
- GET `/api/v1/openapi` — OpenAPI 3.0 spec
- GET `/api/feed` — RSS/Atom

---

## Externe integraties

| Integratie | Doel | Methode |
|---|---|---|
| **Architectuur-API** (GEMMA/WILMA) | Referentiecomponenten, standaarden, applicatiefuncties importeren | REST API, periodieke sync |
| **SKOS/Skosmos API** | Begrippen live ophalen voor tooltips | REST API, caching (1 uur) |
| **AI-adviseur** (Claude/GPT) | Portfolio-analyse en advies | API call met context |
| **E-mail** | Registratie, goedkeuring, wachtwoord-reset | SMTP of API (Resend/SendGrid) |

---

## Linked Data (RDF)

- Publicatie als JSON-LD, Turtle en RDF/XML
- Content negotiation via Accept header of `?format=` parameter
- DCAT-catalogus voor machine-readable metadata
- Begrippen als SKOS-concepten
- Privacy: organisatie-pakket relaties niet openbaar zonder authenticatie

---

## Multi-tenant configuratie

Eén codebase, meerdere deployments. Tenant bepaald via environment variable `TENANT`.

| Configuratie-item | VNG (gemeenten) | HWH (waterschappen) |
|---|---|---|
| Organisatie-type | Gemeente | Waterschap |
| Route | /gemeenten | /waterschappen |
| Architectuur-sync | GEMMA (gemmaonline.nl) | WILMA (wilmaonline.nl) |
| Branding | VNG blauw | HWH blauw |
| Rollen | GEMEENTE_BEHEERDER | WATERSCHAP_BEHEERDER |

---

## Security vereisten

### Authenticatie & Sessies
- Auth check op ELKE API route en beschermde pagina (eerste regel van de handler)
- 2FA/TOTP voor alle rollen, geen uitzonderingen
- Sessie-rotatie na login
- Redirect-parameters valideren (geen open redirects)

### Autorisatie
- Ownership checks op alle mutaties
- Admin-routes apart beveiligd
- Deny by default

### Input validatie
- Schema-validatie op ALLE externe input (API, uploads, URL params)
- Geen mass assignment (`{...req.body}` direct naar database)
- File uploads: MIME check + max 10MB + extensie whitelist

### XSS preventie
- Alle user-generated HTML sanitizen (DOMPurify of equivalent)
- SVG content sanitizen
- CSP headers configureren

### Rate limiting
- API: 100 req/min
- Auth: 10 req/min
- Admin: 30 req/min
- Distributed (Redis) voor productie

### Overig
- Wachtwoorden: bcrypt/argon2
- Error responses: generiek naar client, details naar server logs
- CSV export: sanitize tegen formula injection
- Audit logging op alle mutaties
- Security headers: X-Frame-Options, CSP, HSTS, Referrer-Policy

---

## UX vereisten

- **Responsief**: 375px (mobile) tot 1920px+ (desktop)
- **Dark mode**: systeemvoorkeur-detectie
- **WCAG 2.1 AA**: semantische HTML, ARIA labels, keyboard navigatie, kleurcontrast 4.5:1
- **Loading states**: skeleton placeholders op alle lijstpagina's
- **Paginering**: 25 items per pagina op alle overzichten
- **Zoeken**: fuzzy search met typefouttolerantie
- **Breadcrumbs**: op alle detailpagina's
- **Keyboard shortcuts**: / voor zoeken
- **Print styles**: nette afdrukken zonder navigatie
- **QR-codes**: op detailpagina's voor delen
- **Share-button**: kopieer-link functionaliteit

---

## Performance vereisten

- Database indexes op alle zoek- en FK-kolommen
- Caching op publieke pagina's (minimaal 1 uur)
- Lazy-loading van zware componenten (kaart, editor)
- Paginering verplicht (nooit alle records laden)
- Parallelle database queries waar mogelijk
- Geen N+1 queries
- API response time: p95 < 200ms reads, p95 < 500ms writes
