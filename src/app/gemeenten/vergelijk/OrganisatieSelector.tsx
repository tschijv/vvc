"use client";

import { useRouter } from "next/navigation";

interface OrganisatieSelectorProps {
  organisaties: { id: string; naam: string }[];
  selected: string[]; // up to 4 organisatie IDs
}

export default function OrganisatieSelector({ organisaties, selected }: OrganisatieSelectorProps) {
  const router = useRouter();

  const handleChange = (index: number, value: string) => {
    const next = [...selected];
    next[index] = value;
    const params = new URLSearchParams();
    next.forEach((id, i) => {
      if (id) params.set(String.fromCharCode(97 + i), id); // a, b, c, d
    });
    router.push(`/gemeenten/vergelijk?${params.toString()}`);
  };

  const addSlot = () => {
    if (selected.length >= 4) return;
    const params = new URLSearchParams();
    selected.forEach((id, i) => {
      params.set(String.fromCharCode(97 + i), id || "_");
    });
    // Add new empty slot with placeholder value so Next.js passes the param
    params.set(String.fromCharCode(97 + selected.length), "_");
    router.push(`/gemeenten/vergelijk?${params.toString()}`);
  };

  const removeSlot = (index: number) => {
    const next = selected.filter((_, i) => i !== index);
    const params = new URLSearchParams();
    next.forEach((id, i) => {
      if (id) params.set(String.fromCharCode(97 + i), id);
    });
    router.push(`/gemeenten/vergelijk?${params.toString()}`);
  };

  const selectedSet = new Set(selected.filter(Boolean));

  const labels = ["A", "B", "C", "D"];

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
        {selected.map((sel, index) => (
          <div key={index} className="flex-1 min-w-[200px]">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Gemeente {labels[index]}
              </label>
              {selected.length > 2 && (
                <button
                  onClick={() => removeSlot(index)}
                  className="text-xs text-red-500 hover:text-red-700"
                  title="Verwijder"
                >
                  Verwijder
                </button>
              )}
            </div>
            <select
              value={sel}
              onChange={(e) => handleChange(index, e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="">Selecteer gemeente...</option>
              {organisaties.map((g) => (
                <option
                  key={g.id}
                  value={g.id}
                  disabled={selectedSet.has(g.id) && g.id !== sel}
                >
                  {g.naam}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      {selected.length < 4 && (
        <button
          onClick={addSlot}
          className="mt-3 text-sm text-[#1a6ca8] hover:underline"
        >
          + Gemeente toevoegen
        </button>
      )}
    </div>
  );
}
