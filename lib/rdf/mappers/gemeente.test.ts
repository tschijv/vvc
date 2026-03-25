import { describe, it, expect } from "vitest";
import { gemeenteToTriples } from "./gemeente";

function findTriple(quads: any[], predicateFragment: string) {
  return quads.filter((q) => q.predicate.value.includes(predicateFragment));
}

describe("gemeenteToTriples", () => {
  const base = {
    id: "gem-1",
    naam: "'s-Gravenhage",
  };

  it("creates two rdf:type triples (Organization + GovernmentOrganization)", () => {
    const quads = gemeenteToTriples(base);
    const typeTriples = findTriple(quads, "rdf-syntax-ns#type");
    expect(typeTriples.length).toBe(2);
    const typeValues = typeTriples.map((t: any) => t.object.value);
    expect(typeValues.some((v: string) => v.includes("Organization"))).toBe(true);
    expect(typeValues.some((v: string) => v.includes("GovernmentOrganization"))).toBe(true);
  });

  it("creates schema:name triple with Dutch language tag", () => {
    const quads = gemeenteToTriples(base);
    const nameTriples = findTriple(quads, "schema.org/name");
    expect(nameTriples.length).toBe(1);
    expect(nameTriples[0].object.value).toBe("'s-Gravenhage");
    expect(nameTriples[0].object.language).toBe("nl");
  });

  it("includes CBS code when provided", () => {
    const quads = gemeenteToTriples({ ...base, cbsCode: "0518" });
    const idTriples = findTriple(quads, "dc/terms/identifier");
    expect(idTriples.length).toBe(1);
    expect(idTriples[0].object.value).toBe("0518");
  });

  it("excludes CBS code when null", () => {
    const quads = gemeenteToTriples({ ...base, cbsCode: null });
    const idTriples = findTriple(quads, "dc/terms/identifier");
    expect(idTriples.length).toBe(0);
  });

  it("excludes CBS code when not provided", () => {
    const quads = gemeenteToTriples(base);
    const idTriples = findTriple(quads, "dc/terms/identifier");
    expect(idTriples.length).toBe(0);
  });

  it("uses gemeente URI as subject", () => {
    const quads = gemeenteToTriples(base);
    expect(quads[0].subject.value).toContain("gemeente/gem-1");
  });

  it("returns 3 triples with only required fields (2 types + name)", () => {
    const quads = gemeenteToTriples(base);
    expect(quads.length).toBe(3);
  });

  it("returns 4 triples when CBS code is provided", () => {
    const quads = gemeenteToTriples({ ...base, cbsCode: "0518" });
    expect(quads.length).toBe(4);
  });

  it("does not include any privacy-sensitive data", () => {
    const quads = gemeenteToTriples(base);
    // Should only have type, name, and optionally CBS code - no email, no pakketten
    const predicates = quads.map((q: any) => q.predicate.value);
    expect(predicates.some((p: string) => p.includes("email"))).toBe(false);
    expect(predicates.some((p: string) => p.includes("hasPart"))).toBe(false);
  });
});
