"use client";

import { useState } from "react";
import { getAIAdvies } from "./actions";

const SUGGESTIES = [
  "Welke pakketten naderen einde ondersteuning?",
  "Hoe verhoudt ons portfolio zich tot de GEMMA-standaarden?",
  "Welke standaarden missen we?",
  "Geef advies voor pakketvervanging of consolidatie.",
];

export default function AIAdviseur({
  gemeenteId,
  gemeenteNaam,
}: {
  gemeenteId: string;
  gemeenteNaam: string;
}) {
  const [vraag, setVraag] = useState("");
  const [antwoord, setAntwoord] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(tekst?: string) {
    const q = tekst || vraag;
    if (!q.trim() || loading) return;

    setLoading(true);
    setError("");
    setAntwoord("");

    try {
      const result = await getAIAdvies(gemeenteId, q);
      setAntwoord(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Er ging iets mis");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-5">
      <div className="flex items-center gap-2 mb-3">
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#1a6ca8]" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
        </svg>
        <h2 className="text-lg font-semibold text-gray-800">
          AI-adviseur
        </h2>
        <span className="text-xs text-gray-400 ml-auto">voor {gemeenteNaam}</span>
      </div>

      {/* Voorgestelde vragen */}
      {!antwoord && !loading && (
        <div className="flex flex-wrap gap-2 mb-4">
          {SUGGESTIES.map((s) => (
            <button
              key={s}
              onClick={() => {
                setVraag(s);
                handleSubmit(s);
              }}
              className="text-xs bg-white border border-blue-200 text-[#1a6ca8] px-3 py-1.5 rounded-full hover:bg-blue-50 hover:border-[#1a6ca8] transition"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Invoerveld */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={vraag}
          onChange={(e) => setVraag(e.target.value)}
          placeholder="Stel een vraag over het applicatieportfolio..."
          className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a6ca8] focus:ring-1 focus:ring-[#1a6ca8] dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !vraag.trim()}
          className="bg-[#1a6ca8] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#15587f] disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1.5"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Denken...
            </>
          ) : (
            "Vraag"
          )}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Antwoord */}
      {antwoord && (
        <div className="mt-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200">
            {antwoord}
          </div>
          <button
            onClick={() => {
              setAntwoord("");
              setVraag("");
            }}
            className="mt-2 text-xs text-gray-400 hover:text-gray-600 transition"
          >
            Nieuw advies vragen
          </button>
        </div>
      )}
    </div>
  );
}
