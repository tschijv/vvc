import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";
import { logAudit } from "./services/audit";

declare module "next-auth" {
  interface User {
    role: string;
    gemeenteId?: string | null;
    leverancierId?: string | null;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      naam: string;
      role: string;
      gemeenteId?: string | null;
      leverancierId?: string | null;
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
        }).catch(() => {});

        // Derive primary role from rollen array for backward compat
        const primaryRole = user.rollen.includes("ADMIN")
          ? "ADMIN"
          : user.rollen.includes("KING_BEHEERDER")
            ? "ADMIN"
            : user.rollen.includes("GEMEENTE_BEHEERDER") || user.rollen.includes("GEMEENTE_RAADPLEGER")
              ? "GEMEENTE"
              : user.rollen.includes("LEVERANCIER")
                ? "LEVERANCIER"
                : "ANONIEM";

        return {
          id: user.id,
          email: user.email,
          name: user.naam,
          role: primaryRole,
          gemeenteId: user.gemeenteId,
          leverancierId: user.leverancierId,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role;
        token.gemeenteId = (user as { gemeenteId?: string | null }).gemeenteId;
        token.leverancierId = (user as { leverancierId?: string | null }).leverancierId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
        session.user.gemeenteId = token.gemeenteId as string | null;
        session.user.leverancierId = token.leverancierId as string | null;
        session.user.naam = session.user.name as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
});
