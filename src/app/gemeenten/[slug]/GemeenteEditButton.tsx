"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrganisatieContact } from "./gemeente-edit-actions";

type Props = {
  organisatieId: string;
  contactpersoon: string;
  email: string;
  telefoon: string;
  website: string;
};

export default function GemeenteEditButton({
  organisatieId,
  contactpersoon,
  email,
  telefoon,
  website,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ contactpersoon, email, telefoon, website });

  function handleOpen() {
    setForm({ contactpersoon, email, telefoon, website });
    setError("");
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await updateOrganisatieContact(organisatieId, form);
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError((err as Error).message || "Opslaan mislukt");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="text-gray-400 hover:text-[#1a6ca8] transition-colors"
        title="Contactgegevens bewerken"
        aria-label="Contactgegevens bewerken"
      >
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div
            className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contactgegevens bewerken</h3>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contactpersoon
                </label>
                <input
                  type="text"
                  value={form.contactpersoon}
                  onChange={(e) => setForm({ ...form, contactpersoon: e.target.value })}
                  className="w-full border border-gray-300 dark:border-slate-600 rounded px-3 py-2 text-sm dark:bg-slate-700 dark:text-white focus:outline-none focus:border-[#1a6ca8]"
                  placeholder="Naam contactpersoon"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  E-mailadres
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-300 dark:border-slate-600 rounded px-3 py-2 text-sm dark:bg-slate-700 dark:text-white focus:outline-none focus:border-[#1a6ca8]"
                  placeholder="email@gemeente.nl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Telefoon
                </label>
                <input
                  type="tel"
                  value={form.telefoon}
                  onChange={(e) => setForm({ ...form, telefoon: e.target.value })}
                  className="w-full border border-gray-300 dark:border-slate-600 rounded px-3 py-2 text-sm dark:bg-slate-700 dark:text-white focus:outline-none focus:border-[#1a6ca8]"
                  placeholder="088-000 0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  className="w-full border border-gray-300 dark:border-slate-600 rounded px-3 py-2 text-sm dark:bg-slate-700 dark:text-white focus:outline-none focus:border-[#1a6ca8]"
                  placeholder="https://www.gemeente.nl"
                />
              </div>

              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm bg-[#1a6ca8] text-white rounded hover:bg-[#155a8c] disabled:opacity-50"
                >
                  {saving ? "Opslaan..." : "Opslaan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
