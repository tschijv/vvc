"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/ui/components/Modal";
import { addPakketContact, updatePakketContact } from "./pakket-actions";

type PakketContactData = {
  id: string;
  naam: string;
  email: string | null;
  telefoon: string | null;
  rol: string | null;
};

type Props = {
  pakketId: string;
  /** Existing data for edit mode, null for add mode */
  existing: PakketContactData | null;
  onClose: () => void;
};

export default function PakketContactEditModal({ pakketId, existing, onClose }: Props) {
  const router = useRouter();
  const isAdd = !existing;

  const [naam, setNaam] = useState(existing?.naam || "");
  const [email, setEmail] = useState(existing?.email || "");
  const [telefoon, setTelefoon] = useState(existing?.telefoon || "");
  const [rol, setRol] = useState(existing?.rol || "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (!naam.trim()) {
      setError("Naam is verplicht.");
      setSaving(false);
      return;
    }

    const data = {
      naam: naam.trim(),
      email: email || undefined,
      telefoon: telefoon || undefined,
      rol: rol || undefined,
    };

    let result;
    if (isAdd) {
      result = await addPakketContact(pakketId, data);
    } else {
      result = await updatePakketContact(existing.id, data);
    }

    setSaving(false);

    if ("error" in result) {
      setError(result.error);
    } else {
      router.refresh();
      onClose();
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isAdd ? "Contactpersoon toevoegen" : `"${existing.naam}" bewerken`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 rounded-lg px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Naam *
            </label>
            <input
              type="text"
              value={naam}
              onChange={(e) => setNaam(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rol
            </label>
            <input
              type="text"
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="bijv. Productmanager"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Telefoon
            </label>
            <input
              type="tel"
              value={telefoon}
              onChange={(e) => setTelefoon(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Annuleren
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-[#1a6ca8] hover:bg-[#155a8a] rounded-lg disabled:opacity-50 transition-colors"
          >
            {saving ? "Opslaan..." : isAdd ? "Toevoegen" : "Opslaan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
