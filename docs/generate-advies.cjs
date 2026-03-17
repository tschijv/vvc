const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, ImageRun,
  TableOfContents, HeadingLevel, BorderStyle, WidthType, ShadingType,
  PageNumber, PageBreak, TabStopType, TabStopPosition
} = require("docx");

// ArchiXL corporate colors
const AXL_BLUE = "003B79";
const AXL_GOLD = "FFB60C";
const LIGHT_BLUE = "D5E8F0";
const LIGHT_GRAY = "F5F5F5";
const FONT = "Calibri";

// ArchiXL logo
const logoPath = path.join(__dirname, "archixl-logo.png");
const logoData = fs.readFileSync(logoPath);

// MIM diagram
const mimPath = path.join(__dirname, "mim-informatiemodel.png");
const mimData = fs.readFileSync(mimPath);

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

function headerCell(text, width) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: AXL_BLUE, type: ShadingType.CLEAR },
    margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF", font: FONT, size: 20 })] })],
  });
}

function cell(text, width, opts = {}) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: opts.shading ? { fill: opts.shading, type: ShadingType.CLEAR } : undefined,
    margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text, font: FONT, size: 20, ...opts.run })] })],
  });
}

function heading1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text, font: FONT })] });
}

function heading2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text, font: FONT })] });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    ...opts.paragraph,
    children: [new TextRun({ text, font: FONT, size: 22, ...opts.run })],
  });
}

function boldPara(text) {
  return para(text, { run: { bold: true } });
}

// ArchiXL-branded header with logo + document title
function makeHeader() {
  return new Header({
    children: [new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      children: [
        new ImageRun({ type: "png", data: logoData, transformation: { width: 118, height: 27 }, altText: { title: "ArchiXL", description: "ArchiXL logo", name: "archixl-logo" } }),
        new TextRun({ text: "\tAdvies Voorzieningencatalogus", font: FONT, size: 20, color: AXL_BLUE }),
      ],
    })],
  });
}

// Footer with page number in ArchiXL blue + gold bottom border
function makeFooter() {
  return new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.RIGHT,
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: AXL_GOLD, space: 1 } },
      children: [
        new TextRun({ text: "Pagina ", font: FONT, size: 18, bold: true, color: AXL_BLUE }),
        new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18, bold: true, color: AXL_BLUE }),
      ],
    })],
  });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: FONT, size: 22 } } },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, font: FONT, color: AXL_BLUE, allCaps: true },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 },
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: FONT, color: AXL_BLUE },
        paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 1 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: "bullets2",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: "bullets3",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: "bullets4",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: "bullets5",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: "bullets6",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: "bullets7",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: "bullets8",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: "bullets9",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
    ],
  },
  sections: [
    // ── TITLE PAGE ──
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: [
        // ArchiXL logo top-left
        new Paragraph({
          spacing: { after: 600 },
          children: [new ImageRun({ type: "png", data: logoData, transformation: { width: 200, height: 45 }, altText: { title: "ArchiXL", description: "ArchiXL logo", name: "archixl-logo" } })],
        }),
        new Paragraph({ spacing: { before: 2400 } }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "Advies Voorzieningencatalogus", font: FONT, size: 52, bold: true, color: AXL_BLUE })],
        }),
        new Paragraph({
          spacing: { after: 120 },
          children: [new TextRun({ text: "Van prototype naar productie", font: FONT, size: 36, color: AXL_BLUE })],
        }),
        new Paragraph({
          spacing: { after: 600 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: AXL_GOLD, space: 4 } },
          children: [new TextRun({ text: "Naar aanleiding van de demo door ArchiXL", font: FONT, size: 24, italics: true, color: "666666" })],
        }),
        new Paragraph({ spacing: { before: 600 } }),
        new Table({
          width: { size: 5000, type: WidthType.DXA },
          columnWidths: [2000, 3000],
          rows: [
            new TableRow({ children: [
              new TableCell({ borders: { top: border, bottom: border, left: border, right: border }, width: { size: 2000, type: WidthType.DXA }, margins: cellMargins, shading: { fill: AXL_BLUE, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Opdrachtgever", font: FONT, size: 20, bold: true, color: "FFFFFF" })] })] }),
              new TableCell({ borders: { top: border, bottom: border, left: border, right: border }, width: { size: 3000, type: WidthType.DXA }, margins: cellMargins, children: [new Paragraph({ children: [new TextRun({ text: "VNG (Vereniging van Nederlandse Gemeenten)", font: FONT, size: 20 })] })] }),
            ] }),
            new TableRow({ children: [
              new TableCell({ borders: { top: border, bottom: border, left: border, right: border }, width: { size: 2000, type: WidthType.DXA }, margins: cellMargins, shading: { fill: AXL_BLUE, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Auteur", font: FONT, size: 20, bold: true, color: "FFFFFF" })] })] }),
              new TableCell({ borders: { top: border, bottom: border, left: border, right: border }, width: { size: 3000, type: WidthType.DXA }, margins: cellMargins, children: [new Paragraph({ children: [new TextRun({ text: "ArchiXL", font: FONT, size: 20 })] })] }),
            ] }),
            new TableRow({ children: [
              new TableCell({ borders: { top: border, bottom: border, left: border, right: border }, width: { size: 2000, type: WidthType.DXA }, margins: cellMargins, shading: { fill: AXL_BLUE, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Datum", font: FONT, size: 20, bold: true, color: "FFFFFF" })] })] }),
              new TableCell({ borders: { top: border, bottom: border, left: border, right: border }, width: { size: 3000, type: WidthType.DXA }, margins: cellMargins, children: [new Paragraph({ children: [new TextRun({ text: "17 maart 2026", font: FONT, size: 20 })] })] }),
            ] }),
            new TableRow({ children: [
              new TableCell({ borders: { top: border, bottom: border, left: border, right: border }, width: { size: 2000, type: WidthType.DXA }, margins: cellMargins, shading: { fill: AXL_BLUE, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Versie", font: FONT, size: 20, bold: true, color: "FFFFFF" })] })] }),
              new TableCell({ borders: { top: border, bottom: border, left: border, right: border }, width: { size: 3000, type: WidthType.DXA }, margins: cellMargins, children: [new Paragraph({ children: [new TextRun({ text: "1.0", font: FONT, size: 20 })] })] }),
            ] }),
            new TableRow({ children: [
              new TableCell({ borders: { top: border, bottom: border, left: border, right: border }, width: { size: 2000, type: WidthType.DXA }, margins: cellMargins, shading: { fill: AXL_BLUE, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Status", font: FONT, size: 20, bold: true, color: "FFFFFF" })] })] }),
              new TableCell({ borders: { top: border, bottom: border, left: border, right: border }, width: { size: 3000, type: WidthType.DXA }, margins: cellMargins, children: [new Paragraph({ children: [new TextRun({ text: "Concept", font: FONT, size: 20 })] })] }),
            ] }),
          ],
        }),
      ],
    },
    // ── TOC ──
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: { default: makeHeader() },
      footers: { default: makeFooter() },
      children: [
        new Paragraph({
          spacing: { after: 400 },
          children: [new TextRun({ text: "Inhoudsopgave", font: FONT, size: 32, bold: true, color: AXL_BLUE })],
        }),
        new TableOfContents("Inhoudsopgave", { hyperlink: true, headingStyleRange: "1-2" }),
        new Paragraph({ children: [new PageBreak()] }),

        // ── 1. INLEIDING ──
        heading1("1. Inleiding"),

        heading2("1.1 Aanleiding"),
        para("De huidige Voorzieningencatalogus draait op Drupal-technologie die end-of-life is. Een eerder doorlopen vervangingstraject heeft niet tot het gewenste resultaat geleid. Daarmee is er een urgente behoefte aan een werkend alternatief dat de continu\u00EFteit van de catalogus waarborgt."),
        para("ArchiXL heeft in dit kader in opdracht van VNG een werkend prototype ontwikkeld van de nieuwe Voorzieningencatalogus. Dit prototype is in drie dagen gerealiseerd met behulp van AI-ondersteunde ontwikkeling en demonstreert de kernfunctionaliteit: het beheren van pakketten, leveranciers, gemeenten, standaarden en referentiecomponenten, inclusief een begrippenkader, compliancy-monitoring en inkoopondersteuning."),

        heading2("1.2 Doel van dit document"),
        para("Dit adviesdocument beoordeelt de huidige staat van het prototype en beschrijft twee scenario\u2019s om het systeem naar productie te brengen:"),

        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Scenario A \u2014 MVP: ", font: FONT, size: 22, bold: true }), new TextRun({ text: "minimale vervanging van het huidige Drupal-systeem tegen de laagst mogelijke kosten", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 200 }, children: [new TextRun({ text: "Scenario B \u2014 Volledig: ", font: FONT, size: 22, bold: true }), new TextRun({ text: "doorontwikkeling naar een volwaardig productieplatform voor alle 342 gemeenten", font: FONT, size: 22 })] }),

        // ── 2. HUIDIGE STAAT ──
        heading1("2. Huidige staat van het prototype"),
        para("Het prototype is functioneel en toont de gewenste features, maar mist essentiële lagen voor productiegebruik. Hieronder een analyse per categorie."),

        heading2("2.1 Beveiliging"),
        new Paragraph({ numbering: { reference: "bullets2", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Geen rate limiting op API-endpoints en loginpagina", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets2", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Geen CSRF-bescherming op formulieren", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets2", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Geen multi-factor authenticatie (MFA)", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets2", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Geen IP-gebaseerde brute-force bescherming op login", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets2", level: 0 }, spacing: { after: 200 }, children: [new TextRun({ text: "Geen wachtwoordbeleid (minimale lengte, complexiteit)", font: FONT, size: 22 })] }),

        heading2("2.2 Data-integriteit"),
        new Paragraph({ numbering: { reference: "bullets3", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Schema-wijzigingen via prisma db push in plaats van versiebeheerde migraties", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets3", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Geen database-backupstrategie", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets3", level: 0 }, spacing: { after: 200 }, children: [new TextRun({ text: "Hardcoded dummy-data op de homepage", font: FONT, size: 22 })] }),

        heading2("2.3 Infrastructuur"),
        new Paragraph({ numbering: { reference: "bullets4", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Geen CI/CD-pipeline: deployment is handmatig via CLI", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets4", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Geen staging-omgeving", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets4", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Geen monitoring of alerting", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets4", level: 0 }, spacing: { after: 200 }, children: [new TextRun({ text: "Vercel Hobby tier zonder SLA", font: FONT, size: 22 })] }),

        heading2("2.4 Kwaliteit"),
        new Paragraph({ numbering: { reference: "bullets5", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Geen geautomatiseerde tests (unit, integratie, end-to-end)", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets5", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Geen accessibility audit (WCAG)", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets5", level: 0 }, spacing: { after: 200 }, children: [new TextRun({ text: "Foutafhandeling op veel plekken met .catch(() => {}): fouten worden stilletjes genegeerd", font: FONT, size: 22 })] }),

        heading2("2.5 Compliance"),
        new Paragraph({ numbering: { reference: "bullets6", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Geen AVG/GDPR-verwerkingsregister", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets6", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Geen cookie-banner of privacyverklaring", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets6", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Geen data-retentiebeleid voor audit logs", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets6", level: 0 }, spacing: { after: 200 }, children: [new TextRun({ text: "Geen penetratietest uitgevoerd", font: FONT, size: 22 })] }),

        new Paragraph({ children: [new PageBreak()] }),

        // ── 3. INSPANNINGSSCHATTING ──
        heading1("3. Benodigde inspanning"),
        para("De onderstaande tabel categoriseert de benodigde werkzaamheden in drie niveaus van inspanning."),

        new Table({
          width: { size: 9026, type: WidthType.DXA },
          columnWidths: [1200, 3913, 3913],
          rows: [
            new TableRow({ children: [
              headerCell("Omvang", 1200),
              headerCell("Onderdeel", 3913),
              headerCell("Toelichting", 3913),
            ] }),
            // S items
            new TableRow({ children: [
              cell("S", 1200, { shading: "E8F5E9", run: { bold: true } }),
              cell("Wachtwoordbeleid", 3913),
              cell("Minimale lengte, complexiteitseisen afdwingen", 3913),
            ] }),
            new TableRow({ children: [
              cell("S", 1200, { shading: "E8F5E9", run: { bold: true } }),
              cell("Rate limiting", 3913),
              cell("Bescherming tegen brute-force en overbelasting", 3913),
            ] }),
            new TableRow({ children: [
              cell("S", 1200, { shading: "E8F5E9", run: { bold: true } }),
              cell("Input sanitization", 3913),
              cell("DOMPurify op CMS-content tegen XSS", 3913),
            ] }),
            new TableRow({ children: [
              cell("S", 1200, { shading: "E8F5E9", run: { bold: true } }),
              cell("Cookie-banner", 3913),
              cell("AVG-conforme cookiemelding", 3913),
            ] }),
            new TableRow({ children: [
              cell("S", 1200, { shading: "E8F5E9", run: { bold: true } }),
              cell("Error boundaries", 3913),
              cell("Graceful error handling in de UI", 3913),
            ] }),
            // M items
            new TableRow({ children: [
              cell("M", 1200, { shading: "FFF3E0", run: { bold: true } }),
              cell("Database-migraties", 3913),
              cell("Versiebeheerd schema in plaats van db push", 3913),
            ] }),
            new TableRow({ children: [
              cell("M", 1200, { shading: "FFF3E0", run: { bold: true } }),
              cell("CI/CD-pipeline", 3913),
              cell("Geautomatiseerde build, lint en typecheck", 3913),
            ] }),
            new TableRow({ children: [
              cell("M", 1200, { shading: "FFF3E0", run: { bold: true } }),
              cell("Staging-omgeving", 3913),
              cell("Aparte omgeving voor testen voor deployment", 3913),
            ] }),
            new TableRow({ children: [
              cell("M", 1200, { shading: "FFF3E0", run: { bold: true } }),
              cell("Basis e2e-tests", 3913),
              cell("10-15 happy path tests met Playwright", 3913),
            ] }),
            new TableRow({ children: [
              cell("M", 1200, { shading: "FFF3E0", run: { bold: true } }),
              cell("MFA-ondersteuning", 3913),
              cell("TOTP-gebaseerde tweede factor", 3913),
            ] }),
            new TableRow({ children: [
              cell("M", 1200, { shading: "FFF3E0", run: { bold: true } }),
              cell("Monitoring en alerting", 3913),
              cell("Vercel Analytics, Sentry of vergelijkbaar", 3913),
            ] }),
            new TableRow({ children: [
              cell("M", 1200, { shading: "FFF3E0", run: { bold: true } }),
              cell("WCAG-audit", 3913),
              cell("Toegankelijkheidstoets en fixes", 3913),
            ] }),
            // L items
            new TableRow({ children: [
              cell("L", 1200, { shading: "FFEBEE", run: { bold: true } }),
              cell("Uitgebreide testsuite", 3913),
              cell("Unit, integratie en e2e met >70% coverage", 3913),
            ] }),
            new TableRow({ children: [
              cell("L", 1200, { shading: "FFEBEE", run: { bold: true } }),
              cell("Penetratietest", 3913),
              cell("Door gecertificeerde externe partij", 3913),
            ] }),
            new TableRow({ children: [
              cell("L", 1200, { shading: "FFEBEE", run: { bold: true } }),
              cell("AVG/GDPR-compliance", 3913),
              cell("Verwerkingsregister en DPIA", 3913),
            ] }),
            new TableRow({ children: [
              cell("L", 1200, { shading: "FFEBEE", run: { bold: true } }),
              cell("Fijnmazige autorisatie", 3913),
              cell("Rollen en rechten per gemeente en functie", 3913),
            ] }),
            new TableRow({ children: [
              cell("L", 1200, { shading: "FFEBEE", run: { bold: true } }),
              cell("Backup en disaster recovery", 3913),
              cell("Geteste restore-procedure met RPO/RTO", 3913),
            ] }),
            new TableRow({ children: [
              cell("L", 1200, { shading: "FFEBEE", run: { bold: true } }),
              cell("SLA-waardige hosting", 3913),
              cell("Professionele hosting met beschikbaarheidsgarantie", 3913),
            ] }),
            new TableRow({ children: [
              cell("L", 1200, { shading: "FFEBEE", run: { bold: true } }),
              cell("Documentatie", 3913),
              cell("Architectuur, runbook, API-documentatie", 3913),
            ] }),
          ],
        }),

        new Paragraph({ spacing: { before: 200 } }),
        para("De S-items samen met de belangrijkste M-items (CI/CD, staging, monitoring, migraties) brengen het systeem op een acceptabel niveau voor beperkt intern gebruik. Voor een volwaardig productiesysteem zijn ook de L-items noodzakelijk."),

        heading2("3.2 Doorlooptijd"),
        para("De doorontwikkeling naar productie kan gefaseerd worden uitgevoerd. ArchiXL werkt met AI-ondersteunde ontwikkeling, wat de doorlooptijd aanzienlijk verkort. Het huidige prototype is in drie dagen gerealiseerd. Onderstaande planning gaat uit van \u00E9\u00E9n ontwikkelaar met AI-ondersteuning en een productowner."),

        new Table({
          width: { size: 9026, type: WidthType.DXA },
          columnWidths: [3000, 2013, 2013, 2000],
          rows: [
            new TableRow({ children: [
              headerCell("Fase", 3000),
              headerCell("Doorlooptijd", 2013),
              headerCell("Capaciteit", 2013),
              headerCell("Periode", 2000),
            ] }),
            new TableRow({ children: [
              cell("Fase 1: Quick wins (S)", 3000, { run: { bold: true } }),
              cell("1\u20132 weken", 2013),
              cell("1 ontwikkelaar + AI", 2013),
              cell("Week 1\u20132", 2000, { shading: "E8F5E9" }),
            ] }),
            new TableRow({ children: [
              cell("Fase 2: Basisniveau (M)", 3000, { run: { bold: true } }),
              cell("3\u20136 weken", 2013),
              cell("1 ontwikkelaar + AI", 2013),
              cell("Week 2\u20138", 2000, { shading: "FFF3E0" }),
            ] }),
            new TableRow({ children: [
              cell("Fase 3: Productieniveau (L)", 3000, { run: { bold: true } }),
              cell("2\u20133 maanden", 2013),
              cell("1 ontwikkelaar + AI + extern", 2013),
              cell("Maand 2\u20135", 2000, { shading: "FFEBEE" }),
            ] }),
            new TableRow({ children: [
              cell("Pilotfase", 3000, { run: { bold: true } }),
              cell("1\u20132 maanden", 2013),
              cell("Beheerteam", 2013),
              cell("Maand 5\u20136", 2000, { shading: LIGHT_BLUE }),
            ] }),
            new TableRow({ children: [
              cell("Brede uitrol", 3000, { run: { bold: true } }),
              cell("1\u20132 maanden", 2013),
              cell("Beheerteam + support", 2013),
              cell("Maand 6\u20137", 2000, { shading: LIGHT_BLUE }),
            ] }),
          ],
        }),

        new Paragraph({ spacing: { before: 120 } }),
        para("De totale doorlooptijd van prototype naar volledige productie bedraagt circa 5\u20137 maanden. Door AI-ondersteunde ontwikkeling is de technische realisatie aanzienlijk sneller dan bij traditionele aanpak. De bottleneck zit niet in ontwikkeling maar in externe afhankelijkheden (penetratietest, BIO-toetsing, WCAG-audit) en de pilot- en uitrolfase."),

        new Paragraph({ children: [new PageBreak()] }),

        // ── SCENARIO A: MVP ──
        heading1("4. Scenario A \u2014 Minimal Viable Product (MVP)"),
        para("Dit scenario beantwoordt de directe nood: het vervangen van het huidige Drupal-systeem dat end-of-life is. Het MVP levert een werkend systeem met de kernfunctionaliteit van de huidige catalogus, zonder uitgebreide doorontwikkeling. De focus ligt op het zo snel en goedkoop mogelijk in productie brengen van het bestaande prototype."),

        heading2("4.1 Scope MVP"),
        para("Het MVP omvat uitsluitend:"),
        new Paragraph({ numbering: { reference: "bullets7", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Alle huidige functionaliteit van de Drupal-catalogus (pakketten, leveranciers, gemeenten, standaarden)", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets7", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Quick wins beveiliging (S-items): rate limiting, wachtwoordbeleid, input sanitization, cookie-banner", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets7", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Basisinfrastructuur: eenvoudige CI/CD-pipeline, Vercel Pro hosting (in plaats van Hobby)", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets7", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Datamigratie vanuit het huidige Drupal-systeem", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets7", level: 0 }, spacing: { after: 200 }, children: [new TextRun({ text: "Basismonitoring (Vercel Analytics + error tracking)", font: FONT, size: 22 })] }),

        para("Nadrukkelijk buiten scope van het MVP:"),
        new Paragraph({ numbering: { reference: "bullets8", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "MFA, SSO, fijnmazige autorisatie", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets8", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Uitgebreide testsuite en penetratietest", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets8", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "BIO-toetsing, DPIA, WCAG-audit", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets8", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "OTAP-omgeving en disaster recovery", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets8", level: 0 }, spacing: { after: 200 }, children: [new TextRun({ text: "Nieuwe functionaliteit (dienstverleners, cloud-providers, inkoopondersteuning)", font: FONT, size: 22 })] }),

        heading2("4.2 Doorlooptijd MVP"),
        new Table({
          width: { size: 9026, type: WidthType.DXA },
          columnWidths: [3500, 2763, 2763],
          rows: [
            new TableRow({ children: [
              headerCell("Fase", 3500),
              headerCell("Doorlooptijd", 2763),
              headerCell("Capaciteit", 2763),
            ] }),
            new TableRow({ children: [
              cell("Hardening en beveiliging", 3500),
              cell("3\u20135 dagen", 2763),
              cell("1 ontwikkelaar + AI", 2763),
            ] }),
            new TableRow({ children: [
              cell("Datamigratie en CI/CD", 3500),
              cell("1\u20132 weken", 2763),
              cell("1 ontwikkelaar + AI", 2763),
            ] }),
            new TableRow({ children: [
              cell("Testen en acceptatie", 3500),
              cell("1 week", 2763),
              cell("1 ontwikkelaar + VNG", 2763),
            ] }),
            new TableRow({ children: [
              cell("Go-live", 3500),
              cell("1\u20132 dagen", 2763),
              cell("1 ontwikkelaar", 2763),
            ] }),
            new TableRow({ children: [
              cell("Totaal", 3500, { shading: LIGHT_BLUE, run: { bold: true } }),
              cell("3\u20135 weken", 2763, { shading: LIGHT_BLUE, run: { bold: true } }),
              cell("", 2763, { shading: LIGHT_BLUE }),
            ] }),
          ],
        }),

        heading2("4.3 Kosten MVP"),
        para("De bedragen zijn exclusief btw."),

        new Table({
          width: { size: 9026, type: WidthType.DXA },
          columnWidths: [3500, 2763, 2763],
          rows: [
            new TableRow({ children: [
              headerCell("Kostenpost", 3500),
              headerCell("Eenmalig", 2763),
              headerCell("Structureel / jaar", 2763),
            ] }),
            new TableRow({ children: [
              cell("ArchiXL: ontwikkeling MVP", 3500, { run: { bold: true } }),
              cell("\u20AC 15.000 \u2013 25.000", 2763),
              cell("\u2014", 2763),
            ] }),
            new TableRow({ children: [
              cell("ArchiXL: datamigratie", 3500),
              cell("\u20AC 5.000 \u2013 10.000", 2763),
              cell("\u2014", 2763),
            ] }),
            new TableRow({ children: [
              cell("ArchiXL: hosting (Vercel Pro)", 3500),
              cell("\u2014", 2763),
              cell("\u20AC 3.000 \u2013 6.000", 2763),
            ] }),
            new TableRow({ children: [
              cell("ArchiXL: technisch beheer", 3500),
              cell("\u2014", 2763),
              cell("\u20AC 24.000 \u2013 36.000", 2763),
            ] }),
            new TableRow({ children: [
              cell("ArchiXL: monitoring", 3500),
              cell("\u2014", 2763),
              cell("\u20AC 2.000 \u2013 4.000", 2763),
            ] }),
            new TableRow({ children: [
              cell("VNG: functioneel beheer (beperkt)", 3500),
              cell("\u2014", 2763),
              cell("\u20AC 15.000 \u2013 25.000", 2763),
            ] }),
            new TableRow({ children: [
              cell("Totaal eenmalig", 3500, { shading: LIGHT_BLUE, run: { bold: true } }),
              cell("\u20AC 20.000 \u2013 35.000", 2763, { shading: LIGHT_BLUE, run: { bold: true } }),
              cell("", 2763, { shading: LIGHT_BLUE }),
            ] }),
            new TableRow({ children: [
              cell("Totaal structureel / jaar", 3500, { shading: LIGHT_BLUE, run: { bold: true } }),
              cell("", 2763, { shading: LIGHT_BLUE }),
              cell("\u20AC 44.000 \u2013 71.000", 2763, { shading: LIGHT_BLUE, run: { bold: true } }),
            ] }),
          ],
        }),

        new Paragraph({ spacing: { before: 120 } }),
        para("Het MVP-scenario biedt een werkende vervanging van het Drupal-systeem voor een fractie van de kosten van het eerdere vervangingstraject. Het systeem kan binnen 3\u20135 weken live zijn. Het risico is beperkt doordat het prototype reeds functioneel is en alleen gehardend hoeft te worden."),
        boldPara("Let op:"),
        para("Het MVP is een noodoplossing die de directe pijn wegneemt, maar geen structurele oplossing biedt. Aanvullende investeringen in beveiliging, compliance en schaalbaarheid zijn op termijn alsnog noodzakelijk. Het MVP kan wel dienen als uitgangspunt voor scenario B."),

        new Paragraph({ children: [new PageBreak()] }),

        // ── SCENARIO B: VOLLEDIG ──
        heading1("5. Scenario B \u2014 Volledig productieplatform"),
        para("Dit scenario beschrijft de volledige doorontwikkeling naar een productierijp platform dat alle 342 gemeenten, leveranciers en de GEMMA-architectuur bedient. De kosten zijn opgesplitst naar ArchiXL (ontwikkeling en technisch beheer) en VNG (eigenaarschap en functioneel beheer). Alle bedragen zijn exclusief btw."),

        heading2("5.1 Doorlooptijd"),
        para("Zie hoofdstuk 3.2 voor de gefaseerde planning (5\u20137 maanden totaal)."),

        heading2("5.2 Kosteninschatting"),

        boldPara("Kosten ArchiXL \u2014 Ontwikkeling"),
        para("ArchiXL is verantwoordelijk voor de eenmalige ontwikkeling van het prototype naar een productierijp platform."),

        new Table({
          width: { size: 9026, type: WidthType.DXA },
          columnWidths: [3500, 2763, 2763],
          rows: [
            new TableRow({ children: [
              headerCell("Ontwikkeling ArchiXL", 3500),
              headerCell("Eenmalig", 2763),
              headerCell("Toelichting", 2763),
            ] }),
            new TableRow({ children: [
              cell("Fase 1: Quick wins (S)", 3500, { run: { bold: true } }),
              cell("\u20AC 5.000 \u2013 10.000", 2763),
              cell("Beveiliging, sanitization, cookie-banner", 2763),
            ] }),
            new TableRow({ children: [
              cell("Fase 2: Basisniveau (M)", 3500, { run: { bold: true } }),
              cell("\u20AC 25.000 \u2013 45.000", 2763),
              cell("CI/CD, migraties, staging, MFA, tests", 2763),
            ] }),
            new TableRow({ children: [
              cell("Fase 3: Productieniveau (L)", 3500, { run: { bold: true } }),
              cell("\u20AC 60.000 \u2013 100.000", 2763),
              cell("Autorisatie, API, SSO, testsuite, docs", 2763),
            ] }),
            new TableRow({ children: [
              cell("Totaal ontwikkeling", 3500, { shading: LIGHT_BLUE, run: { bold: true } }),
              cell("\u20AC 90.000 \u2013 155.000", 2763, { shading: LIGHT_BLUE, run: { bold: true } }),
              cell("", 2763, { shading: LIGHT_BLUE }),
            ] }),
          ],
        }),

        new Paragraph({ spacing: { before: 240 } }),
        boldPara("Kosten ArchiXL \u2014 Technisch beheer en hosting"),
        para("Na oplevering verzorgt ArchiXL het structurele technisch beheer, hosting, monitoring en doorontwikkeling."),

        new Table({
          width: { size: 9026, type: WidthType.DXA },
          columnWidths: [3500, 2763, 2763],
          rows: [
            new TableRow({ children: [
              headerCell("Technisch beheer ArchiXL", 3500),
              headerCell("Structureel / jaar", 2763),
              headerCell("Toelichting", 2763),
            ] }),
            new TableRow({ children: [
              cell("Hosting (productie + OTAP)", 3500),
              cell("\u20AC 24.000 \u2013 48.000", 2763),
              cell("Cloud-infrastructuur met SLA", 2763),
            ] }),
            new TableRow({ children: [
              cell("Technisch beheer", 3500),
              cell("\u20AC 48.000 \u2013 72.000", 2763),
              cell("Updates, patches, incidentafhandeling", 2763),
            ] }),
            new TableRow({ children: [
              cell("Doorontwikkeling", 3500),
              cell("\u20AC 48.000 \u2013 72.000", 2763),
              cell("Nieuwe features, integraties, optimalisatie", 2763),
            ] }),
            new TableRow({ children: [
              cell("Monitoring en tooling", 3500),
              cell("\u20AC 6.000 \u2013 12.000", 2763),
              cell("Sentry, Datadog, alerting, logging", 2763),
            ] }),
            new TableRow({ children: [
              cell("Totaal beheer en hosting / jaar", 3500, { shading: LIGHT_BLUE, run: { bold: true } }),
              cell("\u20AC 126.000 \u2013 204.000", 2763, { shading: LIGHT_BLUE, run: { bold: true } }),
              cell("", 2763, { shading: LIGHT_BLUE }),
            ] }),
          ],
        }),

        new Paragraph({ spacing: { before: 240 } }),
        boldPara("Kosten VNG (eigenaarschap en functioneel beheer)"),
        para("VNG is verantwoordelijk voor het functioneel beheer, de productaansturing, compliance en gebruikersondersteuning."),

        new Table({
          width: { size: 9026, type: WidthType.DXA },
          columnWidths: [3500, 2763, 2763],
          rows: [
            new TableRow({ children: [
              headerCell("Kostenpost VNG", 3500),
              headerCell("Eenmalig", 2763),
              headerCell("Structureel / jaar", 2763),
            ] }),
            new TableRow({ children: [
              cell("BIO-toetsing en DPIA", 3500),
              cell("\u20AC 20.000 \u2013 35.000", 2763),
              cell("\u2014", 2763),
            ] }),
            new TableRow({ children: [
              cell("WCAG-audit (extern)", 3500),
              cell("\u20AC 10.000 \u2013 15.000", 2763),
              cell("\u2014", 2763),
            ] }),
            new TableRow({ children: [
              cell("Externe penetratietest", 3500),
              cell("\u20AC 15.000 \u2013 25.000", 2763),
              cell("\u20AC 15.000 \u2013 25.000", 2763),
            ] }),
            new TableRow({ children: [
              cell("Productowner / functioneel beheer", 3500),
              cell("\u2014", 2763),
              cell("\u20AC 40.000 \u2013 60.000", 2763),
            ] }),
            new TableRow({ children: [
              cell("Gebruikersondersteuning / servicedesk", 3500),
              cell("\u2014", 2763),
              cell("\u20AC 20.000 \u2013 36.000", 2763),
            ] }),
            new TableRow({ children: [
              cell("Totaal VNG eenmalig", 3500, { shading: LIGHT_BLUE, run: { bold: true } }),
              cell("\u20AC 45.000 \u2013 75.000", 2763, { shading: LIGHT_BLUE, run: { bold: true } }),
              cell("", 2763, { shading: LIGHT_BLUE }),
            ] }),
            new TableRow({ children: [
              cell("Totaal VNG structureel / jaar", 3500, { shading: LIGHT_BLUE, run: { bold: true } }),
              cell("", 2763, { shading: LIGHT_BLUE }),
              cell("\u20AC 75.000 \u2013 121.000", 2763, { shading: LIGHT_BLUE, run: { bold: true } }),
            ] }),
          ],
        }),

        new Paragraph({ spacing: { before: 240 } }),
        boldPara("Totaaloverzicht"),
        new Table({
          width: { size: 9026, type: WidthType.DXA },
          columnWidths: [3500, 2763, 2763],
          rows: [
            new TableRow({ children: [
              headerCell("Totaal", 3500),
              headerCell("Eenmalig", 2763),
              headerCell("Structureel / jaar", 2763),
            ] }),
            new TableRow({ children: [
              cell("ArchiXL", 3500, { run: { bold: true } }),
              cell("\u20AC 90.000 \u2013 155.000", 2763),
              cell("\u20AC 126.000 \u2013 204.000", 2763),
            ] }),
            new TableRow({ children: [
              cell("VNG", 3500, { run: { bold: true } }),
              cell("\u20AC 45.000 \u2013 75.000", 2763),
              cell("\u20AC 75.000 \u2013 121.000", 2763),
            ] }),
            new TableRow({ children: [
              cell("Totaal", 3500, { shading: AXL_BLUE, run: { bold: true, color: "FFFFFF" } }),
              cell("\u20AC 135.000 \u2013 230.000", 2763, { shading: AXL_BLUE, run: { bold: true, color: "FFFFFF" } }),
              cell("\u20AC 201.000 \u2013 325.000", 2763, { shading: AXL_BLUE, run: { bold: true, color: "FFFFFF" } }),
            ] }),
          ],
        }),

        new Paragraph({ spacing: { before: 120 } }),
        para("Deze bedragen zijn indicatief en afhankelijk van de definitieve scope, architectuurkeuzes en de mate van interne capaciteit bij VNG. Een gedetailleerde begroting kan worden opgesteld na vaststelling van de functionele requirements."),

        new Paragraph({ children: [new PageBreak()] }),

        // ── 6. OPSCHALING ──
        heading1("6. Vereisten bij opschaling naar 342 gemeenten"),
        para("Een systeem dat alle 342 gemeenten, leveranciers en de GEMMA-architectuur bedient, vereist fundamenteel meer dan het hardenen van het huidige prototype. Hieronder de vereisten per domein."),

        heading2("6.1 Organisatorisch"),
        new Paragraph({ numbering: { reference: "bullets7", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Beheerteam van minimaal 2-3 personen (ontwikkelaar, beheerder, productowner)", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets7", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Incidentproces en escalatieprocedure", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets7", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Changemanagement met RFC-proces voor wijzigingen", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets7", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "SLA met beschikbaarheidsgarantie van minimaal 99,5%", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets7", level: 0 }, spacing: { after: 200 }, children: [new TextRun({ text: "Servicedesk voor gebruikersondersteuning", font: FONT, size: 22 })] }),

        heading2("6.2 Technisch"),
        new Paragraph({ numbering: { reference: "bullets8", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Professionele hosting met SLA (Azure, AWS, of gespecialiseerde partij)", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets8", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Gescheiden OTAP-omgevingen (Ontwikkel, Test, Acceptatie, Productie)", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets8", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "CI/CD met quality gates (linting, tests, security scans)", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets8", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Monitoring, alerting en on-call (Datadog, PagerDuty of vergelijkbaar)", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets8", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Geautomatiseerde backups met geteste restore-procedure", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets8", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Disaster recovery plan met RPO/RTO-doelstellingen", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets8", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Jaarlijkse penetratietest door gecertificeerde partij", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets8", level: 0 }, spacing: { after: 200 }, children: [new TextRun({ text: "Load testing voor 342+ gelijktijdige organisaties", font: FONT, size: 22 })] }),

        heading2("6.3 Compliance en governance"),
        new Paragraph({ numbering: { reference: "bullets9", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "BIO-toetsing (Baseline Informatiebeveiliging Overheid) \u2014 verplicht voor gemeentelijke systemen", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets9", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Data Protection Impact Assessment (DPIA)", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets9", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "AVG-verwerkersovereenkomst indien VNG als verwerker optreedt", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets9", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Toegankelijkheidsverklaring conform WCAG 2.1 AA \u2014 wettelijk verplicht voor overheidswebsites", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets9", level: 0 }, spacing: { after: 200 }, children: [new TextRun({ text: "Archiefwet-compliance voor logging en audit trails", font: FONT, size: 22 })] }),

        heading2("6.4 Functioneel"),
        para("Voor een systeem dat door honderden organisaties wordt gebruikt, zijn aanvullende functionele eisen noodzakelijk:"),
        new Paragraph({ numbering: { reference: "bullets9", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Single Sign-On via SAML of OpenID Connect, gekoppeld aan gemeentelijke identity providers", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets9", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Rollen en rechten per gemeente (elke gemeente beheert alleen eigen data)", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets9", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "API-beveiliging met OAuth2 en rate limiting per organisatie", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets9", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Datavalidatie en kwaliteitscontroles", font: FONT, size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullets9", level: 0 }, spacing: { after: 200 }, children: [new TextRun({ text: "Import en export in GEMMA-standaardformaten", font: FONT, size: 22 })] }),

        new Paragraph({ children: [new PageBreak()] }),

        // ── 7. CONCLUSIE ──
        heading1("7. Conclusie en aanbevelingen"),
        para("Het prototype van de Voorzieningencatalogus is een waardevol resultaat dat de gewenste functionaliteit demonstreert. Het bewijst dat de technische visie haalbaar is en biedt een concrete basis voor verdere besluitvorming."),
        para("Gezien de urgentie rondom het end-of-life Drupal-systeem en de lessen uit het eerdere vervangingstraject, presenteert dit advies twee scenario\u2019s die elk een valide route bieden:"),

        new Paragraph({ spacing: { before: 120 } }),
        boldPara("Scenariovergelijking"),
        new Table({
          width: { size: 9026, type: WidthType.DXA },
          columnWidths: [2500, 3263, 3263],
          rows: [
            new TableRow({ children: [
              headerCell("", 2500),
              headerCell("Scenario A: MVP", 3263),
              headerCell("Scenario B: Volledig", 3263),
            ] }),
            new TableRow({ children: [
              cell("Doel", 2500, { run: { bold: true } }),
              cell("Drupal-vervanging, continu\u00EFteit waarborgen", 3263),
              cell("Volwaardig platform voor 342 gemeenten", 3263),
            ] }),
            new TableRow({ children: [
              cell("Doorlooptijd", 2500, { run: { bold: true } }),
              cell("3\u20135 weken", 3263),
              cell("5\u20137 maanden", 3263),
            ] }),
            new TableRow({ children: [
              cell("Eenmalig", 2500, { run: { bold: true } }),
              cell("\u20AC 20.000 \u2013 35.000", 3263),
              cell("\u20AC 135.000 \u2013 230.000", 3263),
            ] }),
            new TableRow({ children: [
              cell("Structureel / jaar", 2500, { run: { bold: true } }),
              cell("\u20AC 44.000 \u2013 71.000 / jaar", 3263),
              cell("\u20AC 201.000 \u2013 325.000 / jaar", 3263),
            ] }),
            new TableRow({ children: [
              cell("Risico", 2500, { run: { bold: true } }),
              cell("Laag (prototype is functioneel)", 3263),
              cell("Beheersbaar (gefaseerde aanpak)", 3263),
            ] }),
            new TableRow({ children: [
              cell("Compliance", 2500, { run: { bold: true } }),
              cell("Basis (geen BIO/DPIA)", 3263),
              cell("Volledig (BIO, DPIA, WCAG)", 3263),
            ] }),
          ],
        }),

        new Paragraph({ spacing: { before: 200 } }),
        boldPara("Aanbeveling"),
        para("ArchiXL adviseert om te starten met Scenario A (MVP) om de directe continu\u00EFteitsbehoefte op te lossen. Het MVP kan binnen enkele weken live zijn en vervangt het huidige Drupal-systeem tegen een fractie van de investering van het eerdere vervangingstraject. Vervolgens kan het MVP stapsgewijs worden doorontwikkeld richting Scenario B, waarbij de investeringen gespreid worden over de tijd."),
        para("Deze gefaseerde aanpak beperkt het financi\u00EBle risico, levert snel een werkend resultaat op en biedt de ruimte om op basis van gebruikersfeedback de juiste prioriteiten te stellen voor de doorontwikkeling."),

        heading2("7.1 Intellectueel eigendom en sectorale inzet"),
        para("ArchiXL behoudt als ontwikkelaar de intellectuele eigendomsrechten op het platform. VNG verkrijgt een gebruiksrecht voor de gemeentelijke sector."),
        para("ArchiXL heeft het recht om het platform ook in te zetten in andere publieke sectoren, waaronder het onderwijs en de waterschappen. Dit biedt de mogelijkheid om vanuit een gezamenlijke technische basis sectorspecifieke varianten te ontwikkelen en te beheren. Deze aanpak heeft voordelen voor alle betrokken partijen:"),
        new Paragraph({ numbering: { reference: "bullets9", level: 0 }, spacing: { after: 60 }, children: [
          new TextRun({ text: "Gedeelde ontwikkelkosten: ", font: FONT, size: 22, bold: true }),
          new TextRun({ text: "doorontwikkeling van het kernplatform wordt over meerdere sectoren verdeeld, wat de kosten per sector verlaagt.", font: FONT, size: 22 }),
        ] }),
        new Paragraph({ numbering: { reference: "bullets9", level: 0 }, spacing: { after: 60 }, children: [
          new TextRun({ text: "Kennisdeling: ", font: FONT, size: 22, bold: true }),
          new TextRun({ text: "verbeteringen en best practices uit de ene sector komen ten goede aan alle andere sectoren.", font: FONT, size: 22 }),
        ] }),
        new Paragraph({ numbering: { reference: "bullets9", level: 0 }, spacing: { after: 60 }, children: [
          new TextRun({ text: "Continuiteit: ", font: FONT, size: 22, bold: true }),
          new TextRun({ text: "een breder draagvlak vergroot de levensvatbaarheid en doorontwikkeling van het platform op lange termijn.", font: FONT, size: 22 }),
        ] }),
        new Paragraph({ numbering: { reference: "bullets9", level: 0 }, spacing: { after: 200 }, children: [
          new TextRun({ text: "Sectorspecifieke configuratie: ", font: FONT, size: 22, bold: true }),
          new TextRun({ text: "elke sector behoudt eigen begrippenkaders, standaarden en catalogusinhoud binnen het gedeelde platform.", font: FONT, size: 22 }),
        ] }),
        para("De nadere afspraken over eigendom, licentievoorwaarden en kostenverdeling tussen sectoren worden vastgelegd in een separaat convenant."),
      ],
    },
    // ============================================================
    // BIJLAGE A: LOGISCH INFORMATIEMODEL (MIM)
    // ============================================================
    {
      properties: { page: { margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new ImageRun({ data: logoData, transformation: { width: 120, height: 35 } })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200 }, children: [new TextRun({ text: "ArchiXL B.V. \u2013 Advies Voorzieningencatalogus \u2013 ", font: FONT, size: 16, color: "888888" }), new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: "888888" })] })] }) },
      children: [
        heading1("Bijlage A \u2014 Logisch Informatiemodel (MIM)"),

        para("Onderstaand diagram toont het logisch informatiemodel van de Voorzieningencatalogus, opgesteld conform het Metamodel Informatie Modellering (MIM 1.2, Niveau 3). Het model beschrijft de objecttypen, attributen en relaties in de datalaag van het systeem."),

        heading2("A.1 Modeloverzicht"),
        para("Het informatiemodel is opgedeeld in de volgende domeinen:"),

        new Paragraph({ numbering: { reference: "bullets9", level: 0 }, spacing: { after: 60 }, children: [
          new TextRun({ text: "Pakketdomein: ", font: FONT, size: 22, bold: true }),
          new TextRun({ text: "Leveranciers, Pakketten, Pakketversies en contactpersonen", font: FONT, size: 22 }),
        ] }),
        new Paragraph({ numbering: { reference: "bullets9", level: 0 }, spacing: { after: 60 }, children: [
          new TextRun({ text: "GEMMA-domein: ", font: FONT, size: 22, bold: true }),
          new TextRun({ text: "Referentiecomponenten, Standaarden, Standaardversies, Applicatiefuncties en GEMMA-views", font: FONT, size: 22 }),
        ] }),
        new Paragraph({ numbering: { reference: "bullets9", level: 0 }, spacing: { after: 60 }, children: [
          new TextRun({ text: "Gemeentedomein: ", font: FONT, size: 22, bold: true }),
          new TextRun({ text: "Gemeenten en Samenwerkingsverbanden met hun applicatieportfolio", font: FONT, size: 22 }),
        ] }),
        new Paragraph({ numbering: { reference: "bullets9", level: 0 }, spacing: { after: 60 }, children: [
          new TextRun({ text: "Integratiedomein: ", font: FONT, size: 22, bold: true }),
          new TextRun({ text: "Koppelingen tussen systemen, addenda bij convenanten", font: FONT, size: 22 }),
        ] }),
        new Paragraph({ numbering: { reference: "bullets9", level: 0 }, spacing: { after: 60 }, children: [
          new TextRun({ text: "Gebruikersdomein: ", font: FONT, size: 22, bold: true }),
          new TextRun({ text: "Gebruikers met rollen, gekoppeld aan gemeenten of leveranciers", font: FONT, size: 22 }),
        ] }),
        new Paragraph({ numbering: { reference: "bullets9", level: 0 }, spacing: { after: 60 }, children: [
          new TextRun({ text: "Contentdomein: ", font: FONT, size: 22, bold: true }),
          new TextRun({ text: "CMS-pagina\u2019s en NL-SBB/SKOS-begrippen", font: FONT, size: 22 }),
        ] }),
        new Paragraph({ numbering: { reference: "bullets9", level: 0 }, spacing: { after: 200 }, children: [
          new TextRun({ text: "Auditdomein: ", font: FONT, size: 22, bold: true }),
          new TextRun({ text: "Logging van alle mutaties voor traceerbaarheid", font: FONT, size: 22 }),
        ] }),

        heading2("A.2 MIM-stereotypen"),
        para("Het model hanteert de volgende MIM-stereotypen:"),

        new Table({ width: { size: 9026, type: WidthType.DXA }, rows: [
          new TableRow({ children: [
            headerCell("Stereotype", 3000),
            headerCell("Beschrijving", 6026),
          ] }),
          new TableRow({ children: [
            cell("\u00ABObjecttype\u00BB", 3000, { run: { bold: true } }),
            cell("Entiteit met eigen identiteit en levenscyclus", 6026),
          ] }),
          new TableRow({ children: [
            cell("\u00ABGegevensgroeptype\u00BB", 3000, { run: { bold: true } }),
            cell("Detailgegevens die onlosmakelijk bij een objecttype horen", 6026),
          ] }),
          new TableRow({ children: [
            cell("\u00ABKoppelklasse\u00BB", 3000, { run: { bold: true } }),
            cell("Relatieobject met eigen attributen (associatieklasse)", 6026),
          ] }),
          new TableRow({ children: [
            cell("\u00ABEnumeratie\u00BB", 3000, { run: { bold: true } }),
            cell("Vaste waardelijst (codelijst)", 6026),
          ] }),
        ] }),

        heading2("A.3 Diagram"),
        para("Het volledige logisch informatiemodel is weergegeven in onderstaand UML-klassendiagram:"),

        new Paragraph({
          spacing: { before: 200, after: 200 },
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              data: mimData,
              transformation: { width: 700, height: 500 },
            }),
          ],
        }),

        para("Het PlantUML-bronbestand (mim-informatiemodel.puml) en het gegenereerde SVG-bestand zijn onderdeel van de broncode van het prototype en kunnen worden gebruikt voor verdere doorontwikkeling van het informatiemodel."),

        heading2("A.4 Kerncijfers datamodel"),
        new Table({ width: { size: 9026, type: WidthType.DXA }, rows: [
          new TableRow({ children: [
            headerCell("Kenmerk", 5000),
            headerCell("Aantal", 4026),
          ] }),
          new TableRow({ children: [
            cell("Objecttypen", 5000),
            cell("20", 4026),
          ] }),
          new TableRow({ children: [
            cell("Koppelklassen (relatieobjecten)", 5000),
            cell("6", 4026),
          ] }),
          new TableRow({ children: [
            cell("Enumeraties (waardelijsten)", 5000),
            cell("4", 4026),
          ] }),
          new TableRow({ children: [
            cell("Totaal attributen", 5000),
            cell("ca. 120", 4026),
          ] }),
          new TableRow({ children: [
            cell("Relatiesoorten", 5000),
            cell("ca. 25", 4026),
          ] }),
        ] }),
      ],
    },
  ],
});

const outputPath = "/Users/toineschijvenaars/claude/softwarecatalogus/docs/advies-voorzieningencatalogus-vng.docx";
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outputPath, buffer);
  console.log("Document created:", outputPath);
});
