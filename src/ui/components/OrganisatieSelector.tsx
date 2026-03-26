"use client";

import { useRouter } from "next/navigation";

export default function OrganisatieSelector({
  organisaties,
  selectedId,
  currentTab,
}: {
  organisaties: { id: string; naam: string }[];
  selectedId: string;
  currentTab?: string;
}) {
  const router = useRouter();

  return (
    <div className="mb-4 flex items-center gap-3">
      <label className="text-sm font-medium text-gray-600">
        Organisatie:
      </label>
      <select
        value={selectedId}
        onChange={(e) =>
          router.push(`/dashboard?tab=pakketten&gemeenteId=${e.target.value}`)
        }
        className="border rounded px-3 py-1.5 text-sm w-72"
      >
        {organisaties.map((g) => (
          <option key={g.id} value={g.id}>
            {g.naam}
          </option>
        ))}
      </select>
    </div>
  );
}
