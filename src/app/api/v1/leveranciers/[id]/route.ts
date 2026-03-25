import { NextRequest, NextResponse } from "next/server";
import { getLeverancierById } from "@/service/leverancier";
import { negotiateFormat, isRdfFormat } from "@/integration/rdf/content-negotiation";
import { serializeRdf } from "@/integration/rdf/serializer";
import { leverancierToTriples } from "@/integration/rdf/mappers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const format = negotiateFormat(request);
  const { id } = await params;

  try {
    const leverancier = await getLeverancierById(id);

    if (!leverancier) {
      return NextResponse.json(
        { error: "Leverancier niet gevonden" },
        { status: 404 }
      );
    }

    if (isRdfFormat(format)) {
      const quads = leverancierToTriples(leverancier);
      return serializeRdf(quads, format);
    }

    return NextResponse.json({
      data: {
        id: leverancier.id,
        naam: leverancier.naam,
        slug: leverancier.slug,
        contactpersoon: leverancier.contactpersoon,
        email: leverancier.email,
        website: leverancier.website,
        telefoon: leverancier.telefoon,
        beschrijvingDiensten: leverancier.beschrijvingDiensten,
        supportPortalUrl: leverancier.supportPortalUrl,
        documentatieUrl: leverancier.documentatieUrl,
        kennisbankUrl: leverancier.kennisbankUrl,
        addenda: leverancier.addenda.map((a) => a.addendum.naam),
        pakketten: leverancier.pakketten.map((p) => ({
          id: p.id,
          naam: p.naam,
          slug: p.slug,
          laatsteVersie: p.versies[0]
            ? { naam: p.versies[0].naam, status: p.versies[0].status }
            : null,
        })),
      },
    });
  } catch (error) {
    console.error("API v1 leverancier detail fout:", error);
    return NextResponse.json(
      { error: "Interne serverfout" },
      { status: 500 }
    );
  }
}
