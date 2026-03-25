import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Breadcrumbs from "@/components/Breadcrumbs";
import NotificatiesClient from "./NotificatiesClient";

export const metadata: Metadata = {
  title: "Notificaties",
};

export default async function NotificatiesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const { filter = "alle" } = await searchParams;

  const where = {
    userId: session.user.id,
    ...(filter === "ongelezen" && { gelezen: false }),
    ...(filter === "gelezen" && { gelezen: true }),
  };

  const notificaties = await prisma.notificatie.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const ongelezen = await prisma.notificatie.count({
    where: { userId: session.user.id, gelezen: false },
  });

  return (
    <div>
      <Breadcrumbs items={[{ label: "Notificaties", href: "/notificaties" }]} />
      <h1 className="text-2xl font-bold text-blue-700 mb-4">Notificaties</h1>

      <NotificatiesClient
        initialNotificaties={JSON.parse(JSON.stringify(notificaties))}
        initialOngelezen={ongelezen}
        currentFilter={filter}
      />
    </div>
  );
}
