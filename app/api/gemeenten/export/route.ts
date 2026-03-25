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

  const gemeenten = await prisma.gemeente.findMany({
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
      "Content-Disposition": 'attachment; filename="gemeenten.csv"',
    },
  });
}
