import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { hash } from "bcryptjs";

// ─── Types ──────────────────────────────────────────────────────────────────────

export type UserListItem = {
  id: string;
  email: string;
  naam: string;
  actief: boolean;
  rollen: Role[];
  gemeenteNaam: string | null;
  leverancierNaam: string | null;
  laatsteToegangOp: Date | null;
  createdAt: Date;
};

export type UserDetail = UserListItem & {
  gemeenteId: string | null;
  leverancierId: string | null;
};

// ─── Lijst & zoek ──────────────────────────────────────────────────────────────

export async function getUsers(options?: {
  zoek?: string;
  rol?: Role;
  actief?: boolean;
  skip?: number;
  take?: number;
}): Promise<UserListItem[]> {
  const { zoek, rol, actief, skip, take } = options || {};

  const where: Record<string, unknown> = {};
  if (zoek) {
    where.OR = [
      { naam: { contains: zoek, mode: "insensitive" } },
      { email: { contains: zoek, mode: "insensitive" } },
    ];
  }
  if (rol) {
    where.rollen = { has: rol };
  }
  if (actief !== undefined) {
    where.actief = actief;
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      gemeente: { select: { naam: true } },
      leverancier: { select: { naam: true } },
    },
    orderBy: { createdAt: "desc" },
    ...(skip !== undefined && { skip }),
    ...(take !== undefined && { take }),
  });

  return users.map((u) => ({
    id: u.id,
    email: u.email,
    naam: u.naam,
    actief: u.actief,
    rollen: u.rollen,
    gemeenteNaam: u.gemeente?.naam || null,
    leverancierNaam: u.leverancier?.naam || null,
    laatsteToegangOp: u.laatsteToegangOp,
    createdAt: u.createdAt,
  }));
}

export async function getUserCount(options?: {
  zoek?: string;
  rol?: Role;
  actief?: boolean;
}): Promise<number> {
  const { zoek, rol, actief } = options || {};

  const where: Record<string, unknown> = {};
  if (zoek) {
    where.OR = [
      { naam: { contains: zoek, mode: "insensitive" } },
      { email: { contains: zoek, mode: "insensitive" } },
    ];
  }
  if (rol) {
    where.rollen = { has: rol };
  }
  if (actief !== undefined) {
    where.actief = actief;
  }

  return prisma.user.count({ where });
}

// ─── Detail ─────────────────────────────────────────────────────────────────────

export async function getUserById(id: string): Promise<UserDetail | null> {
  const u = await prisma.user.findUnique({
    where: { id },
    include: {
      gemeente: { select: { naam: true } },
      leverancier: { select: { naam: true } },
    },
  });

  if (!u) return null;

  return {
    id: u.id,
    email: u.email,
    naam: u.naam,
    actief: u.actief,
    rollen: u.rollen,
    gemeenteId: u.gemeenteId,
    gemeenteNaam: u.gemeente?.naam || null,
    leverancierId: u.leverancierId,
    leverancierNaam: u.leverancier?.naam || null,
    laatsteToegangOp: u.laatsteToegangOp,
    createdAt: u.createdAt,
  };
}

// ─── Mutaties ───────────────────────────────────────────────────────────────────

export async function createUser(data: {
  email: string;
  naam: string;
  wachtwoord?: string;
  rollen: Role[];
  gemeenteId?: string | null;
  leverancierId?: string | null;
}) {
  const passwordHash = data.wachtwoord
    ? await hash(data.wachtwoord, 10)
    : null;

  return prisma.user.create({
    data: {
      email: data.email,
      naam: data.naam,
      passwordHash,
      rollen: data.rollen,
      gemeenteId: data.gemeenteId || null,
      leverancierId: data.leverancierId || null,
    },
  });
}

export async function updateUser(
  id: string,
  data: {
    naam?: string;
    email?: string;
    wachtwoord?: string;
    actief?: boolean;
    rollen?: Role[];
    gemeenteId?: string | null;
    leverancierId?: string | null;
  }
) {
  const { wachtwoord, ...rest } = data;

  const updateData: Record<string, unknown> = { ...rest };
  if (wachtwoord) {
    updateData.passwordHash = await hash(wachtwoord, 10);
  }

  return prisma.user.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteUser(id: string) {
  return prisma.user.delete({
    where: { id },
  });
}

// ─── Rollen helper ──────────────────────────────────────────────────────────────

export const ROLLEN_LABELS: Record<Role, string> = {
  GEVERIFIEERD: "Geverifieerde gebruiker",
  GEMEENTE_RAADPLEGER: "Gemeente raadpleger",
  GEMEENTE_BEHEERDER: "Gemeente beheerder",
  SAMENWERKING_BEHEERDER: "Samenwerking beheerder",
  LEVERANCIER: "Leverancier",
  REDACTEUR: "Redacteur",
  KING_RAADPLEGER: "KING raadpleger",
  KING_BEHEERDER: "KING beheerder",
  ADMIN: "Administrator",
  API_USER: "API user",
};

export const ALL_ROLES = Object.keys(ROLLEN_LABELS) as Role[];

// ─── Zelf-registratie ────────────────────────────────────────────────────────

export type PendingRegistration = {
  id: string;
  email: string;
  naam: string;
  organisatieType: string | null;
  organisatieNaam: string | null;
  afgewezen: boolean;
  createdAt: Date;
};

export async function registerUser(data: {
  email: string;
  naam: string;
  wachtwoord: string;
  organisatieType: string;
  organisatieNaam: string;
}) {
  const passwordHash = await hash(data.wachtwoord, 10);

  return prisma.user.create({
    data: {
      email: data.email,
      naam: data.naam,
      passwordHash,
      actief: false,
      rollen: [],
      registratieBron: "zelfregistratie",
      organisatieType: data.organisatieType,
      organisatieNaam: data.organisatieNaam,
    },
  });
}

export async function getPendingRegistrations(): Promise<PendingRegistration[]> {
  const users = await prisma.user.findMany({
    where: {
      registratieBron: "zelfregistratie",
      actief: false,
      afgewezen: false,
    },
    orderBy: { createdAt: "desc" },
  });

  return users.map((u) => ({
    id: u.id,
    email: u.email,
    naam: u.naam,
    organisatieType: u.organisatieType,
    organisatieNaam: u.organisatieNaam,
    afgewezen: u.afgewezen,
    createdAt: u.createdAt,
  }));
}

export async function getPendingRegistrationCount(): Promise<number> {
  return prisma.user.count({
    where: {
      registratieBron: "zelfregistratie",
      actief: false,
      afgewezen: false,
    },
  });
}

export async function approveRegistration(
  id: string,
  data: {
    rollen: Role[];
    gemeenteId?: string | null;
    leverancierId?: string | null;
  }
) {
  const user = await prisma.user.update({
    where: { id },
    data: {
      actief: true,
      rollen: data.rollen,
      gemeenteId: data.gemeenteId || null,
      leverancierId: data.leverancierId || null,
    },
  });

  const { sendEmail } = await import("@/lib/email");
  const { registratieGoedgekeurdEmail } = await import("@/lib/email-templates");
  const { subject, html } = registratieGoedgekeurdEmail(user.naam);
  await sendEmail({ to: user.email, subject, html });

  return user;
}

export async function rejectRegistration(id: string, reden?: string) {
  const user = await prisma.user.update({
    where: { id },
    data: {
      afgewezen: true,
    },
  });

  const { sendEmail } = await import("@/lib/email");
  const { registratieAfgewezenEmail } = await import("@/lib/email-templates");
  const { subject, html } = registratieAfgewezenEmail(user.naam, reden);
  await sendEmail({ to: user.email, subject, html });

  return user;
}
