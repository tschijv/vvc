"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/ui/components/Modal";
import { updatePakket } from "./pakket-actions";

type Props = {
  pakketId: string;
  naam: string;
  beschrijving: string | null;
};

export default function PakketEditSection({ pakketId, naam, beschrijving }: Props) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [editNaam, setEditNaam] = useState(naam);
  const [editBeschrijving, setEditBeschrijving] = useState(beschrijving || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleOpen() {
    setEditNaam(naam);
    setEditBeschrijving(beschrijving || "");
    setError("");
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const result = await updatePakket(pakketId, {
      naam: editNaam || undefined,
      beschrijving: editBeschrijving || undefined,
    });

    setSaving(false);

    if ("error" in result) {
      setError(result.error);
    } else {
      router.refresh();
      setShowModal(false);
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        title="Pakket bewerken"
        className="p-1 text-gray-400 hover:text-[#1a6ca8] dark:hover:text-blue-400 transition-colors rounded"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>

      {showModal && (
        <Modal isOpen onClose={() => setShowModal(false)} title="Pakket bewerken" size="md">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 rounded-lg px-3 py-2 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Naam
              </label>
              <input
                type="text"
                value={editNaam}
                onChange={(e) => setEditNaam(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Beschrijving
              </label>
              <textarea
                value={editBeschrijving}
                onChange={(e) => setEditBeschrijving(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Annuleren
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-[#1a6ca8] hover:bg-[#155a8a] rounded-lg disabled:opacity-50 transition-colors"
              >
                {saving ? "Opslaan..." : "Opslaan"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
