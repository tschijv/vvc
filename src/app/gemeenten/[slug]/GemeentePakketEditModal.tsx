"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/ui/components/Modal";
import PakketversieSearchSelect from "@/ui/components/PakketversieSearchSelect";
import {
  searchPakketversies,
  addPakketToPortfolio,
  updateOrganisatiePakket,
} from "./portfolio-actions";

type GemeentePakketData = {
  pakketversieId: string;
  pakketNaam?: string;
  versieNaam?: string;
  status: string | null;
  technologie: string | null;
  verantwoordelijke: string | null;
  licentievorm: string | null;
  aantalGebruikers: number | null;
  maatwerk: string | null;
};

type Props = {
  organisatieId: string;
  /** Existing data for edit mode, null for add mode */
  existing: GemeentePakketData | null;
  onClose: () => void;
};

const STATUS_OPTIONS = [
  "In gebruik",
  "In ontwikkeling",
  "Einde ondersteuning",
  "Teruggetrokken",
  "Onbekend",
];

export default function GemeentePakketEditModal({ organisatieId, existing, onClose }: Props) {
  const router = useRouter();
  const isAdd = !existing;

  const [pakketversieId, setPakketversieId] = useState(existing?.pakketversieId || "");
  const [status, setStatus] = useState(existing?.status || "");
  const [technologie, setTechnologie] = useState(existing?.technologie || "");
  const [verantwoordelijke, setVerantwoordelijke] = useState(existing?.verantwoordelijke || "");
  const [licentievorm, setLicentievorm] = useState(existing?.licentievorm || "");
  const [aantalGebruikers, setAantalGebruikers] = useState(existing?.aantalGebruikers?.toString() || "");
  const [maatwerk, setMaatwerk] = useState(existing?.maatwerk || "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const data = {
      status: status || undefined,
      technologie: technologie || undefined,
      verantwoordelijke: verantwoordelijke || undefined,
      licentievorm: licentievorm || undefined,
      aantalGebruikers: aantalGebruikers ? parseInt(aantalGebruikers) : undefined,
      maatwerk: maatwerk || undefined,
    };

    let result;
    if (isAdd) {
      if (!pakketversieId) {
        setError("Selecteer een pakketversie.");
        setSaving(false);
        return;
      }
      result = await addPakketToPortfolio(organisatieId, { pakketversieId, ...data });
    } else {
      result = await updateOrganisatiePakket(organisatieId, existing.pakketversieId, data);
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
      title={isAdd ? "Pakket toevoegen aan portfolio" : `${existing.pakketNaam || "Pakket"} bewerken`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 rounded-lg px-3 py-2 text-sm">
            {error}
          </div>
        )}

        {/* Pakketversie selectie (alleen bij toevoegen) */}
        {isAdd && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Pakketversie *
            </label>
            <PakketversieSearchSelect
              searchAction={searchPakketversies}
              onSelect={(option) => setPakketversieId(option.id)}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">— Geen —</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Technologie
            </label>
            <input
              type="text"
              value={technologie}
              onChange={(e) => setTechnologie(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="bijv. SaaS, On-premise"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Verantwoordelijke
            </label>
            <input
              type="text"
              value={verantwoordelijke}
              onChange={(e) => setVerantwoordelijke(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Licentievorm
            </label>
            <input
              type="text"
              value={licentievorm}
              onChange={(e) => setLicentievorm(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="bijv. Per gebruiker, Site-licentie"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Aantal gebruikers
            </label>
            <input
              type="number"
              value={aantalGebruikers}
              onChange={(e) => setAantalGebruikers(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Maatwerk
            </label>
            <input
              type="text"
              value={maatwerk}
              onChange={(e) => setMaatwerk(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Omschrijving maatwerk"
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
