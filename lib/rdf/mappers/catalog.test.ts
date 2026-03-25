import { describe, it, expect } from "vitest";
import { catalogToTriples } from "./catalog";

function findTriple(quads: any[], predicateFragment: string) {
  return quads.filter((q) => q.predicate.value.includes(predicateFragment));
}

describe("catalogToTriples", () => {
  it("returns a non-empty array of quads", () => {
    const quads = catalogToTriples();
    expect(quads.length).toBeGreaterThan(0);
  });

  it("creates rdf:type DCAT:Catalog", () => {
    const quads = catalogToTriples();
    const typeTriples = findTriple(quads, "rdf-syntax-ns#type");
    const catalogType = typeTriples.find((t: any) =>
      t.object.value.includes("dcat#Catalog")
    );
    expect(catalogType).toBeDefined();
  });

  it("has dct:title in Dutch", () => {
    const quads = catalogToTriples();
    const titleTriples = findTriple(quads, "dc/terms/title");
    expect(titleTriples.length).toBe(1);
    expect(titleTriples[0].object.value).toContain("VNG Voorzieningencatalogus");
    expect(titleTriples[0].object.language).toBe("nl");
  });

  it("has dct:description in Dutch", () => {
    const quads = catalogToTriples();
    const descTriples = findTriple(quads, "dc/terms/description");
    expect(descTriples.length).toBe(1);
    expect(descTriples[0].object.language).toBe("nl");
  });

  it("has dct:publisher pointing to VNG", () => {
    const quads = catalogToTriples();
    const publisherTriples = findTriple(quads, "dc/terms/publisher");
    expect(publisherTriples.length).toBe(1);
    expect(publisherTriples[0].object.value).toContain("vng-realisatie");
  });

  it("includes VNG organization info", () => {
    const quads = catalogToTriples();
    // Find Organization type triple for VNG
    const orgTypes = quads.filter(
      (q: any) =>
        q.object.value.includes("Organization") &&
        q.subject.value.includes("vng-realisatie")
    );
    expect(orgTypes.length).toBeGreaterThan(0);
  });

  it("includes VNG name", () => {
    const quads = catalogToTriples();
    const nameTriples = quads.filter(
      (q: any) =>
        q.predicate.value.includes("schema.org/name") &&
        q.subject.value.includes("vng-realisatie")
    );
    expect(nameTriples.length).toBe(1);
    expect(nameTriples[0].object.value).toBe("VNG Realisatie");
  });

  it("uses catalog URI as main subject", () => {
    const quads = catalogToTriples();
    expect(quads[0].subject.value).toContain("vc/catalog");
  });
});
