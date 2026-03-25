import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import Breadcrumbs from "@/components/Breadcrumbs";
import KaartPageClient from "./KaartPageClient";

export default async function KaartPage() {
  const user = await getSessionUser();
  if (!user || (user.role !== "GEMEENTE" && user.role !== "ADMIN")) {
    redirect("/");
  }

  // Haal views op
  const views = await prisma.gemmaView.findMany({
    where: { actief: true },
    orderBy: [{ domein: "asc" }, { volgorde: "asc" }],
  });

  // Voor ADMIN: haal alle gemeenten op
  let gemeenten: { id: string; naam: string }[] = [];
  if (user.role === "ADMIN") {
    gemeenten = await prisma.organisatie.findMany({
      select: { id: true, naam: true },
      orderBy: { naam: "asc" },
    });
  }

  // Voor GEMEENTE users: haal hun gemeente op
  let eigenGemeente: { id: string; naam: string } | null = null;
  if (user.role === "GEMEENTE" && user.organisatieId) {
    eigenGemeente = await prisma.organisatie.findUnique({
      where: { id: user.organisatieId },
      select: { id: true, naam: true },
    });
  }

  return (
    <>
      <Breadcrumbs items={[{ label: "Kaart", href: "/kaart" }]} />
      <KaartPageClient
        views={views}
        gemeenten={gemeenten}
        eigenGemeente={eigenGemeente}
        isAdmin={user.role === "ADMIN"}
      />
    </>
  );
}
