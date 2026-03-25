import { NextRequest, NextResponse } from "next/server";
import { getReferentiecomponenten } from "@/lib/services/referentiecomponent";
import { negotiateFormat, isRdfFormat } from "@/lib/rdf/content-negotiation";
import { serializeRdf } from "@/lib/rdf/serializer";
import { referentiecomponentToTriples } from "@/lib/rdf/mappers";

export async function GET(request: NextRequest) {
  const format = negotiateFormat(request);
  const { searchParams } = new URL(request.url);
  const zoek = searchParams.get("zoek") || undefined;

  try {
    const refComps = await getReferentiecomponenten({ zoek });

    if (isRdfFormat(format)) {
      const quads = refComps.flatMap((rc) => referentiecomponentToTriples(rc));
      return serializeRdf(quads, format);
    }

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
