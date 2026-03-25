"use client";

import { useState, useRef, useEffect } from "react";

type PakketversieOption = {
  id: string;
  label: string;
  pakketNaam: string;
  versieNaam: string;
  leverancierNaam: string;
  status: string | null;
};

type Props = {
  onSelect: (option: PakketversieOption) => void;
  searchAction: (query: string) => Promise<PakketversieOption[]>;
  placeholder?: string;
};

export default function PakketversieSearchSelect({ onSelect, searchAction, placeholder = "Zoek pakket of versie..." }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PakketversieOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchAction(query);
        setResults(data);
        setShowDropdown(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, searchAction]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#1a6ca8] focus:border-transparent"
        onFocus={() => results.length > 0 && setShowDropdown(true)}
      />
      {loading && (
        <div className="absolute right-3 top-2.5">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-[#1a6ca8] rounded-full animate-spin" />
        </div>
      )}

      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                onSelect(option);
                setQuery(option.label);
                setShowDropdown(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
            >
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {option.pakketNaam}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {option.versieNaam} · {option.leverancierNaam}
                {option.status && <span className="ml-2 text-gray-400">({option.status})</span>}
              </div>
            </button>
          ))}
        </div>
      )}

      {showDropdown && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3 text-sm text-gray-500">
          Geen resultaten gevonden
        </div>
      )}
    </div>
  );
}
