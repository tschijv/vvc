import Link from "next/link";
import type { SuggestieData } from "./types";

// ─── Suggesties tab ──────────────────────────────────────────────────────────

export default function SuggestiesTab({ suggesties }: { suggesties: SuggestieData }) {
  return (
    <div>
      {/* Voortgang verbeteren uitleg */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-bold text-[#1a6ca8] mb-3">Voortgang verbeteren</h2>
        <p className="text-sm text-gray-600 mb-4">
          De sterren geven de volledigheid van de ingevulde gegevens aan. Hoe meer gegevens uw organisatie invult, hoe hoger de voortgang.
        </p>

        <div className="space-y-2 mb-5">
          <div className="flex items-start gap-3 text-sm">
            <span className="text-gray-300 flex-shrink-0 mt-0.5">{"\u2606\u2606\u2606\u2606\u2606"}</span>
            <span className="text-gray-600">Account aangemaakt, maar nog geen pakketten ingevoerd</span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <span className="text-[#e35b10] flex-shrink-0 mt-0.5">{"\u2605"}<span className="text-gray-300">{"\u2606\u2606\u2606\u2606"}</span></span>
            <span className="text-gray-600">1 &ndash; 40 referentiecomponenten gevuld</span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <span className="text-[#e35b10] flex-shrink-0 mt-0.5">{"\u2605\u2605"}<span className="text-gray-300">{"\u2606\u2606\u2606"}</span></span>
            <span className="text-gray-600">41 of meer referentiecomponenten gevuld</span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <span className="text-[#e35b10] flex-shrink-0 mt-0.5">{"\u2605\u2605\u2605"}<span className="text-gray-300">{"\u2606\u2606"}</span></span>
            <span className="text-gray-600">Minimaal 10 pakketversies met status &quot;Gepland&quot; of &quot;Uit te faseren&quot;</span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <span className="text-[#e35b10] flex-shrink-0 mt-0.5">{"\u2605\u2605\u2605\u2605"}<span className="text-gray-300">{"\u2606"}</span></span>
            <span className="text-gray-600">10 of meer koppelingen aangegeven</span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <span className="text-[#e35b10] flex-shrink-0 mt-0.5">{"\u2605\u2605\u2605\u2605\u2605"}</span>
            <span className="text-gray-600">Datum laatste wijziging is recenter dan 3 maanden geleden</span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Totaalindicatie</h3>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400 flex-shrink-0" />
              <span className="text-gray-600">0&ndash;1 ster: <strong className="text-gray-800">Startfase</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-400 flex-shrink-0" />
              <span className="text-gray-600">2&ndash;3 sterren: <strong className="text-gray-800">In ontwikkeling</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
              <span className="text-gray-600">4&ndash;5 sterren: <strong className="text-gray-800">Vrij compleet</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Suggesties nieuwe pakketten */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-[#1a6ca8] mb-3">Suggesties nieuwe pakketten</h2>
        {suggesties.nieuwePakketten.length > 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th scope="col" className="text-left px-4 py-2.5 font-semibold text-gray-700">Leverancier</th>
                  <th scope="col" className="text-left px-4 py-2.5 font-semibold text-gray-700">Pakketversie</th>
                  <th scope="col" className="text-left px-4 py-2.5 font-semibold text-gray-700">Datum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {suggesties.nieuwePakketten.map((s, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-[#1a6ca8]">{s.leverancier}</td>
                    <td className="px-4 py-2.5">
                      <Link href={`/pakketten/${s.pakketSlug}`} className="text-[#1a6ca8] hover:underline">
                        {s.pakketversie}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-gray-500">{s.datum}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Er zijn geen suggesties voor nieuwe pakketten.</p>
        )}
      </div>

      {/* Suggesties nieuwe pakketversies */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-[#1a6ca8] mb-3">Suggesties nieuwe pakketversies</h2>
        {suggesties.nieuweVersies.length > 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th scope="col" className="text-left px-4 py-2.5 font-semibold text-gray-700">Leverancier</th>
                  <th scope="col" className="text-left px-4 py-2.5 font-semibold text-gray-700">Pakket</th>
                  <th scope="col" className="text-left px-4 py-2.5 font-semibold text-gray-700">Huidige versie</th>
                  <th scope="col" className="text-left px-4 py-2.5 font-semibold text-gray-700">Beschikbare versie</th>
                  <th scope="col" className="text-left px-4 py-2.5 font-semibold text-gray-700">Datum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {suggesties.nieuweVersies.map((s, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-[#1a6ca8]">{s.leverancier}</td>
                    <td className="px-4 py-2.5">
                      <Link href={`/pakketten/${s.pakketSlug}`} className="text-[#1a6ca8] hover:underline">
                        {s.pakketNaam}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-gray-500">{s.huidigeVersie}</td>
                    <td className="px-4 py-2.5 font-medium text-green-700">{s.nieuweVersie}</td>
                    <td className="px-4 py-2.5 text-gray-500">{s.datum}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Er zijn nog geen nieuwe suggesties aangemaakt.</p>
        )}
      </div>

      {/* Gesuggereerde koppelingen met buitengemeentelijke voorzieningen */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-[#1a6ca8] mb-3">Gesuggereerde koppelingen met buitengemeentelijke voorzieningen</h2>
        {suggesties.buitenOrganisatieKoppelingen.length > 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th scope="col" className="text-left px-4 py-2.5 font-semibold text-gray-700">Buitengemeentelijke voorziening</th>
                  <th scope="col" className="text-left px-4 py-2.5 font-semibold text-gray-700">Standaard</th>
                  <th scope="col" className="text-left px-4 py-2.5 font-semibold text-gray-700">Transportprotocol</th>
                  <th scope="col" className="text-left px-4 py-2.5 font-semibold text-gray-700">Datum van inzending</th>
                  <th scope="col" className="text-left px-4 py-2.5 font-semibold text-gray-700">Bron</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {suggesties.buitenOrganisatieKoppelingen.map((s, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5">{s.voorziening}</td>
                    <td className="px-4 py-2.5">{s.standaard}</td>
                    <td className="px-4 py-2.5">{s.transportprotocol}</td>
                    <td className="px-4 py-2.5 text-gray-500">{s.datum}</td>
                    <td className="px-4 py-2.5">{s.bron}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Er zijn geen gesuggereerde buitengemeentelijke koppelingen.</p>
        )}
      </div>
    </div>
  );
}
