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
