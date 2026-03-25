import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseBody } from "@/lib/validation";

const favorietSchema = z.object({
  entityType: z.enum(["pakket", "gemeente", "leverancier"], {
    errorMap: () => ({ message: "Ongeldig entityType" }),
  }),
  entityId: z.string().min(1, "entityId is verplicht"),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const favorieten = await prisma.favoriet.findMany({
    where: { userId: session.user.id },
    select: { id: true, entityType: true, entityId: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ favorieten });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const parsed = await parseBody(req, favorietSchema);
  if ("error" in parsed) return parsed.error;
  const { entityType, entityId } = parsed.data;

  // Toggle: delete if exists, create if not
  const existing = await prisma.favoriet.findUnique({
    where: {
      userId_entityType_entityId: {
        userId: session.user.id,
        entityType,
        entityId,
      },
    },
  });

  if (existing) {
    await prisma.favoriet.delete({ where: { id: existing.id } });
    return NextResponse.json({ favoriet: false });
  }

  const favoriet = await prisma.favoriet.create({
    data: {
      userId: session.user.id,
      entityType,
      entityId,
    },
  });

  return NextResponse.json({ favoriet: true, id: favoriet.id });
}
