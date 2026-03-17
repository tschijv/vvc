import { auth } from "./auth";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

export const IMPERSONATE_COOKIE = "impersonate-user-id";

export type SessionUser = {
  id: string;
  email: string;
  naam: string;
  role: string;
  gemeenteId?: string | null;
  leverancierId?: string | null;
  isImpersonating?: boolean;
  realUser?: { id: string; naam: string } | null;
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
          gemeenteId: true,
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
                : "ANONIEM";

        return {
          id: target.id,
          email: target.email,
          naam: target.naam,
          role: primaryRole,
          gemeenteId: target.gemeenteId,
          leverancierId: target.leverancierId,
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
