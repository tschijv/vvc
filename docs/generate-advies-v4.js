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
const LIGHT_RED = "FEF2F2";
const RED = "991B1B";
const ORANGE_BG = "FFF7ED";
const ORANGE = "9A3412";

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

const TABLE_WIDTH = 9026; // A4 with 1" margins

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
    border: { left: { style: BorderStyle.SINGLE, size: 12, color: "F59E0B", space: 8 } },
    indent: { left: 200 },
    children: [new TextRun({ text, font: "Arial", size: 20, color: ORANGE })],
  });
}

function bullet(text, ref = "bullets") {
  return new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text, font: "Arial", size: 20, color: DARK })] });
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
    children: [new Paragraph({ children: [new TextRun({ text, font: "Arial", size: 18, color: opts.color || DARK, bold: opts.bold })] })],
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
          if (typeof cell === "object") return makeCell(cell.text, colWidths[ci], cell);
          return makeCell(cell, colWidths[ci], { bg: ri % 2 === 1 ? LIGHT_GRAY : undefined });
        }),
      })),
    ],
  });
}

function spacer(size = 200) {
  return new Paragraph({ spacing: { before: size } });
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
          children: [new TextRun({ text: "Advies Voorzieningencatalogus v4.0 \u2014 Vertrouwelijk", font: "Arial", size: 16, color: GRAY })],
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
        // ── Title page ──
        spacer(2000),
        new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: "Advies Voorzieningencatalogus", font: "Arial", bold: true, size: 48, color: VNG_BLUE })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "Van demonstratie naar verantwoorde productie", font: "Arial", size: 26, color: GRAY })] }),
        spacer(200),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "Versie 4.0 \u2014 Herzien na doorontwikkeling en GVC-extractie", font: "Arial", size: 22, color: GRAY, italics: true })] }),
        spacer(400),
        makeTable(["", ""], [
          ["Opdrachtgever", "VNG (Vereniging van Nederlandse Gemeenten)"],
          ["Auteur", "ArchiXL"],
          ["Datum", "25 maart 2026"],
          ["Versie", "4.1"],
          ["Status", "Definitief concept"],
          ["Classificatie", "Vertrouwelijk"],
        ], [2500, 6526]),

        // ── 1. Inleiding ──
        new Paragraph({ children: [new PageBreak()] }),
        h1("1. Inleiding"),
        h2("1.1 Aanleiding"),
        p("De huidige Voorzieningencatalogus draait op Drupal-technologie die end-of-life is. Een eerder doorlopen vervangingstraject heeft niet tot het gewenste resultaat geleid. ArchiXL heeft in opdracht van VNG een werkend prototype ontwikkeld dat inmiddels is doorontwikkeld tot een functioneel rijke applicatie."),
        p("Dit document beoordeelt de huidige staat van het platform met bijzondere aandacht voor de risico\u2019s, de resterende werkzaamheden en de randvoorwaarden voor verantwoorde inproductiename. Het schetst een realistisch beeld: het platform demonstreert veel, maar is nog niet productierijp."),

        h2("1.2 Positie van dit document"),
        warningBox("Dit is een advies bij een demonstratieversie, geen opleverdocument. Het platform is niet geschikt voor productiegebruik zonder de in dit document beschreven maatregelen."),
        p("Het platform is ontwikkeld als demonstratie van wat technisch mogelijk is. Het toont de beoogde functionaliteit en de haalbaarheid van de gekozen architectuur. Het is nadrukkelijk geen afgerond product. Voor inproductiename zijn substantiële investeringen nodig in beveiliging, testen, compliance en beheer."),

        h2("1.3 Over AI-gestuurde ontwikkeling"),
        p("Het platform is ontwikkeld met behulp van AI-gestuurde softwareontwikkeling. Dit verdient een eerlijke nuancering:"),
        pbold("Wat AI-gestuurde ontwikkeling wél biedt:"),
        bullet("Aanzienlijke versnelling van het ontwikkelproces"),
        bullet("Snel werkende prototypes die de beoogde functionaliteit demonstreren"),
        bullet("Brede functionaliteit in korte tijd"),
        spacer(80),
        pbold("Wat AI-gestuurde ontwikkeling niet biedt:"),
        bullet("Garantie op productiekwaliteit \u2014 gegenereerde code vereist review en hardening"),
        bullet("Vervanging van architectuurkennis \u2014 AI maakt wat je vraagt, niet wat je nodig hebt"),
        bullet("Automatische naleving van non-functionele eisen (security, privacy, schaalbaarheid, toegankelijkheid)"),
        bullet("Geautomatiseerde tests \u2014 deze moeten apart worden geschreven en onderhouden"),
        bullet("Compliance \u2014 BIO, AVG, WCAG vereisen menselijke beoordeling en externe audits"),
        spacer(80),
        noteBox("De snelheid van AI-ontwikkeling kan een vals gevoel van volwassenheid wekken. Een werkende demo is niet hetzelfde als een productierijp systeem. De afstand tussen demonstratie en verantwoorde productie is aanzienlijk."),

        // ── 2. Huidige staat ──
        new Paragraph({ children: [new PageBreak()] }),
        h1("2. Huidige staat van het platform"),
        p("Het platform bevat uitgebreide functionaliteit die de beoogde werking van de Voorzieningencatalogus demonstreert. Hieronder een samenvatting, gevolgd door een kritische analyse van wat er ontbreekt."),

        h2("2.1 Gerealiseerde functionaliteit (demonstratie)"),
        makeTable(["Categorie", "Onderdelen", "Aantal"], [
          ["Datacatalogi", "Pakketten, Pakketversies, Leveranciers, Gemeenten, Standaarden, Referentiecomponenten, Begrippen, Addenda, Applicatiefuncties", "9"],
          ["Analyse", "Dashboard (KPI\u2019s), AI-adviseur, Compliancy Monitor, Inkoopondersteuning, Gemeenten vergelijken (tot 4), Vergelijkbare gemeenten (Jaccard)", "6"],
          ["Technisch", "REST API (OpenAPI 3.0), Linked Data (JSON-LD/Turtle/RDF/XML), RSS/Atom, Fuzzy zoeken, Content negotiation", "5"],
          ["Beheer", "Admin panel (15+ secties), GEMMA-sync, Begrippen-sync (SKOSMOS), Data-import, Anonimisatie, Deploy", "6"],
          ["UX", "Dark mode, Favorieten, Notificaties, QR-codes, Print styles, Share, Breadcrumbs, Loading skeletons, Keyboard shortcuts", "9"],
          ["Documentatie", "Demo draaiboek (23 secties), PvE-analyse (29 extra features), Datamodel (MIM), Handleidingen, Regeneratie-prompt", "5"],
          ["Marktanalyse", "Marktverdeling (scatterplot leveranciers), inline bewerken gemeente contactgegevens, npm-health panel", "3"],
        ], [1800, 5426, 800]),
        spacer(80),
        pitalic("Totaal: 90+ routes, 30 datamodellen, 26 Playwright tests, 15+ API endpoints, 29 extra features buiten PvE."),

        h2("2.2 Kritische tekortkomingen"),
        warningBox("Onderstaande tekortkomingen verhinderen verantwoorde inproductiename. Ze zijn niet cosmetisch maar fundamenteel."),

        h3("Beveiliging"),
        bullet("Rate limiting is aanwezig maar in-memory \u2014 bij herstart verloren, bij meerdere instances niet gedeeld"),
        bullet("Geen multi-factor authenticatie (MFA) \u2014 verplicht voor overheidssystemen"),
        bullet("Geen wachtwoordbeleid afgedwongen (minimale lengte, complexiteit, hergebruikcontrole)"),
        bullet("Geen CSRF-bescherming op formulieren"),
        bullet("dangerouslySetInnerHTML bij AI-adviseur output \u2014 XSS-risico als Claude-output wordt gemanipuleerd"),
        bullet("Geen Content Security Policy (CSP) headers"),
        bullet("API-sleutels (Anthropic) staan in environment variables zonder rotatiemechanisme"),
        bullet("@ts-nocheck volledig verwijderd \u2014 alle type-errors opgelost, bestanden gesplitst naar <300 regels"),

        h3("Testen en kwaliteitsborging"),
        bullet("26 E2E tests (Playwright) dekken alleen happy paths \u2014 geen edge cases, geen negatieve tests"),
        bullet("264 unit tests (Vitest) voor pure functies \u2014 maar geen coverage op services/database-laag"),
        bullet("Geen integratie tests \u2014 database-interacties zijn niet getest"),
        bullet("Geen load testing \u2014 onbekend of het systeem 342 gemeenten gelijktijdig aankan"),
        bullet("WCAG-audit uitgevoerd (axe-core: 0 violations) \u2014 maar geen externe audit door gecertificeerde partij"),
        bullet("Geen code review door onafhankelijke partij"),

        h3("Infrastructuur en beheer"),
        bullet("Geen CI/CD-pipeline \u2014 deployment is handmatig via CLI"),
        bullet("Geen staging-omgeving (OTAP) \u2014 wijzigingen gaan direct naar productie"),
        bullet("Geen monitoring of alerting (geen Sentry, Datadog of equivalent)"),
        bullet("Vercel als hosting \u2014 geen SLA-garantie, beperkte controle over infrastructuur"),
        bullet("Database schema wijzigingen via db push, niet via versiebeheerde migraties"),
        bullet("Geen backup-strategie met geteste restore-procedure"),
        bullet("Geen disaster recovery plan (RPO/RTO ongedefinieerd)"),

        h3("Compliance en governance"),
        bullet("Geen BIO-toetsing (Baseline Informatiebeveiliging Overheid) \u2014 verplicht"),
        bullet("Geen AVG/GDPR-verwerkingsregister"),
        bullet("Geen Data Protection Impact Assessment (DPIA)"),
        bullet("Geen cookie-banner of privacyverklaring"),
        bullet("Geen penetratietest door gecertificeerde partij"),
        bullet("Geen Archiefwet-compliance voor logging en audit trails"),
        bullet("Persoonsgegevens van gemeentecontactpersonen zijn geanonimiseerd \u2014 maar het anonimisatieproces is niet gevalideerd"),

        h3("Architectuur en code"),
        bullet("Sommige fouten worden stilletjes genegeerd (.catch(() => {})) \u2014 problemen zijn onzichtbaar"),
        bullet("Begrippen-cache is in-memory \u2014 bij schaling naar meerdere instances niet gedeeld"),
        bullet("Notificaties en favorieten missen validatie en autorisatiecontroles op entity-niveau"),
        bullet("QR-codes worden gegenereerd via externe API (qrserver.com) \u2014 overwegen om lokaal te genereren"),
        bullet("Zod-validatie op 10 API routes ge\u00efmplementeerd \u2014 maar nog niet op alle formulieren"),

        // ── 3. Risicoanalyse ──
        new Paragraph({ children: [new PageBreak()] }),
        h1("3. Risicoanalyse"),
        p("Onderstaande tabel beschrijft de belangrijkste risico\u2019s bij inproductiename van het huidige platform zonder verdere maatregelen."),

        makeTable(["#", "Risico", "Impact", "Kans", "Mitigatie"], [
          [{ text: "R1", bold: true }, "Datalek persoonsgegevens door ontbrekende MFA en zwak wachtwoordbeleid", { text: "Hoog", color: RED, bold: true, bg: LIGHT_RED }, { text: "Hoog", color: RED, bold: true, bg: LIGHT_RED }, "MFA implementeren, wachtwoordbeleid afdwingen"],
          [{ text: "R2", bold: true }, "XSS-aanval via AI-adviseur output (dangerouslySetInnerHTML)", { text: "Hoog", color: RED, bold: true, bg: LIGHT_RED }, "Medium", "DOMPurify toepassen op alle HTML-output"],
          [{ text: "R3", bold: true }, "Systeem onbereikbaar bij Vercel-storing (geen SLA)", { text: "Hoog", color: RED, bold: true, bg: LIGHT_RED }, "Laag", "Migratie naar Azure/AWS met SLA"],
          [{ text: "R4", bold: true }, "Dataverlies door ontbreken backup/restore", { text: "Hoog", color: RED, bold: true, bg: LIGHT_RED }, "Medium", "Geautomatiseerde backups met geteste restore"],
          [{ text: "R5", bold: true }, "Niet-compliance met BIO/AVG bij audit", { text: "Hoog", color: RED, bold: true, bg: LIGHT_RED }, { text: "Hoog", color: RED, bold: true, bg: LIGHT_RED }, "BIO-toetsing, DPIA, verwerkingsregister"],
          [{ text: "R6", bold: true }, "WCAG-overtreding (wettelijke verplichting)", "Medium", "Laag", "Basis ge\u00efmplementeerd (axe-core 0 violations). Externe audit nog nodig"],
          [{ text: "R7", bold: true }, "Regressie door ontbreken tests bij doorontwikkeling", "Medium", "Medium", "264 unit tests + 26 E2E tests. Coverage services-laag nog onvoldoende"],
          [{ text: "R8", bold: true }, "Performance-problemen bij 342 gemeenten gelijktijdig", "Medium", "Medium", "Load testing uitvoeren"],
          [{ text: "R9", bold: true }, "Vendor lock-in op Vercel en Neon (PostgreSQL)", "Medium", "Laag", "Exit-strategie documenteren"],
          [{ text: "R10", bold: true }, "Afhankelijkheid van Anthropic API voor AI-adviseur", "Laag", "Medium", "Fallback-mechanisme zonder AI"],
        ], [400, 3200, 1000, 1000, 3426]),

        // ── 4. Benodigde inspanning ──
        new Paragraph({ children: [new PageBreak()] }),
        h1("4. Benodigde inspanning voor productie"),
        p("De onderstaande tabel categoriseert alle werkzaamheden die nodig zijn om het platform van demonstratie naar verantwoorde productie te brengen. De lijst is bewust uitgebreid \u2014 het weglaten van items introduceert risico."),

        makeTable(["Prio", "Onderdeel", "Toelichting", "Risico bij weglaten"], [
          [{ text: "P1", bold: true, bg: LIGHT_RED }, "MFA-ondersteuning", "TOTP of WebAuthn", "R1: Datalek"],
          [{ text: "P1", bold: true, bg: LIGHT_RED }, "Wachtwoordbeleid", "Lengte, complexiteit, hergebruik", "R1: Datalek"],
          [{ text: "P1", bold: true, bg: LIGHT_RED }, "Input sanitization + CSP", "DOMPurify, Content-Security-Policy headers", "R2: XSS"],
          [{ text: "P1", bold: true, bg: LIGHT_RED }, "Backup en restore", "Dagelijks, geteste restore-procedure", "R4: Dataverlies"],
          [{ text: "P1", bold: true, bg: LIGHT_RED }, "BIO-toetsing", "Extern, verplicht voor overheid", "R5: Non-compliance"],
          [{ text: "P1", bold: true, bg: LIGHT_RED }, "AVG/DPIA", "Verwerkingsregister, cookie-banner", "R5: Non-compliance"],
          [{ text: "P2", bold: true, bg: ORANGE_BG }, "CI/CD-pipeline", "Geautomatiseerd: build, lint, test, deploy", "R7: Regressie"],
          [{ text: "P2", bold: true, bg: ORANGE_BG }, "Staging-omgeving (OTAP)", "Testen voor productie-deployment", "R7: Regressie"],
          [{ text: "P2", bold: true, bg: ORANGE_BG }, "Testsuite uitbreiden", "Unit + integratie + E2E, >70% coverage", "R7: Regressie"],
          [{ text: "P2", bold: true, bg: ORANGE_BG }, "WCAG-audit (extern)", "Wettelijk verplicht, WCAG 2.1 AA. Basis ge\u00efmplementeerd: kleurcontrast, ARIA labels, focus indicators, scope headers", "R6: Wettelijk risico (deels gemitigeerd)"],
          [{ text: "P2", bold: true, bg: ORANGE_BG }, "Monitoring en alerting", "Sentry/Datadog + on-call", "Incidenten onzichtbaar"],
          [{ text: "P2", bold: true, bg: ORANGE_BG }, "Penetratietest", "Door gecertificeerde externe partij", "Onbekende kwetsbaarheden"],
          [{ text: "P2", bold: true, bg: ORANGE_BG }, "Load testing", "342+ gelijktijdige organisaties", "R8: Performance"],
          [{ text: "P3", bold: true, bg: LIGHT_BLUE }, "SSO (SAML/OIDC)", "Koppeling gemeentelijke identity providers", "Gebruikersgemak"],
          [{ text: "P3", bold: true, bg: LIGHT_BLUE }, "Fijnmazige autorisatie", "Rollen en rechten per gemeente", "Data-isolatie"],
          [{ text: "P3", bold: true, bg: LIGHT_BLUE }, "SLA-waardige hosting", "Azure/AWS met beschikbaarheidsgarantie", "R3: Beschikbaarheid"],
          [{ text: "P3", bold: true, bg: LIGHT_BLUE }, "Database migraties", "Versiebeheerd i.p.v. db push", "Schema-drift"],
          [{ text: "P3", bold: true, bg: LIGHT_BLUE }, "Code review", "Onafhankelijke review van architectuur en code", "Onbekende fouten"],
          [{ text: "P3", bold: true, bg: LIGHT_BLUE }, "Disaster recovery", "RPO/RTO, failover, documentatie", "R4: Dataverlies"],
        ], [500, 2200, 3526, 2800]),

        spacer(120),
        p("P1 = Blocker voor productie (moet vóór go-live). P2 = Noodzakelijk binnen 3 maanden na go-live. P3 = Noodzakelijk voor volwassen platform.", { italics: true, color: GRAY }),

        // ── 5. Doorlooptijd ──
        new Paragraph({ children: [new PageBreak()] }),
        h1("5. Doorlooptijd en fasering"),
        p("De doorontwikkeling naar verantwoorde productie vergt een gefaseerde aanpak. Onderstaande planning is realistisch \u2014 niet optimistisch."),

        makeTable(["Fase", "Doorlooptijd", "Capaciteit", "Deliverables"], [
          ["Fase 1: Security hardening (P1)", "2\u20134 weken", "1 ontwikkelaar + AI", "MFA, wachtwoordbeleid, sanitization, backups"],
          ["Fase 2: Kwaliteitsborging (P2)", "4\u20138 weken", "1 ontwikkelaar + AI", "CI/CD, OTAP, testsuite (>70%), monitoring"],
          ["Fase 3: Compliance (P1+P2)", "2\u20133 maanden", "Extern + VNG", "BIO-toetsing, DPIA, WCAG-audit, pentest"],
          ["Fase 4: Productieniveau (P3)", "2\u20133 maanden", "1 ontwikkelaar + AI + extern", "SSO, autorisatie, SLA-hosting, DR"],
          ["Pilotfase", "1\u20132 maanden", "Beheerteam", "Beperkte uitrol, feedback, stabilisatie"],
          ["Brede uitrol", "1\u20132 maanden", "Beheerteam + support", "342 gemeenten, training, support"],
        ], [2800, 1500, 2226, 2500]),

        spacer(80),
        warningBox("Totale doorlooptijd: 8\u201314 maanden. De bottleneck is niet ontwikkeling maar externe afhankelijkheden (BIO, WCAG-audit, penetratietest) en de pilotfase."),

        // ── 6. Scenario A ──
        h1("6. Scenario A \u2014 MVP (Noodvervanging Drupal)"),
        noteBox("Scenario A is een noodoplossing die de directe continuïteitsbehoefte adresseert. Het is uitdrukkelijk geen structurele oplossing en brengt bewuste risico\u2019s met zich mee."),
        p("Dit scenario bouwt voort op het bestaande platform en voegt uitsluitend de P1-items toe (security hardening en compliance-basis). Het MVP is bedoeld als tijdelijke oplossing totdat het volledige productieplatform gereed is."),

        h2("6.1 Scope en bewuste beperkingen"),
        pbold("Binnen scope:"),
        bullet("Alle bestaande demonstratie-functionaliteit"),
        bullet("Security hardening: MFA, wachtwoordbeleid, input sanitization, CSP headers"),
        bullet("Basisinfrastructuur: Vercel Pro, eenvoudige monitoring"),
        bullet("Datamigratie vanuit Drupal"),
        bullet("Backup-strategie"),
        bullet("29 extra features buiten oorspronkelijk PvE (dark mode, marktverdeling, Linked Data, demo-speler, etc.)"),
        bullet("Basis WCAG-compliance (kleurcontrast, ARIA labels, focus indicators, tabel-scope headers)"),
        bullet("Generieke Voorzieningencatalogus (GVC) library voor multi-tenant hergebruik (waterschappen, provincies)"),
        spacer(60),
        pbold("Bewust buiten scope (met bijbehorend risico):"),
        bullet("Geen BIO-toetsing \u2014 risico op non-compliance bij audit"),
        bullet("Geen WCAG-audit \u2014 risico op wettelijke overtreding"),
        bullet("Geen penetratietest \u2014 onbekende kwetsbaarheden"),
        bullet("Geen OTAP \u2014 wijzigingen gaan direct naar productie"),
        bullet("Geen uitgebreide testsuite \u2014 risico op regressie bij updates"),
        bullet("Geen SSO \u2014 gemeenten moeten apart inloggen"),

        h2("6.2 Kosten MVP"),
        makeTable(["Kostenpost", "Eenmalig", "Structureel / jaar"], [
          [{ text: "ArchiXL: hardening en migratie", bold: true }, "\u20AC 15.000 \u2013 25.000", "\u2014"],
          ["ArchiXL: hosting (Vercel Pro)", "\u2014", "\u20AC 3.000 \u2013 6.000"],
          ["ArchiXL: technisch beheer", "\u2014", "\u20AC 24.000 \u2013 36.000"],
          ["VNG: functioneel beheer", "\u2014", "\u20AC 15.000 \u2013 25.000"],
          [{ text: "Totaal eenmalig", bold: true }, { text: "\u20AC 15.000 \u2013 25.000", bold: true }, ""],
          [{ text: "Totaal structureel / jaar", bold: true }, "", { text: "\u20AC 42.000 \u2013 67.000", bold: true }],
        ], [3500, 2763, 2763]),
        pitalic("Doorlooptijd MVP: 3\u20135 weken."),

        // ── 7. Scenario B ──
        new Paragraph({ children: [new PageBreak()] }),
        h1("7. Scenario B \u2014 Volledig productieplatform"),
        p("Dit scenario beschrijft de volledige doorontwikkeling naar een productierijp, compliance-conform platform voor alle 342 gemeenten."),

        h2("7.1 Totaaloverzicht kosten"),
        makeTable(["Partij", "Eenmalig", "Structureel / jaar"], [
          ["ArchiXL: ontwikkeling (fase 1\u20134)", "\u20AC 80.000 \u2013 140.000", "\u2014"],
          ["ArchiXL: beheer en hosting", "\u2014", "\u20AC 126.000 \u2013 204.000"],
          ["VNG: compliance (BIO, DPIA, WCAG, pentest)", "\u20AC 45.000 \u2013 75.000", "\u20AC 15.000 \u2013 25.000"],
          ["VNG: functioneel beheer en support", "\u2014", "\u20AC 60.000 \u2013 96.000"],
          [{ text: "Totaal", bold: true }, { text: "\u20AC 125.000 \u2013 215.000", bold: true }, { text: "\u20AC 201.000 \u2013 325.000", bold: true }],
        ], [3500, 2763, 2763]),

        h2("7.2 Scenariovergelijking"),
        makeTable(["", "Scenario A: MVP", "Scenario B: Volledig"], [
          [{ text: "Doel", bold: true }, "Noodvervanging Drupal", "Volwaardig platform"],
          [{ text: "Doorlooptijd", bold: true }, "3\u20135 weken", "8\u201314 maanden"],
          [{ text: "Eenmalig", bold: true }, "\u20AC 15.000 \u2013 25.000", "\u20AC 125.000 \u2013 215.000"],
          [{ text: "Structureel / jaar", bold: true }, "\u20AC 42.000 \u2013 67.000", "\u20AC 201.000 \u2013 325.000"],
          [{ text: "BIO-compliance", bold: true }, { text: "Nee", color: RED, bg: LIGHT_RED }, { text: "Ja", color: "166534", bg: "F0FDF4" }],
          [{ text: "WCAG-compliance", bold: true }, { text: "Nee", color: RED, bg: LIGHT_RED }, { text: "Ja", color: "166534", bg: "F0FDF4" }],
          [{ text: "Penetratietest", bold: true }, { text: "Nee", color: RED, bg: LIGHT_RED }, { text: "Ja", color: "166534", bg: "F0FDF4" }],
          [{ text: "SLA", bold: true }, { text: "Nee", color: RED, bg: LIGHT_RED }, { text: "99,5%+", color: "166534", bg: "F0FDF4" }],
          [{ text: "Risicoprofiel", bold: true }, { text: "Substantieel", color: RED, bold: true }, { text: "Beheersbaar", color: "166534", bold: true }],
        ], [2500, 3263, 3263]),

        // ── 8. Conclusie ──
        new Paragraph({ children: [new PageBreak()] }),
        h1("8. Conclusie en aanbevelingen"),
        p("Het platform van de Voorzieningencatalogus demonstreert op overtuigende wijze dat de beoogde functionaliteit technisch haalbaar is. De breedte van de gerealiseerde functionaliteit is indrukwekkend en biedt een solide basis voor verdere ontwikkeling."),
        spacer(80),
        warningBox("Een werkende demonstratie is echter geen productierijp systeem. De afstand tussen de huidige staat en verantwoorde inproductiename is substantieel en mag niet worden onderschat."),
        spacer(80),
        p("De belangrijkste resterende risico\u2019s \u2014 ontbrekende MFA, geen BIO-toetsing, geen penetratietest, geen backupstrategie \u2014 zijn elk op zichzelf voldoende reden om niet in productie te gaan. WCAG-compliance is inmiddels ge\u00efmplementeerd (axe-core: 0 violations), unit tests zijn toegevoegd (264 tests), en input-validatie is versterkt (Zod). Het risicoprofiel is verbeterd maar nog niet acceptabel voor productie."),

        h2("8.1 Aanbeveling"),
        p("ArchiXL adviseert de volgende aanpak:"),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text: "Start met Scenario A (MVP) om de acute Drupal-vervanging te realiseren, maar communiceer helder naar stakeholders dat dit een noodoplossing is met een bewust geaccepteerd risicoprofiel.", font: "Arial", size: 20 })] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text: "Plan direct door naar Scenario B. Begin met security hardening (P1) en compliance-trajecten (BIO, DPIA) parallel aan het MVP. Deze trajecten hebben de langste doorlooptijd en zijn niet afhankelijk van de ontwikkeling.", font: "Arial", size: 20 })] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text: "Investeer in kwaliteitsborging vóór doorontwikkeling. Nieuwe functionaliteit toevoegen zonder testsuite en CI/CD vergroot de technische schuld exponentieel.", font: "Arial", size: 20 })] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text: "Laat een onafhankelijke code review uitvoeren voordat het systeem in productie gaat. Dit is geen wantrouwen naar de ontwikkelaars, maar een kwaliteitswaarborg die bij elk professioneel softwareproject hoort.", font: "Arial", size: 20 })] }),

        spacer(120),
        noteBox("De kracht van dit traject is de snelheid waarmee functionaliteit is gerealiseerd. Het risico is dat diezelfde snelheid leidt tot het overslaan van stappen die essentieel zijn voor een verantwoord productiesysteem. Dit advies pleit voor het benutten van de snelheid én het respecteren van het proces."),

        h2("8.2 Generieke Voorzieningencatalogus (GVC)"),
        p("De codebase is ge\u00ebxtraheerd naar een generieke library (GVC) die hergebruik voor andere publieke sectoren mogelijk maakt. Het datamodel gebruikt nu \u2018Organisatie\u2019 als generiek basismodel (met @@map() voor backward-compatibiliteit met bestaande databases). Twee operationele varianten zijn gerealiseerd:"),
        spacer(40),
        makeTable(["", "VNG (gemeenten)", "HWH (waterschappen)"], [
          [{ text: "URL", bold: true }, "vng-vc.vercel.app", "hwh-teal.vercel.app"],
          [{ text: "Organisaties", bold: true }, "342 gemeenten", "21 waterschappen"],
          [{ text: "Architectuur-sync", bold: true }, "GEMMA (gemmaonline.nl)", "WILMA (wilmaonline.nl)"],
          [{ text: "Routes", bold: true }, "/gemeenten", "/waterschappen"],
          [{ text: "Database", bold: true }, "Neon (eigen project)", "Neon (eigen project)"],
          [{ text: "Gedeelde code", bold: true }, "GVC git submodule", "GVC git submodule"],
        ], [1800, 3613, 3613]),
        spacer(80),
        pbold("Technische realisatie:"),
        bullet("Generiek Organisatie-model in Prisma (Gemeente/Waterschap via @@map)"),
        bullet("Tenant-configuratie per variant (branding, rollen, routes, sync-bron)"),
        bullet("GVC als git submodule \u2014 werkt lokaal \u00e9n op Vercel"),
        bullet("WILMA-sync ge\u00efmplementeerd met dezelfde Semantic MediaWiki API als GEMMA"),
        bullet("264 unit tests, WCAG-audit (0 violations), Zod-validatie, Haven/Helm"),
        spacer(40),
        p("Dit model biedt schaalvoordelen: verbeteringen in de GVC komen automatisch beschikbaar voor alle varianten. Nieuwe sectoren (provincies, onderwijs) vereisen alleen een tenant-configuratie en domein-specifieke data."),

        h2("8.3 Intellectueel eigendom"),
        p("ArchiXL behoudt als ontwikkelaar de intellectuele eigendomsrechten op het platform. VNG verkrijgt een gebruiksrecht voor de gemeentelijke sector. ArchiXL heeft het recht om het platform ook in te zetten in andere publieke sectoren (onderwijs, waterschappen), wat voordelen biedt in termen van gedeelde ontwikkelkosten, kennisdeling en continuïteit."),

        spacer(400),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\u2014 Einde document \u2014", font: "Arial", size: 18, color: GRAY, italics: true })] }),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync("/Users/toineschijvenaars/claude/vvc/docs/Advies Voorzieningencatalogus v4.docx", buffer);
  console.log("Document gegenereerd: docs/Advies Voorzieningencatalogus v4.docx");
}

generate().catch(console.error);
