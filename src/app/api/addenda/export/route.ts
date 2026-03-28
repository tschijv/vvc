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

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const zoek = searchParams.get("zoek") || undefined;
  const type = searchParams.get("type") || undefined;

  const where: Record<string, unknown> = {};

  if (zoek) {
    where.leverancier = { naam: { contains: zoek, mode: "insensitive" } };
  }

  if (type) {
    where.addendum = { naam: type };
  }

  const addenda = await prisma.leverancierAddendum.findMany({
    where,
    include: {
      leverancier: { select: { naam: true } },
      addendum: { select: { naam: true } },
    },
    orderBy: { leverancier: { naam: "asc" } },
  });

  const header = "Leverancier,Addendum type,Datum ondertekend,Deadline";
  const rows = addenda.map((a) =>
    [
      escapeCsv(a.leverancier.naam),
      escapeCsv(a.addendum.naam),
      escapeCsv(formatDate(a.ondertekend)),
      escapeCsv(formatDate(a.deadline)),
    ].join(",")
  );

  const csv = "\uFEFF" + [header, ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="addenda.csv"',
    },
  });
}
