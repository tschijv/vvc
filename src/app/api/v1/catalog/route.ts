import { NextRequest, NextResponse } from "next/server";
import { negotiateFormat, isRdfFormat } from "@/integration/rdf/content-negotiation";
import { serializeRdf } from "@/integration/rdf/serializer";
import { catalogToTriples } from "@/integration/rdf/mappers";

export async function GET(request: NextRequest) {
  const format = negotiateFormat(request);

  try {
    if (isRdfFormat(format)) {
      const quads = catalogToTriples();
      return serializeRdf(quads, format);
    }

    return NextResponse.json({
      data: {
        title: "VNG Voorzieningencatalogus",
        description:
          "Catalogus van softwarevoorzieningen, standaarden en referentiecomponenten bij Nederlandse gemeenten.",
        publisher: "VNG Realisatie",
        links: {
          gemeenten: "/api/v1/gemeenten",
          leveranciers: "/api/v1/leveranciers",
          referentiecomponenten: "/api/v1/referentiecomponenten",
          standaarden: "/api/v1/standaarden",
          begrippen: "/api/v1/begrippen",
        },
      },
    });
  } catch (error) {
    console.error("API v1 catalog fout:", error);
    return NextResponse.json(
      { error: "Interne serverfout" },
      { status: 500 }
    );
  }
}
