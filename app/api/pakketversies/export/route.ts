import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

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
  const statusFilter = searchParams.get("status") || undefined;
  const referentiecomponentId = searchParams.get("referentiecomponent") || undefined;

  const where = {
    ...(zoek && {
      OR: [
        { naam: { contains: zoek, mode: "insensitive" as const } },
        {
          pakket: {
            naam: { contains: zoek, mode: "insensitive" as const },
          },
        },
        {
          pakket: {
            leverancier: {
              naam: { contains: zoek, mode: "insensitive" as const },
            },
          },
        },
      ],
    }),
    ...(leverancierId && {
      pakket: {
        leverancierId,
      },
    }),
    ...(statusFilter && { status: statusFilter }),
    ...(referentiecomponentId && {
      pakket: {
        referentiecomponenten: {
          some: { referentiecomponentId },
        },
      },
    }),
  };

  const pakketversies = await prisma.pakketversie.findMany({
    where,
    include: {
      pakket: {
        select: {
          naam: true,
          leverancier: { select: { naam: true } },
          referentiecomponenten: {
            include: { referentiecomponent: { select: { naam: true } } },
          },
        },
      },
    },
    orderBy: { naam: "asc" },
  });

  const header = "Pakketversie,Pakket,Leverancier,Status,Referentiecomponenten";
  const rows = pakketversies.map((pv) => {
    const refComps = [
      ...new Set(
        pv.pakket.referentiecomponenten.map((rc) => rc.referentiecomponent.naam)
      ),
    ].join("; ");

    return [
      escapeCsv(pv.naam),
      escapeCsv(pv.pakket.naam),
      escapeCsv(pv.pakket.leverancier.naam),
      escapeCsv(pv.status),
      escapeCsv(refComps),
    ].join(",");
  });

  const csv = "\uFEFF" + [header, ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="pakketversies.csv"',
    },
  });
}
