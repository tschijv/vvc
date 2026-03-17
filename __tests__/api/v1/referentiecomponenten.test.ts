import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/v1/referentiecomponenten/route";
import { NextRequest } from "next/server";

vi.mock("@/lib/services/referentiecomponent", () => ({
  getReferentiecomponenten: vi.fn(),
}));

import { getReferentiecomponenten } from "@/lib/services/referentiecomponent";

const mockGetReferentiecomponenten = vi.mocked(getReferentiecomponenten);

function createRequest(url: string) {
  return new NextRequest(new URL(url, "http://localhost:3000"));
}

describe("GET /api/v1/referentiecomponenten", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retourneert een lijst referentiecomponenten", async () => {
    mockGetReferentiecomponenten.mockResolvedValue([
      {
        id: "rc-1",
        naam: "Zaakregistratie",
        guid: "abc-123",
        beschrijving: "Component voor zaakregistratie",
        _count: { pakketversies: 8 },
      },
      {
        id: "rc-2",
        naam: "Documentbeheer",
        guid: "def-456",
        beschrijving: null,
        _count: { pakketversies: 5 },
      },
    ] as unknown as Awaited<ReturnType<typeof getReferentiecomponenten>>);

    const response = await GET(
      createRequest("/api/v1/referentiecomponenten")
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(2);
    expect(body.data[0].naam).toBe("Zaakregistratie");
    expect(body.data[0].aantalPakketversies).toBe(8);
    expect(body.meta.total).toBe(2);
    expect(response.headers.get("X-Total-Count")).toBe("2");
  });

  it("ondersteunt zoekparameter", async () => {
    mockGetReferentiecomponenten.mockResolvedValue([]);

    await GET(createRequest("/api/v1/referentiecomponenten?zoek=Zaak"));

    expect(mockGetReferentiecomponenten).toHaveBeenCalledWith({
      zoek: "Zaak",
    });
  });

  it("retourneert lege lijst bij geen resultaten", async () => {
    mockGetReferentiecomponenten.mockResolvedValue([]);

    const response = await GET(
      createRequest("/api/v1/referentiecomponenten?zoek=bestaatniet")
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(0);
    expect(body.meta.total).toBe(0);
  });

  it("retourneert 500 bij interne fout", async () => {
    mockGetReferentiecomponenten.mockRejectedValue(new Error("DB error"));

    const response = await GET(
      createRequest("/api/v1/referentiecomponenten")
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Interne serverfout");
  });

  it("behandelt null beschrijving correct", async () => {
    mockGetReferentiecomponenten.mockResolvedValue([
      {
        id: "rc-1",
        naam: "Test",
        guid: "test-guid",
        beschrijving: null,
        _count: { pakketversies: 0 },
      },
    ] as unknown as Awaited<ReturnType<typeof getReferentiecomponenten>>);

    const response = await GET(
      createRequest("/api/v1/referentiecomponenten")
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data[0].beschrijving).toBeNull();
    expect(body.data[0].aantalPakketversies).toBe(0);
  });
});
