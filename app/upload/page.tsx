import { getSessionUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import UploadForm from "./UploadForm";

export default async function UploadPage() {
  const user = await getSessionUser();

  if (!user || !["ADMIN", "LEVERANCIER", "GEMEENTE"].includes(user.role)) {
    redirect("/");
  }

  // For ADMIN: fetch list of leveranciers and gemeenten for dropdown
  let leveranciers: { id: string; naam: string }[] = [];
  let gemeenten: { id: string; naam: string }[] = [];

  if (user.role === "ADMIN") {
    leveranciers = await prisma.leverancier.findMany({
      select: { id: true, naam: true },
      orderBy: { naam: "asc" },
    });
    gemeenten = await prisma.gemeente.findMany({
      select: { id: true, naam: true },
      orderBy: { naam: "asc" },
    });
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-[#1a6ca8] mb-2">
        Data importeren
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Upload een bestand (CSV, JSON of Excel) om pakketten of uw
        applicatieportfolio te synchroniseren.
      </p>

      <UploadForm
        userRole={user.role}
        userLeverancierId={user.leverancierId || undefined}
        userGemeenteId={user.gemeenteId || undefined}
        leveranciers={leveranciers}
        gemeenten={gemeenten}
      />
    </div>
  );
}
