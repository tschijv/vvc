"use client";

import { useState, useCallback } from "react";
import Modal from "@/ui/components/Modal";

type ReviewFormProps = {
  pakketId: string;
  /** Existing review data for editing, if any */
  existing?: {
    id: string;
    score: number;
    gebruiksgemak: number | null;
    ondersteuning: number | null;
    prijsKwaliteit: number | null;
    standaardenSupport: number | null;
    toelichting: string | null;
    anoniem: boolean;
  } | null;
  /** Label shown on the trigger button */
  buttonLabel?: string;
};

function ClickableStars({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 dark:text-gray-400 w-32 shrink-0">{label}</span>
      <div className="flex gap-0.5" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="p-0.5 focus:outline-none focus:ring-2 focus:ring-[#1a6ca8] rounded"
            aria-label={`${star} ${star === 1 ? "ster" : "sterren"}`}
            role="radio"
            aria-checked={star === value}
          >
            <svg
              className={`w-6 h-6 transition-colors ${
                star <= (hover || value)
                  ? "text-[#e35b10]"
                  : "text-gray-300 dark:text-gray-600"
              }`}
              fill={star <= (hover || value) ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Client component: modal form for creating or editing a pakket review.
 * Uses fetch to POST to /api/reviews.
 */
export default function ReviewForm({
  pakketId,
  existing,
  buttonLabel,
}: ReviewFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [score, setScore] = useState(existing?.score ?? 0);
  const [gebruiksgemak, setGebruiksgemak] = useState(existing?.gebruiksgemak ?? 0);
  const [ondersteuning, setOndersteuning] = useState(existing?.ondersteuning ?? 0);
  const [prijsKwaliteit, setPrijsKwaliteit] = useState(existing?.prijsKwaliteit ?? 0);
  const [standaardenSupport, setStandaardenSupport] = useState(existing?.standaardenSupport ?? 0);
  const [toelichting, setToelichting] = useState(existing?.toelichting ?? "");
  const [anoniem, setAnoniem] = useState(existing?.anoniem ?? false);

  const label = buttonLabel ?? (existing ? "Review bewerken" : "Beoordeel dit pakket");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (score === 0) {
        setError("Geef een score van 1 tot 5.");
        return;
      }
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pakketId,
            score,
            gebruiksgemak: gebruiksgemak || null,
            ondersteuning: ondersteuning || null,
            prijsKwaliteit: prijsKwaliteit || null,
            standaardenSupport: standaardenSupport || null,
            toelichting: toelichting || null,
            anoniem,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: "Onbekende fout" }));
          setError(data.error || "Er ging iets mis.");
          return;
        }

        setIsOpen(false);
        // Refresh the page to show updated reviews
        window.location.reload();
      } catch {
        setError("Netwerkfout. Probeer het opnieuw.");
      } finally {
        setLoading(false);
      }
    },
    [pakketId, score, gebruiksgemak, ondersteuning, prijsKwaliteit, standaardenSupport, toelichting, anoniem]
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`px-4 py-2 text-sm rounded font-medium transition-colors ${
          existing
            ? "border border-[#1a6ca8] text-[#1a6ca8] hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20"
            : "bg-[#e35b10] text-white hover:bg-[#c44b0a]"
        }`}
      >
        {label}
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={existing ? "Review bewerken" : "Pakket beoordelen"} size="md">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Totaalscore *
            </p>
            <ClickableStars value={score} onChange={setScore} label="Score" />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Deelscores (optioneel)
            </p>
            <ClickableStars value={gebruiksgemak} onChange={setGebruiksgemak} label="Gebruiksgemak" />
            <ClickableStars value={ondersteuning} onChange={setOndersteuning} label="Ondersteuning" />
            <ClickableStars value={prijsKwaliteit} onChange={setPrijsKwaliteit} label="Prijs/kwaliteit" />
            <ClickableStars value={standaardenSupport} onChange={setStandaardenSupport} label="Standaarden" />
          </div>

          <div>
            <label htmlFor="review-toelichting" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Toelichting (optioneel)
            </label>
            <textarea
              id="review-toelichting"
              rows={3}
              maxLength={2000}
              value={toelichting}
              onChange={(e) => setToelichting(e.target.value)}
              placeholder="Licht uw ervaring met dit pakket toe..."
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#1a6ca8] focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1">{toelichting.length}/2000</p>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={anoniem}
              onChange={(e) => setAnoniem(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            Anoniem plaatsen (naam organisatie wordt niet getoond)
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={loading || score === 0}
              className="px-4 py-2 text-sm bg-[#1a6ca8] text-white rounded hover:bg-[#155a8a] disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? "Opslaan..." : "Opslaan"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
