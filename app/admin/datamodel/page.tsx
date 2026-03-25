import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-helpers";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import MimDiagram from "./MimDiagram";
import {
  domeinen,
  koppelklassen,
  enumeraties,
  relaties,
  aantalObjecttypen,
  aantalKoppelklassen,
  aantalEnumeraties,
  aantalAttributen,
  aantalRelaties,
} from "./datamodel-data";

export default async function DatamodelPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div>
      <Breadcrumbs items={[
        { label: "Beheer", href: "/admin" },
        { label: "Datamodel", href: "/admin/datamodel" },
      ]} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logisch Informatiemodel (MIM)</h1>
          <p className="text-sm text-gray-500 mt-1">Conform MIM 1.2 – Niveau 3 (Logisch informatiemodel)</p>
        </div>
      </div>

      {/* MIM Diagram — dynamisch gegenereerd uit data */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">UML-klassendiagram</h2>
        <div className="overflow-auto border border-gray-100 rounded bg-gray-50 p-2">
          <MimDiagram domeinen={domeinen} koppelklassen={koppelklassen} relaties={relaties} />
        </div>
      </div>

      {/* Legenda */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">MIM-stereotypen</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-[#CCE5FF] border border-[#2171B5]" />
            <span className="text-sm">«Objecttype»</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-[#E0F0E0] border border-[#41AB5D]" />
            <span className="text-sm">«Gegevensgroeptype»</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-[#F0E0FF] border border-[#7A3DB8]" />
            <span className="text-sm">«Koppelklasse»</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-[#FFF3CD] border border-[#FFA500]" />
            <span className="text-sm">«Enumeratie»</span>
          </div>
        </div>
      </div>

      {/* Domeinen */}
      <div className="space-y-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Objecttypen per domein</h2>
        {domeinen.map((d) => (
          <div key={d.naam} className={`border rounded-lg p-4 ${d.kleur}`}>
            <h3 className="font-semibold text-gray-800 mb-2">{d.naam}</h3>
            <div className="space-y-1">
              {d.objecttypen.map((ot) => (
                <div key={ot.naam} className="flex items-start gap-2 text-sm">
                  <span className="font-mono font-semibold text-gray-700 whitespace-nowrap min-w-[200px]">
                    {ot.naam}
                    {ot.stereotype && (
                      <span className="text-xs text-gray-400 ml-1">«{ot.stereotype}»</span>
                    )}
                  </span>
                  <span className="text-gray-500">{ot.attrs}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Koppelklassen */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Koppelklassen (relatieobjecten)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th scope="col" className="text-left py-2 pr-4 font-semibold text-gray-700">Koppelklasse</th>
                <th scope="col" className="text-left py-2 pr-4 font-semibold text-gray-700">Relatie</th>
                <th scope="col" className="text-left py-2 font-semibold text-gray-700">Attributen</th>
              </tr>
            </thead>
            <tbody>
              {koppelklassen.map((kk) => (
                <tr key={kk.naam} className="border-b border-gray-50">
                  <td className="py-1.5 pr-4 font-mono text-gray-700">{kk.naam}</td>
                  <td className="py-1.5 pr-4 text-gray-500">{kk.tussen}</td>
                  <td className="py-1.5 text-gray-500">{kk.attrs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enumeraties */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Enumeraties (waardelijsten)</h2>
        <div className="space-y-2">
          {enumeraties.map((e) => (
            <div key={e.naam} className="flex items-start gap-2 text-sm">
              <span className="font-mono font-semibold text-gray-700 min-w-[140px]">{e.naam}</span>
              <span className="text-gray-500">{e.waarden}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Kerncijfers */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Kerncijfers</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: "Objecttypen", waarde: String(aantalObjecttypen) },
            { label: "Koppelklassen", waarde: String(aantalKoppelklassen) },
            { label: "Enumeraties", waarde: String(aantalEnumeraties) },
            { label: "Attributen", waarde: `~${aantalAttributen}` },
            { label: "Relaties", waarde: `~${aantalRelaties}` },
          ].map((k) => (
            <div key={k.label} className="text-center">
              <div className="text-2xl font-bold text-[#1a6ca8]">{k.waarde}</div>
              <div className="text-xs text-gray-500">{k.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
