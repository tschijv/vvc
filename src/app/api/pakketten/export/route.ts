import { NextRequest } from "next/server";
import { prisma } from "@/data/prisma";

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const zoek = searchParams.get("zoek") || undefined;
  const leverancierId = searchParams.get("leverancier") || undefined;
  const referentiecomponentId = searchParams.get("referentiecomponent") || undefined;

  const where = {
    ...(zoek && {
      OR: [
        { naam: { contains: zoek, mode: "insensitive" as const } },
        {
          leverancier: {
            naam: { contains: zoek, mode: "insensitive" as const },
          },
        },
      ],
    }),
    ...(leverancierId && { leverancierId }),
    ...(referentiecomponentId && {
      versies: {
        some: {
          referentiecomponenten: {
            some: { referentiecomponentId },
          },
        },
      },
    }),
  };

  const pakketten = await prisma.pakket.findMany({
    where,
    include: {
      leverancier: { select: { naam: true } },
      versies: {
        include: {
          referentiecomponenten: {
            include: { referentiecomponent: { select: { naam: true } } },
          },
        },
      },
    },
    orderBy: { naam: "asc" },
  });

  const header = "Pakket,Leverancier,Beschrijving,Referentiecomponenten";
  const rows = pakketten.map((p) => {
    const refComps = [
      ...new Set(
        p.versies.flatMap((v) =>
          v.referentiecomponenten.map((rc) => rc.referentiecomponent.naam)
        )
      ),
    ].join("; ");

    return [
      escapeCsv(p.naam),
      escapeCsv(p.leverancier.naam),
      escapeCsv(p.beschrijving || ""),
      escapeCsv(refComps),
    ].join(",");
  });

  const csv = "\uFEFF" + [header, ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="pakketten.csv"',
    },
  });
}
