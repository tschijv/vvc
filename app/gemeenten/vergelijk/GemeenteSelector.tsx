"use client";

import { useRouter } from "next/navigation";

interface GemeenteSelectorProps {
  gemeenten: { id: string; naam: string }[];
  selectedA: string;
  selectedB: string;
}

export default function GemeenteSelector({ gemeenten, selectedA, selectedB }: GemeenteSelectorProps) {
  const router = useRouter();

  const handleChange = (side: "a" | "b", value: string) => {
    const a = side === "a" ? value : selectedA;
    const b = side === "b" ? value : selectedB;
    const params = new URLSearchParams();
    if (a) params.set("a", a);
    if (b) params.set("b", b);
    router.push(`/gemeenten/vergelijk?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
          Gemeente A
        </label>
        <select
          value={selectedA}
          onChange={(e) => handleChange("a", e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
        >
          <option value="">Selecteer gemeente...</option>
          {gemeenten.map((g) => (
            <option key={g.id} value={g.id} disabled={g.id === selectedB}>
              {g.naam}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-end pb-2">
        <span className="text-gray-400 text-lg">⇄</span>
      </div>
      <div className="flex-1">
        <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
          Gemeente B
        </label>
        <select
          value={selectedB}
          onChange={(e) => handleChange("b", e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
        >
          <option value="">Selecteer gemeente...</option>
          {gemeenten.map((g) => (
            <option key={g.id} value={g.id} disabled={g.id === selectedA}>
              {g.naam}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
