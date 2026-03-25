import { NextRequest, NextResponse } from "next/server";
import { getReferentiecomponenten } from "@/service/referentiecomponent";
import { negotiateFormat, isRdfFormat } from "@/integration/rdf/content-negotiation";
import { serializeRdf } from "@/integration/rdf/serializer";
import { referentiecomponentToTriples } from "@/integration/rdf/mappers";
import type { components } from "@/integration/api-types";

type Referentiecomponent = components["schemas"]["Referentiecomponent"];

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

    const data: Referentiecomponent[] = refComps.map((rc) => ({
      id: rc.id,
      naam: rc.naam,
      guid: rc.guid,
      beschrijving: rc.beschrijving,
      aantalPakketversies: rc._count.pakketten,
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
