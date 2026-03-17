"use server";

import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { IMPERSONATE_COOKIE } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/services/audit";
import { redirect } from "next/navigation";

export async function startImpersonation(userId: string) {
  const session = await auth();
  if (!session?.user || (session.user as { role: string }).role !== "ADMIN") {
    throw new Error("Geen toegang");
  }

  // Verifieer dat de doelgebruiker bestaat
  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, naam: true, email: true },
  });

  if (!target) {
    throw new Error("Gebruiker niet gevonden");
  }

  // Audit log
  await logAudit({
    userId: session.user.id,
    userEmail: session.user.email!,
    actie: "impersonate_start",
    entiteit: "User",
    entiteitId: target.id,
    details: `Impersonatie gestart als ${target.naam} (${target.email})`,
  });

  const cookieStore = await cookies();
  cookieStore.set(IMPERSONATE_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60, // 1 uur
  });

  redirect("/");
}

export async function stopImpersonation() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Niet ingelogd");
  }

  // Audit log
  await logAudit({
    userId: session.user.id,
    userEmail: session.user.email!,
    actie: "impersonate_stop",
    entiteit: "User",
    entiteitId: session.user.id,
    details: "Impersonatie beëindigd",
  });

  const cookieStore = await cookies();
  cookieStore.delete(IMPERSONATE_COOKIE);

  redirect("/admin/gebruikers");
}
