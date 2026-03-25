# Draaiboek Demo VNG Voorzieningencatalogus

> Geschatte duur: 30-45 minuten. Inloggen als admin@vvc.nl / admin123 voor volledige toegang.

---

## 1. Homepage & Navigatie (3 min)

**Link:** [http://localhost:3000/](http://localhost:3000/)

**Toelichting:** De homepage toont een tegelmenu in drie kleuren:
- **Oranje** — Primaire functies: Mijn Voorzieningencatalogus, Inkoopondersteuning, Compliancy Monitor
- **Blauw** — Datacatalogi: Pakketten, Leveranciers, Gemeenten, Standaarden, Referentiecomponenten
- **Groen** — Dienstverleners, Cloud-providers

Alle tegels tonen live aantallen uit de database. Onderaan staat nieuws, doel van de catalogus, en voortgang van gemeenten.

**Demo-actie:** Klik door de tegels om de structuur te laten zien.

---

## 2. Pakketten overzicht (5 min)

**Link:** [http://localhost:3000/pakketten](http://localhost:3000/pakketten)

**Toelichting:** Overzicht van alle softwarepakketten in de catalogus. Bevat:
- Zoekbalk (zoek op naam)
- Filter op leverancier (dropdown)
- Filter op referentiecomponent (dropdown)
- Paginering (25 per pagina)
- CSV-export van het gefilterde resultaat

**Demo-actie:** Zoek op een pakketnaam, filter op een leverancier, en exporteer het resultaat als CSV.

**Detailpagina voorbeeld:** [http://localhost:3000/pakketten/\<slug\>](http://localhost:3000/pakketten) — klik op een pakket voor versies, referentiecomponenten, standaarden en welke gemeenten het gebruiken.

---

## 3. Leveranciers (3 min)

**Link:** [http://localhost:3000/leveranciers](http://localhost:3000/leveranciers)

**Toelichting:** Alle geregistreerde softwareleveranciers met contactpersoon, e-mail, aantal pakketten en addenda. Zoekbaar en gepagineerd.

**Demo-actie:** Klik door naar een leverancier om het volledige pakketaanbod te bekijken.

---

## 4. Gemeenten & Voortgang (5 min)

**Link:** [http://localhost:3000/gemeenten](http://localhost:3000/gemeenten)

**Toelichting:** Alle 389 Nederlandse gemeenten met voortgangsindicator (sterren). Zoekbaar, filterbaar op pakket, gepagineerd.

**Demo-actie:** Klik op een gemeente (bijv. 's-Gravenhage) om het applicatieportfolio te bekijken: pakketten, versies, statussen, en koppelingen.

**Detailpagina voorbeeld:** [http://localhost:3000/gemeenten/1f41e9e0-ac4d-471d-850a-9c083103667d](http://localhost:3000/gemeenten/1f41e9e0-ac4d-471d-850a-9c083103667d) ('s-Gravenhage)

---

## 5. AI-adviseur (5 min) ⭐

**Link:** [http://localhost:3000/gemeenten/1f41e9e0-ac4d-471d-850a-9c083103667d](http://localhost:3000/gemeenten/1f41e9e0-ac4d-471d-850a-9c083103667d) (scroll naar beneden)

**Toelichting:** Op elke gemeentedetailpagina staat onderaan een AI-adviseur (aangedreven door Claude). Deze analyseert het volledige applicatieportfolio van de gemeente en geeft intelligent advies. Bevat 4 voorgestelde vragen:
- Welke pakketten naderen einde ondersteuning?
- Hoe verhoudt ons portfolio zich tot de GEMMA-standaarden?
- Welke standaarden missen we?
- Geef advies voor pakketvervanging of consolidatie.

Er kan ook een vrije vraag gesteld worden.

**Demo-actie:** Klik op "Welke pakketten naderen einde ondersteuning?" en laat het AI-antwoord zien. Stel daarna een eigen vraag.

**Vereist:** Ingelogd als ADMIN, GEMEENTE of LEVERANCIER.

---

## 6. Gemeenten vergelijken (3 min)

**Link:** [http://localhost:3000/gemeenten/vergelijk](http://localhost:3000/gemeenten/vergelijk)

**Toelichting:** Vergelijk twee gemeenten zij-aan-zij op applicatieportfolio. Toont:
- Samenvatting: gedeelde pakketten, uniek voor gemeente A, uniek voor gemeente B
- Voortgangsbalken naast elkaar
- Gedetailleerde vergelijkingstabel met kleurcodes (groen=beiden, oranje=alleen A, blauw=alleen B)

**Demo-actie:** Selecteer twee gemeenten en bespreek de verschillen.

**Vereist:** Ingelogd.

---

## 7. Dashboard (5 min)

**Link:** [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

**Toelichting:** Persoonlijk dashboard met tabbladen:
- **Dashboard** — 6 KPI-kaarten: compliant versies, einde ondersteuning, SaaS-alternatieven, inkoopondersteuning, extra mogelijkheden, multi-pakket referentiecomponenten
- **Pakketten** — Gefilterde pakketlijst met compliancy- en standaardfilters
- **Koppelingen** — Koppelingenmatrix met bidirectionele datastromen
- **Suggesties** — Aanbevelingen voor verbetering

Admins kunnen via de gemeenteselector wisselen tussen gemeenten.

**Demo-actie:** Loop door de tabbladen en laat de KPI-kaarten zien.

---

## 8. Compliancy Monitor (3 min)

**Link:** [http://localhost:3000/compliancy](http://localhost:3000/compliancy)

**Toelichting:** Matrix van pakketten versus standaarden. Per standaardversie wordt getoond welke pakketversies compliant zijn (✓), niet compliant (✗), of onbekend. Samenvatting met ratio per standaard.

**Demo-actie:** Laat zien hoe snel je kunt zien welke pakketten aan welke standaarden voldoen.

---

## 9. Inkoopondersteuning (3 min)

**Link:** [http://localhost:3000/inkoop](http://localhost:3000/inkoop)

**Toelichting:** Selecteer gewenste referentiecomponenten en bekijk welke pakketten deze ondersteunen. Inclusief standaardaanbevelingen en GIBIT-richtlijnen.

**Demo-actie:** Selecteer een referentiecomponent en toon de gefilterde aanbiedingen.

---

## 10. Koppelingen (2 min)

**Link:** [http://localhost:3000/koppelingen](http://localhost:3000/koppelingen)

**Toelichting:** Overzicht van alle systeem-integraties/koppelingen met filters op soort, standaard en status. Toont bron → richting → doel.

**Demo-actie:** Filter op een specifieke standaard of status.

---

## 11. Standaarden & Referentiecomponenten (2 min)

**Links:**
- [http://localhost:3000/standaarden](http://localhost:3000/standaarden)
- [http://localhost:3000/referentiecomponenten](http://localhost:3000/referentiecomponenten)

**Toelichting:** Standaarden met versies en pakketdekking. Referentiecomponenten gelinkt aan GEMMA Online. Beide zoekbaar.

---

## 12. Zoeken (2 min)

**Link:** [http://localhost:3000/zoeken](http://localhost:3000/zoeken)

**Toelichting:** Globale fuzzy zoekmachine over 6 contenttypen: pakketten, leveranciers, gemeenten, standaarden, referentiecomponenten en begrippen. Tolereert typefouten (pg_trgm similarity). Filterchips per type.

**Demo-actie:** Zoek met een typefout en laat zien dat de juiste resultaten toch gevonden worden.

---

## 13. Begrippenkader (2 min)

**Link:** [http://localhost:3000/begrippen](http://localhost:3000/begrippen)

**Toelichting:** Woordenlijst conform NL-SBB/SKOS met termen, definities, synoniemen en vocabulairebron. Begrippen worden automatisch gemarkeerd in teksten door de GlossaryHighlighter (tooltips).

**Demo-actie:** Zoek een begrip en laat de tooltip zien op een andere pagina.

---

## 14. Kaart (1 min)

**Link:** [http://localhost:3000/kaart/nederland](http://localhost:3000/kaart/nederland)

**Toelichting:** Interactieve kaart van Nederland met gemeenten. Applicatielandschap per regio.

**Vereist:** Ingelogd.

---

## 15. REST API & Documentatie (2 min)

**Link:** [http://localhost:3000/api/v1/docs](http://localhost:3000/api/v1/docs)

**Toelichting:** Volledige REST API (OpenAPI 3.0) met endpoints voor gemeenten, leveranciers, pakketten, standaarden, referentiecomponenten en begrippen. Paginatie, zoeken, en include-parameters.

**Demo-actie:** Toon de Swagger UI en voer een voorbeeld-request uit.

---

## 16. Admin beheer (5 min)

**Link:** [http://localhost:3000/admin](http://localhost:3000/admin)

**Toelichting:** Beheerdashboard met:

| Functie | Link | Omschrijving |
|---------|------|-------------|
| Gebruikersbeheer | [/admin/gebruikers](/admin/gebruikers) | Overzicht, rollen wijzigen |
| Registraties | [/admin/registraties](/admin/registraties) | Nieuwe registraties goedkeuren/afwijzen |
| Data importeren | [/upload](/upload) | CSV, JSON, Excel import |
| Gemeenten samenvoegen | [/admin/gemeenten/samenvoegen](/admin/gemeenten/samenvoegen) | Herindelingen verwerken |
| Audit log | [/admin/auditlog](/admin/auditlog) | Alle mutaties bijhouden |
| Statistieken | [/admin/statistieken](/admin/statistieken) | Platform statistieken |
| PvE-analyse | [/admin/pve-analyse](/admin/pve-analyse) | 104 eisen/wensen, 64% gerealiseerd |
| Datamodel | [/admin/datamodel](/admin/datamodel) | MIM 1.2 informatiemodel |
| Datamigratie | [/admin/migratie](/admin/migratie) | Mapping van Drupal CSV naar Prisma |
| Regeneratie-prompt | [/admin/prompt](/admin/prompt) | AI-prompt voor volledige herbouw |

**Demo-actie:** Laat de PvE-analyse zien (realisatiegraad) en het datamodel.

**Vereist:** Ingelogd als ADMIN.

---

## Tips voor de demo

- **Inloggen vóór de demo** — veel features zijn alleen zichtbaar voor ingelogde gebruikers
- **Begin met de homepage** — laat de structuur zien voordat je inzoomt
- **AI-adviseur als hoogtepunt** — bewaar dit voor het midden/einde van de demo
- **Vergelijkingstool** — visueel aantrekkelijk, goed voor discussie
- **PvE-analyse** — toont de volwassenheid van het platform (64% gerealiseerd)
