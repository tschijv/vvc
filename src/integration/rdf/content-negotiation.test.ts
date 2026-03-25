import { describe, it, expect } from "vitest";
import { rdfContentType, isRdfFormat, type RdfFormat } from "./content-negotiation";

// We can't easily construct NextRequest in unit tests, so we test the
// helper functions that don't depend on NextRequest, and test negotiateFormat
// via a lightweight approach.

describe("rdfContentType", () => {
  it("returns correct content type for jsonld", () => {
    expect(rdfContentType("jsonld")).toBe("application/ld+json; charset=utf-8");
  });

  it("returns correct content type for turtle", () => {
    expect(rdfContentType("turtle")).toBe("text/turtle; charset=utf-8");
  });

  it("returns correct content type for rdfxml", () => {
    expect(rdfContentType("rdfxml")).toBe("application/rdf+xml; charset=utf-8");
  });

  it("returns correct content type for json", () => {
    expect(rdfContentType("json")).toBe("application/json; charset=utf-8");
  });

  it("all content types include charset=utf-8", () => {
    const formats: RdfFormat[] = ["jsonld", "turtle", "rdfxml", "json"];
    for (const format of formats) {
      expect(rdfContentType(format)).toContain("charset=utf-8");
    }
  });
});

describe("isRdfFormat", () => {
  it("returns true for jsonld", () => {
    expect(isRdfFormat("jsonld")).toBe(true);
  });

  it("returns true for turtle", () => {
    expect(isRdfFormat("turtle")).toBe(true);
  });

  it("returns true for rdfxml", () => {
    expect(isRdfFormat("rdfxml")).toBe(true);
  });

  it("returns false for json", () => {
    expect(isRdfFormat("json")).toBe(false);
  });
});

// Test negotiateFormat by constructing a minimal NextRequest-like object
// NextRequest requires a real URL, so we use the actual class from next/server
describe("negotiateFormat", () => {
  // Dynamic import to handle the Next.js dependency
  async function callNegotiateFormat(url: string, acceptHeader?: string) {
    // We import dynamically to catch potential module issues
    const { negotiateFormat } = await import("./content-negotiation");
    const { NextRequest } = await import("next/server");
    const headers = new Headers();
    if (acceptHeader) headers.set("accept", acceptHeader);
    const req = new NextRequest(new URL(url, "http://localhost:3000"), { headers });
    return negotiateFormat(req);
  }

  it("returns jsonld for ?format=jsonld", async () => {
    const result = await callNegotiateFormat("http://localhost:3000/api?format=jsonld");
    expect(result).toBe("jsonld");
  });

  it("returns jsonld for ?format=json-ld", async () => {
    const result = await callNegotiateFormat("http://localhost:3000/api?format=json-ld");
    expect(result).toBe("jsonld");
  });

  it("returns turtle for ?format=turtle", async () => {
    const result = await callNegotiateFormat("http://localhost:3000/api?format=turtle");
    expect(result).toBe("turtle");
  });

  it("returns turtle for ?format=ttl", async () => {
    const result = await callNegotiateFormat("http://localhost:3000/api?format=ttl");
    expect(result).toBe("turtle");
  });

  it("returns rdfxml for ?format=rdf", async () => {
    const result = await callNegotiateFormat("http://localhost:3000/api?format=rdf");
    expect(result).toBe("rdfxml");
  });

  it("returns rdfxml for ?format=rdfxml", async () => {
    const result = await callNegotiateFormat("http://localhost:3000/api?format=rdfxml");
    expect(result).toBe("rdfxml");
  });

  it("format param is case-insensitive", async () => {
    const result = await callNegotiateFormat("http://localhost:3000/api?format=JSONLD");
    expect(result).toBe("jsonld");
  });

  it("returns jsonld for Accept: application/ld+json", async () => {
    const result = await callNegotiateFormat(
      "http://localhost:3000/api",
      "application/ld+json"
    );
    expect(result).toBe("jsonld");
  });

  it("returns turtle for Accept: text/turtle", async () => {
    const result = await callNegotiateFormat(
      "http://localhost:3000/api",
      "text/turtle"
    );
    expect(result).toBe("turtle");
  });

  it("returns rdfxml for Accept: application/rdf+xml", async () => {
    const result = await callNegotiateFormat(
      "http://localhost:3000/api",
      "application/rdf+xml"
    );
    expect(result).toBe("rdfxml");
  });

  it("returns turtle for Accept: application/n-triples", async () => {
    const result = await callNegotiateFormat(
      "http://localhost:3000/api",
      "application/n-triples"
    );
    expect(result).toBe("turtle");
  });

  it("defaults to json when no format specified", async () => {
    const result = await callNegotiateFormat("http://localhost:3000/api");
    expect(result).toBe("json");
  });

  it("defaults to json for unknown Accept header", async () => {
    const result = await callNegotiateFormat(
      "http://localhost:3000/api",
      "text/html"
    );
    expect(result).toBe("json");
  });

  it("format param takes precedence over Accept header", async () => {
    const result = await callNegotiateFormat(
      "http://localhost:3000/api?format=turtle",
      "application/ld+json"
    );
    expect(result).toBe("turtle");
  });
});
