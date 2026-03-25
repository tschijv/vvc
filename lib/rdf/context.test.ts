import { describe, it, expect } from "vitest";
import { JSONLD_CONTEXT } from "./context";
import { BASE_URI, PREFIXES } from "./namespaces";

describe("JSONLD_CONTEXT", () => {
  it("has @base set to BASE_URI", () => {
    expect(JSONLD_CONTEXT["@base"]).toBe(BASE_URI);
  });

  it("includes standard namespace prefixes", () => {
    expect(JSONLD_CONTEXT.schema).toBe(PREFIXES.schema);
    expect(JSONLD_CONTEXT.dcat).toBe(PREFIXES.dcat);
    expect(JSONLD_CONTEXT.dct).toBe(PREFIXES.dct);
    expect(JSONLD_CONTEXT.skos).toBe(PREFIXES.skos);
    expect(JSONLD_CONTEXT.xsd).toBe(PREFIXES.xsd);
    expect(JSONLD_CONTEXT.vvc).toBe(PREFIXES.vvc);
  });

  it("maps Dutch terms to schema.org properties", () => {
    expect(JSONLD_CONTEXT.naam).toBe("schema:name");
    expect(JSONLD_CONTEXT.beschrijving).toBe("schema:description");
    expect(JSONLD_CONTEXT.email).toBe("schema:email");
    expect(JSONLD_CONTEXT.identificatie).toBe("schema:identifier");
    expect(JSONLD_CONTEXT.versie).toBe("schema:version");
  });

  it("maps leverancier as an @id reference", () => {
    const leverancier = JSONLD_CONTEXT.leverancier as { "@id": string; "@type": string };
    expect(leverancier["@id"]).toBe("schema:provider");
    expect(leverancier["@type"]).toBe("@id");
  });

  it("maps pakketversies as @set container", () => {
    const pv = JSONLD_CONTEXT.pakketversies as { "@id": string; "@type": string; "@container": string };
    expect(pv["@id"]).toBe("schema:hasPart");
    expect(pv["@type"]).toBe("@id");
    expect(pv["@container"]).toBe("@set");
  });

  it("maps website as @id type", () => {
    const website = JSONLD_CONTEXT.website as { "@id": string; "@type": string };
    expect(website["@id"]).toBe("schema:url");
    expect(website["@type"]).toBe("@id");
  });

  it("maps gewijzigd with xsd:dateTime type", () => {
    const gewijzigd = JSONLD_CONTEXT.gewijzigd as { "@id": string; "@type": string };
    expect(gewijzigd["@id"]).toBe("dct:modified");
    expect(gewijzigd["@type"]).toBe("xsd:dateTime");
  });

  it("maps aangemaakt with xsd:dateTime type", () => {
    const aangemaakt = JSONLD_CONTEXT.aangemaakt as { "@id": string; "@type": string };
    expect(aangemaakt["@id"]).toBe("dct:created");
    expect(aangemaakt["@type"]).toBe("xsd:dateTime");
  });

  it("maps status to vvc namespace", () => {
    expect(JSONLD_CONTEXT.status).toBe("vvc:status");
  });

  it("maps implementeert as @set container", () => {
    const impl = JSONLD_CONTEXT.implementeert as { "@container": string };
    expect(impl["@container"]).toBe("@set");
  });
});
