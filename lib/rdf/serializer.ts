/**
 * RDF serializer — converteert N3 Quads naar Turtle, JSON-LD of RDF/XML.
 */
import { Writer, Quad, DataFactory } from "n3";
import { NextResponse } from "next/server";
import { PREFIXES, BASE_URI } from "./namespaces";
import { JSONLD_CONTEXT } from "./context";
import { RdfFormat, rdfContentType } from "./content-negotiation";

const { namedNode, literal } = DataFactory;

// ─── Turtle serialisatie ─────────────────────────────────────────────────────

function triplesToTurtle(quads: Quad[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new Writer({
      prefixes: PREFIXES,
      baseIRI: BASE_URI,
    });
    for (const quad of quads) {
      writer.addQuad(quad);
    }
    writer.end((error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
}

// ─── JSON-LD serialisatie ────────────────────────────────────────────────────

interface JsonLdNode {
  "@id": string;
  "@type"?: string | string[];
  [key: string]: unknown;
}

function triplesToJsonLd(quads: Quad[]): string {
  // Groepeer quads per subject
  const subjects = new Map<string, JsonLdNode>();

  for (const quad of quads) {
    const subjectId = quad.subject.value;
    if (!subjects.has(subjectId)) {
      subjects.set(subjectId, { "@id": subjectId });
    }
    const node = subjects.get(subjectId)!;

    const predicate = quad.predicate.value;
    const isType = predicate === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";

    if (isType) {
      const existing = node["@type"];
      if (!existing) {
        node["@type"] = quad.object.value;
      } else if (Array.isArray(existing)) {
        existing.push(quad.object.value);
      } else {
        node["@type"] = [existing, quad.object.value];
      }
      continue;
    }

    // Gebruik compacte predicate key
    const key = compactUri(predicate);
    const value =
      quad.object.termType === "NamedNode"
        ? { "@id": quad.object.value }
        : quad.object.termType === "Literal" && quad.object.language
          ? { "@value": quad.object.value, "@language": quad.object.language }
          : quad.object.value;

    // Multi-value: maak array als er al een waarde is
    if (key in node) {
      const existing = node[key];
      if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        node[key] = [existing, value];
      }
    } else {
      node[key] = value;
    }
  }

  const graph = Array.from(subjects.values());

  return JSON.stringify(
    {
      "@context": JSONLD_CONTEXT,
      "@graph": graph.length === 1 ? graph[0] : graph,
    },
    null,
    2
  );
}

/** Verkort een URI naar prefix:local form */
function compactUri(uri: string): string {
  for (const [prefix, ns] of Object.entries(PREFIXES)) {
    if (uri.startsWith(ns)) {
      return `${prefix}:${uri.slice(ns.length)}`;
    }
  }
  return uri;
}

// ─── RDF/XML serialisatie ────────────────────────────────────────────────────

function triplesToRdfXml(quads: Quad[]): string {
  const lines: string[] = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push("<rdf:RDF");
  for (const [prefix, ns] of Object.entries(PREFIXES)) {
    lines.push(`  xmlns:${prefix}="${escapeXml(ns)}"`);
  }
  lines.push(">");

  // Groepeer per subject
  const subjects = new Map<string, Quad[]>();
  for (const quad of quads) {
    const key = quad.subject.value;
    if (!subjects.has(key)) subjects.set(key, []);
    subjects.get(key)!.push(quad);
  }

  for (const [subjectUri, subjectQuads] of subjects) {
    // Vind het type
    const typeQuad = subjectQuads.find(
      (q) => q.predicate.value === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
    );
    const typeName = typeQuad
      ? compactUri(typeQuad.object.value)
      : "rdf:Description";

    lines.push(`  <${typeName} rdf:about="${escapeXml(subjectUri)}">`);

    for (const quad of subjectQuads) {
      if (quad.predicate.value === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type") continue;

      const pred = compactUri(quad.predicate.value);

      if (quad.object.termType === "NamedNode") {
        lines.push(`    <${pred} rdf:resource="${escapeXml(quad.object.value)}"/>`);
      } else if (quad.object.termType === "Literal") {
        const lang = quad.object.language ? ` xml:lang="${quad.object.language}"` : "";
        const dt =
          quad.object.datatype &&
          quad.object.datatype.value !== "http://www.w3.org/2001/XMLSchema#string"
            ? ` rdf:datatype="${escapeXml(quad.object.datatype.value)}"`
            : "";
        lines.push(`    <${pred}${lang}${dt}>${escapeXml(quad.object.value)}</${pred}>`);
      }
    }

    lines.push(`  </${typeName}>`);
  }

  lines.push("</rdf:RDF>");
  return lines.join("\n");
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Serialiseer quads naar het gevraagde formaat en retourneer een NextResponse.
 */
export async function serializeRdf(
  quads: Quad[],
  format: RdfFormat
): Promise<NextResponse> {
  let body: string;

  switch (format) {
    case "turtle":
      body = await triplesToTurtle(quads);
      break;
    case "jsonld":
      body = triplesToJsonLd(quads);
      break;
    case "rdfxml":
      body = triplesToRdfXml(quads);
      break;
    default:
      throw new Error(`Unsupported RDF format: ${format}`);
  }

  return new NextResponse(body, {
    headers: {
      "Content-Type": rdfContentType(format),
      "Access-Control-Allow-Origin": "*",
    },
  });
}

// Re-export DataFactory helpers voor gebruik in mappers
export { namedNode, literal };
