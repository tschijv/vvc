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
