"use client";

import { useState } from "react";
import Link from "next/link";
import type { SimilarGemeente } from "@/service/gemeente";

type SortKey = "overlap" | "naam" | "shared" | "total";

export default function SortableTable({
  gemeenten,
  currentGemeenteId,
}: {
  gemeenten: SimilarGemeente[];
  currentGemeenteId: string;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("overlap");

  const sorted = [...gemeenten].sort((a, b) => {
    switch (sortKey) {
      case "overlap":
        return b.overlapPercentage - a.overlapPercentage || b.sharedCount - a.sharedCount;
      case "naam":
        return a.naam.localeCompare(b.naam);
      case "shared":
        return b.sharedCount - a.sharedCount || b.overlapPercentage - a.overlapPercentage;
      case "total":
        return b.totalPakketten - a.totalPakketten || b.overlapPercentage - a.overlapPercentage;
      default:
        return 0;
    }
  });

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "overlap", label: "Overlap %" },
    { key: "naam", label: "Naam (A-Z)" },
    { key: "shared", label: "Gedeelde pakketten" },
    { key: "total", label: "Totaal pakketten" },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="text-sm text-gray-600">Sorteer op:</span>
        <div className="flex gap-1.5">
          {sortOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSortKey(opt.key)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                sortKey === opt.key
                  ? "bg-[#1a6ca8] text-white border-[#1a6ca8]"
                  : "bg-white text-gray-600 border-gray-300 hover:border-[#1a6ca8] hover:text-[#1a6ca8]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 border-b border-gray-200 bg-gray-50">
              <th scope="col" className="px-4 py-2.5 font-medium">Gemeente</th>
              <th scope="col" className="px-4 py-2.5 font-medium text-right">Gedeelde pakketten</th>
              <th scope="col" className="px-4 py-2.5 font-medium text-right">Totaal pakketten gemeente</th>
              <th scope="col" className="px-4 py-2.5 font-medium text-right">Overlap %</th>
              <th scope="col" className="px-4 py-2.5 font-medium text-right">Vergelijk</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((sg, i) => (
              <tr key={sg.id} className={`border-b border-gray-100 last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                <td className="px-4 py-2.5">
                  <Link href={`/gemeenten/${sg.id}`} className="text-[#1a6ca8] hover:underline font-medium">
                    {sg.naam}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-right text-gray-700 tabular-nums">{sg.sharedCount}</td>
                <td className="px-4 py-2.5 text-right text-gray-700 tabular-nums">{sg.totalPakketten}</td>
                <td className="px-4 py-2.5 text-right">
                  <span className="inline-flex items-center justify-center min-w-[2.5rem] h-6 rounded bg-green-600 text-white text-xs font-bold px-1.5">
                    {sg.overlapPercentage}%
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Link
                    href={`/gemeenten/vergelijk?a=${currentGemeenteId}&b=${sg.id}`}
                    className="text-xs border border-[#1a6ca8] text-[#1a6ca8] rounded px-3 py-1 hover:bg-[#1a6ca8] hover:text-white transition-colors whitespace-nowrap inline-block"
                  >
                    Vergelijk
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
