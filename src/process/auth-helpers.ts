import { auth } from "./auth";
import type { UserOrganisatieInfo } from "./auth";
import { cookies } from "next/headers";
import { prisma } from "@/data/prisma";

export const IMPERSONATE_COOKIE = "impersonate-user-id";

export type SessionUser = {
  id: string;
  email: string;
  naam: string;
  role: string;
  organisatieId?: string | null;
  leverancierId?: string | null;
  isBeheerder?: boolean;
  isImpersonating?: boolean;
  realUser?: { id: string; naam: string } | null;
  organisaties?: UserOrganisatieInfo[];
} | null;

/**
 * Haal de huidige sessie-gebruiker op (server-side).
 * Als een admin een andere gebruiker impersoneert, retourneer die gebruiker.
 * Retourneert null als niet ingelogd.
 */
export async function getSessionUser(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user) return null;

  const realUser = session.user as NonNullable<SessionUser>;

  // Check impersonatie cookie (alleen voor ADMIN)
  if (realUser.role === "ADMIN") {
    const cookieStore = await cookies();
    const impersonateId = cookieStore.get(IMPERSONATE_COOKIE)?.value;

    if (impersonateId) {
      const target = await prisma.user.findUnique({
        where: { id: impersonateId },
        select: {
          id: true,
          email: true,
          naam: true,
          rollen: true,
          organisatieId: true,
          leverancierId: true,
        },
      });

      if (target) {
        const primaryRole = target.rollen.includes("ADMIN")
          ? "ADMIN"
          : target.rollen.includes("KING_BEHEERDER")
            ? "ADMIN"
            : target.rollen.includes("GEMEENTE_BEHEERDER") || target.rollen.includes("GEMEENTE_RAADPLEGER")
              ? "GEMEENTE"
              : target.rollen.includes("LEVERANCIER")
                ? "LEVERANCIER"
                : target.rollen.includes("API_USER")
                  ? "API_USER"
                  : "ANONIEM";

        return {
          id: target.id,
          email: target.email,
          naam: target.naam,
          role: primaryRole,
          organisatieId: target.organisatieId,
          leverancierId: target.leverancierId,
          isBeheerder: target.rollen.includes("GEMEENTE_BEHEERDER") || target.rollen.includes("ADMIN") || target.rollen.includes("KING_BEHEERDER"),
          isImpersonating: true,
          realUser: { id: realUser.id, naam: realUser.naam },
        };
      }
    }
  }

  return realUser;
}

/**
 * Mag deze gebruiker het applicatieportfolio van een gemeente zien?
 * - Admin: altijd
 * - Gemeente: altijd (mag alle gemeenten zien)
 * - Leverancier: ja, maar gefilterd (zie filterGemeentePakketten)
 * - Anoniem: nee
 */
export function canViewGemeentePortfolio(user: SessionUser): boolean {
  if (!user) return false;
  return ["ADMIN", "GEMEENTE", "LEVERANCIER"].includes(user.role);
}

/**
 * Mag deze gebruiker contactgegevens van gemeenten zien?
 * - Admin: ja
 * - Gemeente: ja
 * - Leverancier: nee
 * - Anoniem: nee
 */
export function canViewGemeenteContact(user: SessionUser): boolean {
  if (!user) return false;
  return ["ADMIN", "GEMEENTE"].includes(user.role);
}

/**
 * Filter het applicatieportfolio van een gemeente op basis van de rol.
 * - Admin/Gemeente: volledig portfolio
 * - Leverancier: alleen pakketten van de eigen leverancier
 */
/**
 * Mag deze gebruiker CMS-pagina's bewerken?
 * - Alleen ADMIN
 */
export function canEditPagina(user: SessionUser): boolean {
  if (!user) return false;
  return user.role === "ADMIN";
}

/**
 * Mag deze gebruiker het portfolio van een gemeente bewerken?
 * - Admin: altijd
 * - Gemeente beheerder: eigen actieve organisatie OR any organisatie via UserOrganisatie met BEHEERDER rol
 */
export function canEditGemeentePortfolio(user: SessionUser, organisatieId: string): boolean {
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  if (user.role === "GEMEENTE" && user.isBeheerder && user.organisatieId === organisatieId) return true;
  // Check multi-org: user may have BEHEERDER role for this org via UserOrganisatie
  if (user.role === "GEMEENTE" && user.organisaties) {
    const membership = user.organisaties.find(
      (uo) => uo.organisatieId === organisatieId && uo.rol === "BEHEERDER"
    );
    if (membership) return true;
  }
  return false;
}

/**
 * Switch the active organisatie for a user.
 * Verifies user has access to the org via UserOrganisatie.
 * Returns true on success, false if user has no access.
 */
export async function switchActiveOrganisatie(userId: string, organisatieId: string): Promise<boolean> {
  const membership = await prisma.userOrganisatie.findUnique({
    where: { userId_organisatieId: { userId, organisatieId } },
  });
  if (!membership) return false;

  await prisma.user.update({
    where: { id: userId },
    data: { organisatieId },
  });
  return true;
}

/**
 * Mag deze gebruiker pakketten van een leverancier bewerken?
 * - Admin: altijd
 * - Leverancier: alleen eigen pakketten
 */
export function canEditLeverancierPakket(user: SessionUser, leverancierId: string): boolean {
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  if (user.role === "LEVERANCIER" && user.leverancierId === leverancierId) return true;
  return false;
}

export function filterGemeentePakketten<
  T extends { pakketversie: { pakket: { leverancierId: string } } }
>(user: SessionUser, pakketten: T[]): T[] {
  if (!user) return [];

  if (user.role === "ADMIN" || user.role === "GEMEENTE") {
    return pakketten;
  }

  if (user.role === "LEVERANCIER" && user.leverancierId) {
    return pakketten.filter(
      (gp) => gp.pakketversie.pakket.leverancierId === user.leverancierId
    );
  }

  return [];
}
