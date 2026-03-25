import { NextRequest, NextResponse } from "next/server";
import { getGemeenteById } from "@/lib/services/gemeente";
import { negotiateFormat, isRdfFormat } from "@/lib/rdf/content-negotiation";
import { serializeRdf } from "@/lib/rdf/serializer";
import { gemeenteToTriples } from "@/lib/rdf/mappers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const format = negotiateFormat(request);
  const { id } = await params;

  try {
    const gemeente = await getGemeenteById(id);

    if (!gemeente) {
      return NextResponse.json(
        { error: "Gemeente niet gevonden" },
        { status: 404 }
      );
    }

    if (isRdfFormat(format)) {
      const quads = gemeenteToTriples(gemeente);
      return serializeRdf(quads, format);
    }

    return NextResponse.json({
      data: {
        id: gemeente.id,
        naam: gemeente.naam,
        cbsCode: gemeente.cbsCode,
        progress: gemeente.progress,
        contactpersoon: gemeente.contactpersoon,
        email: gemeente.email,
        website: gemeente.website,
        telefoon: gemeente.telefoon,
        samenwerkingen: gemeente.samenwerkingen.map((sg) => ({
          naam: sg.samenwerking.naam,
          type: sg.samenwerking.type,
        })),
      },
    });
  } catch (error) {
    console.error("API v1 gemeente detail fout:", error);
    return NextResponse.json(
      { error: "Interne serverfout" },
      { status: 500 }
    );
  }
}
