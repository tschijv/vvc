import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import Providers from "@/components/Providers";
import AuthButton from "@/components/AuthButton";
import GlossaryProvider from "@/components/GlossaryProvider";
import MobileNav from "@/components/MobileNav";
import ThemeToggle from "@/components/ThemeToggle";
import { menuItems } from "@/lib/menu-items";
import ImpersonationBanner from "@/components/ImpersonationBanner";

export const metadata: Metadata = {
  title: {
    default: "VNG Voorzieningencatalogus",
    template: "%s — VNG Voorzieningencatalogus",
  },
  description: "De voorzieningencatalogus voor gemeenten — overzicht van pakketten, leveranciers, standaarden en referentiecomponenten.",
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: "VNG Voorzieningencatalogus",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, type: "image/svg+xml" }],
  },
  twitter: {
    card: "summary_large_image",
  },
};

// Inline script to prevent flash of wrong theme
const themeScript = `(function(){try{var d=document.documentElement;var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches))d.classList.add('dark')}catch(e){}})()`;

const matomoUrl = process.env.MATOMO_URL;
const matomoSiteId = process.env.MATOMO_SITE_ID;
const matomoScript = matomoUrl && matomoSiteId
  ? `var _paq=window._paq=window._paq||[];_paq.push(["trackPageView"]);_paq.push(["enableLinkTracking"]);(function(){var u="${matomoUrl}";_paq.push(["setTrackerUrl",u+"matomo.php"]);_paq.push(["setSiteId","${matomoSiteId}"]);var d=document,g=d.createElement("script"),s=d.getElementsByTagName("script")[0];g.async=true;g.src=u+"matomo.js";s.parentNode.insertBefore(g,s)})();`
  : null;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {matomoScript && (
          <script dangerouslySetInnerHTML={{ __html: matomoScript }} />
        )}
      </head>
      <body className="antialiased bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 min-h-screen transition-colors">
        <Providers>
        <GlossaryProvider>
        {/* Skip link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-[#1a6ca8] focus:text-white focus:px-4 focus:py-2 focus:rounded focus:text-sm focus:font-medium"
        >
          Ga naar inhoud
        </a>

        <ImpersonationBanner />

        {/* Top bar */}
        <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 py-3 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="text-lg sm:text-2xl font-light text-gray-800 dark:text-slate-200 tracking-wide flex items-center gap-2">
              <Image src="/logo.svg" alt="" width={28} height={28} className="inline-block" />
              <span className="hidden sm:inline">VNG Voorzieningencatalogus</span>
              <span className="sm:hidden">VNG VC</span>
            </Link>
            <span className="text-sm text-gray-500 dark:text-slate-400 hidden sm:inline">websites VNG Realisatie ▾</span>
          </div>
        </div>

        {/* Blue nav bar with dropdowns */}
        <nav aria-label="Hoofdnavigatie" className="bg-[#1a6ca8] dark:bg-[#0f4c75] text-white text-sm relative z-50">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-0">
            {/* Mobile hamburger */}
            <MobileNav />

            {/* Desktop menu */}
            {menuItems.map((menu) => (
              <div key={menu.label} className="relative group hidden md:block">
                <span className="px-4 py-3 hover:bg-[#155a8c] dark:hover:bg-[#0a3a5c] cursor-pointer flex items-center gap-1 whitespace-nowrap">
                  {menu.label}
                  <span className="text-xs opacity-70">▾</span>
                </span>
                <div className="absolute left-0 top-full hidden group-hover:block bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 shadow-lg rounded-b min-w-[240px] border border-gray-200 dark:border-slate-600 z-50">
                  {menu.items.map((item) => (
                    <Link
                      key={item.href + item.label}
                      href={item.href}
                      className="block px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-slate-700 text-sm border-b border-gray-100 dark:border-slate-700 last:border-0"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <Link
              href="/info/gebruikersonderzoeken"
              className="px-4 py-3 hover:bg-[#155a8c] dark:hover:bg-[#0a3a5c] cursor-pointer whitespace-nowrap hidden md:block"
            >
              Gebruikersonderzoeken
            </Link>
            <div className="ml-auto flex items-center gap-1 px-4 py-3">
              <ThemeToggle />
              <AuthButton />
            </div>
          </div>
        </nav>

        <main id="main-content" className="max-w-7xl mx-auto px-4 py-6">{children}</main>

        {/* Footer */}
        <footer aria-label="Footer" className="bg-[#1a6ca8] dark:bg-[#0f4c75] text-white mt-16 py-8">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 text-sm">
            <div className="space-y-2">
              <a href="#" className="block hover:underline opacity-90">Onderwerpen VNG</a>
              <a href="#" className="block hover:underline opacity-90">Privacyverklaring</a>
              <a href="#" className="block hover:underline opacity-90">Over VNG Realisatie</a>
              <a href="#" className="block hover:underline opacity-90">Vacatures</a>
            </div>
            <div className="space-y-2">
              <a href="#" className="block hover:underline opacity-90">Agenda VNG</a>
              <a href="#" className="block hover:underline opacity-90">Nieuws</a>
              <a href="#" className="block hover:underline opacity-90">Contact</a>
              <a href="#" className="block hover:underline opacity-90">Meld aan VNG Realisatie</a>
            </div>
            <div className="space-y-2">
              <a href="#" className="block hover:underline opacity-90">Twitter</a>
              <a href="#" className="block hover:underline opacity-90">Linkedin</a>
              <a href="#" className="block hover:underline opacity-90">Youtube</a>
              <a href="#" className="block hover:underline opacity-90">Nieuwsbrief GEMMA</a>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 mt-6 pt-4 border-t border-white/20 text-xs opacity-70">
            Colofon · Proclaimer · Toegankelijkheid · VNG Realisatie © 2026
          </div>
        </footer>
        </GlossaryProvider>
        </Providers>
      </body>
    </html>
  );
}
