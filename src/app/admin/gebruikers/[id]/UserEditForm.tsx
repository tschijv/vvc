"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";


type UserData = {
  id: string;
  email: string;
  naam: string;
  actief: boolean;
  rollen: string[];
  organisatieId: string | null;
  leverancierId: string | null;
};

type UserOrgKoppeling = {
  organisatieId: string;
  organisatieNaam: string;
  rol: string;
};

type Props = {
  user: UserData | null; // null = nieuw
  gemeenten: { id: string; naam: string }[];
  leveranciers: { id: string; naam: string }[];
  rollenLabels: Record<string, string>;
  alleRollen: string[];
  userOrganisaties?: UserOrgKoppeling[];
};

export default function UserEditForm({
  user,
  gemeenten,
  leveranciers,
  rollenLabels,
  alleRollen,
  userOrganisaties: initialOrganisaties = [],
}: Props) {
  const router = useRouter();
  const isNieuw = !user;

  const [naam, setNaam] = useState(user?.naam || "");
  const [email, setEmail] = useState(user?.email || "");
  const [actief, setActief] = useState(user?.actief ?? true);
  const [rollen, setRollen] = useState<string[]>(
    user?.rollen || ["GEVERIFIEERD"]
  );
  const [organisatieId, setOrganisatieId] = useState(user?.organisatieId || "");
  const [leverancierId, setLeverancierId] = useState(user?.leverancierId || "");
  const [wachtwoord, setWachtwoord] = useState("");
  const [wachtwoordBevestiging, setWachtwoordBevestiging] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Multi-org state
  const [orgKoppelingen, setOrgKoppelingen] = useState<UserOrgKoppeling[]>(initialOrganisaties);
  const [newOrgId, setNewOrgId] = useState("");
  const [newOrgRol, setNewOrgRol] = useState("BEHEERDER");
  const [orgSaving, setOrgSaving] = useState(false);

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
        organisatieId: organisatieId || null,
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

  async function handleAddOrg() {
    if (!user || !newOrgId || orgSaving) return;
    setOrgSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/organisaties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organisatieId: newOrgId, rol: newOrgRol }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Toevoegen mislukt");
      }
      const org = gemeenten.find((g) => g.id === newOrgId);
      setOrgKoppelingen((prev) => {
        // Replace if already exists (upsert)
        const existing = prev.findIndex((k) => k.organisatieId === newOrgId);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = {
            organisatieId: newOrgId,
            organisatieNaam: org?.naam || newOrgId,
            rol: newOrgRol,
          };
          return updated;
        }
        return [
          ...prev,
          {
            organisatieId: newOrgId,
            organisatieNaam: org?.naam || newOrgId,
            rol: newOrgRol,
          },
        ];
      });
      setNewOrgId("");
      setNewOrgRol("BEHEERDER");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Onbekende fout");
    } finally {
      setOrgSaving(false);
    }
  }

  async function handleRemoveOrg(organisatieId: string) {
    if (!user || orgSaving) return;
    if (!confirm("Weet je zeker dat je deze koppeling wilt verwijderen?")) return;
    setOrgSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/organisaties`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organisatieId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Verwijderen mislukt");
      }
      setOrgKoppelingen((prev) => prev.filter((k) => k.organisatieId !== organisatieId));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Onbekende fout");
    } finally {
      setOrgSaving(false);
    }
  }

  const isGemeenteUser =
    rollen.includes("RAADPLEGER") ||
    rollen.includes("BEHEERDER");

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 px-4 py-3 rounded">
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
          className="border dark:border-slate-600 dark:bg-slate-700 rounded px-3 py-2 w-full max-w-md"
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
          className="border dark:border-slate-600 dark:bg-slate-700 rounded px-3 py-2 w-full max-w-md"
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
          className="border dark:border-slate-600 dark:bg-slate-700 rounded px-3 py-2 w-full max-w-md"
        />
        {!isNieuw && (
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
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
            className="border dark:border-slate-600 dark:bg-slate-700 rounded px-3 py-2 w-full max-w-md"
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

      {/* Gemeente koppeling (actieve organisatie) */}
      {isGemeenteUser && (
        <div>
          <label className="block font-semibold mb-1">
            Actieve organisatie
          </label>
          <select
            value={organisatieId}
            onChange={(e) => setOrganisatieId(e.target.value)}
            className="border dark:border-slate-600 dark:bg-slate-700 rounded px-3 py-2 w-full max-w-md"
          >
            <option value="">-- Geen --</option>
            {gemeenten.map((g) => (
              <option key={g.id} value={g.id}>
                {g.naam}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            De actieve organisatie bepaalt welk portfolio de gebruiker standaard ziet.
          </p>
        </div>
      )}

      {/* Multi-organisatie koppelingen */}
      {isGemeenteUser && !isNieuw && (
        <div className="border dark:border-slate-600 rounded-lg p-4 bg-gray-50 dark:bg-slate-800">
          <label className="block font-semibold mb-3">
            Organisatie-koppelingen (multi-org)
          </label>
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">
            Voeg meerdere organisaties toe waartussen de gebruiker kan schakelen.
          </p>

          {/* Existing koppelingen */}
          {orgKoppelingen.length > 0 && (
            <div className="space-y-2 mb-4">
              {orgKoppelingen.map((koppeling) => (
                <div
                  key={koppeling.organisatieId}
                  className="flex items-center justify-between bg-white dark:bg-slate-700 border dark:border-slate-600 rounded px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{koppeling.organisatieNaam}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                      {koppeling.rol === "BEHEERDER" ? "Beheerder" : "Raadpleger"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveOrg(koppeling.organisatieId)}
                    disabled={orgSaving}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs disabled:opacity-50"
                    title="Koppeling verwijderen"
                  >
                    Verwijderen
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add new koppeling */}
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-xs text-gray-600 dark:text-slate-400 mb-1">Organisatie</label>
              <select
                value={newOrgId}
                onChange={(e) => setNewOrgId(e.target.value)}
                className="border dark:border-slate-600 dark:bg-slate-700 rounded px-2 py-1.5 w-full text-sm"
              >
                <option value="">-- Selecteer --</option>
                {gemeenten
                  .filter((g) => !orgKoppelingen.some((k) => k.organisatieId === g.id))
                  .map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.naam}
                    </option>
                  ))}
              </select>
            </div>
            <div className="w-36">
              <label className="block text-xs text-gray-600 dark:text-slate-400 mb-1">Rol</label>
              <select
                value={newOrgRol}
                onChange={(e) => setNewOrgRol(e.target.value)}
                className="border dark:border-slate-600 dark:bg-slate-700 rounded px-2 py-1.5 w-full text-sm"
              >
                <option value="BEHEERDER">Beheerder</option>
                <option value="RAADPLEGER">Raadpleger</option>
              </select>
            </div>
            <button
              type="button"
              onClick={handleAddOrg}
              disabled={!newOrgId || orgSaving}
              className="bg-[#1a6ca8] text-white px-3 py-1.5 rounded text-sm hover:bg-[#15567f] transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {orgSaving ? "..." : "Toevoegen"}
            </button>
          </div>
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
            className="border dark:border-slate-600 dark:bg-slate-700 rounded px-3 py-2 w-full max-w-md"
          >
            <option value="">-- Geen --</option>
            {leveranciers.map((l) => (
              <option key={l.id} value={l.id}>
                {l.naam}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Knoppen */}
      <div className="flex gap-3 pt-4 border-t dark:border-slate-600">
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
          className="border dark:border-slate-600 rounded px-6 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        >
          Annuleren
        </button>
        {!isNieuw && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="ml-auto text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm"
          >
            Account verwijderen
          </button>
        )}
      </div>
    </form>
  );
}
