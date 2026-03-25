/**
 * Content negotiation voor RDF formaten.
 */
import { NextRequest } from "next/server";

export type RdfFormat = "jsonld" | "turtle" | "rdfxml" | "json";

const ACCEPT_MAP: Record<string, RdfFormat> = {
  "application/ld+json": "jsonld",
  "text/turtle": "turtle",
  "application/rdf+xml": "rdfxml",
  "application/n-triples": "turtle", // serve turtle for n-triples requests too
};

const FORMAT_PARAM_MAP: Record<string, RdfFormat> = {
  jsonld: "jsonld",
  "json-ld": "jsonld",
  turtle: "turtle",
  ttl: "turtle",
  rdfxml: "rdfxml",
  "rdf+xml": "rdfxml",
  rdf: "rdfxml",
};

const CONTENT_TYPES: Record<RdfFormat, string> = {
  jsonld: "application/ld+json; charset=utf-8",
  turtle: "text/turtle; charset=utf-8",
  rdfxml: "application/rdf+xml; charset=utf-8",
  json: "application/json; charset=utf-8",
};

/**
 * Bepaal het gewenste formaat op basis van:
 * 1. ?format= query parameter (heeft voorrang)
 * 2. Accept header
 * 3. Default: json (bestaand gedrag)
 */
export function negotiateFormat(request: NextRequest): RdfFormat {
  // 1. Check query parameter
  const formatParam = request.nextUrl.searchParams.get("format");
  if (formatParam) {
    const mapped = FORMAT_PARAM_MAP[formatParam.toLowerCase()];
    if (mapped) return mapped;
  }

  // 2. Parse Accept header
  const accept = request.headers.get("accept") || "";
  for (const [mimeType, format] of Object.entries(ACCEPT_MAP)) {
    if (accept.includes(mimeType)) {
      return format;
    }
  }

  // 3. Default: JSON
  return "json";
}

/**
 * Geeft de Content-Type header voor het gegeven formaat.
 */
export function rdfContentType(format: RdfFormat): string {
  return CONTENT_TYPES[format];
}

/**
 * Check of het formaat een RDF formaat is (niet plain JSON).
 */
export function isRdfFormat(format: RdfFormat): format is "jsonld" | "turtle" | "rdfxml" {
  return format !== "json";
}
