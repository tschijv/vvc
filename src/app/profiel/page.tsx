import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/process/auth-helpers";
import { prisma } from "@/data/prisma";
import Breadcrumbs from "@/ui/components/Breadcrumbs";
import ProfielForm from "./ProfielForm";

export const metadata: Metadata = {
  title: "Mijn profiel",
};

export default async function ProfielPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect("/auth/login?callbackUrl=/profiel");

  const [user, favorietenCount, ongelezen, recenteActies] = await Promise.all([
    prisma.user.findUnique({
      where: { id: sessionUser.id },
      include: {
        organisatie: { select: { id: true, naam: true } },
        leverancier: { select: { id: true, naam: true, slug: true } },
      },
    }),
    prisma.favoriet.count({ where: { userId: sessionUser.id } }),
    prisma.notificatie.count({ where: { userId: sessionUser.id, gelezen: false } }),
    prisma.auditLog.findMany({
      where: { userId: sessionUser.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        actie: true,
        entiteit: true,
        details: true,
        createdAt: true,
      },
    }),
  ]);

  if (!user) redirect("/auth/login");

  return (
    <div>
      <Breadcrumbs items={[{ label: "Mijn profiel", href: "/profiel" }]} />
      <h1 className="text-2xl font-bold text-[#1a6ca8] dark:text-blue-400 mb-4">Mijn profiel</h1>

      <ProfielForm
        user={JSON.parse(JSON.stringify(user))}
        favorietenCount={favorietenCount}
        ongelezen={ongelezen}
        recenteActies={JSON.parse(JSON.stringify(recenteActies))}
      />
    </div>
  );
}
