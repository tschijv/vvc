import { NextResponse } from "next/server";
import { auth } from "@/process/auth";
import { prisma } from "@/data/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  await prisma.notificatie.updateMany({
    where: { userId: session.user.id, gelezen: false },
    data: { gelezen: true },
  });

  return NextResponse.json({ ok: true });
}
