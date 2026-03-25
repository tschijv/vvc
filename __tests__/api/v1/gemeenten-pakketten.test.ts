import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/v1/gemeenten/[id]/pakketten/route";
import { NextRequest } from "next/server";

// Mock the service layer and prisma
vi.mock("@/lib/services/gemeente", () => ({
  getGemeentePakketten: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    organisatie: {
      findUnique: vi.fn(),
    },
  },
}));

import { getGemeentePakketten } from "@/lib/services/gemeente";
import { prisma } from "@/lib/prisma";

const mockGetGemeentePakketten = vi.mocked(getGemeentePakketten);
const mockFindUnique = vi.mocked(prisma.organisatie.findUnique);

function createRequest(url: string) {
  return new NextRequest(new URL(url, "http://localhost:3000"));
}

describe("GET /api/v1/gemeenten/[id]/pakketten", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retourneert pakketportfolio van een gemeente", async () => {
    mockFindUnique.mockResolvedValue({
      id: "gem-1",
      naam: "Amsterdam",
    } as ReturnType<typeof prisma.organisatie.findUnique> extends Promise<infer T> ? T : never);

    mockGetGemeentePakketten.mockResolvedValue([
      {
        pakketversie: {
          naam: "3.2",
          status: "In gebruik",
          pakket: {
            id: "pak-1",
            naam: "Zaaksysteem",
            slug: "zaaksysteem",
            leverancier: { naam: "Leverancier A" },
          },
          referentiecomponenten: [
            {
              referentiecomponent: {
                naam: "Zaakregistratie",
                guid: "abc-123",
              },
            },
          ],
          standaarden: [],
        },
        status: "productie",
        datumIngangStatus: null,
      },
    ] as unknown as Awaited<ReturnType<typeof getGemeentePakketten>>);

    const response = await GET(createRequest("/api/v1/gemeenten/gem-1/pakketten"), {
      params: Promise.resolve({ id: "gem-1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].pakketNaam).toBe("Zaaksysteem");
    expect(body.data[0].leverancier.naam).toBe("Leverancier A");
    expect(body.data[0].referentiecomponenten).toHaveLength(1);
    expect(body.meta.gemeenteNaam).toBe("Amsterdam");
  });

  it("retourneert 404 voor onbekende gemeente", async () => {
    mockFindUnique.mockResolvedValue(null);

    const response = await GET(
      createRequest("/api/v1/gemeenten/onbekend/pakketten"),
      { params: Promise.resolve({ id: "onbekend" }) }
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Gemeente niet gevonden");
  });
});
