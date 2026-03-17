import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/v1/gemeenten/route";
import { NextRequest } from "next/server";

// Mock the service layer
vi.mock("@/lib/services/gemeente", () => ({
  getGemeenten: vi.fn(),
  getGemeenteCount: vi.fn(),
}));

import { getGemeenten, getGemeenteCount } from "@/lib/services/gemeente";

const mockGetGemeenten = vi.mocked(getGemeenten);
const mockGetGemeenteCount = vi.mocked(getGemeenteCount);

function createRequest(url: string) {
  return new NextRequest(new URL(url, "http://localhost:3000"));
}

describe("GET /api/v1/gemeenten", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retourneert een lijst gemeenten", async () => {
    mockGetGemeenten.mockResolvedValue([
      {
        id: "gem-1",
        naam: "Amsterdam",
        cbsCode: "0363",
        progress: 85,
        _count: { pakketten: 42 },
      },
      {
        id: "gem-2",
        naam: "Rotterdam",
        cbsCode: "0599",
        progress: 72,
        _count: { pakketten: 35 },
      },
    ] as Awaited<ReturnType<typeof getGemeenten>>);
    mockGetGemeenteCount.mockResolvedValue(2);

    const response = await GET(createRequest("/api/v1/gemeenten"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(2);
    expect(body.data[0].naam).toBe("Amsterdam");
    expect(body.data[0].aantalPakketten).toBe(42);
    expect(body.meta).toEqual({ total: 2, offset: 0, limit: 50 });
    expect(response.headers.get("X-Total-Count")).toBe("2");
  });

  it("ondersteunt zoekparameter", async () => {
    mockGetGemeenten.mockResolvedValue([]);
    mockGetGemeenteCount.mockResolvedValue(0);

    await GET(createRequest("/api/v1/gemeenten?zoek=Amster"));

    expect(mockGetGemeenten).toHaveBeenCalledWith(
      expect.objectContaining({ zoek: "Amster" })
    );
    expect(mockGetGemeenteCount).toHaveBeenCalledWith(
      expect.objectContaining({ zoek: "Amster" })
    );
  });

  it("ondersteunt paginatie", async () => {
    mockGetGemeenten.mockResolvedValue([]);
    mockGetGemeenteCount.mockResolvedValue(100);

    const response = await GET(
      createRequest("/api/v1/gemeenten?offset=20&limit=10")
    );
    const body = await response.json();

    expect(mockGetGemeenten).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 })
    );
    expect(body.meta).toEqual({ total: 100, offset: 20, limit: 10 });
  });

  it("beperkt limit tot maximum 200", async () => {
    mockGetGemeenten.mockResolvedValue([]);
    mockGetGemeenteCount.mockResolvedValue(0);

    await GET(createRequest("/api/v1/gemeenten?limit=500"));

    expect(mockGetGemeenten).toHaveBeenCalledWith(
      expect.objectContaining({ take: 200 })
    );
  });

  it("retourneert lege lijst als er geen resultaten zijn", async () => {
    mockGetGemeenten.mockResolvedValue([]);
    mockGetGemeenteCount.mockResolvedValue(0);

    const response = await GET(
      createRequest("/api/v1/gemeenten?zoek=bestaatniet")
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(0);
    expect(body.meta.total).toBe(0);
  });

  it("retourneert 500 bij interne fout", async () => {
    mockGetGemeenten.mockRejectedValue(new Error("DB connection lost"));
    mockGetGemeenteCount.mockResolvedValue(0);

    const response = await GET(createRequest("/api/v1/gemeenten"));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Interne serverfout");
  });

  it("gebruikt default offset 0 bij negatieve waarde", async () => {
    mockGetGemeenten.mockResolvedValue([]);
    mockGetGemeenteCount.mockResolvedValue(0);

    await GET(createRequest("/api/v1/gemeenten?offset=-5"));

    expect(mockGetGemeenten).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0 })
    );
  });

  it("gebruikt default limit bij ongeldige waarde", async () => {
    mockGetGemeenten.mockResolvedValue([]);
    mockGetGemeenteCount.mockResolvedValue(0);

    await GET(createRequest("/api/v1/gemeenten?limit=abc"));

    expect(mockGetGemeenten).toHaveBeenCalledWith(
      expect.objectContaining({ take: 50 })
    );
  });
});
