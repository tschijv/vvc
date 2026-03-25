import { describe, it, expect } from "vitest";
import { menuItems, type MenuGroup, type MenuItem } from "./menu-items";

describe("menuItems", () => {
  it("is a non-empty array of menu groups", () => {
    expect(Array.isArray(menuItems)).toBe(true);
    expect(menuItems.length).toBeGreaterThan(0);
  });

  it("every group has a label and items array", () => {
    for (const group of menuItems) {
      expect(group.label).toBeTypeOf("string");
      expect(group.label.length).toBeGreaterThan(0);
      expect(Array.isArray(group.items)).toBe(true);
      expect(group.items.length).toBeGreaterThan(0);
    }
  });

  it("every item has a label and href", () => {
    for (const group of menuItems) {
      for (const item of group.items) {
        expect(item.label).toBeTypeOf("string");
        expect(item.label.length).toBeGreaterThan(0);
        expect(item.href).toBeTypeOf("string");
        expect(item.href.length).toBeGreaterThan(0);
      }
    }
  });

  it("all hrefs start with /", () => {
    for (const group of menuItems) {
      for (const item of group.items) {
        expect(item.href).toMatch(/^\//);
      }
    }
  });

  it("has no duplicate hrefs within a group", () => {
    for (const group of menuItems) {
      const hrefs = group.items.map((i) => i.href);
      const unique = new Set(hrefs);
      expect(unique.size).toBe(hrefs.length);
    }
  });

  it("has no duplicate group labels", () => {
    const labels = menuItems.map((g) => g.label);
    const unique = new Set(labels);
    expect(unique.size).toBe(labels.length);
  });

  it("contains the expected groups", () => {
    const labels = menuItems.map((g) => g.label);
    expect(labels).toContain("Hoe werkt de catalogus");
    expect(labels).toContain("Wat is er te vinden");
    expect(labels).toContain("Wie doet er mee");
    expect(labels).toContain("Praktijkvoorbeelden");
  });

  it("contains pakketten link", () => {
    const allItems = menuItems.flatMap((g) => g.items);
    const pakkettenItem = allItems.find((i) => i.href === "/pakketten");
    expect(pakkettenItem).toBeDefined();
    expect(pakkettenItem!.label).toBe("Alle pakketten");
  });

  it("contains leveranciers link", () => {
    const allItems = menuItems.flatMap((g) => g.items);
    const leveranciersItems = allItems.filter((i) => i.href === "/leveranciers");
    expect(leveranciersItems.length).toBeGreaterThan(0);
  });

  it("has more than 10 total items across all groups", () => {
    const totalItems = menuItems.reduce((sum, g) => sum + g.items.length, 0);
    expect(totalItems).toBeGreaterThan(10);
  });
});
