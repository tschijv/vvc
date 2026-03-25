"use client";

import { useState, useRef, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function AuthButton() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  if (status === "loading") {
    return <span className="text-white/50 text-sm">...</span>;
  }

  if (!session?.user) {
    return (
      <Link href="/auth/login" className="text-white hover:text-white/80 text-sm">
        Inloggen
      </Link>
    );
  }

  const role = session.user.role as string;
  const isGemeente = role === "GEMEENTE";
  const isAdmin = role === "ADMIN";
  const isLeverancier = role === "LEVERANCIER";

  const menuItems: { label: string; href: string }[] = [];
  menuItems.push({ label: "Mijn profiel", href: "/profiel" });
  menuItems.push({ label: "Mijn favorieten", href: "/favorieten" });

  if (isGemeente || isAdmin) {
    menuItems.push({ label: "Mijn Voorzieningencatalogus", href: "/dashboard" });
    menuItems.push({ label: "Applicatielandschap", href: "/kaart" });
    menuItems.push({ label: "Alles van gemeenten en samenwerkingen", href: "/gemeenten" });
    menuItems.push({ label: "Alle koppelingen", href: "/koppelingen" });
    menuItems.push({ label: "Mijn gemeenten", href: "/dashboard" });
    menuItems.push({ label: "Alle gemeenten", href: "/gemeenten" });
    menuItems.push({ label: "Alle samenwerkingen", href: "/samenwerkingen" });
  }

  if (isLeverancier) {
    menuItems.push({ label: "Mijn pakketten", href: "/leveranciers" });
    menuItems.push({ label: "Alle gemeenten", href: "/gemeenten" });
  }

  if (isAdmin) {
    menuItems.push({ label: "Beheer", href: "/admin" });
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 cursor-pointer text-sm bg-transparent border-none"
      >
        <span className="text-white/90">Menu</span>
        <span className="text-xs text-white/60">▾</span>
        <a
          href="mailto:voorzieningencatalogus@vng.nl?subject=Voorzieningencatalogus%20-%20Vraag%20of%20melding"
          className="ml-1 text-white/80 hover:text-white transition-colors"
          title="Mail het beheerteam"
          aria-label="Mail het beheerteam"
          onClick={(e) => e.stopPropagation()}
        >
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </a>
      </button>

      {open && (
        <div className="absolute right-0 top-full bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 shadow-lg rounded-b min-w-[320px] border border-gray-200 dark:border-slate-600 z-50">
          <div className="px-4 py-3 bg-blue-50 border-b border-gray-200 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">{session.user.email}</span>
            <Link href="/profiel" className="text-gray-400 hover:text-gray-600 transition-colors" title="Mijn profiel" aria-label="Mijn profiel" onClick={() => setOpen(false)}>
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
          </div>
          {menuItems.map((item) => (
            <Link key={item.label} href={item.href} className="block px-4 py-2.5 hover:bg-gray-100 text-sm border-b border-gray-100 last:border-0" onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <button onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }} className="w-full text-left px-4 py-2.5 hover:bg-gray-100 text-sm text-gray-700 border-t border-gray-200">
            Uitloggen
          </button>
        </div>
      )}
    </div>
  );
}
