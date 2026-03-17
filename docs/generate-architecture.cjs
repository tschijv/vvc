const pptxgen = require("pptxgenjs");
const path = require("path");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "VNG Voorzieningencatalogus";
pres.title = "Architectuurdocument VNG Voorzieningencatalogus";

// Brand colors
const BLUE = "1A6CA8";
const DARK_BLUE = "0D4F7A";
const ORANGE = "E35B10";
const WHITE = "FFFFFF";
const LIGHT_GRAY = "F5F7FA";
const DARK = "1E293B";
const MED_GRAY = "64748B";

// Helper: fresh shadow each time (pptxgenjs mutates objects)
const makeShadow = () => ({ type: "outer", blur: 4, offset: 2, angle: 135, color: "000000", opacity: 0.1 });

// ─── Slide 1: Title ────────────────────────────────────────
let s1 = pres.addSlide();
s1.background = { color: DARK_BLUE };
// Orange accent bar at top
s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.08, fill: { color: ORANGE } });
s1.addText("Architectuurdocument", {
  x: 0.8, y: 1.2, w: 8.4, h: 1.0,
  fontSize: 40, fontFace: "Georgia", color: WHITE, bold: true, margin: 0
});
s1.addText("VNG Voorzieningencatalogus", {
  x: 0.8, y: 2.1, w: 8.4, h: 0.8,
  fontSize: 32, fontFace: "Georgia", color: ORANGE, margin: 0
});
s1.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 3.1, w: 2.5, h: 0.04, fill: { color: ORANGE } });
s1.addText("Conform NORA Vijflagenmodel", {
  x: 0.8, y: 3.4, w: 8.4, h: 0.5,
  fontSize: 18, fontFace: "Calibri", color: WHITE, italic: true, margin: 0
});
s1.addText("Maart 2026", {
  x: 0.8, y: 4.6, w: 8.4, h: 0.4,
  fontSize: 14, fontFace: "Calibri", color: MED_GRAY, margin: 0
});

// ─── Slide 2: Inhoudsopgave ───────────────────────────────
let s2 = pres.addSlide();
s2.background = { color: WHITE };
s2.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.08, fill: { color: ORANGE } });
s2.addText("Inhoudsopgave", {
  x: 0.8, y: 0.3, w: 8.4, h: 0.7,
  fontSize: 32, fontFace: "Georgia", color: DARK_BLUE, bold: true, margin: 0
});
s2.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 1.0, w: 1.5, h: 0.04, fill: { color: ORANGE } });

const tocItems = [
  { num: "01", title: "NORA Vijflagenmodel", sub: "Overzicht van het raamwerk" },
  { num: "02", title: "Grondslagenlaag", sub: "Wet- en regelgeving, beleidskaders" },
  { num: "03", title: "Organisatorische laag", sub: "Stakeholders, processen en rollen" },
  { num: "04", title: "Informatielaag", sub: "Kernentiteiten en datavolumes" },
  { num: "05", title: "Applicatielaag", sub: "Frontend, backend en middleware" },
  { num: "06", title: "IT-Infrastructuurlaag", sub: "Hosting, database en netwerk" },
  { num: "07", title: "Softwarearchitectuur", sub: "Componenten, datamodel en deployment" },
  { num: "08", title: "Technologie Stack", sub: "Versies en Common Ground positionering" },
];
tocItems.forEach((item, i) => {
  const y = 1.3 + i * 0.5;
  s2.addText(item.num, { x: 0.8, y, w: 0.6, h: 0.4, fontSize: 16, fontFace: "Georgia", color: ORANGE, bold: true, margin: 0 });
  s2.addText(item.title, { x: 1.5, y, w: 3.5, h: 0.25, fontSize: 14, fontFace: "Calibri", color: DARK, bold: true, margin: 0 });
  s2.addText(item.sub, { x: 1.5, y: y + 0.22, w: 5, h: 0.2, fontSize: 10, fontFace: "Calibri", color: MED_GRAY, margin: 0 });
});

// ─── Slide 3: NORA Vijflagenmodel Overzicht ───────────────
let s3 = pres.addSlide();
s3.background = { color: LIGHT_GRAY };
s3.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.08, fill: { color: ORANGE } });
s3.addText("NORA Vijflagenmodel", {
  x: 0.8, y: 0.3, w: 8.4, h: 0.7,
  fontSize: 28, fontFace: "Georgia", color: DARK_BLUE, bold: true, margin: 0
});

const layers = [
  { name: "1. Grondslagenlaag", desc: "Wet- en regelgeving, beleidskaders en principes", color: "2D4A7A" },
  { name: "2. Organisatorische laag", desc: "Stakeholders, processen en rollen", color: "1A6CA8" },
  { name: "3. Informatielaag", desc: "Data-entiteiten, informatiestromen en gegevensstandaarden", color: "2980B9" },
  { name: "4. Applicatielaag", desc: "Software, componenten en integraties", color: "3498DB" },
  { name: "5. IT-Infrastructuurlaag", desc: "Hosting, netwerk en beveiliging", color: "5DADE2" },
];
layers.forEach((layer, i) => {
  const y = 1.2 + i * 0.82;
  const w = 7.0 - i * 0.3;
  const x = (10 - w) / 2;
  s3.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h: 0.7,
    fill: { color: layer.color },
    shadow: makeShadow()
  });
  s3.addText(layer.name, { x: x + 0.3, y, w: w - 0.6, h: 0.4, fontSize: 14, fontFace: "Calibri", color: WHITE, bold: true, margin: 0 });
  s3.addText(layer.desc, { x: x + 0.3, y: y + 0.35, w: w - 0.6, h: 0.3, fontSize: 10, fontFace: "Calibri", color: WHITE, margin: 0 });
});

// ─── Slide 4: Grondslagenlaag ─────────────────────────────
let s4 = pres.addSlide();
s4.background = { color: WHITE };
s4.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.08, fill: { color: ORANGE } });
s4.addText("Laag 1 — Grondslagenlaag", {
  x: 0.8, y: 0.3, w: 8.4, h: 0.6,
  fontSize: 26, fontFace: "Georgia", color: DARK_BLUE, bold: true, margin: 0
});
s4.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 0.9, w: 1.5, h: 0.04, fill: { color: ORANGE } });

const grondslagCards = [
  { title: "Wet- en regelgeving", items: "Gemeentewet\nArchiefwet\nAVG / GDPR\nWet open overheid (Woo)" },
  { title: "Beleidskaders", items: "Common Ground\nGEMMA referentiearchitectuur\nNORA principes\nInformatiebeveiliging (BIO)" },
  { title: "Standaarden", items: "GEMMA standaarden\nStUF\nZGW API's\nSemantische standaarden" },
  { title: "Principes", items: "Open en transparant\nHerbruikbaar\nFederatief\nVeilig en betrouwbaar" },
];
grondslagCards.forEach((card, i) => {
  const x = 0.5 + i * 2.35;
  s4.addShape(pres.shapes.RECTANGLE, {
    x, y: 1.2, w: 2.15, h: 3.8,
    fill: { color: WHITE },
    shadow: makeShadow(),
    line: { color: "E2E8F0", width: 1 }
  });
  s4.addShape(pres.shapes.RECTANGLE, { x, y: 1.2, w: 2.15, h: 0.5, fill: { color: DARK_BLUE } });
  s4.addText(card.title, { x: x + 0.15, y: 1.25, w: 1.85, h: 0.4, fontSize: 11, fontFace: "Calibri", color: WHITE, bold: true, margin: 0 });
  s4.addText(card.items.split("\n").map((t, j) => ({
    text: t, options: { bullet: true, breakLine: j < card.items.split("\n").length - 1, fontSize: 10, color: DARK }
  })), { x: x + 0.15, y: 1.85, w: 1.85, h: 3.0 });
});

// ─── Slide 5: Organisatorische laag ───────────────────────
let s5 = pres.addSlide();
s5.background = { color: LIGHT_GRAY };
s5.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.08, fill: { color: ORANGE } });
s5.addText("Laag 2 — Organisatorische laag", {
  x: 0.8, y: 0.3, w: 8.4, h: 0.6,
  fontSize: 26, fontFace: "Georgia", color: DARK_BLUE, bold: true, margin: 0
});

// Stakeholders row
s5.addText("Stakeholders", { x: 0.8, y: 1.1, w: 3, h: 0.35, fontSize: 14, fontFace: "Calibri", color: ORANGE, bold: true, margin: 0 });
const stakeholders = [
  { label: "VNG Realisatie", value: "Beheerder" },
  { label: "Gemeenten", value: "342" },
  { label: "Leveranciers", value: "314" },
  { label: "Samenwerkingen", value: "84" },
];
stakeholders.forEach((sh, i) => {
  const x = 0.5 + i * 2.3;
  s5.addShape(pres.shapes.RECTANGLE, { x, y: 1.5, w: 2.1, h: 1.1, fill: { color: WHITE }, shadow: makeShadow() });
  s5.addText(sh.value, { x, y: 1.55, w: 2.1, h: 0.55, fontSize: 28, fontFace: "Georgia", color: BLUE, bold: true, align: "center", margin: 0 });
  s5.addText(sh.label, { x, y: 2.1, w: 2.1, h: 0.4, fontSize: 11, fontFace: "Calibri", color: MED_GRAY, align: "center", margin: 0 });
});

// Processen & Rollen
s5.addText("Processen", { x: 0.8, y: 2.9, w: 3, h: 0.35, fontSize: 14, fontFace: "Calibri", color: ORANGE, bold: true, margin: 0 });
const processen = ["Pakketregistratie", "Compliancy monitoring", "Marktoriëntatie", "Applicatieportfoliobeheer"];
s5.addText(processen.map((p, i) => ({
  text: p, options: { bullet: true, breakLine: i < processen.length - 1, fontSize: 12, color: DARK }
})), { x: 0.8, y: 3.3, w: 4, h: 1.8 });

s5.addText("Rollen", { x: 5.5, y: 2.9, w: 3, h: 0.35, fontSize: 14, fontFace: "Calibri", color: ORANGE, bold: true, margin: 0 });
const rollen = ["Gemeentegebruiker", "Leverancier", "Beheerder VC", "Samenwerkingscoördinator"];
s5.addText(rollen.map((r, i) => ({
  text: r, options: { bullet: true, breakLine: i < rollen.length - 1, fontSize: 12, color: DARK }
})), { x: 5.5, y: 3.3, w: 4, h: 1.8 });

// ─── Slide 6: Informatielaag ──────────────────────────────
let s6 = pres.addSlide();
s6.background = { color: WHITE };
s6.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.08, fill: { color: ORANGE } });
s6.addText("Laag 3 — Informatielaag", {
  x: 0.8, y: 0.3, w: 8.4, h: 0.6,
  fontSize: 26, fontFace: "Georgia", color: DARK_BLUE, bold: true, margin: 0
});

// Data volumes as big numbers
s6.addText("Datavolumes", { x: 0.8, y: 1.0, w: 3, h: 0.35, fontSize: 14, fontFace: "Calibri", color: ORANGE, bold: true, margin: 0 });
const volumes = [
  { num: "1.133", label: "Pakketten" },
  { num: "314", label: "Leveranciers" },
  { num: "306", label: "Gemeenten" },
  { num: "64", label: "Referentiecomponenten" },
  { num: "69", label: "Standaardversies" },
];
volumes.forEach((v, i) => {
  const x = 0.4 + i * 1.85;
  s6.addShape(pres.shapes.RECTANGLE, { x, y: 1.4, w: 1.7, h: 1.0, fill: { color: LIGHT_GRAY }, shadow: makeShadow() });
  s6.addText(v.num, { x, y: 1.42, w: 1.7, h: 0.55, fontSize: 22, fontFace: "Georgia", color: BLUE, bold: true, align: "center", margin: 0 });
  s6.addText(v.label, { x, y: 1.95, w: 1.7, h: 0.35, fontSize: 9, fontFace: "Calibri", color: MED_GRAY, align: "center", margin: 0 });
});

// Kernentiteiten
s6.addText("Kernentiteiten", { x: 0.8, y: 2.7, w: 3, h: 0.35, fontSize: 14, fontFace: "Calibri", color: ORANGE, bold: true, margin: 0 });
const entities = [
  ["Pakket", "Pakketversie", "Leverancier"],
  ["Gemeente", "Referentiecomponent", "Standaard"],
  ["Standaardversie", "Applicatiefunctie", "Samenwerking"],
];
entities.forEach((row, ri) => {
  row.forEach((ent, ci) => {
    const x = 0.8 + ci * 3.0;
    const y = 3.15 + ri * 0.55;
    s6.addShape(pres.shapes.RECTANGLE, { x, y, w: 2.8, h: 0.45, fill: { color: ri === 0 ? BLUE : "E8F0FE" }, shadow: makeShadow() });
    s6.addText(ent, { x, y, w: 2.8, h: 0.45, fontSize: 11, fontFace: "Calibri", color: ri === 0 ? WHITE : DARK, bold: ri === 0, align: "center", valign: "middle", margin: 0 });
  });
});

// ─── Slide 7: Applicatielaag ──────────────────────────────
let s7 = pres.addSlide();
s7.background = { color: LIGHT_GRAY };
s7.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.08, fill: { color: ORANGE } });
s7.addText("Laag 4 — Applicatielaag", {
  x: 0.8, y: 0.3, w: 8.4, h: 0.6,
  fontSize: 26, fontFace: "Georgia", color: DARK_BLUE, bold: true, margin: 0
});

// Left: tech stack cards
const appCards = [
  { title: "Frontend", desc: "Next.js 16 (App Router)\nReact 19 Server Components\nTailwind CSS 4" },
  { title: "Backend", desc: "Next.js Server Components\nServer-side rendering (SSR)\nPrisma 7 ORM" },
  { title: "Authenticatie", desc: "Basic Auth middleware\nDevelopment: geen auth\nProductie: username/password" },
];
appCards.forEach((card, i) => {
  const y = 1.1 + i * 1.45;
  s7.addShape(pres.shapes.RECTANGLE, { x: 0.5, y, w: 4.2, h: 1.3, fill: { color: WHITE }, shadow: makeShadow() });
  s7.addShape(pres.shapes.RECTANGLE, { x: 0.5, y, w: 0.08, h: 1.3, fill: { color: ORANGE } });
  s7.addText(card.title, { x: 0.8, y: y + 0.08, w: 3.7, h: 0.3, fontSize: 13, fontFace: "Calibri", color: DARK_BLUE, bold: true, margin: 0 });
  s7.addText(card.desc, { x: 0.8, y: y + 0.4, w: 3.7, h: 0.8, fontSize: 10, fontFace: "Calibri", color: DARK, margin: 0 });
});

// Right: pages list
s7.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.1, w: 4.3, h: 4.2, fill: { color: WHITE }, shadow: makeShadow() });
s7.addText("Pagina's", { x: 5.5, y: 1.2, w: 3.8, h: 0.35, fontSize: 14, fontFace: "Calibri", color: ORANGE, bold: true, margin: 0 });
const pages = [
  "Homepage (dashboard met statistieken)",
  "Pakketten (lijst + zoeken + filteren)",
  "Pakket detail (versies, standaarden, functionaliteit)",
  "Leveranciers (lijst + zoeken)",
  "Leverancier detail (contactinfo, pakketten)",
  "Gemeenten (lijst + voortgang)",
  "Gemeente detail (applicatieportfolio)",
  "Standaarden (overzicht)",
  "Referentiecomponenten (overzicht)",
  "Zoeken (globale zoekfunctie)",
];
s7.addText(pages.map((p, i) => ({
  text: p, options: { bullet: true, breakLine: i < pages.length - 1, fontSize: 10, color: DARK }
})), { x: 5.5, y: 1.65, w: 3.8, h: 3.5 });

// ─── Slide 8: IT-Infrastructuurlaag ───────────────────────
let s8 = pres.addSlide();
s8.background = { color: WHITE };
s8.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.08, fill: { color: ORANGE } });
s8.addText("Laag 5 — IT-Infrastructuurlaag", {
  x: 0.8, y: 0.3, w: 8.4, h: 0.6,
  fontSize: 26, fontFace: "Georgia", color: DARK_BLUE, bold: true, margin: 0
});

const infraCards = [
  { title: "Hosting", value: "Vercel", desc: "Serverless edge network\nAutomatische SSL/TLS\nGlobaal CDN" },
  { title: "Database", value: "Neon PostgreSQL", desc: "Serverless PostgreSQL\nEU-Central-1 (Frankfurt)\nAutomatische backups" },
  { title: "Netwerk", value: "Edge Network", desc: "Vercel Edge Functions\nDDoS bescherming\nHTTP/2 + HTTP/3" },
];
infraCards.forEach((card, i) => {
  const x = 0.5 + i * 3.1;
  s8.addShape(pres.shapes.RECTANGLE, { x, y: 1.2, w: 2.9, h: 3.5, fill: { color: LIGHT_GRAY }, shadow: makeShadow() });
  s8.addShape(pres.shapes.RECTANGLE, { x, y: 1.2, w: 2.9, h: 0.08, fill: { color: BLUE } });
  s8.addText(card.title, { x: x + 0.2, y: 1.45, w: 2.5, h: 0.3, fontSize: 12, fontFace: "Calibri", color: MED_GRAY, margin: 0 });
  s8.addText(card.value, { x: x + 0.2, y: 1.75, w: 2.5, h: 0.45, fontSize: 20, fontFace: "Georgia", color: DARK_BLUE, bold: true, margin: 0 });
  s8.addShape(pres.shapes.RECTANGLE, { x: x + 0.2, y: 2.25, w: 1.2, h: 0.03, fill: { color: ORANGE } });
  s8.addText(card.desc, { x: x + 0.2, y: 2.45, w: 2.5, h: 2.0, fontSize: 11, fontFace: "Calibri", color: DARK, margin: 0 });
});

// Domain
s8.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.9, w: 9.0, h: 0.5, fill: { color: DARK_BLUE } });
s8.addText("voorzieningencatalogus.vercel.app", { x: 0.5, y: 4.9, w: 9.0, h: 0.5, fontSize: 16, fontFace: "Calibri", color: WHITE, align: "center", valign: "middle", margin: 0 });

// ─── Slide 9: Componentendiagram ──────────────────────────
let s9 = pres.addSlide();
s9.background = { color: LIGHT_GRAY };
s9.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.08, fill: { color: ORANGE } });
s9.addText("Softwarearchitectuur — Componentendiagram", {
  x: 0.8, y: 0.3, w: 8.4, h: 0.6,
  fontSize: 24, fontFace: "Georgia", color: DARK_BLUE, bold: true, margin: 0
});

// Component boxes
const comps = [
  { x: 0.5, y: 1.2, w: 2.0, h: 0.8, label: "Browser", color: "E8F0FE", textColor: DARK },
  { x: 3.2, y: 1.2, w: 2.2, h: 0.8, label: "Vercel Edge\n(Auth Middleware)", color: ORANGE, textColor: WHITE },
  { x: 6.2, y: 1.2, w: 2.5, h: 0.8, label: "Next.js App Router\n(Server Components)", color: BLUE, textColor: WHITE },
  { x: 3.2, y: 2.6, w: 2.2, h: 0.8, label: "Vercel CDN\n(Static Assets)", color: "5DADE2", textColor: WHITE },
  { x: 6.2, y: 2.6, w: 2.5, h: 0.8, label: "Prisma 7 ORM\n(PrismaPg Adapter)", color: "2D4A7A", textColor: WHITE },
  { x: 6.2, y: 4.0, w: 2.5, h: 0.8, label: "Neon PostgreSQL\n(EU-Central-1)", color: DARK_BLUE, textColor: WHITE },
  { x: 0.5, y: 4.0, w: 2.0, h: 0.8, label: "CSV Export\n(seed.ts)", color: "F5E6D3", textColor: DARK },
];
comps.forEach((c) => {
  s9.addShape(pres.shapes.RECTANGLE, { x: c.x, y: c.y, w: c.w, h: c.h, fill: { color: c.color }, shadow: makeShadow() });
  s9.addText(c.label, { x: c.x, y: c.y, w: c.w, h: c.h, fontSize: 10, fontFace: "Calibri", color: c.textColor, bold: true, align: "center", valign: "middle", margin: 0 });
});

// Arrows (using lines)
// Browser → Edge
s9.addShape(pres.shapes.LINE, { x: 2.5, y: 1.6, w: 0.7, h: 0, line: { color: MED_GRAY, width: 2 } });
// Edge → App Router
s9.addShape(pres.shapes.LINE, { x: 5.4, y: 1.6, w: 0.8, h: 0, line: { color: MED_GRAY, width: 2 } });
// App Router → Prisma
s9.addShape(pres.shapes.LINE, { x: 7.45, y: 2.0, w: 0, h: 0.6, line: { color: MED_GRAY, width: 2 } });
// Prisma → DB
s9.addShape(pres.shapes.LINE, { x: 7.45, y: 3.4, w: 0, h: 0.6, line: { color: MED_GRAY, width: 2 } });
// CSV → DB
s9.addShape(pres.shapes.LINE, { x: 2.5, y: 4.4, w: 3.7, h: 0, line: { color: MED_GRAY, width: 2, dashType: "dash" } });

// Labels on arrows
s9.addText("HTTP", { x: 2.5, y: 1.25, w: 0.7, h: 0.3, fontSize: 8, fontFace: "Calibri", color: MED_GRAY, align: "center", margin: 0 });
s9.addText("SSR", { x: 5.4, y: 1.25, w: 0.8, h: 0.3, fontSize: 8, fontFace: "Calibri", color: MED_GRAY, align: "center", margin: 0 });
s9.addText("SQL", { x: 7.7, y: 3.5, w: 0.5, h: 0.3, fontSize: 8, fontFace: "Calibri", color: MED_GRAY, margin: 0 });
s9.addText("Data Import", { x: 3.0, y: 4.05, w: 1.5, h: 0.3, fontSize: 8, fontFace: "Calibri", color: MED_GRAY, align: "center", margin: 0 });

// ─── Slide 10: Datamodel ──────────────────────────────────
let s10 = pres.addSlide();
s10.background = { color: WHITE };
s10.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.08, fill: { color: ORANGE } });
s10.addText("Datamodel (Entity Relationship Diagram)", {
  x: 0.8, y: 0.3, w: 8.4, h: 0.6,
  fontSize: 24, fontFace: "Georgia", color: DARK_BLUE, bold: true, margin: 0
});

// Entities as boxes with relations
const erdEntities = [
  { x: 0.5, y: 1.2, w: 2.0, h: 0.6, label: "Leverancier", color: BLUE },
  { x: 3.5, y: 1.2, w: 2.0, h: 0.6, label: "Pakket", color: BLUE },
  { x: 6.5, y: 1.2, w: 2.5, h: 0.6, label: "Pakketversie", color: DARK_BLUE },
  { x: 0.5, y: 2.5, w: 2.0, h: 0.6, label: "Addendum", color: "5DADE2" },
  { x: 6.5, y: 2.5, w: 2.5, h: 0.6, label: "Referentiecomponent", color: "2980B9" },
  { x: 6.5, y: 3.4, w: 2.5, h: 0.6, label: "Standaardversie", color: "2980B9" },
  { x: 6.5, y: 4.3, w: 2.5, h: 0.6, label: "Applicatiefunctie", color: "2980B9" },
  { x: 3.5, y: 3.4, w: 2.0, h: 0.6, label: "Gemeente", color: ORANGE },
  { x: 3.5, y: 4.3, w: 2.0, h: 0.6, label: "Samenwerking", color: ORANGE },
];
erdEntities.forEach((ent) => {
  s10.addShape(pres.shapes.RECTANGLE, { x: ent.x, y: ent.y, w: ent.w, h: ent.h, fill: { color: ent.color }, shadow: makeShadow() });
  s10.addText(ent.label, { x: ent.x, y: ent.y, w: ent.w, h: ent.h, fontSize: 11, fontFace: "Calibri", color: WHITE, bold: true, align: "center", valign: "middle", margin: 0 });
});

// Relation labels
const relations = [
  { x: 2.5, y: 1.35, w: 1.0, label: "1:N" },
  { x: 5.5, y: 1.35, w: 1.0, label: "1:N" },
  { x: 1.2, y: 1.8, w: 0.6, label: "N:M" },
  { x: 5.7, y: 2.6, w: 0.8, label: "N:M" },
  { x: 5.7, y: 3.5, w: 0.8, label: "N:M" },
  { x: 5.7, y: 4.4, w: 0.8, label: "N:M" },
  { x: 4.2, y: 2.5, w: 0.8, label: "N:M" },
  { x: 4.2, y: 3.95, w: 0.8, label: "N:M" },
];
relations.forEach((r) => {
  s10.addText(r.label, { x: r.x, y: r.y, w: r.w, h: 0.25, fontSize: 8, fontFace: "Calibri", color: MED_GRAY, align: "center", margin: 0 });
});
// Lines
s10.addShape(pres.shapes.LINE, { x: 2.5, y: 1.5, w: 1.0, h: 0, line: { color: MED_GRAY, width: 1.5 } });
s10.addShape(pres.shapes.LINE, { x: 5.5, y: 1.5, w: 1.0, h: 0, line: { color: MED_GRAY, width: 1.5 } });
s10.addShape(pres.shapes.LINE, { x: 1.5, y: 1.8, w: 0, h: 0.7, line: { color: MED_GRAY, width: 1.5 } });
// Pakketversie → refcomp/standaard/appfunctie
s10.addShape(pres.shapes.LINE, { x: 7.75, y: 1.8, w: 0, h: 0.7, line: { color: MED_GRAY, width: 1.5 } });
s10.addShape(pres.shapes.LINE, { x: 7.75, y: 3.1, w: 0, h: 0.3, line: { color: MED_GRAY, width: 1.5 } });
s10.addShape(pres.shapes.LINE, { x: 7.75, y: 4.0, w: 0, h: 0.3, line: { color: MED_GRAY, width: 1.5 } });
// Pakketversie → Gemeente
s10.addShape(pres.shapes.LINE, { x: 5.5, y: 3.7, w: 1.0, h: 0, line: { color: MED_GRAY, width: 1.5 } });
// Gemeente → Samenwerking
s10.addShape(pres.shapes.LINE, { x: 4.5, y: 4.0, w: 0, h: 0.3, line: { color: MED_GRAY, width: 1.5 } });

// ─── Slide 11: Deployment ─────────────────────────────────
let s11 = pres.addSlide();
s11.background = { color: LIGHT_GRAY };
s11.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.08, fill: { color: ORANGE } });
s11.addText("Deployment Architectuur", {
  x: 0.8, y: 0.3, w: 8.4, h: 0.6,
  fontSize: 26, fontFace: "Georgia", color: DARK_BLUE, bold: true, margin: 0
});

// Development environment
s11.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.1, w: 4.2, h: 3.5, fill: { color: WHITE }, shadow: makeShadow() });
s11.addText("Development", { x: 0.7, y: 1.2, w: 3.8, h: 0.4, fontSize: 16, fontFace: "Georgia", color: BLUE, bold: true, margin: 0 });
s11.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.65, w: 1.5, h: 0.03, fill: { color: ORANGE } });
const devItems = [
  "localhost:3000 (Next.js dev server)",
  "Lokale PostgreSQL database",
  "Hot module replacement",
  "Geen authenticatie (middleware skip)",
  "npm run dev",
];
s11.addText(devItems.map((d, i) => ({
  text: d, options: { bullet: true, breakLine: i < devItems.length - 1, fontSize: 11, color: DARK }
})), { x: 0.7, y: 1.85, w: 3.8, h: 2.5 });

// Production environment
s11.addShape(pres.shapes.RECTANGLE, { x: 5.3, y: 1.1, w: 4.2, h: 3.5, fill: { color: WHITE }, shadow: makeShadow() });
s11.addText("Production", { x: 5.5, y: 1.2, w: 3.8, h: 0.4, fontSize: 16, fontFace: "Georgia", color: ORANGE, bold: true, margin: 0 });
s11.addShape(pres.shapes.RECTANGLE, { x: 5.5, y: 1.65, w: 1.5, h: 0.03, fill: { color: ORANGE } });
const prodItems = [
  "Vercel Serverless (auto-deploy)",
  "Neon PostgreSQL (EU-Central-1)",
  "Basic Auth middleware actief",
  "Vercel CLI deploy",
  "Environment variables beheer",
];
s11.addText(prodItems.map((d, i) => ({
  text: d, options: { bullet: true, breakLine: i < prodItems.length - 1, fontSize: 11, color: DARK }
})), { x: 5.5, y: 1.85, w: 3.8, h: 2.5 });

// Env vars bar
s11.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.8, w: 9.0, h: 0.5, fill: { color: DARK_BLUE } });
s11.addText("Environment: DATABASE_URL  |  BASIC_AUTH_USER  |  BASIC_AUTH_PASS", {
  x: 0.5, y: 4.8, w: 9.0, h: 0.5, fontSize: 11, fontFace: "Calibri", color: WHITE, align: "center", valign: "middle", margin: 0
});

// ─── Slide 12: Technologie Stack ──────────────────────────
let s12 = pres.addSlide();
s12.background = { color: WHITE };
s12.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.08, fill: { color: ORANGE } });
s12.addText("Technologie Stack", {
  x: 0.8, y: 0.3, w: 8.4, h: 0.6,
  fontSize: 26, fontFace: "Georgia", color: DARK_BLUE, bold: true, margin: 0
});

const techRows = [
  [
    { text: "Component", options: { bold: true, color: WHITE, fill: { color: DARK_BLUE }, fontSize: 12, align: "left" } },
    { text: "Technologie", options: { bold: true, color: WHITE, fill: { color: DARK_BLUE }, fontSize: 12, align: "left" } },
    { text: "Versie", options: { bold: true, color: WHITE, fill: { color: DARK_BLUE }, fontSize: 12, align: "left" } },
  ],
  [{ text: "Framework", options: { fontSize: 11 } }, { text: "Next.js (App Router)", options: { fontSize: 11, bold: true } }, { text: "16.1.6", options: { fontSize: 11 } }],
  [{ text: "UI Library", options: { fontSize: 11, fill: { color: LIGHT_GRAY } } }, { text: "React", options: { fontSize: 11, bold: true, fill: { color: LIGHT_GRAY } } }, { text: "19.2.3", options: { fontSize: 11, fill: { color: LIGHT_GRAY } } }],
  [{ text: "Language", options: { fontSize: 11 } }, { text: "TypeScript", options: { fontSize: 11, bold: true } }, { text: "5.x", options: { fontSize: 11 } }],
  [{ text: "Styling", options: { fontSize: 11, fill: { color: LIGHT_GRAY } } }, { text: "Tailwind CSS", options: { fontSize: 11, bold: true, fill: { color: LIGHT_GRAY } } }, { text: "4.x", options: { fontSize: 11, fill: { color: LIGHT_GRAY } } }],
  [{ text: "ORM", options: { fontSize: 11 } }, { text: "Prisma", options: { fontSize: 11, bold: true } }, { text: "7.5.0", options: { fontSize: 11 } }],
  [{ text: "Database", options: { fontSize: 11, fill: { color: LIGHT_GRAY } } }, { text: "PostgreSQL (Neon)", options: { fontSize: 11, bold: true, fill: { color: LIGHT_GRAY } } }, { text: "17", options: { fontSize: 11, fill: { color: LIGHT_GRAY } } }],
  [{ text: "Hosting", options: { fontSize: 11 } }, { text: "Vercel", options: { fontSize: 11, bold: true } }, { text: "Serverless", options: { fontSize: 11 } }],
  [{ text: "Data Import", options: { fontSize: 11, fill: { color: LIGHT_GRAY } } }, { text: "csv-parse + ts-node", options: { fontSize: 11, bold: true, fill: { color: LIGHT_GRAY } } }, { text: "6.1 / 10.9", options: { fontSize: 11, fill: { color: LIGHT_GRAY } } }],
  [{ text: "DB Adapter", options: { fontSize: 11 } }, { text: "@prisma/adapter-pg", options: { fontSize: 11, bold: true } }, { text: "7.5.0", options: { fontSize: 11 } }],
];
s12.addTable(techRows, {
  x: 0.8, y: 1.1, w: 8.4,
  colW: [2.5, 3.5, 2.4],
  border: { pt: 0.5, color: "E2E8F0" },
  rowH: [0.4, 0.35, 0.35, 0.35, 0.35, 0.35, 0.35, 0.35, 0.35, 0.35],
});

// ─── Slide 13: Common Ground ──────────────────────────────
let s13 = pres.addSlide();
s13.background = { color: LIGHT_GRAY };
s13.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.08, fill: { color: ORANGE } });
s13.addText("Common Ground — Positionering", {
  x: 0.8, y: 0.3, w: 8.4, h: 0.6,
  fontSize: 26, fontFace: "Georgia", color: DARK_BLUE, bold: true, margin: 0
});

const cgLayers = [
  { name: "Interactielaag", desc: "Voorzieningencatalogus webapplicatie\n(Next.js + React)", color: ORANGE },
  { name: "Proceslaag", desc: "Server-side rendering\nData queries & filtering", color: "E35B10" },
  { name: "Integratielaag", desc: "Prisma ORM\nPostgreSQL adapter (PrismaPg)", color: BLUE },
  { name: "Servicelaag", desc: "PostgreSQL database services\nData seed & import pipeline", color: "1A6CA8" },
  { name: "Datalaag", desc: "Neon PostgreSQL (cloud-native)\nEU-Central-1 Frankfurt", color: DARK_BLUE },
];
cgLayers.forEach((layer, i) => {
  const y = 1.1 + i * 0.88;
  s13.addShape(pres.shapes.RECTANGLE, { x: 0.5, y, w: 9.0, h: 0.75, fill: { color: layer.color }, shadow: makeShadow() });
  s13.addText(layer.name, { x: 0.8, y: y + 0.05, w: 2.5, h: 0.3, fontSize: 14, fontFace: "Georgia", color: WHITE, bold: true, margin: 0 });
  s13.addText(layer.desc, { x: 3.5, y: y + 0.05, w: 5.5, h: 0.65, fontSize: 11, fontFace: "Calibri", color: WHITE, margin: 0 });
});

// ─── Save ─────────────────────────────────────────────────
const outPath = path.join(__dirname, "architectuur-voorzieningencatalogus.pptx");
pres.writeFile({ fileName: outPath }).then(() => {
  console.log("Presentatie opgeslagen:", outPath);
}).catch((err) => {
  console.error("Fout:", err);
});
