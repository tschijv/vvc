const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat,
  HeadingLevel, BorderStyle, WidthType, ShadingType,
  PageNumber, PageBreak,
} = require("docx");

const VNG_BLUE = "1a6ca8";
const DARK = "1a1a1a";
const GRAY = "666666";
const WHITE = "FFFFFF";
const LIGHT_GRAY = "F5F5F5";
const LIGHT_BLUE = "E8F0F8";
const LIGHT_GREEN = "F0FDF4";
const GREEN = "166534";
const LIGHT_RED = "FEF2F2";
const RED = "991B1B";
const ORANGE_BG = "FFF7ED";
const ORANGE = "9A3412";

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text, font: "Arial", bold: true, size: 32, color: VNG_BLUE })] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 }, children: [new TextRun({ text, font: "Arial", bold: true, size: 26, color: DARK })] });
}
function h3(text) {
  return new Paragraph({ spacing: { before: 160, after: 80 }, children: [new TextRun({ text, font: "Arial", bold: true, size: 22, color: DARK })] });
}
function p(text, opts = {}) {
  return new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text, font: "Arial", size: 20, color: DARK, ...opts })] });
}
function pbold(text) { return p(text, { bold: true }); }
function pitalic(text) { return p(text, { italics: true, color: GRAY }); }

function bullet(text, ref = "bullets") {
  return new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text, font: "Arial", size: 20, color: DARK })] });
}
function numberedItem(text, ref = "numbers") {
  return new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text, font: "Arial", size: 20, color: DARK })] });
}

function makeHeaderCell(text, width) {
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA },
    shading: { fill: VNG_BLUE, type: ShadingType.CLEAR },
    margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text, font: "Arial", size: 18, bold: true, color: WHITE })] })],
  });
}
function makeCell(text, width, opts = {}) {
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA },
    shading: opts.bg ? { fill: opts.bg, type: ShadingType.CLEAR } : undefined,
    margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text: String(text), font: "Arial", size: 18, color: opts.color || DARK, bold: opts.bold })] })],
  });
}

function makeTable(headers, rows, colWidths) {
  const totalWidth = colWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({ children: headers.map((h, i) => makeHeaderCell(h, colWidths[i])) }),
      ...rows.map((row, ri) => new TableRow({
        children: row.map((cell, ci) => {
          if (typeof cell === "object" && cell !== null && cell.text !== undefined) return makeCell(cell.text, colWidths[ci], cell);
          return makeCell(cell, colWidths[ci], { bg: ri % 2 === 1 ? LIGHT_GRAY : undefined });
        }),
      })),
    ],
  });
}

function spacer(size = 200) {
  return new Paragraph({ spacing: { before: size } });
}

function warningBox(text) {
  return new Paragraph({
    spacing: { before: 120, after: 120 },
    border: { left: { style: BorderStyle.SINGLE, size: 12, color: "DC2626", space: 8 } },
    indent: { left: 200 },
    children: [new TextRun({ text, font: "Arial", size: 20, color: RED, bold: true })],
  });
}

function noteBox(text) {
  return new Paragraph({
    spacing: { before: 120, after: 120 },
    border: { left: { style: BorderStyle.SINGLE, size: 12, color: VNG_BLUE, space: 8 } },
    indent: { left: 200 },
    children: [new TextRun({ text, font: "Arial", size: 20, color: VNG_BLUE })],
  });
}

async function generate() {
  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Arial", size: 20 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 32, bold: true, font: "Arial", color: VNG_BLUE },
          paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 26, bold: true, font: "Arial", color: DARK },
          paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
      ],
    },
    numbering: {
      config: [
        { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
        { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
        { reference: "numbers2", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
        { reference: "numbers3", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      ],
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({ children: [new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: VNG_BLUE, space: 4 } },
          children: [new TextRun({ text: "Plan van Aanpak \u2014 VNG Voorzieningencatalogus \u2014 Vertrouwelijk", font: "Arial", size: 16, color: GRAY })],
        })] }),
      },
      footers: {
        default: new Footer({ children: [new Paragraph({
          border: { top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC", space: 4 } },
          children: [
            new TextRun({ text: "ArchiXL \u2014 VNG Voorzieningencatalogus", font: "Arial", size: 16, color: GRAY }),
            new TextRun({ text: "\tPagina ", font: "Arial", size: 16, color: GRAY }),
            new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: GRAY }),
          ],
        })] }),
      },
      children: [
        // ── Titelpagina ──
        spacer(2000),
        new Paragraph({ children: [new TextRun({ text: "Plan van Aanpak", font: "Arial", bold: true, size: 48, color: VNG_BLUE })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "VNG Voorzieningencatalogus", font: "Arial", size: 28, color: GRAY })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "Van demonstratie naar verantwoorde productie", font: "Arial", size: 22, color: GRAY, italics: true })] }),
        spacer(400),
        makeTable(["", ""], [
          ["Opdrachtgever", "VNG (Vereniging van Nederlandse Gemeenten)"],
          ["Opdrachtnemer", "ArchiXL"],
          ["Datum", "19 maart 2026"],
          ["Versie", "1.0"],
          ["Status", "Concept"],
          ["Classificatie", "Vertrouwelijk"],
        ], [2500, 6526]),

        // ── 1. Projectdefinitie ──
        new Paragraph({ children: [new PageBreak()] }),
        h1("1. Projectdefinitie"),

        h2("1.1 Projectnaam"),
        p("Voorzieningencatalogus Vernieuwing (VVC) \u2014 Van demonstratie naar productie"),

        h2("1.2 Projectdoel"),
        p("Het doorontwikkelen van het huidige demonstratieplatform van de VNG Voorzieningencatalogus naar een productierijp, veilig, compliance-conform en beheerbaar systeem dat de bestaande Drupal-gebaseerde Softwarecatalogus vervangt en alle 342+ Nederlandse gemeenten bedient."),

        h2("1.3 Scope"),
        pbold("Binnen scope:"),
        bullet("Security hardening (MFA, wachtwoordbeleid, input sanitization, CSP)"),
        bullet("Kwaliteitsborging (CI/CD, OTAP, testsuite >70% coverage, code review)"),
        bullet("Compliance (BIO-toetsing, DPIA, WCAG 2.1 AA audit, penetratietest)"),
        bullet("Infrastructuur (SLA-waardige hosting, backup/restore, monitoring, alerting)"),
        bullet("Autorisatie (SSO via SAML/OIDC, rollen en rechten per gemeente)"),
        bullet("Datamigratie vanuit huidige Drupal Softwarecatalogus"),
        bullet("Pilotfase met 10\u201320 gemeenten"),
        bullet("Brede uitrol naar alle gemeenten"),
        bullet("Technische en functionele documentatie"),
        bullet("Overdracht naar VNG-beheerteam"),
        spacer(80),
        pbold("Buiten scope:"),
        bullet("Ontwikkeling van geheel nieuwe functionaliteit (tenzij in separate change requests)"),
        bullet("Migratie naar NL Design System (separaat traject na productie)"),
        bullet("Koppeling met externe systemen anders dan GEMMA Online en SKOSMOS"),
        bullet("Training van eindgebruikers (verantwoordelijkheid VNG)"),

        h2("1.4 Uitgangspunten"),
        bullet("Het huidige demonstratieplatform vormt de technische basis"),
        bullet("De bestaande architectuur (Next.js, Prisma, PostgreSQL) wordt behouden"),
        bullet("AI-gestuurde ontwikkeling wordt ingezet waar verantwoord, met menselijke review"),
        bullet("Elke fase sluit af met een formele go/no-go beslissing"),
        bullet("Alle code wordt beoordeeld door een onafhankelijke reviewer v\u00F3\u00F3r productie"),

        h2("1.5 Randvoorwaarden"),
        bullet("VNG stelt een productowner beschikbaar (minimaal 2 dagen/week)"),
        bullet("VNG initieert BIO-toetsing en DPIA parallel aan fase 1"),
        bullet("Toegang tot de huidige Drupal-database voor datamigratie"),
        bullet("Beschikbaarheid van 10\u201320 pilotgemeenten voor de pilotfase"),
        bullet("Budget is goedgekeurd conform het adviesdocument v3"),

        // ── 2. Fasering ──
        new Paragraph({ children: [new PageBreak()] }),
        h1("2. Fasering en mijlpalen"),

        p("Het project is opgedeeld in 6 fasen met formele go/no-go momenten na elke fase. Geen fase start zonder goedkeuring van de vorige."),

        makeTable(["Fase", "Naam", "Doorlooptijd", "Start", "Einde"], [
          [{ text: "0", bold: true }, "Projectstart en planning", "1 week", "Week 1", "Week 1"],
          [{ text: "1", bold: true }, "Security hardening (P1)", "2\u20134 weken", "Week 2", "Week 5"],
          [{ text: "2", bold: true }, "Kwaliteitsborging (P2)", "4\u20138 weken", "Week 4", "Week 12"],
          [{ text: "3", bold: true }, "Compliance en audits", "8\u201312 weken", "Week 2", "Week 14"],
          [{ text: "4", bold: true }, "Productieniveau (P3)", "6\u201310 weken", "Week 12", "Week 22"],
          [{ text: "5", bold: true }, "Pilot", "4\u20138 weken", "Week 22", "Week 30"],
          [{ text: "6", bold: true }, "Brede uitrol", "4\u20138 weken", "Week 30", "Week 38"],
        ], [600, 2800, 1800, 1400, 1400]),

        pitalic("Fase 1, 2 en 3 lopen deels parallel. Totale doorlooptijd: 8\u201310 maanden."),

        h2("2.1 Fase 0: Projectstart (week 1)"),
        pbold("Doel: Projectorganisatie inrichten en planning vaststellen"),
        pbold("Deliverables:"),
        bullet("Getekend Plan van Aanpak"),
        bullet("Ingericht projectoverleg (wekelijks stand-up, tweewekelijks stuurgroep)"),
        bullet("Toegang tot alle benodigde systemen en omgevingen"),
        bullet("Backlog in projectmanagementtool (Jira/Linear)"),
        pbold("Go/no-go criteria:"),
        bullet("PvA goedgekeurd door stuurgroep"),
        bullet("Productowner VNG benoemd en beschikbaar"),

        h2("2.2 Fase 1: Security hardening (week 2\u20135)"),
        pbold("Doel: Het platform beveiligen tot een acceptabel minimumniveau"),
        pbold("Deliverables:"),
        bullet("Multi-factor authenticatie (TOTP) operationeel"),
        bullet("Wachtwoordbeleid afgedwongen (min. 12 tekens, complexiteit, hergebruikcontrole)"),
        bullet("Input sanitization op alle formulieren (DOMPurify)"),
        bullet("Content Security Policy headers geactiveerd"),
        bullet("AI-adviseur output gesanitized (XSS-bescherming)"),
        bullet("Rate limiting persistent (Redis of database-backed)"),
        bullet("Geautomatiseerde dagelijkse backups met geteste restore-procedure"),
        bullet("Security-review rapport"),
        pbold("Go/no-go criteria:"),
        bullet("Alle P1-items uit het advies v3 zijn gerealiseerd en getest"),
        bullet("Security-review rapport goedgekeurd"),
        bullet("Restore-procedure succesvol getest"),

        h2("2.3 Fase 2: Kwaliteitsborging (week 4\u201312)"),
        pbold("Doel: Ontwikkelproces professionaliseren en testdekking waarborgen"),
        pbold("Deliverables:"),
        bullet("CI/CD-pipeline operationeel (build, lint, typecheck, test op elke commit)"),
        bullet("Staging-omgeving (OTAP) ingericht en operationeel"),
        bullet("Testsuite: unit tests (>50% coverage), integratie tests, E2E tests (>70% coverage totaal)"),
        bullet("@ts-nocheck verwijderd uit alle bestanden"),
        bullet("Code review door onafhankelijke reviewer"),
        bullet("Monitoring en alerting operationeel (Sentry + Datadog of equivalent)"),
        bullet("Performance baseline vastgesteld (load testing met 342+ gemeenten)"),
        bullet("Database migraties ingevoerd (versiebeheerd, geen db push)"),
        pbold("Go/no-go criteria:"),
        bullet("CI/CD-pipeline draait succesvol op elke merge naar main"),
        bullet("Testdekking >70% bevestigd"),
        bullet("Load test geslaagd voor 500+ gelijktijdige gebruikers"),
        bullet("Onafhankelijke code review rapport beschikbaar"),

        new Paragraph({ children: [new PageBreak()] }),
        h2("2.4 Fase 3: Compliance en audits (week 2\u201314)"),
        noteBox("Deze fase loopt parallel aan fase 1 en 2. Externe audits hebben een lange doorlooptijd en moeten zo vroeg mogelijk worden gestart."),
        pbold("Doel: Voldoen aan alle wettelijke en beleidsmatige eisen"),
        pbold("Deliverables:"),
        bullet("BIO-toetsing afgerond (door externe partij, gecoordineerd door VNG)"),
        bullet("DPIA afgerond en goedgekeurd door FG"),
        bullet("AVG-verwerkingsregister opgesteld"),
        bullet("Cookie-banner en privacyverklaring operationeel"),
        bullet("WCAG 2.1 AA audit afgerond (door externe partij)"),
        bullet("WCAG-bevindingen opgelost (minimaal alle A en AA)"),
        bullet("Penetratietest uitgevoerd (door gecertificeerde partij)"),
        bullet("Penetratietest-bevindingen opgelost (alle hoog en kritiek)"),
        bullet("Toegankelijkheidsverklaring gepubliceerd"),
        pbold("Go/no-go criteria:"),
        bullet("BIO-toetsing: geen blokkerende bevindingen"),
        bullet("Penetratietest: geen hoog/kritieke bevindingen open"),
        bullet("WCAG: alle A en AA criteria voldaan"),
        bullet("DPIA goedgekeurd"),

        h2("2.5 Fase 4: Productieniveau (week 12\u201322)"),
        pbold("Doel: Platform gereedmaken voor gebruik door alle gemeenten"),
        pbold("Deliverables:"),
        bullet("SSO-integratie (SAML/OIDC) met minimaal 2 gemeentelijke identity providers"),
        bullet("Fijnmazige autorisatie (gemeente beheert alleen eigen data)"),
        bullet("SLA-waardige hosting operationeel (Azure/AWS, 99,5% beschikbaarheid)"),
        bullet("Disaster recovery plan met geteste failover"),
        bullet("Datamigratie vanuit Drupal uitgevoerd en gevalideerd"),
        bullet("NL Design System tokens ge\u00EFntegreerd (kleuren, fonts)"),
        bullet("Technische handleiding bijgewerkt"),
        bullet("Functionele handleiding voor eindgebruikers"),
        bullet("Runbook voor beheerdersoperaties"),
        pbold("Go/no-go criteria:"),
        bullet("SSO werkt met minimaal 2 pilotgemeenten"),
        bullet("Datamigratie gevalideerd (nul dataverlies)"),
        bullet("Hosting SLA contractueel vastgelegd"),
        bullet("DR-failover succesvol getest"),

        h2("2.6 Fase 5: Pilot (week 22\u201330)"),
        pbold("Doel: Gecontroleerde uitrol bij een beperkte groep gemeenten"),
        pbold("Deliverables:"),
        bullet("10\u201320 pilotgemeenten actief op het nieuwe platform"),
        bullet("Feedbackrapport met bevindingen en verbeterpunten"),
        bullet("Alle blokkerend bevindingen opgelost"),
        bullet("Gebruikerstevredenheidsonderzoek uitgevoerd"),
        bullet("Beheerprocessen getest (incident, change, release)"),
        pbold("Go/no-go criteria:"),
        bullet("Geen blokkerende bevindingen open"),
        bullet("Gebruikerstevredenheid minimaal 7/10"),
        bullet("Beheerteam operationeel en zelfstandig"),
        bullet("Stuurgroep akkoord op brede uitrol"),

        h2("2.7 Fase 6: Brede uitrol (week 30\u201338)"),
        pbold("Doel: Alle gemeenten migreren naar het nieuwe platform"),
        pbold("Deliverables:"),
        bullet("Alle 342+ gemeenten gemigreerd en actief"),
        bullet("Oude Drupal-systeem uitgefaseerd"),
        bullet("Servicedesk operationeel"),
        bullet("Projectafsluiting en overdracht aan beheer"),
        bullet("Eindrapport met lessons learned"),

        // ── 3. Rollen ──
        new Paragraph({ children: [new PageBreak()] }),
        h1("3. Rollen en verantwoordelijkheden"),

        makeTable(["Rol", "Partij", "Verantwoordelijkheden"], [
          [{ text: "Opdrachtgever", bold: true }, "VNG", "Besluitvorming, budget, prioritering, go/no-go besluiten"],
          [{ text: "Productowner", bold: true }, "VNG", "Functionele requirements, backlog-prioritering, acceptatietesten, 2 dagen/week"],
          [{ text: "Stuurgroep", bold: true }, "VNG + ArchiXL", "Tweewekelijkse voortgangsbespreking, escalaties, go/no-go besluiten per fase"],
          [{ text: "Lead developer", bold: true }, "ArchiXL", "Architectuur, ontwikkeling, AI-sturing, technische keuzes, code reviews"],
          [{ text: "Onafhankelijk reviewer", bold: true }, "Extern", "Code review, architectuurtoetsing, kwaliteitsbewaking"],
          [{ text: "Security auditor", bold: true }, "Extern", "Penetratietest, BIO-toetsing"],
          [{ text: "WCAG auditor", bold: true }, "Extern", "Toegankelijkheidstoets WCAG 2.1 AA"],
          [{ text: "Privacy officer", bold: true }, "VNG (FG)", "DPIA-beoordeling, AVG-toezicht"],
          [{ text: "Beheerteam", bold: true }, "VNG", "Technisch en functioneel beheer na oplevering (min. 2\u20133 personen)"],
        ], [2200, 1500, 5326]),

        // ── 4. Risicoregister ──
        h1("4. Risicoregister"),
        p("Onderstaande risico\u2019s zijn specifiek voor het vervolgtraject (niet het demonstratieplatform)."),

        makeTable(["#", "Risico", "Impact", "Kans", "Mitigatie", "Eigenaar"], [
          ["R1", "BIO-toetsing levert blokkerende bevindingen op", { text: "Hoog", color: RED, bg: LIGHT_RED }, "Medium", "Vroegtijdig starten (fase 3 parallel), tussentijdse self-assessment", "VNG"],
          ["R2", "Penetratietest onthult kritieke kwetsbaarheden", { text: "Hoog", color: RED, bg: LIGHT_RED }, "Medium", "Security hardening in fase 1, pre-scan met OWASP tools", "ArchiXL"],
          ["R3", "Datamigratie uit Drupal is complexer dan verwacht", "Medium", "Medium", "Vroegtijdig migratieproef op subset, rollback-strategie", "ArchiXL"],
          ["R4", "Pilotgemeenten niet beschikbaar of niet betrokken", "Medium", { text: "Hoog", color: RED, bg: LIGHT_RED }, "Vroegtijdig werven, incentives, minimaal 15 aanmelden", "VNG"],
          ["R5", "SSO-integratie met gemeentelijke IdP\u2019s vertraagd", "Medium", "Medium", "Vroegtijdig afstemmen met 2 pilot-IdP\u2019s, fallback: lokale accounts", "ArchiXL"],
          ["R6", "WCAG-audit levert veel bevindingen op", "Laag", { text: "Hoog", color: RED, bg: LIGHT_RED }, "NL Design System componenten, vroegtijdige self-assessment", "ArchiXL"],
          ["R7", "Afhankelijkheid van \u00e9\u00e9n ontwikkelaar (ArchiXL)", { text: "Hoog", color: RED, bg: LIGHT_RED }, "Medium", "Documentatie, code reviews, kennisoverdracht aan VNG-team", "ArchiXL + VNG"],
          ["R8", "Vertraging externe audits (BIO, pentest, WCAG)", "Medium", { text: "Hoog", color: RED, bg: LIGHT_RED }, "Vroegtijdig contracteren, parallel plannen", "VNG"],
          ["R9", "Anthropic API wijzigt of wordt duurder", "Laag", "Laag", "Abstractielaag, fallback zonder AI, budget reserveren", "ArchiXL"],
          ["R10", "Scope creep door stakeholder-wensen", "Medium", { text: "Hoog", color: RED, bg: LIGHT_RED }, "Strict change request proces, backlog-discipline", "VNG PO"],
        ], [400, 2000, 800, 800, 2826, 1200]),

        // ── 5. Kwaliteitsborging ──
        new Paragraph({ children: [new PageBreak()] }),
        h1("5. Kwaliteitsborging"),

        h2("5.1 Testplan"),
        makeTable(["Testsoort", "Verantwoordelijk", "Fase", "Dekking / criterium"], [
          ["Unit tests", "ArchiXL", "Fase 2", ">50% line coverage"],
          ["Integratie tests", "ArchiXL", "Fase 2", "Alle API endpoints, database operaties"],
          ["E2E tests (Playwright)", "ArchiXL", "Fase 2", ">70% feature coverage, 50+ tests"],
          ["Load tests", "ArchiXL", "Fase 2", "500+ gelijktijdige gebruikers, <2s response time"],
          ["Security tests", "Extern", "Fase 3", "OWASP Top 10, geen hoog/kritiek open"],
          ["WCAG audit", "Extern", "Fase 3", "WCAG 2.1 AA, alle A+AA criteria"],
          ["BIO-toetsing", "Extern + VNG", "Fase 3", "Geen blokkerende bevindingen"],
          ["Acceptatietesten", "VNG (PO)", "Fase 4\u20135", "Alle user stories geaccepteerd"],
          ["Regressietesten", "CI/CD (automatisch)", "Doorlopend", "Alle tests slagen bij elke merge"],
        ], [2000, 1800, 1200, 4026]),

        h2("5.2 Code review"),
        p("Alle code wordt beoordeeld op drie niveaus:"),
        numberedItem("AI-gegenereerde code wordt beoordeeld door de lead developer v\u00F3\u00F3r commit", "numbers2"),
        numberedItem("Alle commits worden automatisch gecontroleerd door CI/CD (lint, typecheck, tests)", "numbers2"),
        numberedItem("V\u00F3\u00F3r elke fase-oplevering vindt een onafhankelijke code review plaats", "numbers2"),

        h2("5.3 Acceptatiecriteria per fase"),
        p("Elke fase eindigt met een formeel acceptatiemoment. De productowner (VNG) tekent af op basis van vooraf gedefinieerde acceptatiecriteria. Geen fase wordt als afgerond beschouwd zonder getekende acceptatie."),

        // ── 6. Communicatieplan ──
        h1("6. Communicatieplan"),
        makeTable(["Overleg", "Frequentie", "Deelnemers", "Doel"], [
          ["Stand-up", "Wekelijks (30 min)", "ArchiXL + VNG PO", "Voortgang, blokkades, prioriteiten"],
          ["Stuurgroep", "Tweewekelijks (60 min)", "ArchiXL + VNG management", "Voortgang, risico\u2019s, besluiten"],
          ["Sprint review", "Elke 2 weken", "ArchiXL + VNG PO + stakeholders", "Demo van opgeleverde functionaliteit"],
          ["Fase-afsluiting", "Per fase", "Stuurgroep", "Go/no-go besluit, acceptatie"],
          ["Pilotfeedback", "Wekelijks (fase 5)", "Pilotgemeenten + VNG + ArchiXL", "Bevindingen, verbeterpunten"],
        ], [1800, 2000, 2600, 2626]),

        // ── 7. Kostenraming ──
        new Paragraph({ children: [new PageBreak()] }),
        h1("7. Kostenraming per fase"),

        makeTable(["Fase", "ArchiXL", "VNG / Extern", "Totaal"], [
          ["Fase 0: Projectstart", "\u20AC 2.000 \u2013 5.000", "\u2014", "\u20AC 2.000 \u2013 5.000"],
          ["Fase 1: Security hardening", "\u20AC 10.000 \u2013 20.000", "\u2014", "\u20AC 10.000 \u2013 20.000"],
          ["Fase 2: Kwaliteitsborging", "\u20AC 25.000 \u2013 45.000", "\u20AC 5.000 \u2013 10.000 (reviewer)", "\u20AC 30.000 \u2013 55.000"],
          ["Fase 3: Compliance", "\u20AC 10.000 \u2013 15.000 (WCAG-fixes)", "\u20AC 45.000 \u2013 75.000 (audits)", "\u20AC 55.000 \u2013 90.000"],
          ["Fase 4: Productieniveau", "\u20AC 30.000 \u2013 50.000", "\u2014", "\u20AC 30.000 \u2013 50.000"],
          ["Fase 5: Pilot", "\u20AC 5.000 \u2013 10.000", "\u20AC 5.000 \u2013 10.000 (support)", "\u20AC 10.000 \u2013 20.000"],
          ["Fase 6: Brede uitrol", "\u20AC 5.000 \u2013 10.000", "\u20AC 10.000 \u2013 15.000 (support)", "\u20AC 15.000 \u2013 25.000"],
          [{ text: "Totaal eenmalig", bold: true }, { text: "\u20AC 87.000 \u2013 155.000", bold: true }, { text: "\u20AC 65.000 \u2013 110.000", bold: true }, { text: "\u20AC 152.000 \u2013 265.000", bold: true }],
        ], [2500, 2500, 2526, 1500]),

        spacer(120),
        pbold("Structurele kosten na oplevering:"),
        makeTable(["Kostenpost", "Per jaar"], [
          ["Hosting (productie + OTAP + SLA)", "\u20AC 24.000 \u2013 48.000"],
          ["Technisch beheer (ArchiXL)", "\u20AC 48.000 \u2013 72.000"],
          ["Doorontwikkeling", "\u20AC 48.000 \u2013 72.000"],
          ["Monitoring en tooling", "\u20AC 6.000 \u2013 12.000"],
          ["Jaarlijkse penetratietest", "\u20AC 15.000 \u2013 25.000"],
          ["VNG: functioneel beheer en support", "\u20AC 60.000 \u2013 96.000"],
          [{ text: "Totaal structureel / jaar", bold: true }, { text: "\u20AC 201.000 \u2013 325.000", bold: true }],
        ], [5500, 3526]),

        pitalic("Alle bedragen zijn exclusief btw en indicatief. Een gedetailleerde begroting wordt opgesteld na vaststelling van dit PvA."),

        // ── 8. Afhankelijkheden ──
        h1("8. Afhankelijkheden en kritiek pad"),
        p("De volgende externe afhankelijkheden bepalen het kritieke pad van het project:"),

        makeTable(["Afhankelijkheid", "Fase", "Doorlooptijd", "Risico bij vertraging"], [
          ["BIO-toetsing (extern)", "3", "6\u201310 weken", "Go-live wordt geblokkeerd"],
          ["Penetratietest (extern)", "3", "4\u20136 weken", "Go-live wordt geblokkeerd"],
          ["WCAG-audit (extern)", "3", "4\u20136 weken", "Go-live wordt geblokkeerd"],
          ["Pilotgemeenten werving", "5", "4\u20136 weken", "Pilot kan niet starten"],
          ["SSO/IdP afstemming gemeenten", "4", "4\u20138 weken", "SSO niet beschikbaar bij pilot"],
          ["Drupal database export", "4", "1\u20132 weken", "Migratie kan niet starten"],
          ["VNG beheerteam formatie", "5\u20136", "8\u201312 weken", "Overdracht niet mogelijk"],
        ], [3000, 600, 1800, 3626]),

        spacer(120),
        warningBox("De drie externe audits (BIO, pentest, WCAG) hebben elk 4\u201310 weken doorlooptijd en moeten zo vroeg mogelijk worden gecontracteerd. Vertraging hier vertraagt het gehele project."),

        // ── 9. Projectafsluiting ──
        new Paragraph({ children: [new PageBreak()] }),
        h1("9. Projectafsluiting"),
        p("Het project wordt formeel afgesloten wanneer:"),
        numberedItem("Alle 342+ gemeenten zijn gemigreerd naar het nieuwe platform", "numbers3"),
        numberedItem("Het oude Drupal-systeem is uitgefaseerd", "numbers3"),
        numberedItem("Het beheerteam VNG is operationeel en zelfstandig", "numbers3"),
        numberedItem("Alle documentatie is overgedragen (technisch, functioneel, runbook)", "numbers3"),
        numberedItem("Het eindrapport met lessons learned is opgeleverd", "numbers3"),
        numberedItem("De stuurgroep heeft formeel decharge verleend", "numbers3"),

        spacer(200),
        h1("10. Bijlagen"),
        p("De volgende documenten zijn als bijlage bij dit PvA beschikbaar:"),
        bullet("Advies Voorzieningencatalogus v3.0 (ArchiXL, maart 2026)"),
        bullet("Tijdsinvestering AI vs Klassiek (ArchiXL, maart 2026)"),
        bullet("Demo Draaiboek (22 secties, beschikbaar in de applicatie)"),
        bullet("PvE-analyse (beschikbaar in de applicatie)"),
        bullet("Logisch Informatiemodel MIM 1.2 (beschikbaar in de applicatie)"),

        spacer(400),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\u2014 Einde document \u2014", font: "Arial", size: 18, color: GRAY, italics: true })] }),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync("/Users/toineschijvenaars/claude/vvc/docs/Plan van Aanpak VVC.docx", buffer);
  console.log("Document gegenereerd: docs/Plan van Aanpak VVC.docx");
}

generate().catch(console.error);
