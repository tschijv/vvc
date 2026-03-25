import { NextRequest, NextResponse } from "next/server";
import { getGemeenteById } from "@/service/gemeente";
import { negotiateFormat, isRdfFormat } from "@/integration/rdf/content-negotiation";
import { serializeRdf } from "@/integration/rdf/serializer";
import { gemeenteToTriples } from "@/integration/rdf/mappers";
import type { components } from "@/integration/api-types";

type GemeenteDetail = components["schemas"]["GemeenteDetail"];

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

    const data: GemeenteDetail = {
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
    };

    return NextResponse.json({ data });
  } catch (error) {
    console.error("API v1 gemeente detail fout:", error);
    return NextResponse.json(
      { error: "Interne serverfout" },
      { status: 500 }
    );
  }
}
