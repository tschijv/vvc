"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PakketversieEditModal from "./PakketversieEditModal";
import PakketContactEditModal from "./PakketContactEditModal";
import { deletePakketversie, deletePakketContact } from "./pakket-actions";

// ─── Versie Actions ─────────────────────────────────────────────────────────

type VersieData = {
  id: string;
  naam: string;
  status: string;
  beschrijving: string | null;
  startOntwikkeling: string | null;
  startTest: string | null;
  startDistributie: string | null;
};

export function AddVersieButton({ pakketId }: { pakketId: string }) {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-1.5 bg-[#e35b10] hover:bg-[#c44b0a] text-white text-xs font-medium px-2.5 py-1 rounded-lg transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Versie toevoegen
      </button>
      {showModal && (
        <PakketversieEditModal
          pakketId={pakketId}
          existing={null}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

export function VersieRowActions({ pakketId, versie }: { pakketId: string; versie: VersieData }) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Weet je zeker dat je versie "${versie.naam}" wilt verwijderen?`)) return;
    setDeleting(true);
    const result = await deletePakketversie(versie.id);
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
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          title="Verwijderen"
          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded disabled:opacity-50"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      {showEdit && (
        <PakketversieEditModal
          pakketId={pakketId}
          existing={versie}
          onClose={() => setShowEdit(false)}
        />
      )}
    </>
  );
}

// ─── Contact Actions ────────────────────────────────────────────────────────

type ContactData = {
  id: string;
  naam: string;
  email: string | null;
  telefoon: string | null;
  rol: string | null;
};

export function AddContactButton({ pakketId }: { pakketId: string }) {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-1.5 text-[#1a6ca8] hover:text-[#155a8a] text-xs font-medium transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Contactpersoon toevoegen
      </button>
      {showModal && (
        <PakketContactEditModal
          pakketId={pakketId}
          existing={null}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

export function ContactRowActions({ pakketId, contact }: { pakketId: string; contact: ContactData }) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Weet je zeker dat je contactpersoon "${contact.naam}" wilt verwijderen?`)) return;
    setDeleting(true);
    const result = await deletePakketContact(contact.id);
    if ("error" in result) {
      alert(result.error);
    } else {
      router.refresh();
    }
    setDeleting(false);
  }

  return (
    <>
      <div className="flex items-center gap-1 mt-1">
        <button
          onClick={() => setShowEdit(true)}
          title="Bewerken"
          className="p-0.5 text-gray-400 hover:text-[#1a6ca8] transition-colors rounded"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          title="Verwijderen"
          className="p-0.5 text-gray-400 hover:text-red-600 transition-colors rounded disabled:opacity-50"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      {showEdit && (
        <PakketContactEditModal
          pakketId={pakketId}
          existing={contact}
          onClose={() => setShowEdit(false)}
        />
      )}
    </>
  );
}
