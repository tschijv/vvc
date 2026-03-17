import { NextRequest, NextResponse } from "next/server";
import { getReferentiecomponenten } from "@/lib/services/referentiecomponent";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const zoek = searchParams.get("zoek") || undefined;

  try {
    const refComps = await getReferentiecomponenten({ zoek });

    const data = refComps.map((rc) => ({
      id: rc.id,
      naam: rc.naam,
      guid: rc.guid,
      beschrijving: rc.beschrijving,
      aantalPakketversies: rc._count.pakketversies,
    }));

    return NextResponse.json(
      { data, meta: { total: data.length } },
      { headers: { "X-Total-Count": String(data.length) } }
    );
  } catch (error) {
    console.error("API v1 referentiecomponenten fout:", error);
    return NextResponse.json(
      { error: "Interne serverfout" },
      { status: 500 }
    );
  }
}
