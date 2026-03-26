import { redirect } from "next/navigation";
import { getSessionUser } from "@/process/auth-helpers";
import { prisma } from "@/data/prisma";
import Breadcrumbs from "@/ui/components/Breadcrumbs";
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

  // Voor ADMIN: haal alle organisaties op
  let organisaties: { id: string; naam: string }[] = [];
  if (user.role === "ADMIN") {
    organisaties = await prisma.organisatie.findMany({
      select: { id: true, naam: true },
      orderBy: { naam: "asc" },
    });
  }

  // Voor GEMEENTE users: haal hun organisatie op
  let eigenOrganisatie: { id: string; naam: string } | null = null;
  if (user.role === "GEMEENTE" && user.organisatieId) {
    eigenOrganisatie = await prisma.organisatie.findUnique({
      where: { id: user.organisatieId },
      select: { id: true, naam: true },
    });
  }

  return (
    <>
      <Breadcrumbs items={[{ label: "Kaart", href: "/kaart" }]} />
      <KaartPageClient
        views={views}
        organisaties={organisaties}
        eigenOrganisatie={eigenOrganisatie}
        isAdmin={user.role === "ADMIN"}
      />
    </>
  );
}
