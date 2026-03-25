import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getUsers, getUserCount, ROLLEN_LABELS } from "@/lib/services/user";
import { Role } from "@prisma/client";
import { startImpersonation } from "@/lib/actions/impersonation";

const PER_PAGE = 25;

export default async function GebruikersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const zoek = sp.zoek || undefined;
  const rol = (sp.rol as Role) || undefined;
  const actiefParam = sp.actief;
  const actief =
    actiefParam === "ja" ? true : actiefParam === "nee" ? false : undefined;
  const pagina = parseInt(sp.pagina || "1");
  const skip = (pagina - 1) * PER_PAGE;

  const [users, total] = await Promise.all([
    getUsers({ zoek, rol, actief, skip, take: PER_PAGE }),
    getUserCount({ zoek, rol, actief }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  function formatDatum(d: Date | null) {
    if (!d) return "—";
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const dagen = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (dagen === 0) return "Vandaag";
    if (dagen === 1) return "Gisteren";
    if (dagen < 7) return `${dagen} dagen geleden`;
    if (dagen < 30) return `${Math.floor(dagen / 7)} weken geleden`;
    if (dagen < 365) return `${Math.floor(dagen / 30)} maanden geleden`;
    return `${Math.floor(dagen / 365)} jaar geleden`;
  }

  function formatRegistratie(d: Date) {
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const maanden = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    if (maanden < 1) return "Minder dan een maand";
    if (maanden < 12) return `${maanden} maanden`;
    const jaren = Math.floor(maanden / 12);
    const restMaanden = maanden % 12;
    return `${jaren} jaar${restMaanden > 0 ? ` ${restMaanden} maanden` : ""}`;
  }

  return (
    <div>
      <Breadcrumbs items={[
        { label: "Beheer", href: "/admin" },
        { label: "Gebruikers", href: "/admin/gebruikers" },
      ]} />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1a6ca8]">Gebruikersbeheer</h1>
        <Link
          href="/admin/gebruikers/nieuw"
          className="bg-[#1a6ca8] text-white px-4 py-2 rounded hover:bg-[#15567f] transition-colors"
        >
          + Gebruiker toevoegen
        </Link>
      </div>

      {/* Filters */}
      <form className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Zoeken</label>
          <input
            type="text"
            name="zoek"
            defaultValue={zoek}
            placeholder="Naam of e-mail..."
            className="border rounded px-3 py-1.5 w-56"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Actief</label>
          <select
            name="actief"
            defaultValue={actiefParam || ""}
            className="border rounded px-3 py-1.5"
          >
            <option value="">- Alle -</option>
            <option value="ja">Ja</option>
            <option value="nee">Nee</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Rol</label>
          <select
            name="rol"
            defaultValue={rol || ""}
            className="border rounded px-3 py-1.5"
          >
            <option value="">- Alle -</option>
            {Object.entries(ROLLEN_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="border rounded px-4 py-1.5 bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          Toepassen
        </button>
        <Link
          href="/admin/gebruikers"
          className="border rounded px-4 py-1.5 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          Opnieuw instellen
        </Link>
      </form>

      {/* Resultaten info */}
      <p className="text-sm text-gray-600 mb-3">
        {total} gebruiker{total !== 1 ? "s" : ""} gevonden
      </p>

      {/* Tabel */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th scope="col" className="text-left px-4 py-3 font-semibold text-[#1a6ca8]">
                Naam
              </th>
              <th scope="col" className="text-left px-4 py-3 font-semibold text-[#1a6ca8]">
                Actief
              </th>
              <th scope="col" className="text-left px-4 py-3 font-semibold text-[#1a6ca8]">
                Rollen
              </th>
              <th scope="col" className="text-left px-4 py-3 font-semibold text-[#1a6ca8]">
                Geregistreerd sinds
              </th>
              <th scope="col" className="text-left px-4 py-3 font-semibold text-[#1a6ca8]">
                Laatste toegang
              </th>
              <th scope="col" className="text-left px-4 py-3 font-semibold text-[#1a6ca8]">
                Bewerkingen
              </th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Geen gebruikers gevonden.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/gebruikers/${user.id}`}
                      className="text-[#1a6ca8] hover:underline font-medium"
                    >
                      {user.naam}
                    </Link>
                    <br />
                    <span className="text-gray-500 text-xs">{user.email}</span>
                  </td>
                  <td className="px-4 py-3">
                    {user.actief ? (
                      <span className="text-green-700">Ja</span>
                    ) : (
                      <span className="text-red-600">Nee</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <ul className="list-disc list-inside text-xs">
                      {user.rollen.map((r) => (
                        <li key={r}>{ROLLEN_LABELS[r] || r}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatRegistratie(user.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDatum(user.laatsteToegangOp)}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <Link
                      href={`/admin/gebruikers/${user.id}`}
                      className="text-[#1a6ca8] hover:underline text-xs"
                    >
                      bewerken
                    </Link>
                    <form action={startImpersonation.bind(null, user.id)}>
                      <button
                        type="submit"
                        className="text-amber-600 hover:underline text-xs"
                        title={`Bekijk als ${user.naam}`}
                      >
                        impersoneer
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginatie */}
      {totalPages > 1 && (
        <div className="flex gap-2 mt-4 items-center justify-center">
          {pagina > 1 && (
            <Link
              href={`/admin/gebruikers?${new URLSearchParams({
                ...(zoek && { zoek }),
                ...(rol && { rol }),
                ...(actiefParam && { actief: actiefParam }),
                pagina: String(pagina - 1),
              })}`}
              className="px-3 py-1 border rounded hover:bg-gray-100"
            >
              Vorige
            </Link>
          )}
          <span className="text-sm text-gray-600">
            Pagina {pagina} van {totalPages}
          </span>
          {pagina < totalPages && (
            <Link
              href={`/admin/gebruikers?${new URLSearchParams({
                ...(zoek && { zoek }),
                ...(rol && { rol }),
                ...(actiefParam && { actief: actiefParam }),
                pagina: String(pagina + 1),
              })}`}
              className="px-3 py-1 border rounded hover:bg-gray-100"
            >
              Volgende
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
