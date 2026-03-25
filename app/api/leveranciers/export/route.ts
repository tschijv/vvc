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

  const where = zoek
    ? { naam: { contains: zoek, mode: "insensitive" as const } }
    : {};

  const leveranciers = await prisma.leverancier.findMany({
    where,
    include: {
      _count: { select: { pakketten: true } },
    },
    orderBy: { naam: "asc" },
  });

  const header = "Naam,Contactpersoon,E-mail,Website,Aantal pakketten";
  const rows = leveranciers.map((l) =>
    [
      escapeCsv(l.naam),
      escapeCsv(l.contactpersoon || ""),
      escapeCsv(l.email || ""),
      escapeCsv(l.website || ""),
      String(l._count.pakketten),
    ].join(",")
  );

  const csv = "\uFEFF" + [header, ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="leveranciers.csv"',
    },
  });
}
