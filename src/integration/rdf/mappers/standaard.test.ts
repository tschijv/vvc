import { describe, it, expect } from "vitest";
import { standaardToTriples, standaardversieToTriples } from "./standaard";

function findTriple(quads: any[], predicateFragment: string) {
  return quads.filter((q) => q.predicate.value.includes(predicateFragment));
}

describe("standaardToTriples", () => {
  const base = {
    id: "std-1",
    naam: "StUF-ZKN",
  };

  it("creates rdf:type dct:Standard", () => {
    const quads = standaardToTriples(base);
    const typeTriples = findTriple(quads, "rdf-syntax-ns#type");
    expect(typeTriples.length).toBe(1);
    expect(typeTriples[0].object.value).toContain("dc/terms/Standard");
  });

  it("creates schema:name triple", () => {
    const quads = standaardToTriples(base);
    const nameTriples = findTriple(quads, "schema.org/name");
    expect(nameTriples.length).toBe(1);
    expect(nameTriples[0].object.value).toBe("StUF-ZKN");
  });

  it("includes guid as identifier", () => {
    const quads = standaardToTriples({ ...base, guid: "abc-def" });
    const idTriples = findTriple(quads, "dc/terms/identifier");
    expect(idTriples.length).toBe(1);
    expect(idTriples[0].object.value).toBe("abc-def");
  });

  it("excludes guid when null", () => {
    const quads = standaardToTriples({ ...base, guid: null });
    const idTriples = findTriple(quads, "dc/terms/identifier");
    expect(idTriples.length).toBe(0);
  });

  it("includes beschrijving when provided", () => {
    const quads = standaardToTriples({ ...base, beschrijving: "Een standaard" });
    const descTriples = findTriple(quads, "schema.org/description");
    expect(descTriples.length).toBe(1);
    expect(descTriples[0].object.language).toBe("nl");
  });

  it("includes versies as hasVersion", () => {
    const quads = standaardToTriples({
      ...base,
      versies: [{ id: "sv-1", standaardId: "std-1", naam: "3.1" }],
    });
    const hasVersionTriples = findTriple(quads, "dc/terms/hasVersion");
    expect(hasVersionTriples.length).toBe(1);
  });

  it("returns 2 triples with only required fields", () => {
    const quads = standaardToTriples(base);
    expect(quads.length).toBe(2);
  });
});

describe("standaardversieToTriples", () => {
  const base = {
    id: "sv-1",
    standaardId: "std-1",
  };

  it("creates rdf:type dct:Standard", () => {
    const quads = standaardversieToTriples(base);
    const typeTriples = findTriple(quads, "rdf-syntax-ns#type");
    expect(typeTriples.length).toBe(1);
  });

  it("includes name and version when naam is provided", () => {
    const quads = standaardversieToTriples({ ...base, naam: "3.1" });
    const nameTriples = findTriple(quads, "schema.org/name");
    const versionTriples = findTriple(quads, "schema.org/version");
    expect(nameTriples.length).toBe(1);
    expect(versionTriples.length).toBe(1);
  });

  it("includes isVersionOf linking to parent standaard", () => {
    const quads = standaardversieToTriples(base);
    const isVersionOfTriples = findTriple(quads, "dc/terms/isVersionOf");
    expect(isVersionOfTriples.length).toBe(1);
    expect(isVersionOfTriples[0].object.value).toContain("standaard/std-1");
  });

  it("includes compliancyMonitor when true", () => {
    const quads = standaardversieToTriples({ ...base, compliancyMonitor: true });
    const cmTriples = findTriple(quads, "compliancyMonitor");
    expect(cmTriples.length).toBe(1);
    expect(cmTriples[0].object.value).toBe("true");
  });

  it("includes compliancyMonitor when false", () => {
    const quads = standaardversieToTriples({ ...base, compliancyMonitor: false });
    const cmTriples = findTriple(quads, "compliancyMonitor");
    expect(cmTriples.length).toBe(1);
    expect(cmTriples[0].object.value).toBe("false");
  });

  it("excludes compliancyMonitor when null", () => {
    const quads = standaardversieToTriples({ ...base, compliancyMonitor: null });
    const cmTriples = findTriple(quads, "compliancyMonitor");
    expect(cmTriples.length).toBe(0);
  });
});
