"use client";

import { useState } from "react";
import Link from "next/link";

interface RefComp {
  id: string;
  naam: string;
}

interface AanbodItem {
  leverancier: string;
  leverancierSlug: string;
  pakket: string;
  pakketSlug: string;
  versie: string;
  status: string;
  referentiecomponenten: { naam: string }[];
  standaarden: { naam: string; versie: string; compliancy: boolean | null }[];
}

interface StandaardItem {
  naam: string;
  versies: string[];
}

interface InkoopClientProps {
  referentiecomponenten: RefComp[];
}

export default function InkoopClient({
  referentiecomponenten,
}: InkoopClientProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [zoek, setZoek] = useState("");
  const [loading, setLoading] = useState(false);
  const [aanbod, setAanbod] = useState<AanbodItem[] | null>(null);
  const [standaarden, setStandaarden] = useState<StandaardItem[]>([]);

  const filtered = referentiecomponenten.filter((rc) =>
    rc.naam.toLowerCase().includes(zoek.toLowerCase())
  );

  const toggleRefComp = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleRaadpleeg = async () => {
    if (selected.size === 0) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/inkoop?refcomps=${Array.from(selected).join(",")}`
      );
      const data = await res.json();
      if (res.ok) {
        setAanbod(data.aanbod);
        setStandaarden(data.standaarden);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBestektekst = () => {
    if (selected.size === 0 || !aanbod) return;

    const selectedNames = referentiecomponenten
      .filter((rc) => selected.has(rc.id))
      .map((rc) => rc.naam);

    const lines: string[] = [];
    lines.push("BESTEKTEKST - VNG Voorzieningencatalogus");
    lines.push("=".repeat(50));
    lines.push("");
    lines.push(`Datum: ${new Date().toLocaleDateString("nl-NL")}`);
    lines.push("");
    lines.push("Geselecteerde referentiecomponenten:");
    for (const name of selectedNames) {
      lines.push(`  - ${name}`);
    }
    lines.push("");

    if (standaarden.length > 0) {
      lines.push("Toepasselijke standaarden:");
      lines.push("-".repeat(40));
      for (const s of standaarden) {
        lines.push(`  ${s.naam} (${s.versies.join(", ")})`);
      }
      lines.push("");
      lines.push(
        "De leverancier dient aan te tonen dat het aangeboden product"
      );
      lines.push(
        "voldoet aan bovengenoemde standaarden conform de GEMMA-architectuur."
      );
      lines.push("");
    }

    lines.push("ICT-aanbod:");
    lines.push("-".repeat(40));
    if (aanbod.length === 0) {
      lines.push("  Geen pakketversies gevonden.");
    } else {
      for (const item of aanbod) {
        lines.push(
          `  ${item.leverancier} - ${item.pakket} (${item.versie}) [${item.status}]`
        );
        if (item.standaarden.length > 0) {
          for (const s of item.standaarden) {
            const status =
              s.compliancy === true
                ? "Ok"
                : s.compliancy === false
                  ? "Niet ok"
                  : "Onbekend";
            lines.push(`    Standaard: ${s.naam} ${s.versie} - ${status}`);
          }
        }
      }
    }

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bestektekst_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Selector */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 max-w-3xl">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Selecteer referentiecomponenten
        </label>
        <input
          type="text"
          placeholder="Zoek referentiecomponent..."
          value={zoek}
          onChange={(e) => setZoek(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-3"
        />
        <div className="border border-gray-200 rounded max-h-64 overflow-y-auto">
          {filtered.map((rc) => (
            <label
              key={rc.id}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer hover:bg-blue-50 ${
                selected.has(rc.id) ? "bg-blue-50 font-medium" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={selected.has(rc.id)}
                onChange={() => toggleRefComp(rc.id)}
                className="rounded border-gray-300"
              />
              {rc.naam}
            </label>
          ))}
          {filtered.length === 0 && (
            <p className="px-3 py-2 text-sm text-gray-400">
              Geen resultaten voor &ldquo;{zoek}&rdquo;
            </p>
          )}
        </div>

        {selected.size > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            {selected.size} referentiecomponent
            {selected.size !== 1 ? "en" : ""} geselecteerd
          </p>
        )}

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleRaadpleeg}
            disabled={selected.size === 0 || loading}
            className={`px-4 py-2 rounded text-sm text-white ${
              selected.size === 0 || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#1a6ca8] hover:bg-[#155a8c] cursor-pointer"
            }`}
          >
            {loading ? "Laden..." : "Raadpleeg ICT-aanbod"}
          </button>
          <button
            onClick={handleBestektekst}
            disabled={selected.size === 0 || !aanbod}
            className={`px-4 py-2 rounded text-sm text-white ${
              selected.size === 0 || !aanbod
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#e35b10] hover:bg-[#c54d0d] cursor-pointer"
            }`}
          >
            Genereer bestektekst
          </button>
        </div>
      </div>

      {/* Resultaten */}
      {aanbod !== null && (
        <div className="space-y-6">
          {/* Toepasselijke standaarden */}
          {standaarden.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h2 className="text-lg font-semibold text-[#1a6ca8] mb-3">
                Toepasselijke standaarden
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                De volgende standaarden zijn van toepassing op de geselecteerde
                referentiecomponenten:
              </p>
              <div className="grid gap-2">
                {standaarden.map((s) => (
                  <div
                    key={s.naam}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span className="text-[#e35b10] font-bold">▸</span>
                    <span className="font-medium">{s.naam}</span>
                    <span className="text-gray-500">
                      ({s.versies.join(", ")})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ICT Aanbod */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="text-lg font-semibold text-[#1a6ca8] mb-3">
              ICT-aanbod ({aanbod.length} pakketversie
              {aanbod.length !== 1 ? "s" : ""})
            </h2>

            {aanbod.length === 0 ? (
              <p className="text-sm text-gray-500">
                Geen pakketversies gevonden voor de geselecteerde
                referentiecomponenten.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left">
                      <th scope="col" className="py-2 pr-4 font-semibold text-gray-600">
                        Leverancier
                      </th>
                      <th scope="col" className="py-2 pr-4 font-semibold text-gray-600">
                        Pakket
                      </th>
                      <th scope="col" className="py-2 pr-4 font-semibold text-gray-600">
                        Versie
                      </th>
                      <th scope="col" className="py-2 pr-4 font-semibold text-gray-600">
                        Status
                      </th>
                      <th scope="col" className="py-2 pr-4 font-semibold text-gray-600">
                        Referentiecomponenten
                      </th>
                      <th scope="col" className="py-2 font-semibold text-gray-600">
                        Standaarden
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {aanbod.map((item, i) => (
                      <tr
                        key={i}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-2 pr-4">
                          <Link
                            href={`/leveranciers/${item.leverancierSlug}`}
                            className="text-[#1a6ca8] hover:underline"
                          >
                            {item.leverancier}
                          </Link>
                        </td>
                        <td className="py-2 pr-4">
                          <Link
                            href={`/pakketten/${item.pakketSlug}`}
                            className="text-[#1a6ca8] hover:underline"
                          >
                            {item.pakket}
                          </Link>
                        </td>
                        <td className="py-2 pr-4 text-gray-600">
                          {item.versie}
                        </td>
                        <td className="py-2 pr-4">
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              item.status === "In productie" ||
                              item.status === "productie"
                                ? "bg-green-100 text-green-700"
                                : item.status === "In ontwikkeling"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-2 pr-4 text-gray-600">
                          {item.referentiecomponenten
                            .map((rc) => rc.naam)
                            .join(", ")}
                        </td>
                        <td className="py-2">
                          {item.standaarden.length > 0 ? (
                            <div className="space-y-0.5">
                              {item.standaarden.map((s, j) => (
                                <div key={j} className="flex items-center gap-1">
                                  <span
                                    className={`inline-block w-2 h-2 rounded-full ${
                                      s.compliancy === true
                                        ? "bg-green-500"
                                        : s.compliancy === false
                                          ? "bg-red-500"
                                          : "bg-gray-300"
                                    }`}
                                  />
                                  <span className="text-xs text-gray-600">
                                    {s.naam} {s.versie}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
