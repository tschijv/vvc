import { describe, it, expect } from "vitest";
import { pakketToTriples, pakketversieToTriples } from "./pakket";

function findTriple(quads: any[], predicateFragment: string) {
  return quads.filter((q) => q.predicate.value.includes(predicateFragment));
}

describe("pakketToTriples", () => {
  const base = {
    id: "pkg-1",
    naam: "Suite4Gemeenten",
    slug: "suite4gemeenten",
  };

  it("creates rdf:type triple for SoftwareApplication", () => {
    const quads = pakketToTriples(base);
    const typeTriples = findTriple(quads, "rdf-syntax-ns#type");
    expect(typeTriples.length).toBe(1);
    expect(typeTriples[0].object.value).toContain("SoftwareApplication");
  });

  it("creates schema:name triple", () => {
    const quads = pakketToTriples(base);
    const nameTriples = findTriple(quads, "schema.org/name");
    expect(nameTriples.length).toBe(1);
    expect(nameTriples[0].object.value).toBe("Suite4Gemeenten");
  });

  it("includes beschrijving when provided", () => {
    const quads = pakketToTriples({ ...base, beschrijving: "Een pakket" });
    const descTriples = findTriple(quads, "schema.org/description");
    expect(descTriples.length).toBe(1);
    expect(descTriples[0].object.language).toBe("nl");
  });

  it("includes leverancier as provider", () => {
    const quads = pakketToTriples({ ...base, leverancier: { slug: "centric" } });
    const providerTriples = findTriple(quads, "schema.org/provider");
    expect(providerTriples.length).toBe(1);
    expect(providerTriples[0].object.value).toContain("leverancier/centric");
  });

  it("excludes leverancier when null", () => {
    const quads = pakketToTriples({ ...base, leverancier: null });
    const providerTriples = findTriple(quads, "schema.org/provider");
    expect(providerTriples.length).toBe(0);
  });

  it("includes referentiecomponenten as implementeert", () => {
    const quads = pakketToTriples({
      ...base,
      referentiecomponenten: [
        { referentiecomponentId: "rc-1" },
        { referentiecomponentId: "rc-2" },
      ],
    });
    const implTriples = findTriple(quads, "implementeert");
    expect(implTriples.length).toBe(2);
  });

  it("includes standaarden as conformsTo", () => {
    const quads = pakketToTriples({
      ...base,
      standaarden: [
        { standaardversie: { id: "sv-1", standaardId: "std-1" } },
      ],
    });
    const conformsTriples = findTriple(quads, "conformsTo");
    expect(conformsTriples.length).toBe(1);
    expect(conformsTriples[0].object.value).toContain("standaard/std-1/versie/sv-1");
  });

  it("skips standaarden with null standaardversie", () => {
    const quads = pakketToTriples({
      ...base,
      standaarden: [{ standaardversie: null }],
    });
    const conformsTriples = findTriple(quads, "conformsTo");
    expect(conformsTriples.length).toBe(0);
  });

  it("includes versies as hasPart and creates versie triples", () => {
    const quads = pakketToTriples({
      ...base,
      versies: [{ id: "v1", naam: "1.0", status: "actief" }],
    });
    const hasPartTriples = findTriple(quads, "schema.org/hasPart");
    expect(hasPartTriples.length).toBe(1);
    // Also check versie triples are included
    expect(quads.length).toBeGreaterThan(3);
  });

  it("returns minimal triples with only required fields", () => {
    const quads = pakketToTriples(base);
    expect(quads.length).toBe(2); // type + name
  });
});

describe("pakketversieToTriples", () => {
  it("creates rdf:type triple", () => {
    const quads = pakketversieToTriples({ id: "v1" }, "my-pkg");
    const typeTriples = findTriple(quads, "rdf-syntax-ns#type");
    expect(typeTriples.length).toBe(1);
  });

  it("includes name and version when naam is provided", () => {
    const quads = pakketversieToTriples({ id: "v1", naam: "2.0" }, "my-pkg");
    const nameTriples = findTriple(quads, "schema.org/name");
    const versionTriples = findTriple(quads, "schema.org/version");
    expect(nameTriples.length).toBe(1);
    expect(versionTriples.length).toBe(1);
    expect(nameTriples[0].object.value).toBe("2.0");
  });

  it("includes isPartOf linking back to pakket", () => {
    const quads = pakketversieToTriples({ id: "v1" }, "my-pkg");
    const isPartOfTriples = findTriple(quads, "schema.org/isPartOf");
    expect(isPartOfTriples.length).toBe(1);
    expect(isPartOfTriples[0].object.value).toContain("pakket/my-pkg");
  });

  it("includes status when provided", () => {
    const quads = pakketversieToTriples({ id: "v1", status: "actief" }, "my-pkg");
    const statusTriples = findTriple(quads, "status");
    expect(statusTriples.length).toBe(1);
    expect(statusTriples[0].object.value).toBe("actief");
  });

  it("excludes status when null", () => {
    const quads = pakketversieToTriples({ id: "v1", status: null }, "my-pkg");
    const statusTriples = quads.filter(
      (q) => q.predicate.value.includes("status") && !q.predicate.value.includes("syntax")
    );
    expect(statusTriples.length).toBe(0);
  });
});
