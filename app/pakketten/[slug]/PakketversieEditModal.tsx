"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import {
  addPakketversie,
  updatePakketversie,
  getAllReferentiecomponenten,
  getPakketversieRefcomps,
  updatePakketversieRefcomps,
  getAllStandaardversies,
  getPakketversieStandaarden,
  updatePakketversieStandaarden,
  createStandaardversie,
  getAllApplicatiefuncties,
  getPakketversieAppFuncties,
  updatePakketversieAppFuncties,
  getPakketversieTechnologieen,
  updatePakketversieTechnologieen,
} from "./pakket-actions";

type PakketversieData = {
  id: string;
  naam: string;
  status: string;
  beschrijving: string | null;
  startOntwikkeling: string | null;
  startTest: string | null;
  startDistributie: string | null;
};

type NamedItem = { id: string; naam: string };
type StandaardversieItem = { id: string; naam: string; standaard: { naam: string } };
type StandaardSelection = { standaardversieId: string; compliancy: boolean };

type Props = {
  pakketId: string;
  existing: PakketversieData | null;
  onClose: () => void;
};

const STATUS_OPTIONS = ["In ontwikkeling", "In test", "In distributie", "Uit distributie"];

function toDateInputValue(dateStr: string | null): string {
  if (!dateStr) return "";
  return dateStr.substring(0, 10);
}

/** Reusable checkbox list with search filter */
function CheckboxList({
  items,
  selected,
  onToggle,
  labelFn,
  placeholder,
}: {
  items: { id: string }[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  labelFn: (item: { id: string }) => string;
  placeholder: string;
}) {
  const [filter, setFilter] = useState("");
  const filtered = filter
    ? items.filter((item) => labelFn(item).toLowerCase().includes(filter.toLowerCase()))
    : items;

  return (
    <>
      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-2"
      />
      <div className="border border-gray-200 dark:border-gray-600 rounded-lg max-h-40 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 p-3 text-center">Geen resultaten</p>
        ) : (
          filtered.map((item) => (
            <label
              key={item.id}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
            >
              <input
                type="checkbox"
                checked={selected.has(item.id)}
                onChange={() => onToggle(item.id)}
                className="rounded border-gray-300 text-[#1a6ca8] focus:ring-[#1a6ca8]"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{labelFn(item)}</span>
            </label>
          ))
        )}
      </div>
    </>
  );
}

export default function PakketversieEditModal({ pakketId, existing, onClose }: Props) {
  const router = useRouter();
  const isAdd = !existing;

  // Basic fields
  const [naam, setNaam] = useState(existing?.naam || "");
  const [status, setStatus] = useState(existing?.status || "In ontwikkeling");
  const [beschrijving, setBeschrijving] = useState(existing?.beschrijving || "");
  const [startOntwikkeling, setStartOntwikkeling] = useState(toDateInputValue(existing?.startOntwikkeling ?? null));
  const [startTest, setStartTest] = useState(toDateInputValue(existing?.startTest ?? null));
  const [startDistributie, setStartDistributie] = useState(toDateInputValue(existing?.startDistributie ?? null));

  // Relations data (loaded async)
  const [allRefComps, setAllRefComps] = useState<NamedItem[]>([]);
  const [selectedRefComps, setSelectedRefComps] = useState<Set<string>>(new Set());
  const [allStandaardversies, setAllStandaardversies] = useState<StandaardversieItem[]>([]);
  const [selectedStandaarden, setSelectedStandaarden] = useState<Map<string, boolean>>(new Map());
  const [allAppFuncties, setAllAppFuncties] = useState<NamedItem[]>([]);
  const [selectedAppFuncties, setSelectedAppFuncties] = useState<Set<string>>(new Set());
  const [technologieen, setTechnologieen] = useState("");

  const [loadingRelations, setLoadingRelations] = useState(!!existing);
  const [activeTab, setActiveTab] = useState<"basis" | "refcomp" | "standaarden" | "functies" | "tech">("basis");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load all relation data for edit mode
  useEffect(() => {
    if (!existing) return;
    async function load() {
      setLoadingRelations(true);
      try {
        const [refComps, curRefComps, svs, curStd, afs, curAfs, curTech] = await Promise.all([
          getAllReferentiecomponenten(),
          getPakketversieRefcomps(existing!.id),
          getAllStandaardversies(),
          getPakketversieStandaarden(existing!.id),
          getAllApplicatiefuncties(),
          getPakketversieAppFuncties(existing!.id),
          getPakketversieTechnologieen(existing!.id),
        ]);
        setAllRefComps(refComps);
        setSelectedRefComps(new Set(curRefComps));
        setAllStandaardversies(svs);
        const stdMap = new Map<string, boolean>();
        curStd.forEach((s) => stdMap.set(s.standaardversieId, s.compliancy ?? false));
        setSelectedStandaarden(stdMap);
        setAllAppFuncties(afs);
        setSelectedAppFuncties(new Set(curAfs));
        setTechnologieen(curTech.join(", "));
      } catch {
        console.error("Failed to load relations");
      } finally {
        setLoadingRelations(false);
      }
    }
    load();
  }, [existing]);

  function toggleRefComp(id: string) {
    setSelectedRefComps((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleStandaard(id: string) {
    setSelectedStandaarden((prev) => {
      const n = new Map(prev);
      if (n.has(id)) n.delete(id); else n.set(id, false);
      return n;
    });
  }
  function toggleStandaardCompliancy(id: string) {
    setSelectedStandaarden((prev) => {
      const n = new Map(prev);
      n.set(id, !n.get(id));
      return n;
    });
  }
  function toggleAppFunctie(id: string) {
    setSelectedAppFuncties((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (!naam.trim()) { setError("Naam is verplicht."); setSaving(false); return; }

    const data = {
      naam: naam.trim(),
      status: status || undefined,
      beschrijving: beschrijving || undefined,
      startOntwikkeling: startOntwikkeling || undefined,
      startTest: startTest || undefined,
      startDistributie: startDistributie || undefined,
    };

    let result;
    if (isAdd) {
      result = await addPakketversie(pakketId, data);
    } else {
      result = await updatePakketversie(existing.id, data);

      // Save all relations
      if (!("error" in result)) {
        const stdData: StandaardSelection[] = [];
        selectedStandaarden.forEach((compliancy, svId) => stdData.push({ standaardversieId: svId, compliancy }));

        const techArray = technologieen.split(",").map((t) => t.trim()).filter(Boolean);

        const [r1, r2, r3, r4] = await Promise.all([
          updatePakketversieRefcomps(existing.id, Array.from(selectedRefComps)),
          updatePakketversieStandaarden(existing.id, stdData),
          updatePakketversieAppFuncties(existing.id, Array.from(selectedAppFuncties)),
          updatePakketversieTechnologieen(existing.id, techArray),
        ]);

        const firstError = [r1, r2, r3, r4].find((r) => "error" in r);
        if (firstError && "error" in firstError) {
          setSaving(false);
          setError(firstError.error);
          return;
        }
      }
    }

    setSaving(false);
    if ("error" in result) {
      setError(result.error);
    } else {
      router.refresh();
      onClose();
    }
  }

  const tabs = [
    { key: "basis" as const, label: "Basis" },
    ...(!isAdd ? [
      { key: "refcomp" as const, label: `Referentiecomp. (${selectedRefComps.size})` },
      { key: "standaarden" as const, label: `Standaarden (${selectedStandaarden.size})` },
      { key: "functies" as const, label: `Functies (${selectedAppFuncties.size})` },
      { key: "tech" as const, label: "Technologie" },
    ] : []),
  ];

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isAdd ? "Pakketversie toevoegen" : `Versie "${existing.naam}" bewerken`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 rounded-lg px-3 py-2 text-sm">
            {error}
          </div>
        )}

        {/* Tab navigation */}
        {tabs.length > 1 && (
          <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 -mx-6 px-6">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === t.key
                    ? "border-[#1a6ca8] text-[#1a6ca8]"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Basis tab */}
        {activeTab === "basis" && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Naam *</label>
                <input type="text" value={naam} onChange={(e) => setNaam(e.target.value)} required
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="bijv. 4.2.1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Beschrijving</label>
              <textarea value={beschrijving} onChange={(e) => setBeschrijving(e.target.value)} rows={3}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {([["Start ontwikkeling", startOntwikkeling, setStartOntwikkeling],
                ["Start test", startTest, setStartTest],
                ["Start distributie", startDistributie, setStartDistributie]] as const).map(([label, val, setVal]) => (
                <div key={label}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                  <input type="date" value={val} onChange={(e) => (setVal as (v: string) => void)(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Referentiecomponenten tab */}
        {activeTab === "refcomp" && !isAdd && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Referentiecomponenten
              <span className="ml-2 text-xs font-normal text-[#1a6ca8]">({selectedRefComps.size} geselecteerd)</span>
            </label>
            {loadingRelations ? (
              <div className="flex items-center gap-2 py-3 text-sm text-gray-500">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-[#1a6ca8] rounded-full animate-spin" /> Laden...
              </div>
            ) : (
              <CheckboxList
                items={allRefComps}
                selected={selectedRefComps}
                onToggle={toggleRefComp}
                labelFn={(item) => (item as NamedItem).naam}
                placeholder="Zoek referentiecomponent..."
              />
            )}
          </div>
        )}

        {/* Standaarden tab */}
        {activeTab === "standaarden" && !isAdd && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Standaarden
              <span className="ml-2 text-xs font-normal text-[#1a6ca8]">({selectedStandaarden.size} geselecteerd)</span>
            </label>
            {loadingRelations ? (
              <div className="flex items-center gap-2 py-3 text-sm text-gray-500">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-[#1a6ca8] rounded-full animate-spin" /> Laden...
              </div>
            ) : (
              <StandaardenSelector
                items={allStandaardversies}
                selected={selectedStandaarden}
                onToggle={toggleStandaard}
                onToggleCompliancy={toggleStandaardCompliancy}
                onNewCreated={(sv) => setAllStandaardversies((prev) => [...prev, sv].sort((a, b) =>
                  `${a.standaard.naam} ${a.naam}`.localeCompare(`${b.standaard.naam} ${b.naam}`)))}
              />
            )}
          </div>
        )}

        {/* Applicatiefuncties tab */}
        {activeTab === "functies" && !isAdd && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Applicatiefuncties
              <span className="ml-2 text-xs font-normal text-[#1a6ca8]">({selectedAppFuncties.size} geselecteerd)</span>
            </label>
            {loadingRelations ? (
              <div className="flex items-center gap-2 py-3 text-sm text-gray-500">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-[#1a6ca8] rounded-full animate-spin" /> Laden...
              </div>
            ) : (
              <CheckboxList
                items={allAppFuncties}
                selected={selectedAppFuncties}
                onToggle={toggleAppFunctie}
                labelFn={(item) => (item as NamedItem).naam}
                placeholder="Zoek applicatiefunctie..."
              />
            )}
          </div>
        )}

        {/* Technologie tab */}
        {activeTab === "tech" && !isAdd && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Technologieën
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
              Voer technologieën in, gescheiden door komma&apos;s (bijv. &quot;SaaS, REST API, PostgreSQL&quot;)
            </p>
            <textarea
              value={technologieen}
              onChange={(e) => setTechnologieen(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="SaaS, REST API, PostgreSQL"
            />
            {technologieen && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {technologieen.split(",").map((t) => t.trim()).filter(Boolean).map((t, i) => (
                  <span key={i} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {isAdd && (
          <p className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2">
            💡 Na het aanmaken kun je de versie bewerken om referentiecomponenten, standaarden, applicatiefuncties en technologieën in te stellen.
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
            Annuleren
          </button>
          <button type="submit" disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-[#1a6ca8] hover:bg-[#155a8a] rounded-lg disabled:opacity-50 transition-colors">
            {saving ? "Opslaan..." : isAdd ? "Toevoegen" : "Opslaan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/** Standaarden selector with compliancy toggle + inline "new" form */
function StandaardenSelector({
  items, selected, onToggle, onToggleCompliancy, onNewCreated,
}: {
  items: StandaardversieItem[];
  selected: Map<string, boolean>;
  onToggle: (id: string) => void;
  onToggleCompliancy: (id: string) => void;
  onNewCreated: (sv: StandaardversieItem) => void;
}) {
  const [filter, setFilter] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [newStdNaam, setNewStdNaam] = useState("");
  const [newVersieNaam, setNewVersieNaam] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const filtered = filter
    ? items.filter((sv) => `${sv.standaard.naam} ${sv.naam}`.toLowerCase().includes(filter.toLowerCase()))
    : items;

  async function handleCreate() {
    if (!newStdNaam.trim() || !newVersieNaam.trim()) {
      setCreateError("Beide velden zijn verplicht.");
      return;
    }
    setCreating(true);
    setCreateError("");
    const result = await createStandaardversie({
      standaardNaam: newStdNaam.trim(),
      versieNaam: newVersieNaam.trim(),
    });
    setCreating(false);
    if ("error" in result) {
      setCreateError(result.error);
    } else {
      // Add to the list and auto-select
      const newItem: StandaardversieItem = {
        id: result.id,
        naam: newVersieNaam.trim(),
        standaard: { naam: newStdNaam.trim() },
      };
      onNewCreated(newItem);
      onToggle(result.id);
      setNewStdNaam("");
      setNewVersieNaam("");
      setShowNewForm(false);
    }
  }

  return (
    <>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Zoek standaard..."
          className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
        <button
          type="button"
          onClick={() => setShowNewForm(!showNewForm)}
          className="text-xs font-medium text-[#1a6ca8] hover:text-[#155a8a] dark:text-blue-400 whitespace-nowrap px-2"
        >
          {showNewForm ? "Annuleren" : "+ Nieuwe standaard"}
        </button>
      </div>

      {/* Inline create form */}
      {showNewForm && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-2 space-y-2">
          <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Nieuwe standaard(versie) toevoegen</p>
          {createError && (
            <p className="text-xs text-red-600 dark:text-red-400">{createError}</p>
          )}
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={newStdNaam}
              onChange={(e) => setNewStdNaam(e.target.value)}
              placeholder="Standaardnaam (bijv. StUF BG)"
              className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <input
              type="text"
              value={newVersieNaam}
              onChange={(e) => setNewVersieNaam(e.target.value)}
              placeholder="Versie (bijv. 3.10)"
              className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating}
            className="text-xs font-medium text-white bg-[#1a6ca8] hover:bg-[#155a8a] rounded px-3 py-1.5 disabled:opacity-50 transition-colors"
          >
            {creating ? "Aanmaken..." : "Toevoegen en selecteren"}
          </button>
        </div>
      )}

      <div className="border border-gray-200 dark:border-gray-600 rounded-lg max-h-48 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 p-3 text-center">Geen resultaten</p>
        ) : (
          filtered.map((sv) => {
            const isSelected = selected.has(sv.id);
            const isCompliant = selected.get(sv.id) ?? false;
            return (
              <div key={sv.id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggle(sv.id)}
                    className="rounded border-gray-300 text-[#1a6ca8] focus:ring-[#1a6ca8]"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    {sv.standaard.naam} {sv.naam}
                  </span>
                </label>
                {isSelected && (
                  <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={isCompliant}
                      onChange={() => onToggleCompliancy(sv.id)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-3.5 h-3.5"
                    />
                    Compliant
                  </label>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
