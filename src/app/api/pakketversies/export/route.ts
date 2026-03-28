import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/data/prisma";
import { getSessionUser } from "@/process/auth-helpers";

function escapeCsv(val: unknown): string {
  const str = val == null ? "" : String(val);
  // Prevent CSV injection: prefix formula characters with single quote
  const safe = /^[=+\-@\t\r]/.test(str) ? "'" + str : str;
  // Then handle commas/quotes/newlines as before
  if (safe.includes('"') || safe.includes(",") || safe.includes("\n")) {
    return '"' + safe.replace(/"/g, '""') + '"';
  }
  return safe;
}

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

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
