import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/v1/standaarden/route";
import { NextRequest } from "next/server";

vi.mock("@/lib/services/standaard", () => ({
  getStandaarden: vi.fn(),
}));

import { getStandaarden } from "@/lib/services/standaard";

const mockGetStandaarden = vi.mocked(getStandaarden);

function createRequest(url: string) {
  return new NextRequest(new URL(url, "http://localhost:3000"));
}

describe("GET /api/v1/standaarden", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retourneert een lijst standaarden met versies", async () => {
    mockGetStandaarden.mockResolvedValue([
      {
        id: "std-1",
        naam: "StUF",
        guid: "stuf-guid",
        beschrijving: "Standaard Uitwisseling Formaat",
        versies: [
          { id: "sv-1", naam: "3.01", _count: { pakketversies: 12 } },
          { id: "sv-2", naam: "2.04", _count: { pakketversies: 8 } },
        ],
      },
      {
        id: "std-2",
        naam: "ZDS",
        guid: "zds-guid",
        beschrijving: null,
        versies: [
          { id: "sv-3", naam: "1.2", _count: { pakketversies: 5 } },
        ],
      },
    ] as unknown as Awaited<ReturnType<typeof getStandaarden>>);

    const response = await GET(createRequest("/api/v1/standaarden"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(2);
    expect(body.data[0].naam).toBe("StUF");
    expect(body.data[0].versies).toHaveLength(2);
    expect(body.data[0].totaalPakketversies).toBe(20);
    expect(body.data[1].totaalPakketversies).toBe(5);
    expect(body.meta.total).toBe(2);
    expect(response.headers.get("X-Total-Count")).toBe("2");
  });

  it("ondersteunt zoekparameter", async () => {
    mockGetStandaarden.mockResolvedValue([]);

    await GET(createRequest("/api/v1/standaarden?zoek=StUF"));

    expect(mockGetStandaarden).toHaveBeenCalledWith({ zoek: "StUF" });
  });

  it("retourneert lege lijst bij geen resultaten", async () => {
    mockGetStandaarden.mockResolvedValue([]);

    const response = await GET(
      createRequest("/api/v1/standaarden?zoek=bestaatniet")
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(0);
    expect(body.meta.total).toBe(0);
  });

  it("retourneert 500 bij interne fout", async () => {
    mockGetStandaarden.mockRejectedValue(new Error("DB error"));

    const response = await GET(createRequest("/api/v1/standaarden"));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Interne serverfout");
  });

  it("berekent totaalPakketversies correct over meerdere versies", async () => {
    mockGetStandaarden.mockResolvedValue([
      {
        id: "std-1",
        naam: "ZGW",
        guid: "zgw-guid",
        beschrijving: "Zaakgericht Werken APIs",
        versies: [
          { id: "sv-1", naam: "1.0", _count: { pakketversies: 10 } },
          { id: "sv-2", naam: "1.1", _count: { pakketversies: 25 } },
          { id: "sv-3", naam: "2.0", _count: { pakketversies: 5 } },
        ],
      },
    ] as unknown as Awaited<ReturnType<typeof getStandaarden>>);

    const response = await GET(createRequest("/api/v1/standaarden"));
    const body = await response.json();

    expect(body.data[0].totaalPakketversies).toBe(40);
    expect(body.data[0].versies).toHaveLength(3);
  });

  it("retourneert 0 totaalPakketversies voor standaard zonder versies", async () => {
    mockGetStandaarden.mockResolvedValue([
      {
        id: "std-1",
        naam: "Nieuw",
        guid: "nieuw-guid",
        beschrijving: null,
        versies: [],
      },
    ] as unknown as Awaited<ReturnType<typeof getStandaarden>>);

    const response = await GET(createRequest("/api/v1/standaarden"));
    const body = await response.json();

    expect(body.data[0].totaalPakketversies).toBe(0);
    expect(body.data[0].versies).toHaveLength(0);
  });
});
