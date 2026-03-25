import { NextResponse } from "next/server";
import { auth } from "@/process/auth";
import { prisma } from "@/data/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const notificaties = await prisma.notificatie.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const ongelezen = await prisma.notificatie.count({
    where: { userId: session.user.id, gelezen: false },
  });

  return NextResponse.json({ notificaties, ongelezen });
}
