"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Role } from "@prisma/client";

type UserData = {
  id: string;
  email: string;
  naam: string;
  actief: boolean;
  rollen: Role[];
  organisatieId: string | null;
  leverancierId: string | null;
};

type Props = {
  user: UserData | null; // null = nieuw
  gemeenten: { id: string; naam: string }[];
  leveranciers: { id: string; naam: string }[];
  rollenLabels: Record<string, string>;
  alleRollen: string[];
};

export default function UserEditForm({
  user,
  gemeenten,
  leveranciers,
  rollenLabels,
  alleRollen,
}: Props) {
  const router = useRouter();
  const isNieuw = !user;

  const [naam, setNaam] = useState(user?.naam || "");
  const [email, setEmail] = useState(user?.email || "");
  const [actief, setActief] = useState(user?.actief ?? true);
  const [rollen, setRollen] = useState<string[]>(
    user?.rollen || ["GEVERIFIEERD"]
  );
  const [gemeenteId, setGemeenteId] = useState(user?.organisatieId || "");
  const [leverancierId, setLeverancierId] = useState(user?.leverancierId || "");
  const [wachtwoord, setWachtwoord] = useState("");
  const [wachtwoordBevestiging, setWachtwoordBevestiging] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function toggleRol(rol: string) {
    setRollen((prev) =>
      prev.includes(rol) ? prev.filter((r) => r !== rol) : [...prev, rol]
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (wachtwoord && wachtwoord !== wachtwoordBevestiging) {
        throw new Error("Wachtwoorden komen niet overeen");
      }
      if (isNieuw && wachtwoord && wachtwoord.length < 8) {
        throw new Error("Wachtwoord moet minimaal 8 tekens bevatten");
      }
      if (!isNieuw && wachtwoord && wachtwoord.length < 8) {
        throw new Error("Wachtwoord moet minimaal 8 tekens bevatten");
      }

      const body: Record<string, unknown> = {
        naam,
        email,
        actief,
        rollen,
        organisatieId: gemeenteId || null,
        leverancierId: leverancierId || null,
      };
      if (wachtwoord) {
        body.wachtwoord = wachtwoord;
      }

      const url = isNieuw
        ? "/api/admin/users"
        : `/api/admin/users/${user.id}`;
      const method = isNieuw ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Opslaan mislukt");
      }

      setSuccess(isNieuw ? "Gebruiker aangemaakt!" : "Wijzigingen opgeslagen!");
      setWachtwoord("");
      setWachtwoordBevestiging("");

      if (isNieuw) {
        const data = await res.json();
        router.push(`/admin/gebruikers/${data.id}`);
      } else {
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Onbekende fout");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!user) return;
    if (!confirm("Weet je zeker dat je deze gebruiker wilt verwijderen?"))
      return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Verwijderen mislukt");
      }
      router.push("/admin/gebruikers");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Onbekende fout");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Naam */}
      <div>
        <label className="block font-semibold mb-1">
          Naam <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={naam}
          onChange={(e) => setNaam(e.target.value)}
          required
          className="border rounded px-3 py-2 w-full max-w-md"
        />
      </div>

      {/* E-mail */}
      <div>
        <label className="block font-semibold mb-1">
          E-mailadres <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border rounded px-3 py-2 w-full max-w-md"
        />
      </div>

      {/* Wachtwoord */}
      <div>
        <label className="block font-semibold mb-1">
          {isNieuw ? "Wachtwoord" : "Nieuw wachtwoord"}
          {isNieuw && <span className="text-red-500"> *</span>}
        </label>
        <input
          type="password"
          value={wachtwoord}
          onChange={(e) => setWachtwoord(e.target.value)}
          required={isNieuw}
          minLength={8}
          placeholder={isNieuw ? "" : "Laat leeg om niet te wijzigen"}
          className="border rounded px-3 py-2 w-full max-w-md"
        />
        {!isNieuw && (
          <p className="text-xs text-gray-500 mt-1">
            Laat leeg om het huidige wachtwoord te behouden.
          </p>
        )}
      </div>

      {/* Wachtwoord bevestiging */}
      {wachtwoord && (
        <div>
          <label className="block font-semibold mb-1">
            Wachtwoord bevestigen <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={wachtwoordBevestiging}
            onChange={(e) => setWachtwoordBevestiging(e.target.value)}
            required
            minLength={8}
            className="border rounded px-3 py-2 w-full max-w-md"
          />
        </div>
      )}

      {/* Status */}
      {!isNieuw && (
        <div>
          <label className="block font-semibold mb-2">Status</label>
          <label className="inline-flex items-center gap-2 mr-6">
            <input
              type="radio"
              checked={!actief}
              onChange={() => setActief(false)}
            />
            Geblokkeerd
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              checked={actief}
              onChange={() => setActief(true)}
            />
            Actief
          </label>
        </div>
      )}

      {/* Rollen */}
      <div>
        <label className="block font-semibold mb-2">Rollen</label>
        <div className="space-y-2">
          {alleRollen.map((rol) => (
            <label key={rol} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={rollen.includes(rol)}
                onChange={() => toggleRol(rol)}
              />
              {rollenLabels[rol] || rol}
            </label>
          ))}
        </div>
      </div>

      {/* Gemeente koppeling */}
      {(rollen.includes("GEMEENTE_RAADPLEGER") ||
        rollen.includes("GEMEENTE_BEHEERDER")) && (
        <div>
          <label className="block font-semibold mb-1">
            Gekoppelde gemeente
          </label>
          <select
            value={gemeenteId}
            onChange={(e) => setGemeenteId(e.target.value)}
            className="border rounded px-3 py-2 w-full max-w-md"
          >
            <option value="">— Geen —</option>
            {gemeenten.map((g) => (
              <option key={g.id} value={g.id}>
                {g.naam}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Leverancier koppeling */}
      {rollen.includes("LEVERANCIER") && (
        <div>
          <label className="block font-semibold mb-1">
            Gekoppelde leverancier
          </label>
          <select
            value={leverancierId}
            onChange={(e) => setLeverancierId(e.target.value)}
            className="border rounded px-3 py-2 w-full max-w-md"
          >
            <option value="">— Geen —</option>
            {leveranciers.map((l) => (
              <option key={l.id} value={l.id}>
                {l.naam}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Knoppen */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          type="submit"
          disabled={saving}
          className="bg-[#1a6ca8] text-white px-6 py-2 rounded hover:bg-[#15567f] transition-colors disabled:opacity-50"
        >
          {saving ? "Opslaan..." : isNieuw ? "Aanmaken" : "Opslaan"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/gebruikers")}
          className="border rounded px-6 py-2 hover:bg-gray-100 transition-colors"
        >
          Annuleren
        </button>
        {!isNieuw && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="ml-auto text-red-600 hover:text-red-800 text-sm"
          >
            Account verwijderen
          </button>
        )}
      </div>
    </form>
  );
}
