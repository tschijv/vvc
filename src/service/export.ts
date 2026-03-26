import { prisma } from "@/data/prisma";
import { createHash } from "crypto";

const GEMMA_API = "https://www.gemmaonline.nl/api.php";

// ─── Types ──────────────────────────────────────────────────────────────────────

interface OrganisatiePakketRow {
  leverancier: string;
  pakketNaam: string;
  pakketversieNaam: string;
  omschrijving: string;
  omschrijvingGebruik: string;
  referentiecomponenten: string;
  status: string;
  datumIngangStatus: string;
  technologie: string;
  externPakket: string;
  pakketId: string;
  pakketversieId: string;
  organisatie: string;
}

// ─── Pakketoverzicht CSV (comma-separated) ──────────────────────────────────────

export async function generatePakketoverzichtCsv(
  organisatieId: string
): Promise<{ csv: string; organisatieNaam: string }> {
  const organisatie = await prisma.organisatie.findUnique({
    where: { id: organisatieId },
  });
  if (!organisatie) throw new Error("Organisatie niet gevonden");

  const rows = await getExportRows(organisatieId, organisatie.naam);

  const headers = [
    "Leverancier",
    "Pakket Naam",
    "Pakketversie Naam",
    "Omschrijving",
    "Omschrijving gebruik",
    "Referentiecomponenten gemeente",
    "Status",
    "Datum ingang status",
    "Gebruikte technologiën",
    "Extern pakket",
    "Pakket ID",
    "Pakketversie ID",
    "Organisatie",
  ];

  const csvRows = rows.map((r) =>
    [
      r.leverancier,
      r.pakketNaam,
      r.pakketversieNaam,
      r.omschrijving,
      r.omschrijvingGebruik,
      r.referentiecomponenten,
      r.status,
      r.datumIngangStatus,
      r.technologie,
      r.externPakket,
      r.pakketId,
      r.pakketversieId,
      r.organisatie,
    ]
      .map(csvQuote)
      .join(",")
  );

  const csv = [headers.map(csvQuote).join(","), ...csvRows].join("\n") + "\n";
  return { csv, organisatieNaam: organisatie.naam };
}

// ─── IBD Foto CSV (semicolon-separated) ─────────────────────────────────────────

export async function generateIbdFotoCsv(
  organisatieId: string
): Promise<{ csv: string; organisatieNaam: string }> {
  const organisatie = await prisma.organisatie.findUnique({
    where: { id: organisatieId },
  });
  if (!organisatie) throw new Error("Organisatie niet gevonden");

  // Haal unieke pakketten op (niet per versie)
  const organisatiePakketten = await prisma.organisatiePakket.findMany({
    where: { organisatieId },
    include: {
      pakketversie: {
        include: {
          pakket: {
            include: { leverancier: true },
          },
        },
      },
    },
    orderBy: { pakketversie: { pakket: { leverancier: { naam: "asc" } } } },
  });

  // Deduplicate op pakketnaam (IBD foto toont unieke pakketten, geen versies)
  const seen = new Set<string>();
  const uniquePakketten: { leverancier: string; product: string }[] = [];

  for (const gp of organisatiePakketten) {
    const key = gp.pakketversie.pakket.naam;
    if (!seen.has(key)) {
      seen.add(key);
      uniquePakketten.push({
        leverancier: gp.pakketversie.pakket.leverancier.naam,
        product: gp.pakketversie.pakket.naam,
      });
    }
  }

  const headers = ["Leverancier", "Product", "CPE", "Type"];
  const csvRows = uniquePakketten.map((p) =>
    [
      csvQuoteSemicolon(p.leverancier),
      csvQuoteSemicolon(p.product),
      csvQuoteSemicolon(""),
      csvQuoteSemicolon("Gemeentelijke applicatie (VC)"),
    ].join(";")
  );

  const csv =
    [headers.map(csvQuoteSemicolon).join(";"), ...csvRows].join("\n") + "\n";
  return { csv, organisatieNaam: organisatie.naam };
}

// ─── AMEFF Export (ArchiMate Model Exchange File Format) ─────────────────────────
// Conform: https://www.opengroup.org/xsd/archimate/
// Schema:  http://www.opengroup.org/xsd/archimate/3.1/archimate3_Model.xsd
//
// Strategie:
//   1. Probeer GEMMA Online swcquery API met output=ameff (volledig model incl. views)
//   2. Als dat faalt: genereer zelf een standaard-conforme AMEFF 3.1 XML

export async function generateAmeffExport(
  organisatieId: string,
  viewId: string
): Promise<{ xml: string; organisatieNaam: string; viewTitel: string }> {
  const view = await prisma.gemmaView.findUnique({
    where: { id: viewId },
  });
  if (!view) throw new Error("View niet gevonden");

  const organisatie = await prisma.organisatie.findUnique({
    where: { id: organisatieId },
  });
  if (!organisatie) throw new Error("Organisatie niet gevonden");

  // Haal organisatie-pakketten op met alle benodigde relaties
  const organisatiePakketten = await prisma.organisatiePakket.findMany({
    where: { organisatieId },
    include: {
      pakketversie: {
        include: {
          pakket: { include: { leverancier: true } },
          referentiecomponenten: {
            include: { referentiecomponent: true },
          },
        },
      },
    },
  });

  // Probeer eerst de GEMMA API
  try {
    const xml = await tryGemmaAmeffApi(view, organisatie, organisatiePakketten);
    if (xml) {
      return { xml, organisatieNaam: organisatie.naam, viewTitel: view.titel };
    }
  } catch (error) {
    console.warn("GEMMA AMEFF API niet beschikbaar, gebruik lokale generator:", error);
  }

  // Fallback: genereer zelf een standaard-conforme AMEFF XML
  const xml = generateAmeffXml(view, organisatie, organisatiePakketten);
  return { xml, organisatieNaam: organisatie.naam, viewTitel: view.titel };
}

// ─── GEMMA API poging ─────────────────────────────────────────────────────────

async function tryGemmaAmeffApi(
  view: { objectId: string; modelId: string; titel: string },
  organisatie: { id: string; naam: string; cbsCode: string | null },
  organisatiePakketten: OrganisatiePakketWithRelations[]
): Promise<string | null> {
  const pakketData = buildSwcqueryPayload(view, organisatie, organisatiePakketten);

  const gemmaParams = new URLSearchParams({
    action: "swcquery",
    output: "ameff",
    view: view.objectId,
    modelid: view.modelId,
    format: "json",
  });

  const gemmaRes = await fetch(`${GEMMA_API}?${gemmaParams}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `json=${encodeURIComponent(JSON.stringify(pakketData))}`,
    signal: AbortSignal.timeout(15000),
  });

  if (!gemmaRes.ok) return null;

  const gemmaData = await gemmaRes.json();

  // De API kan base64-encoded XML of een URL retourneren
  const base64Xml =
    gemmaData?.ameff?.item?.base64 ||
    gemmaData?.ameff?.base64 ||
    gemmaData?.item?.base64;

  if (base64Xml) {
    return Buffer.from(base64Xml, "base64").toString("utf-8");
  }

  const ameffUrl =
    gemmaData?.ameff?.item?.url ||
    gemmaData?.ameff?.url ||
    gemmaData?.item?.url;

  if (ameffUrl) {
    const xmlRes = await fetch(ameffUrl);
    if (xmlRes.ok) return xmlRes.text();
  }

  return null;
}

// ─── Standaard-conforme AMEFF XML generator ─────────────────────────────────────

function generateAmeffXml(
  view: { id: string; objectId: string; titel: string; domein: string },
  organisatie: { id: string; naam: string; cbsCode: string | null },
  organisatiePakketten: OrganisatiePakketWithRelations[]
): string {
  const now = new Date().toISOString();
  const modelId = `id-${hashId(`model-${organisatie.id}-${view.id}`)}`;

  // Verzamel unieke entiteiten
  const leveranciers = new Map<string, { id: string; naam: string }>();
  const pakketten = new Map<string, { id: string; naam: string; versie: string; leverancierId: string; status: string }>();
  const refcomps = new Map<string, { id: string; naam: string; guid: string | null }>();
  const relationships: { id: string; type: string; source: string; target: string; naam?: string }[] = [];

  for (const gp of organisatiePakketten) {
    const pv = gp.pakketversie;
    const pakket = pv.pakket;
    const lev = pakket.leverancier;

    const levElementId = `id-${hashId(`lev-${lev.id}`)}`;
    const pakElementId = `id-${hashId(`pak-${pakket.id}-${pv.id}`)}`;

    if (!leveranciers.has(lev.id)) {
      leveranciers.set(lev.id, { id: levElementId, naam: lev.naam });
    }

    pakketten.set(`${pakket.id}-${pv.id}`, {
      id: pakElementId,
      naam: `${pakket.naam}${pv.naam ? ` (${pv.naam})` : ""}`,
      versie: pv.naam,
      leverancierId: lev.id,
      status: gp.status || pv.status || "In productie",
    });

    // Leverancier → Pakket (Assignment)
    relationships.push({
      id: `id-${hashId(`rel-assign-${lev.id}-${pakket.id}-${pv.id}`)}`,
      type: "Assignment",
      source: levElementId,
      target: pakElementId,
    });

    // Pakket → Referentiecomponenten (Realization)
    for (const pvrc of pv.referentiecomponenten) {
      const rc = pvrc.referentiecomponent;
      const rcElementId = `id-${hashId(`rc-${rc.id}`)}`;

      if (!refcomps.has(rc.id)) {
        refcomps.set(rc.id, { id: rcElementId, naam: rc.naam, guid: rc.guid });
      }

      relationships.push({
        id: `id-${hashId(`rel-real-${pakket.id}-${pv.id}-${rc.id}`)}`,
        type: "Realization",
        source: pakElementId,
        target: rcElementId,
      });
    }
  }

  // PropertyDefinitions
  const propDefs = [
    { id: "id-propdef-status", naam: "Status", type: "string" },
    { id: "id-propdef-versie", naam: "Versie", type: "string" },
    { id: "id-propdef-guid", naam: "GUID", type: "string" },
    { id: "id-propdef-organisatie", naam: "Organisatie", type: "string" },
    { id: "id-propdef-cbscode", naam: "CBS-code", type: "string" },
    { id: "id-propdef-bron", naam: "Bron", type: "string" },
    { id: "id-propdef-exportdatum", naam: "Exportdatum", type: "string" },
    { id: "id-propdef-view", naam: "View", type: "string" },
  ];

  // Build XML
  const lines: string[] = [];
  lines.push(`<?xml version="1.0" encoding="utf-8"?>`);
  lines.push(`<model xmlns="http://www.opengroup.org/xsd/archimate/3.0/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengroup.org/xsd/archimate/3.0/ http://www.opengroup.org/xsd/archimate/3.1/archimate3_Model.xsd" identifier="${modelId}">`);
  lines.push(`  <name xml:lang="nl">${escXml(view.titel)} - ${escXml(organisatie.naam)}</name>`);
  lines.push(`  <documentation xml:lang="nl">Applicatielandschap ${escXml(organisatie.naam)} - ${escXml(view.titel)}. Geëxporteerd uit de Voorzieningencatalogus op ${now}.</documentation>`);

  // Model properties
  lines.push(`  <properties>`);
  lines.push(`    <property propertyDefinitionRef="id-propdef-organisatie"><value xml:lang="nl">${escXml(organisatie.naam)}</value></property>`);
  if (organisatie.cbsCode) {
    lines.push(`    <property propertyDefinitionRef="id-propdef-cbscode"><value xml:lang="nl">${escXml(organisatie.cbsCode)}</value></property>`);
  }
  lines.push(`    <property propertyDefinitionRef="id-propdef-bron"><value xml:lang="nl">Voorzieningencatalogus</value></property>`);
  lines.push(`    <property propertyDefinitionRef="id-propdef-exportdatum"><value xml:lang="nl">${now}</value></property>`);
  lines.push(`    <property propertyDefinitionRef="id-propdef-view"><value xml:lang="nl">${escXml(view.titel)}</value></property>`);
  lines.push(`  </properties>`);

  // PropertyDefinitions
  lines.push(`  <propertyDefinitions>`);
  for (const pd of propDefs) {
    lines.push(`    <propertyDefinition identifier="${pd.id}" type="${pd.type}"><name xml:lang="nl">${escXml(pd.naam)}</name></propertyDefinition>`);
  }
  lines.push(`  </propertyDefinitions>`);

  // Elements
  lines.push(`  <elements>`);

  // Organisatie als BusinessActor
  const organisatieElementId = `id-${hashId(`gem-${organisatie.id}`)}`;
  lines.push(`    <element identifier="${organisatieElementId}" xsi:type="BusinessActor">`);
  lines.push(`      <name xml:lang="nl">${escXml(organisatie.naam)}</name>`);
  if (organisatie.cbsCode) {
    lines.push(`      <properties><property propertyDefinitionRef="id-propdef-cbscode"><value xml:lang="nl">${escXml(organisatie.cbsCode)}</value></property></properties>`);
  }
  lines.push(`    </element>`);

  // Leveranciers als BusinessActors
  for (const [, lev] of leveranciers) {
    lines.push(`    <element identifier="${lev.id}" xsi:type="BusinessActor">`);
    lines.push(`      <name xml:lang="nl">${escXml(lev.naam)}</name>`);
    lines.push(`    </element>`);
  }

  // Pakketten als ApplicationComponents
  for (const [, pak] of pakketten) {
    lines.push(`    <element identifier="${pak.id}" xsi:type="ApplicationComponent">`);
    lines.push(`      <name xml:lang="nl">${escXml(pak.naam)}</name>`);
    lines.push(`      <properties>`);
    lines.push(`        <property propertyDefinitionRef="id-propdef-status"><value xml:lang="nl">${escXml(pak.status)}</value></property>`);
    if (pak.versie) {
      lines.push(`        <property propertyDefinitionRef="id-propdef-versie"><value xml:lang="nl">${escXml(pak.versie)}</value></property>`);
    }
    lines.push(`      </properties>`);
    lines.push(`    </element>`);
  }

  // Referentiecomponenten als ApplicationComponents
  for (const [, rc] of refcomps) {
    lines.push(`    <element identifier="${rc.id}" xsi:type="ApplicationComponent">`);
    lines.push(`      <name xml:lang="nl">${escXml(rc.naam)}</name>`);
    if (rc.guid) {
      lines.push(`      <properties><property propertyDefinitionRef="id-propdef-guid"><value xml:lang="nl">${escXml(rc.guid)}</value></property></properties>`);
    }
    lines.push(`    </element>`);
  }

  lines.push(`  </elements>`);

  // Relationships
  lines.push(`  <relationships>`);
  for (const rel of relationships) {
    lines.push(`    <relationship identifier="${rel.id}" xsi:type="${rel.type}" source="${rel.source}" target="${rel.target}" />`);
  }
  lines.push(`  </relationships>`);

  // Organizations (tree-based grouping)
  lines.push(`  <organizations>`);

  // Top-level: organisatie
  lines.push(`    <item identifier="id-org-gemeente">`);
  lines.push(`      <label xml:lang="nl">${escXml(organisatie.naam)}</label>`);

  // Groepeer per leverancier
  for (const [levId, lev] of leveranciers) {
    lines.push(`      <item identifier="id-org-lev-${hashId(levId)}" identifierRef="${lev.id}">`);
    lines.push(`        <label xml:lang="nl">${escXml(lev.naam)}</label>`);
    // Pakketten onder deze leverancier
    for (const [, pak] of pakketten) {
      if (pak.leverancierId === levId) {
        lines.push(`        <item identifierRef="${pak.id}"><label xml:lang="nl">${escXml(pak.naam)}</label></item>`);
      }
    }
    lines.push(`      </item>`);
  }

  // Referentiecomponenten
  lines.push(`      <item identifier="id-org-refcomps">`);
  lines.push(`        <label xml:lang="nl">Referentiecomponenten</label>`);
  for (const [, rc] of refcomps) {
    lines.push(`        <item identifierRef="${rc.id}"><label xml:lang="nl">${escXml(rc.naam)}</label></item>`);
  }
  lines.push(`      </item>`);

  lines.push(`    </item>`);
  lines.push(`  </organizations>`);

  lines.push(`</model>`);

  return lines.join("\n");
}

// ─── Shared swcquery payload builder ────────────────────────────────────────────

function buildSwcqueryPayload(
  view: { titel: string },
  organisatie: { id: string; naam: string; cbsCode: string | null },
  organisatiePakketten: OrganisatiePakketWithRelations[]
) {
  const pakketData = organisatiePakketten
    .map((gp) => {
      const pv = gp.pakketversie;
      const pakket = pv.pakket;
      const leverancier = pakket.leverancier;

      const refComps = pv.referentiecomponenten
        .filter((rc) => rc.referentiecomponent.guid)
        .map((rc) => ({
          ReferentiecomponentID: rc.referentiecomponent.guid!,
          ReferentiecomponentURL: `https://www.gemmaonline.nl/wiki/GEMMA/id-${rc.referentiecomponent.guid}`,
        }));

      if (refComps.length === 0) return null;

      return {
        Pakketregel: {
          Pakketid: pakket.id,
          Pakketnaam: pakket.naam,
          Pakketversie: pv.naam,
          Pakketstatus: gp.status || pv.status || "productie",
          Beheerder: leverancier.naam,
          Leverancier: leverancier.naam,
        },
        Pakketstijl: "",
        PakketURL: `/pakketten/${pakket.slug}`,
        Referentiecomponenten: refComps,
        Organisaties: [
          {
            CBS: organisatie.cbsCode || "",
            Id: organisatie.id,
            Naam: organisatie.naam,
          },
        ],
      };
    })
    .filter(Boolean);

  return [
    {
      Title: view.titel,
      Pakketten: pakketData,
      Infoboxes: [],
    },
  ];
}

// ─── AMEFF type voor Prisma resultaat ───────────────────────────────────────────

type OrganisatiePakketWithRelations = {
  organisatieId: string;
  pakketversieId: string;
  status: string | null;
  datumIngangStatus: Date | null;
  technologie: string | null;
  pakketversie: {
    id: string;
    naam: string;
    status: string;
    pakket: {
      id: string;
      naam: string;
      slug: string;
      leverancier: { id: string; naam: string };
    };
    referentiecomponenten: {
      referentiecomponent: { id: string; naam: string; guid: string | null };
    }[];
  };
};

// ─── Helpers ────────────────────────────────────────────────────────────────────

async function getExportRows(
  organisatieId: string,
  organisatieNaam: string
): Promise<OrganisatiePakketRow[]> {
  const organisatiePakketten = await prisma.organisatiePakket.findMany({
    where: { organisatieId },
    include: {
      pakketversie: {
        include: {
          pakket: { include: { leverancier: true } },
          referentiecomponenten: {
            include: { referentiecomponent: true },
          },
          technologieen: true,
        },
      },
    },
    orderBy: { pakketversie: { pakket: { leverancier: { naam: "asc" } } } },
  });

  return organisatiePakketten.map((gp) => {
    const pv = gp.pakketversie;
    const pakket = pv.pakket;
    const leverancier = pakket.leverancier;

    // Referentiecomponenten van type "gemeente" (of alle als er geen gemeente-type zijn)
    const organisatieRefComps = pv.referentiecomponenten
      .filter((rc) => rc.type === "gemeente")
      .map((rc) => rc.referentiecomponent.naam);
    const allRefComps =
      organisatieRefComps.length > 0
        ? organisatieRefComps
        : pv.referentiecomponenten.map((rc) => rc.referentiecomponent.naam);

    // Technologieën
    const technologieen =
      gp.technologie ||
      pv.technologieen.map((t) => t.technologie).join(", ") ||
      "";

    // Extern pakket: als pakketId === pakketversieId is het een extern pakket
    const isExtern = pakket.id === pv.id ? "j" : "n";

    return {
      leverancier: leverancier.naam,
      pakketNaam: pakket.naam,
      pakketversieNaam: pv.naam,
      omschrijving: pv.beschrijving || pakket.beschrijving || "",
      omschrijvingGebruik: "",
      referentiecomponenten: allRefComps.join(", "),
      status: gp.status || pv.status || "",
      datumIngangStatus: gp.datumIngangStatus
        ? formatDate(gp.datumIngangStatus)
        : "",
      technologie: technologieen,
      externPakket: isExtern,
      pakketId: pakket.id,
      pakketversieId: pv.id,
      organisatie: organisatieNaam,
    };
  });
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function csvQuote(value: string): string {
  if (
    value.includes(",") ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r")
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return `"${value}"`;
}

function csvQuoteSemicolon(value: string): string {
  if (
    value.includes(";") ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r")
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return `"${value}"`;
}

/** Genereer een deterministische hex-hash voor XML identifiers (conform xs:ID) */
function hashId(input: string): string {
  return createHash("md5").update(input).digest("hex");
}

/** Escape XML special characters */
function escXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
