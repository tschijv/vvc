import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
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
