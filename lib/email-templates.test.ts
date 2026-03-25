import { describe, it, expect } from "vitest";
import {
  registratieOntvangenEmail,
  registratieGoedgekeurdEmail,
  registratieAfgewezenEmail,
  wachtwoordResetEmail,
} from "./email-templates";

describe("registratieOntvangenEmail", () => {
  it("returns subject and html", () => {
    const result = registratieOntvangenEmail("Jan");
    expect(result.subject).toBeTypeOf("string");
    expect(result.html).toBeTypeOf("string");
  });

  it("has correct subject line", () => {
    const result = registratieOntvangenEmail("Jan");
    expect(result.subject).toContain("Aanmelding ontvangen");
    expect(result.subject).toContain("VNG Voorzieningencatalogus");
  });

  it("includes the person name in html", () => {
    const result = registratieOntvangenEmail("Pieter");
    expect(result.html).toContain("Pieter");
  });

  it("contains valid HTML structure", () => {
    const result = registratieOntvangenEmail("Jan");
    expect(result.html).toContain("<!DOCTYPE html>");
    expect(result.html).toContain("<html");
    expect(result.html).toContain("</html>");
  });

  it("contains the VNG brand header", () => {
    const result = registratieOntvangenEmail("Jan");
    expect(result.html).toContain("VNG Voorzieningencatalogus");
  });

  it("handles names with special characters", () => {
    const result = registratieOntvangenEmail("Jan-Willem van der Berg");
    expect(result.html).toContain("Jan-Willem van der Berg");
  });
});

describe("registratieGoedgekeurdEmail", () => {
  it("returns subject and html", () => {
    const result = registratieGoedgekeurdEmail("Maria");
    expect(result.subject).toBeTypeOf("string");
    expect(result.html).toBeTypeOf("string");
  });

  it("has correct subject about activation", () => {
    const result = registratieGoedgekeurdEmail("Maria");
    expect(result.subject).toContain("Account geactiveerd");
  });

  it("includes the person name", () => {
    const result = registratieGoedgekeurdEmail("Maria");
    expect(result.html).toContain("Maria");
  });

  it("contains login link", () => {
    const result = registratieGoedgekeurdEmail("Maria");
    expect(result.html).toContain("/auth/login");
    expect(result.html).toContain("Inloggen");
  });

  it("contains a styled button/link", () => {
    const result = registratieGoedgekeurdEmail("Maria");
    expect(result.html).toContain("<a href=");
  });
});

describe("registratieAfgewezenEmail", () => {
  it("returns subject and html", () => {
    const result = registratieAfgewezenEmail("Kees");
    expect(result.subject).toBeTypeOf("string");
    expect(result.html).toBeTypeOf("string");
  });

  it("has correct subject about rejection", () => {
    const result = registratieAfgewezenEmail("Kees");
    expect(result.subject).toContain("Aanmelding afgewezen");
  });

  it("includes the person name", () => {
    const result = registratieAfgewezenEmail("Kees");
    expect(result.html).toContain("Kees");
  });

  it("includes reason when provided", () => {
    const result = registratieAfgewezenEmail("Kees", "Onbekende organisatie");
    expect(result.html).toContain("Onbekende organisatie");
    expect(result.html).toContain("Reden:");
  });

  it("omits reason section when not provided", () => {
    const result = registratieAfgewezenEmail("Kees");
    expect(result.html).not.toContain("Reden:");
  });

  it("omits reason section for undefined", () => {
    const result = registratieAfgewezenEmail("Kees", undefined);
    expect(result.html).not.toContain("Reden:");
  });
});

describe("wachtwoordResetEmail", () => {
  it("returns subject and html", () => {
    const result = wachtwoordResetEmail("Sofie", "https://example.com/reset/abc123");
    expect(result.subject).toBeTypeOf("string");
    expect(result.html).toBeTypeOf("string");
  });

  it("has correct subject about password reset", () => {
    const result = wachtwoordResetEmail("Sofie", "https://example.com/reset/abc123");
    expect(result.subject).toContain("Wachtwoord herstellen");
  });

  it("includes the person name", () => {
    const result = wachtwoordResetEmail("Sofie", "https://example.com/reset/abc123");
    expect(result.html).toContain("Sofie");
  });

  it("includes the reset URL", () => {
    const resetUrl = "https://example.com/reset/abc123";
    const result = wachtwoordResetEmail("Sofie", resetUrl);
    expect(result.html).toContain(resetUrl);
  });

  it("mentions link expiry time", () => {
    const result = wachtwoordResetEmail("Sofie", "https://example.com/reset/abc123");
    expect(result.html).toContain("1 uur");
  });

  it("has a button with the reset link", () => {
    const resetUrl = "https://example.com/reset/token";
    const result = wachtwoordResetEmail("Sofie", resetUrl);
    expect(result.html).toContain(`href="${resetUrl}"`);
  });
});
