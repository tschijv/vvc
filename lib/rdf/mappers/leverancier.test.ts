import { describe, it, expect } from "vitest";
import { leverancierToTriples } from "./leverancier";

function findTriple(quads: any[], predicateFragment: string) {
  return quads.filter((q) => q.predicate.value.includes(predicateFragment));
}

describe("leverancierToTriples", () => {
  const base = {
    id: "lev-1",
    naam: "Centric",
    slug: "centric",
  };

  it("creates rdf:type triple for Organization", () => {
    const quads = leverancierToTriples(base);
    const typeTriples = findTriple(quads, "rdf-syntax-ns#type");
    expect(typeTriples.length).toBe(1);
    expect(typeTriples[0].object.value).toContain("Organization");
  });

  it("creates schema:name triple", () => {
    const quads = leverancierToTriples(base);
    const nameTriples = findTriple(quads, "schema.org/name");
    expect(nameTriples.length).toBe(1);
    expect(nameTriples[0].object.value).toBe("Centric");
  });

  it("includes beschrijving when provided", () => {
    const quads = leverancierToTriples({ ...base, beschrijving: "Een leverancier" });
    const descTriples = findTriple(quads, "schema.org/description");
    expect(descTriples.length).toBe(1);
    expect(descTriples[0].object.value).toBe("Een leverancier");
    expect(descTriples[0].object.language).toBe("nl");
  });

  it("excludes beschrijving when null", () => {
    const quads = leverancierToTriples({ ...base, beschrijving: null });
    const descTriples = findTriple(quads, "schema.org/description");
    expect(descTriples.length).toBe(0);
  });

  it("includes website as named node", () => {
    const quads = leverancierToTriples({ ...base, website: "https://centric.nl" });
    const urlTriples = findTriple(quads, "schema.org/url");
    expect(urlTriples.length).toBe(1);
    expect(urlTriples[0].object.value).toBe("https://centric.nl");
  });

  it("excludes website when null", () => {
    const quads = leverancierToTriples({ ...base, website: null });
    const urlTriples = findTriple(quads, "schema.org/url");
    expect(urlTriples.length).toBe(0);
  });

  it("includes email when provided", () => {
    const quads = leverancierToTriples({ ...base, email: "info@centric.nl" });
    const emailTriples = findTriple(quads, "schema.org/email");
    expect(emailTriples.length).toBe(1);
    expect(emailTriples[0].object.value).toBe("info@centric.nl");
  });

  it("creates makesOffer triples for pakketten", () => {
    const quads = leverancierToTriples({
      ...base,
      pakketten: [{ slug: "pakket-a" }, { slug: "pakket-b" }],
    });
    const offerTriples = findTriple(quads, "schema.org/makesOffer");
    expect(offerTriples.length).toBe(2);
    expect(offerTriples[0].object.value).toContain("pakket/pakket-a");
    expect(offerTriples[1].object.value).toContain("pakket/pakket-b");
  });

  it("returns minimal triples with only required fields", () => {
    const quads = leverancierToTriples(base);
    // Should have rdf:type + schema:name = 2 triples minimum
    expect(quads.length).toBe(2);
  });

  it("uses the correct subject URI based on slug", () => {
    const quads = leverancierToTriples(base);
    expect(quads[0].subject.value).toContain("leverancier/centric");
  });
});
