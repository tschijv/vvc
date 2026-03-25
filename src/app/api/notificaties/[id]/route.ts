import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/process/auth";
import { prisma } from "@/data/prisma";

export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const { id } = await params;

  const notificatie = await prisma.notificatie.findUnique({ where: { id } });
  if (!notificatie || notificatie.userId !== session.user.id) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }

  const updated = await prisma.notificatie.update({
    where: { id },
    data: { gelezen: true },
  });

  return NextResponse.json(updated);
}
