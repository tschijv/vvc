import { redirect } from "next/navigation";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getSessionUser } from "@/lib/auth-helpers";
import { getAuditLogs } from "@/lib/services/audit";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audit log",
};

interface Props {
  searchParams: Promise<{ pagina?: string; entiteit?: string }>;
}

export default async function AuditLogPage({ searchParams }: Props) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") redirect("/");

  const params = await searchParams;
  const pagina = Math.max(1, parseInt(params.pagina || "1", 10));
  const entiteit = params.entiteit || undefined;
  const perPagina = 50;

  const { logs, total } = await getAuditLogs({
    skip: (pagina - 1) * perPagina,
    take: perPagina,
    entiteit,
  });

  const totalPages = Math.ceil(total / perPagina);

  const actieKleuren: Record<string, string> = {
    login: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    create: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    update: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    delete: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    merge: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    sync: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300",
  };

  return (
    <div className="max-w-5xl">
      <Breadcrumbs items={[
        { label: "Beheer", href: "/admin" },
        { label: "Audit log", href: "/admin/auditlog" },
      ]} />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#1a6ca8]">Audit log</h1>
      </div>

      <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{total} logregels gevonden</p>

      {logs.length === 0 ? (
        <p className="text-gray-500 italic text-sm">Geen audit logs beschikbaar.</p>
      ) : (
        <>
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <table className="w-full text-sm border-collapse bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600 text-left">
                  <th scope="col" className="py-2 px-3 font-semibold text-gray-700 dark:text-slate-300">Tijdstip</th>
                  <th scope="col" className="py-2 px-3 font-semibold text-gray-700 dark:text-slate-300">Gebruiker</th>
                  <th scope="col" className="py-2 px-3 font-semibold text-gray-700 dark:text-slate-300">Actie</th>
                  <th scope="col" className="py-2 px-3 font-semibold text-gray-700 dark:text-slate-300">Entiteit</th>
                  <th scope="col" className="py-2 px-3 font-semibold text-gray-700 dark:text-slate-300">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-750">
                    <td className="py-2 px-3 text-gray-500 dark:text-slate-400 whitespace-nowrap">
                      {log.createdAt.toLocaleString("nl-NL", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="py-2 px-3 text-gray-700 dark:text-slate-300">
                      {log.userEmail || "—"}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${actieKleuren[log.actie] || "bg-gray-100 text-gray-700 dark:bg-slate-600 dark:text-slate-300"}`}>
                        {log.actie}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-gray-600 dark:text-slate-400">{log.entiteit}</td>
                    <td className="py-2 px-3 text-gray-500 dark:text-slate-400 max-w-xs truncate">{log.details || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2 mt-4 text-sm">
              {pagina > 1 && (
                <Link
                  href={`/admin/auditlog?pagina=${pagina - 1}${entiteit ? `&entiteit=${entiteit}` : ""}`}
                  className="text-[#1a6ca8] hover:underline"
                >
                  ← Vorige
                </Link>
              )}
              <span className="text-gray-500">Pagina {pagina} van {totalPages}</span>
              {pagina < totalPages && (
                <Link
                  href={`/admin/auditlog?pagina=${pagina + 1}${entiteit ? `&entiteit=${entiteit}` : ""}`}
                  className="text-[#1a6ca8] hover:underline"
                >
                  Volgende →
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
