"use client";

import { useState } from "react";
import Link from "next/link";
import { menuItems } from "@/ui/menu-items";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const toggleGroup = (label: string) => {
    setExpandedGroup(expandedGroup === label ? null : label);
  };

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden p-2 text-white"
        aria-label="Menu openen"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />

          {/* Slide-out panel */}
          <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-[320px] bg-white overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between bg-[#1a6ca8] text-white px-4 py-3">
              <span className="font-semibold text-sm">Menu</span>
              <button onClick={() => setOpen(false)} aria-label="Menu sluiten">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Menu groups */}
            <nav className="py-2">
              {menuItems.map((group) => (
                <div key={group.label} className="border-b border-gray-100">
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                  >
                    {group.label}
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        expandedGroup === group.label ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedGroup === group.label && (
                    <div className="bg-gray-50 pb-2">
                      {group.items.map((item) => (
                        <Link
                          key={item.href + item.label}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className="block px-6 py-2 text-sm text-gray-700 hover:text-[#1a6ca8] hover:bg-gray-100"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Gebruikersonderzoeken (standalone link) */}
              <Link
                href="/info/gebruikersonderzoeken"
                onClick={() => setOpen(false)}
                className="block px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 border-b border-gray-100"
              >
                Gebruikersonderzoeken
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
