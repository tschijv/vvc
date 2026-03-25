"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/ui/components/Modal";
import { addKoppeling, updateKoppeling } from "./koppeling-actions";

export type KoppelingEditData = {
  id: string;
  bronPakketversieId?: string | null;
  bronExternNaam?: string | null;
  richting: string;
  doelPakketversieId?: string | null;
  doelExternNaam?: string | null;
  buitengemeentelijk: boolean;
  status?: string | null;
  standaard?: string | null;
  transportprotocol?: string | null;
  aanvullendeInformatie?: string | null;
};

type PakketversieOption = {
  id: string;
  label: string;
};

type Props = {
  gemeenteId: string;
  /** Existing data for edit mode, null for add mode */
  existing: KoppelingEditData | null;
  pakketversies: PakketversieOption[];
  onClose: () => void;
};

export default function KoppelingEditModal({
  gemeenteId,
  existing,
  pakketversies,
  onClose,
}: Props) {
  const router = useRouter();
  const isAdd = !existing;

  // Bron fields
  const [bronType, setBronType] = useState<"intern" | "extern">(
    existing?.bronExternNaam ? "extern" : "intern"
  );
  const [bronPakketversieId, setBronPakketversieId] = useState(
    existing?.bronPakketversieId || ""
  );
  const [bronExternNaam, setBronExternNaam] = useState(
    existing?.bronExternNaam || ""
  );

  // Richting
  const [richting, setRichting] = useState(existing?.richting || "beide");

  // Doel fields
  const [doelType, setDoelType] = useState<"intern" | "extern">(
    existing?.doelExternNaam ? "extern" : "intern"
  );
  const [doelPakketversieId, setDoelPakketversieId] = useState(
    existing?.doelPakketversieId || ""
  );
  const [doelExternNaam, setDoelExternNaam] = useState(
    existing?.doelExternNaam || ""
  );

  // Other fields
  const [buitengemeentelijk, setBuitengemeentelijk] = useState(
    existing?.buitengemeentelijk ?? false
  );
  const [status, setStatus] = useState(existing?.status || "");
  const [standaard, setStandaard] = useState(existing?.standaard || "");
  const [transportprotocol, setTransportprotocol] = useState(
    existing?.transportprotocol || ""
  );
  const [aanvullendeInformatie, setAanvullendeInformatie] = useState(
    existing?.aanvullendeInformatie || ""
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const data = {
      bronPakketversieId:
        bronType === "intern" && bronPakketversieId
          ? bronPakketversieId
          : undefined,
      bronExternNaam:
        bronType === "extern" && bronExternNaam ? bronExternNaam : undefined,
      richting,
      doelPakketversieId:
        doelType === "intern" && doelPakketversieId
          ? doelPakketversieId
          : undefined,
      doelExternNaam:
        doelType === "extern" && doelExternNaam ? doelExternNaam : undefined,
      buitengemeentelijk,
      status: status || undefined,
      standaard: standaard || undefined,
      transportprotocol: transportprotocol || undefined,
      aanvullendeInformatie: aanvullendeInformatie || undefined,
    };

    let result;
    if (isAdd) {
      result = await addKoppeling(gemeenteId, data);
    } else {
      result = await updateKoppeling(existing.id, data);
    }

    setSaving(false);

    if ("error" in result) {
      setError(result.error);
    } else {
      router.refresh();
      onClose();
    }
  }

  const inputClass =
    "w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100";
  const labelClass =
    "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isAdd ? "Koppeling toevoegen" : "Koppeling bewerken"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 rounded-lg px-3 py-2 text-sm">
            {error}
          </div>
        )}

        {/* Bron */}
        <fieldset>
          <legend className={labelClass}>Bron</legend>
          <div className="flex items-center gap-4 mb-2">
            <label className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="radio"
                name="bronType"
                checked={bronType === "intern"}
                onChange={() => setBronType("intern")}
                className="accent-[#1a6ca8]"
              />
              Intern pakket
            </label>
            <label className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="radio"
                name="bronType"
                checked={bronType === "extern"}
                onChange={() => setBronType("extern")}
                className="accent-[#1a6ca8]"
              />
              Extern pakket
            </label>
          </div>
          {bronType === "intern" ? (
            <select
              value={bronPakketversieId}
              onChange={(e) => setBronPakketversieId(e.target.value)}
              className={inputClass}
            >
              <option value="">— Selecteer pakketversie —</option>
              {pakketversies.map((pv) => (
                <option key={pv.id} value={pv.id}>
                  {pv.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={bronExternNaam}
              onChange={(e) => setBronExternNaam(e.target.value)}
              className={inputClass}
              placeholder="Naam extern pakket"
            />
          )}
        </fieldset>

        {/* Richting */}
        <div>
          <label className={labelClass}>Richting</label>
          <select
            value={richting}
            onChange={(e) => setRichting(e.target.value)}
            className={inputClass}
          >
            <option value="heen">Heen →</option>
            <option value="weer">Weer ←</option>
            <option value="beide">Beide ↔</option>
          </select>
        </div>

        {/* Doel */}
        <fieldset>
          <legend className={labelClass}>Doel</legend>
          <div className="flex items-center gap-4 mb-2">
            <label className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="radio"
                name="doelType"
                checked={doelType === "intern"}
                onChange={() => setDoelType("intern")}
                className="accent-[#1a6ca8]"
              />
              Intern pakket
            </label>
            <label className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="radio"
                name="doelType"
                checked={doelType === "extern"}
                onChange={() => setDoelType("extern")}
                className="accent-[#1a6ca8]"
              />
              Extern pakket
            </label>
          </div>
          {doelType === "intern" ? (
            <select
              value={doelPakketversieId}
              onChange={(e) => setDoelPakketversieId(e.target.value)}
              className={inputClass}
            >
              <option value="">— Selecteer pakketversie —</option>
              {pakketversies.map((pv) => (
                <option key={pv.id} value={pv.id}>
                  {pv.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={doelExternNaam}
              onChange={(e) => setDoelExternNaam(e.target.value)}
              className={inputClass}
              placeholder="Naam extern pakket"
            />
          )}
        </fieldset>

        {/* Buitengemeentelijk */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="buitengemeentelijk"
            checked={buitengemeentelijk}
            onChange={(e) => setBuitengemeentelijk(e.target.checked)}
            className="accent-[#1a6ca8] w-4 h-4"
          />
          <label
            htmlFor="buitengemeentelijk"
            className="text-sm text-gray-700 dark:text-gray-300"
          >
            Buitengemeentelijk
          </label>
        </div>

        {/* Grid fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Status</label>
            <input
              type="text"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={inputClass}
              placeholder="bijv. Actief, In ontwikkeling"
            />
          </div>

          <div>
            <label className={labelClass}>Standaard</label>
            <input
              type="text"
              value={standaard}
              onChange={(e) => setStandaard(e.target.value)}
              className={inputClass}
              placeholder="bijv. StUF, RSGB"
            />
          </div>

          <div className="col-span-2">
            <label className={labelClass}>Transportprotocol</label>
            <input
              type="text"
              value={transportprotocol}
              onChange={(e) => setTransportprotocol(e.target.value)}
              className={inputClass}
              placeholder="bijv. SOAP, REST, sFTP"
            />
          </div>
        </div>

        {/* Aanvullende informatie */}
        <div>
          <label className={labelClass}>Aanvullende informatie</label>
          <textarea
            value={aanvullendeInformatie}
            onChange={(e) => setAanvullendeInformatie(e.target.value)}
            className={inputClass}
            rows={3}
            placeholder="Eventuele opmerkingen over deze koppeling"
          />
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
