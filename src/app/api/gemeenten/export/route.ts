import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/data/prisma";
import { getSessionUser } from "@/process/auth-helpers";
import { tenant } from "@/process/tenant-config";

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
  const pakketId = searchParams.get("pakket") || undefined;

  const where: Record<string, unknown> = {};
  if (zoek) {
    where.naam = { contains: zoek, mode: "insensitive" };
  }
  if (pakketId) {
    where.pakketten = {
      some: {
        pakketversie: {
          pakket: { id: pakketId },
        },
      },
    };
  }

  const gemeenten = await prisma.organisatie.findMany({
    where,
    include: {
      _count: { select: { pakketten: true } },
    },
    orderBy: { naam: "asc" },
  });

  const header = "Naam,CBS-code,Contactpersoon,E-mail,Voortgang,Aantal pakketten";
  const rows = gemeenten.map((g) =>
    [
      escapeCsv(g.naam),
      escapeCsv(g.cbsCode || ""),
      escapeCsv(g.contactpersoon || ""),
      escapeCsv(g.email || ""),
      String(g.progress),
      String(g._count.pakketten),
    ].join(",")
  );

  const csv = "\uFEFF" + [header, ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${tenant.organisatieType.meervoud}.csv"`,
    },
  });
}
