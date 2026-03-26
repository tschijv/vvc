import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/process/auth-helpers";
import { prisma } from "@/data/prisma";
import RegistratieApprovalForm from "./RegistratieApprovalForm";
import { tenant } from "@/process/tenant-config";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RegistratieDetailPage({ params }: Props) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  const { id } = await params;

  const registratie = await prisma.user.findUnique({
    where: { id },
  });

  if (!registratie || registratie.registratieBron !== "zelfregistratie") {
    notFound();
  }

  // Haal leveranciers en gemeenten op voor de dropdowns
  const [leveranciers, gemeenten] = await Promise.all([
    prisma.leverancier.findMany({
      select: { id: true, naam: true },
      orderBy: { naam: "asc" },
    }),
    prisma.organisatie.findMany({
      select: { id: true, naam: true },
      orderBy: { naam: "asc" },
    }),
  ]);

  return (
    <div>
      <Link href="/admin/registraties" className="text-sm text-[#1a6ca8] hover:underline mb-4 inline-block">
        ← Terug naar registraties
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Registratie beoordelen</h1>

      {/* Ingediende gegevens */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Ingediende gegevens</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">Naam</dt>
            <dd className="font-medium text-gray-900">{registratie.naam}</dd>
          </div>
          <div>
            <dt className="text-gray-500">E-mailadres</dt>
            <dd className="font-medium text-gray-900">{registratie.email}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Organisatietype</dt>
            <dd>
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                registratie.organisatieType === "leverancier"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-green-100 text-green-700"
              }`}>
                {registratie.organisatieType === "leverancier" ? "Leverancier" : tenant.organisatieType.capitaal}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Organisatienaam</dt>
            <dd className="font-medium text-gray-900">{registratie.organisatieNaam}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Aangemeld op</dt>
            <dd className="text-gray-700">{registratie.createdAt.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Status</dt>
            <dd>
              {registratie.afgewezen ? (
                <span className="text-red-600 font-medium">Afgewezen</span>
              ) : registratie.actief ? (
                <span className="text-green-600 font-medium">Goedgekeurd</span>
              ) : (
                <span className="text-orange-600 font-medium">Wacht op beoordeling</span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      {/* Goedkeuren/Afwijzen formulier — alleen als nog niet beoordeeld */}
      {!registratie.actief && !registratie.afgewezen && (
        <RegistratieApprovalForm
          id={registratie.id}
          organisatieType={registratie.organisatieType || "leverancier"}
          leveranciers={leveranciers}
          gemeenten={gemeenten}
        />
      )}
    </div>
  );
}
