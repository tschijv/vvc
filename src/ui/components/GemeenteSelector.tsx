"use client";

import { useRouter } from "next/navigation";

export default function GemeenteSelector({
  gemeenten,
  selectedId,
}: {
  gemeenten: { id: string; naam: string }[];
  selectedId: string;
}) {
  const router = useRouter();

  return (
    <div className="mb-4 flex items-center gap-3">
      <label className="text-sm font-medium text-gray-600">
        Gemeente:
      </label>
      <select
        value={selectedId}
        onChange={(e) =>
          router.push(`/dashboard?tab=pakketten&gemeenteId=${e.target.value}`)
        }
        className="border rounded px-3 py-1.5 text-sm w-72"
      >
        {gemeenten.map((g) => (
          <option key={g.id} value={g.id}>
            {g.naam}
          </option>
        ))}
      </select>
    </div>
  );
}
