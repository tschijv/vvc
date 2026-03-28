import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/data/prisma";
import { logAudit } from "@/service/audit";
import { verifyTotpToken } from "@/service/totp";
import { tenant } from "@/process/tenant-config";

class TotpRequiredError extends CredentialsSignin {
  code = "TOTP_REQUIRED";
}

class TotpInvalidError extends CredentialsSignin {
  code = "TOTP_INVALID";
}

export type UserOrganisatieInfo = {
  organisatieId: string;
  rol: string;
  organisatie: { id: string; naam: string };
};

declare module "next-auth" {
  interface User {
    role: string;
    organisatieId?: string | null;
    leverancierId?: string | null;
    isBeheerder?: boolean;
    organisaties?: UserOrganisatieInfo[];
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      naam: string;
      role: string;
      organisatieId?: string | null;
      leverancierId?: string | null;
      isBeheerder?: boolean;
      organisaties?: UserOrganisatieInfo[];
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      name: "Inloggen",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Wachtwoord", type: "password" },
        totpToken: { label: "2FA Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.passwordHash) return null;
        if (!user.actief) return null;

        const isValid = await compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) return null;

        // Check TOTP for all users with 2FA enabled
        if (user.totpEnabled) {
          const totpToken = credentials.totpToken as string | undefined;
          if (!totpToken) {
            throw new TotpRequiredError();
          }
          if (!user.totpSecret || !verifyTotpToken(user.totpSecret, totpToken)) {
            throw new TotpInvalidError();
          }
        }

        // Log successful login
        logAudit({
          userId: user.id,
          userEmail: user.email,
          actie: "login",
          entiteit: "User",
          entiteitId: user.id,
        });

        // Update last access timestamp
        prisma.user.update({
          where: { id: user.id },
          data: { laatsteToegangOp: new Date() },
        }).catch((err) => console.error("Failed to update lastAccess:", err));

        // Fetch user organisaties for multi-org support
        const userOrganisaties = await prisma.userOrganisatie.findMany({
          where: { userId: user.id },
          select: {
            organisatieId: true,
            rol: true,
            organisatie: { select: { id: true, naam: true } },
          },
        });

        // Derive primary role from rollen array for backward compat
        const primaryRole = user.rollen.includes("ADMIN")
          ? "ADMIN"
          : user.rollen.includes("KING_BEHEERDER")
            ? "ADMIN"
            : user.rollen.includes("BEHEERDER") || user.rollen.includes("RAADPLEGER")
              ? tenant.roles.primary
              : user.rollen.includes("LEVERANCIER")
                ? "LEVERANCIER"
                : user.rollen.includes("API_USER")
                  ? "API_USER"
                  : "ANONIEM";

        return {
          id: user.id,
          email: user.email,
          name: user.naam,
          role: primaryRole,
          organisatieId: user.organisatieId,
          leverancierId: user.leverancierId,
          isBeheerder: user.rollen.includes("BEHEERDER") || user.rollen.includes("ADMIN") || user.rollen.includes("KING_BEHEERDER"),
          organisaties: userOrganisaties,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.role = (user as { role: string }).role;
        token.organisatieId = (user as { organisatieId?: string | null }).organisatieId;
        token.leverancierId = (user as { leverancierId?: string | null }).leverancierId;
        token.isBeheerder = (user as { isBeheerder?: boolean }).isBeheerder;
        token.organisaties = (user as { organisaties?: UserOrganisatieInfo[] }).organisaties || [];
      }
      // Refresh organisatieId from DB on session update (e.g. after switching org)
      if (trigger === "update" && token.sub) {
        const freshUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { organisatieId: true },
        });
        if (freshUser) {
          token.organisatieId = freshUser.organisatieId;
        }
        const freshOrgs = await prisma.userOrganisatie.findMany({
          where: { userId: token.sub },
          select: {
            organisatieId: true,
            rol: true,
            organisatie: { select: { id: true, naam: true } },
          },
        });
        token.organisaties = freshOrgs;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
        session.user.organisatieId = token.organisatieId as string | null;
        session.user.leverancierId = token.leverancierId as string | null;
        session.user.naam = session.user.name as string;
        session.user.isBeheerder = token.isBeheerder as boolean | undefined;
        session.user.organisaties = token.organisaties as UserOrganisatieInfo[] | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
});
