"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

/**
 * Compact organisation switcher for the header bar.
 * Only visible when the user belongs to 2+ organisaties.
 */
export default function OrganisatieSwitcher() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const organisaties = session?.user?.organisaties;
  if (!organisaties || organisaties.length < 2) return null;

  const activeOrgId = session?.user?.organisatieId;
  const activeOrg = organisaties.find((o) => o.organisatieId === activeOrgId);
  const activeNaam = activeOrg?.organisatie.naam || "Selecteer organisatie";

  async function handleSwitch(organisatieId: string) {
    if (organisatieId === activeOrgId || switching) return;
    setSwitching(true);
    try {
      const res = await fetch("/api/organisatie/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organisatieId }),
      });
      if (res.ok) {
        // Trigger NextAuth session update to refresh the JWT
        await update();
        setOpen(false);
        router.refresh();
      }
    } catch {
      // Silent fail - user can try again
    } finally {
      setSwitching(false);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        disabled={switching}
        className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-200 border border-[#1a6ca8] dark:border-slate-500 rounded hover:bg-blue-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 max-w-[180px]"
        title="Wissel van organisatie"
        aria-label="Wissel van organisatie"
        aria-expanded={open}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3.5 w-3.5 text-[#1a6ca8] dark:text-blue-300 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        <span className="truncate">{activeNaam}</span>
        <span className="text-[10px] opacity-60 shrink-0">&#9662;</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 shadow-lg rounded border border-gray-200 dark:border-slate-600 min-w-[220px] z-50">
          <div className="px-3 py-2 text-xs text-gray-500 dark:text-slate-400 border-b border-gray-100 dark:border-slate-700 font-medium">
            Mijn organisaties
          </div>
          {organisaties.map((uo) => {
            const isActive = uo.organisatieId === activeOrgId;
            return (
              <button
                key={uo.organisatieId}
                onClick={() => handleSwitch(uo.organisatieId)}
                disabled={isActive || switching}
                className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between gap-2 transition-colors ${
                  isActive
                    ? "bg-blue-50 dark:bg-slate-700 text-[#1a6ca8] dark:text-blue-300 font-medium"
                    : "hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300"
                } ${switching ? "opacity-50" : ""}`}
              >
                <span className="truncate">{uo.organisatie.naam}</span>
                <span className="text-[10px] text-gray-400 dark:text-slate-500 shrink-0 uppercase">
                  {uo.rol === "BEHEERDER" ? "Beheerder" : "Raadpleger"}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
