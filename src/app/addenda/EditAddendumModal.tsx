"use client";

import { useState } from "react";

interface EditAddendumModalProps {
  leverancierId: string;
  addendumId: string;
  leverancierNaam: string;
  addendumNaam: string;
  deadline: string | null;
  datumGereed: string | null;
}

export default function EditAddendumModal({
  leverancierId,
  addendumId,
  leverancierNaam,
  addendumNaam,
  deadline,
  datumGereed,
}: EditAddendumModalProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deadlineVal, setDeadlineVal] = useState(deadline || "");
  const [gereedVal, setGereedVal] = useState(datumGereed || "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/addenda/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leverancierId,
          addendumId,
          deadline: deadlineVal || null,
          datumGereed: gereedVal || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Opslaan mislukt");
      } else {
        setSuccess(true);
        setTimeout(() => {
          setOpen(false);
          setSuccess(false);
          window.location.reload();
        }, 800);
      }
    } catch (err) {
      setError(`Fout: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Weet je zeker dat je dit addendum wilt verwijderen voor ${leverancierNaam}?`)) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/addenda/update", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leverancierId, addendumId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Verwijderen mislukt");
      } else {
        setOpen(false);
        window.location.reload();
      }
    } catch (err) {
      setError(`Fout: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* Edit button */}
      <button
        onClick={() => setOpen(true)}
        className="w-7 h-7 border border-gray-300 rounded flex items-center justify-center text-[#1a6ca8] hover:bg-blue-50"
        title="Bewerken"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>

      {/* Delete button */}
      <button
        onClick={handleDelete}
        disabled={saving}
        className="w-7 h-7 border border-gray-300 rounded flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-600"
        title="Verwijderen"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            {/* Header */}
            <div className="bg-[#1a6ca8] text-white -mx-6 -mt-6 px-6 py-3 rounded-t-lg mb-4">
              <h2 className="font-semibold">Wijzig addendum</h2>
            </div>

            <p className="text-[#1a6ca8] text-lg font-medium mb-1">{addendumNaam}</p>
            <p className="text-sm text-gray-500 mb-4">{leverancierNaam}</p>

            {/* Afspraak datum realisatie */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Afspraak datum realisatie
              </label>
              <input
                type="date"
                value={deadlineVal}
                onChange={(e) => setDeadlineVal(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6ca8] focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Bijvoorbeeld: {new Date().toLocaleDateString("nl-NL")}</p>
            </div>

            {/* Datum gereed */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Datum gereed
              </label>
              <input
                type="date"
                value={gereedVal}
                onChange={(e) => setGereedVal(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6ca8] focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Bijvoorbeeld: {new Date().toLocaleDateString("nl-NL")}</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded px-3 py-2 text-sm text-red-700 mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded px-3 py-2 text-sm text-green-700 mb-4">
                Opgeslagen!
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className={`px-5 py-2 rounded text-white font-medium text-sm ${
                  saving ? "bg-gray-400" : "bg-[#1a6ca8] hover:bg-[#155a8c]"
                }`}
              >
                {saving ? "Opslaan..." : "Wijzigen"}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="text-sm text-[#1a6ca8] hover:underline"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
