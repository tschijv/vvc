import Link from "next/link";
import Breadcrumbs from "@/ui/components/Breadcrumbs";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/process/auth-helpers";
import { getPendingRegistrations } from "@/service/user";
import { tenant } from "@/process/tenant-config";

export default async function RegistratiesPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  const registraties = await getPendingRegistrations();

  return (
    <div>
      <Breadcrumbs items={[
        { label: "Beheer", href: "/admin" },
        { label: "Registraties", href: "/admin/registraties" },
      ]} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registraties</h1>
        </div>
        {registraties.length > 0 && (
          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
            {registraties.length} wachtend
          </span>
        )}
      </div>

      {registraties.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500">Geen openstaande registraties.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-600">Naam</th>
                  <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-600">E-mail</th>
                  <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
                  <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-600">Organisatie</th>
                  <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-600">Datum</th>
                  <th scope="col" className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {registraties.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{r.naam}</td>
                    <td className="px-4 py-3 text-gray-600">{r.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        r.organisatieType === "leverancier"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {r.organisatieType === "leverancier" ? "Leverancier" : tenant.organisatieType.capitaal}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.organisatieNaam}</td>
                    <td className="px-4 py-3 text-gray-400">
                      {r.createdAt.toLocaleDateString("nl-NL")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/registraties/${r.id}`}
                        className="text-[#1a6ca8] hover:underline font-medium text-sm"
                      >
                        Beoordelen →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
