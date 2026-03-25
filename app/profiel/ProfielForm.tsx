"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type UserProfile = {
  id: string;
  email: string;
  naam: string;
  telefoon: string | null;
  functie: string | null;
  rollen: string[];
  emailNotificaties: boolean;
  lastLoginAt: string | null;
  gemeenteId: string | null;
  leverancierId: string | null;
  gemeente: { id: string; naam: string } | null;
  leverancier: { id: string; naam: string; slug: string } | null;
};

type ProfielFormProps = {
  user: UserProfile;
  favorietenCount: number;
  ongelezen: number;
  recenteActies: { id: string; actie: string; entiteit: string; details: string | null; createdAt: string }[];
};

const rolLabels: Record<string, string> = {
  GEVERIFIEERD: "Geverifieerd",
  GEMEENTE_RAADPLEGER: "Gemeente raadpleger",
  GEMEENTE_BEHEERDER: "Gemeente beheerder",
  SAMENWERKING_BEHEERDER: "Samenwerking beheerder",
  LEVERANCIER: "Leverancier",
  REDACTEUR: "Redacteur",
  KING_RAADPLEGER: "KING raadpleger",
  KING_BEHEERDER: "KING beheerder",
  ADMIN: "Beheerder",
  API_USER: "API gebruiker",
};

export default function ProfielForm({ user, favorietenCount, ongelezen, recenteActies }: ProfielFormProps) {
  const [naam, setNaam] = useState(user.naam);
  const [telefoon, setTelefoon] = useState(user.telefoon || "");
  const [functie, setFunctie] = useState(user.functie || "");
  const [emailNotificaties, setEmailNotificaties] = useState(user.emailNotificaties);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/profiel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ naam, telefoon, functie, emailNotificaties }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Er ging iets mis");
      }

      setMessage({ type: "success", text: "Profiel opgeslagen" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Er ging iets mis" });
    } finally {
      setSaving(false);
    }
  };

  const primaryRole = user.rollen.includes("ADMIN")
    ? "ADMIN"
    : user.rollen.includes("KING_BEHEERDER")
      ? "KING_BEHEERDER"
      : user.rollen.find((r) => r.startsWith("GEMEENTE_")) || user.rollen.find((r) => r === "LEVERANCIER") || user.rollen[0] || "GEVERIFIEERD";

  return (
    <div className="space-y-6">
      {/* Mijn gegevens */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-600">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Mijn gegevens</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {message && (
            <div
              className={`px-4 py-2 rounded text-sm ${
                message.type === "success"
                  ? "bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700"
                  : "bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Naam */}
            <div>
              <label htmlFor="naam" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Naam
              </label>
              <input
                id="naam"
                type="text"
                value={naam}
                onChange={(e) => setNaam(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-500 rounded text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* E-mail (readonly) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={user.email}
                readOnly
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded text-sm bg-gray-50 dark:bg-slate-600 text-gray-500 dark:text-slate-400 cursor-not-allowed"
              />
            </div>

            {/* Telefoon */}
            <div>
              <label htmlFor="telefoon" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Telefoon
              </label>
              <input
                id="telefoon"
                type="tel"
                value={telefoon}
                onChange={(e) => setTelefoon(e.target.value)}
                placeholder="Bijv. 06-12345678"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-500 rounded text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Functie */}
            <div>
              <label htmlFor="functie" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Functie
              </label>
              <input
                id="functie"
                type="text"
                value={functie}
                onChange={(e) => setFunctie(e.target.value)}
                placeholder="Bijv. Informatiemanager"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-500 rounded text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Rol */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Rol:</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
              {rolLabels[primaryRole] || primaryRole}
            </span>
          </div>

          {/* Gekoppelde organisatie */}
          {(user.organisatie || user.leverancier) && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Gekoppelde organisatie:</span>
              {user.organisatie && (
                <Link href={`/gemeenten/${user.organisatieId}`} className="text-sm text-blue-700 dark:text-blue-400 hover:underline">
                  {user.organisatie.naam}
                </Link>
              )}
              {user.leverancier && (
                <Link href={`/leveranciers/${user.leverancier.slug}`} className="text-sm text-blue-700 dark:text-blue-400 hover:underline">
                  {user.leverancier.naam}
                </Link>
              )}
            </div>
          )}

          {/* Wachtwoord wijzigen */}
          <div>
            <Link
              href="/auth/wachtwoord-reset"
              className="text-sm text-blue-700 dark:text-blue-400 hover:underline"
            >
              Wachtwoord wijzigen
            </Link>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#1a6ca8] text-white rounded text-sm font-medium hover:bg-[#15567f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "Opslaan..." : "Opslaan"}
            </button>
          </div>
        </form>
      </div>

      {/* Mijn activiteit */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-600">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Mijn activiteit</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Favorieten */}
            <Link
              href="/favorieten"
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
            >
              <span className="text-sm text-gray-700 dark:text-slate-300">Favorieten</span>
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                {favorietenCount}
              </span>
            </Link>

            {/* Notificaties */}
            <Link
              href="/notificaties"
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
            >
              <span className="text-sm text-gray-700 dark:text-slate-300">Ongelezen notificaties</span>
              <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium ${
                ongelezen > 0
                  ? "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300"
                  : "bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-slate-400"
              }`}>
                {ongelezen}
              </span>
            </Link>

            {/* Laatste inlogdatum */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded">
              <span className="text-sm text-gray-700 dark:text-slate-300">Laatste login</span>
              <span className="text-sm text-gray-500 dark:text-slate-400">
                {user.lastLoginAt
                  ? new Date(user.lastLoginAt).toLocaleDateString("nl-NL", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Onbekend"}
              </span>
            </div>
          </div>

          {/* Recente acties */}
          {recenteActies.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Recente acties</h3>
              <div className="border border-gray-200 dark:border-slate-600 rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-left">
                      <th scope="col" className="px-3 py-2 font-medium text-gray-600 dark:text-slate-400">Actie</th>
                      <th scope="col" className="px-3 py-2 font-medium text-gray-600 dark:text-slate-400">Entiteit</th>
                      <th scope="col" className="px-3 py-2 font-medium text-gray-600 dark:text-slate-400 hidden sm:table-cell">Details</th>
                      <th scope="col" className="px-3 py-2 font-medium text-gray-600 dark:text-slate-400">Datum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recenteActies.map((actie) => (
                      <tr key={actie.id} className="border-b border-gray-100 dark:border-slate-700 last:border-0">
                        <td className="px-3 py-2 text-gray-900 dark:text-slate-200">{actie.actie}</td>
                        <td className="px-3 py-2 text-gray-600 dark:text-slate-400">{actie.entiteit}</td>
                        <td className="px-3 py-2 text-gray-500 dark:text-slate-400 hidden sm:table-cell truncate max-w-[200px]">
                          {actie.details || "-"}
                        </td>
                        <td className="px-3 py-2 text-gray-500 dark:text-slate-400">
                          {new Date(actie.createdAt).toLocaleDateString("nl-NL", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Voorkeuren */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-600">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Voorkeuren</h2>
        </div>
        <div className="p-6 space-y-4">
          {/* Dark mode */}
          {mounted && (
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Dark mode</span>
                <p className="text-xs text-gray-500 dark:text-slate-400">Schakel het donkere thema in of uit</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={darkMode}
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  darkMode ? "bg-[#1a6ca8]" : "bg-gray-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    darkMode ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          )}

          {/* E-mail notificaties */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">E-mail notificaties</span>
              <p className="text-xs text-gray-500 dark:text-slate-400">Ontvang notificaties per e-mail</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={emailNotificaties}
              onClick={() => setEmailNotificaties(!emailNotificaties)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                emailNotificaties ? "bg-[#1a6ca8]" : "bg-gray-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  emailNotificaties ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Taal */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Taal</span>
              <p className="text-xs text-gray-500 dark:text-slate-400">Binnenkort beschikbaar</p>
            </div>
            <select
              disabled
              className="px-3 py-1.5 border border-gray-200 dark:border-slate-600 rounded text-sm bg-gray-50 dark:bg-slate-600 text-gray-400 dark:text-slate-500 cursor-not-allowed"
            >
              <option>Nederlands</option>
              <option>English</option>
            </select>
          </div>

          <p className="text-xs text-gray-400 dark:text-slate-500">
            Wijzigingen in e-mail notificaties worden opgeslagen via de knop &quot;Opslaan&quot; hierboven.
          </p>
        </div>
      </div>
    </div>
  );
}
