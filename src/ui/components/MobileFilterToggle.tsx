"use client";

import { useState } from "react";

interface MobileFilterToggleProps {
  children: React.ReactNode;
  label?: string;
}

export default function MobileFilterToggle({ children, label = "Filters" }: MobileFilterToggleProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden flex items-center gap-2 text-sm font-medium text-[#1a6ca8] border border-[#1a6ca8] rounded px-3 py-2 mb-4 hover:bg-blue-50"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        {label}
        {open && (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </button>
      {/* Mobile: collapsible filter panel */}
      {open && <div className="md:hidden mb-4">{children}</div>}
      {/* Desktop: always visible sidebar */}
    </>
  );
}
