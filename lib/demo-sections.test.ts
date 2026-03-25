import { describe, it, expect } from "vitest";
import { demoSections, type DemoSection } from "./demo-sections";

describe("demoSections", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(demoSections)).toBe(true);
    expect(demoSections.length).toBeGreaterThan(0);
  });

  it("has sequential section numbers", () => {
    const numbers = demoSections.map((s) => s.nr);
    for (let i = 0; i < numbers.length; i++) {
      expect(numbers[i]).toBe(i + 1);
    }
  });

  it("every section has required fields", () => {
    for (const section of demoSections) {
      expect(section.nr).toBeTypeOf("number");
      expect(section.titel).toBeTypeOf("string");
      expect(section.titel.length).toBeGreaterThan(0);
      expect(section.duur).toBeTypeOf("string");
      expect(section.link).toBeTypeOf("string");
      expect(section.toelichting).toBeTypeOf("string");
      expect(section.toelichting.length).toBeGreaterThan(0);
    }
  });

  it("all links start with /", () => {
    for (const section of demoSections) {
      expect(section.link).toMatch(/^\//);
      if (section.extraLinks) {
        for (const extra of section.extraLinks) {
          expect(extra.href).toMatch(/^\//);
        }
      }
    }
  });

  it("duur values follow the pattern 'N min'", () => {
    for (const section of demoSections) {
      expect(section.duur).toMatch(/^\d+ min$/);
    }
  });

  it("has no duplicate section numbers", () => {
    const numbers = demoSections.map((s) => s.nr);
    const unique = new Set(numbers);
    expect(unique.size).toBe(numbers.length);
  });

  it("has no duplicate titles", () => {
    const titles = demoSections.map((s) => s.titel);
    const unique = new Set(titles);
    expect(unique.size).toBe(titles.length);
  });

  it("extraLinks have label and href when present", () => {
    const withExtraLinks = demoSections.filter((s) => s.extraLinks);
    expect(withExtraLinks.length).toBeGreaterThan(0);
    for (const section of withExtraLinks) {
      for (const link of section.extraLinks!) {
        expect(link.label).toBeTypeOf("string");
        expect(link.label.length).toBeGreaterThan(0);
        expect(link.href).toBeTypeOf("string");
        expect(link.href.length).toBeGreaterThan(0);
      }
    }
  });

  it("highlight sections exist and are boolean", () => {
    const highlighted = demoSections.filter((s) => s.highlight);
    expect(highlighted.length).toBeGreaterThan(0);
    for (const section of highlighted) {
      expect(section.highlight).toBe(true);
    }
  });

  it("contains the AI-adviseur section", () => {
    const aiSection = demoSections.find((s) =>
      s.titel.includes("AI-adviseur")
    );
    expect(aiSection).toBeDefined();
    expect(aiSection!.highlight).toBe(true);
  });
});
