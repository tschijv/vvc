"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
  organisatieType: string;
  leveranciers: { id: string; naam: string }[];
  gemeenten: { id: string; naam: string }[];
}

export default function RegistratieApprovalForm({
  id,
  organisatieType,
  leveranciers,
  gemeenten,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orgId, setOrgId] = useState("");
  const [afwijsReden, setAfwijsReden] = useState("");

  const isLeverancier = organisatieType === "leverancier";

  async function handleApprove() {
    setError("");
    setLoading(true);

    if (!orgId) {
      setError("Selecteer een organisatie om de gebruiker aan te koppelen.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/registraties/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actie: "goedkeuren",
          rollen: isLeverancier ? ["LEVERANCIER"] : ["GEMEENTE_BEHEERDER"],
          ...(isLeverancier
            ? { leverancierId: orgId }
            : { organisatieId: orgId }),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Er is een fout opgetreden.");
        setLoading(false);
        return;
      }

      router.push("/admin/registraties");
      router.refresh();
    } catch {
      setError("Er is een fout opgetreden.");
      setLoading(false);
    }
  }

  async function handleReject() {
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/registraties/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actie: "afwijzen",
          reden: afwijsReden || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Er is een fout opgetreden.");
        setLoading(false);
        return;
      }

      router.push("/admin/registraties");
      router.refresh();
    } catch {
      setError("Er is een fout opgetreden.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      {/* Goedkeuren */}
      <div className="bg-white border border-green-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-green-700 mb-4">Goedkeuren</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Koppel aan {isLeverancier ? "leverancier" : "gemeente"}
          </label>
          <select
            value={orgId}
            onChange={(e) => setOrgId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1a6ca8] focus:border-transparent"
          >
            <option value="">— Selecteer —</option>
            {(isLeverancier ? leveranciers : gemeenten).map((org) => (
              <option key={org.id} value={org.id}>
                {org.naam}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            De gebruiker krijgt automatisch de rol {isLeverancier ? "Leverancier" : "Gemeente beheerder"}.
          </p>
        </div>

        <button
          onClick={handleApprove}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Bezig..." : "Goedkeuren"}
        </button>
      </div>

      {/* Afwijzen */}
      <div className="bg-white border border-red-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-red-700 mb-4">Afwijzen</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reden <span className="text-gray-400 font-normal">(optioneel)</span>
          </label>
          <textarea
            value={afwijsReden}
            onChange={(e) => setAfwijsReden(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
            placeholder="Bijv. onbekende organisatie"
          />
        </div>

        <button
          onClick={handleReject}
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Bezig..." : "Afwijzen"}
        </button>
      </div>
    </div>
  );
}
