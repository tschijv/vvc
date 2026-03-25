"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import KoppelingEditModal, { type KoppelingEditData } from "./KoppelingEditModal";
import { deleteKoppeling } from "./koppeling-actions";

type PakketversieOption = {
  id: string;
  label: string;
};

/**
 * "Koppeling toevoegen" button for the Koppelingen tab header.
 */
export function AddKoppelingButton({
  gemeenteId,
  pakketversies,
}: {
  gemeenteId: string;
  pakketversies: PakketversieOption[];
}) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-1.5 bg-[#e35b10] hover:bg-[#c44b0a] text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Koppeling toevoegen
      </button>

      {showModal && (
        <KoppelingEditModal
          gemeenteId={gemeenteId}
          existing={null}
          pakketversies={pakketversies}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

/**
 * Inline edit/delete buttons for a single koppeling row.
 */
export function KoppelingRowActions({
  gemeenteId,
  koppeling,
  pakketversies,
}: {
  gemeenteId: string;
  koppeling: KoppelingEditData;
  pakketversies: PakketversieOption[];
}) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Weet je zeker dat je deze koppeling wilt verwijderen?")) {
      return;
    }
    setDeleting(true);
    const result = await deleteKoppeling(koppeling.id);
    if ("error" in result) {
      alert(result.error);
    } else {
      router.refresh();
    }
    setDeleting(false);
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setShowEdit(true)}
          title="Bewerken"
          className="p-1 text-gray-400 hover:text-[#1a6ca8] dark:hover:text-blue-400 transition-colors rounded"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          title="Verwijderen"
          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {showEdit && (
        <KoppelingEditModal
          gemeenteId={gemeenteId}
          existing={koppeling}
          pakketversies={pakketversies}
          onClose={() => setShowEdit(false)}
        />
      )}
    </>
  );
}
