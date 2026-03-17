import { NextRequest, NextResponse } from "next/server";
import { getStandaarden } from "@/lib/services/standaard";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const zoek = searchParams.get("zoek") || undefined;

  try {
    const standaarden = await getStandaarden({ zoek });

    const data = standaarden.map((s) => ({
      id: s.id,
      naam: s.naam,
      guid: s.guid,
      beschrijving: s.beschrijving,
      versies: s.versies.map((v) => ({
        id: v.id,
        naam: v.naam,
        aantalPakketversies: v._count.pakketversies,
      })),
      totaalPakketversies: s.versies.reduce(
        (sum, v) => sum + v._count.pakketversies,
        0
      ),
    }));

    return NextResponse.json(
      { data, meta: { total: data.length } },
      { headers: { "X-Total-Count": String(data.length) } }
    );
  } catch (error) {
    console.error("API v1 standaarden fout:", error);
    return NextResponse.json(
      { error: "Interne serverfout" },
      { status: 500 }
    );
  }
}
