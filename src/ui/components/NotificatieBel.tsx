"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Notificatie {
  id: string;
  titel: string;
  bericht: string;
  type: string;
  gelezen: boolean;
  link: string | null;
  createdAt: string;
}

const TYPE_COLORS: Record<string, string> = {
  info: "bg-blue-100 text-blue-700",
  warning: "bg-yellow-100 text-yellow-700",
  error: "bg-red-100 text-red-700",
  success: "bg-green-100 text-green-700",
};

const TYPE_ICONS: Record<string, string> = {
  info: "i",
  warning: "!",
  error: "x",
  success: "\u2713",
};

export default function NotificatieBel() {
  const { data: session } = useSession();
  const [notificaties, setNotificaties] = useState<Notificatie[]>([]);
  const [ongelezen, setOngelezen] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/notificaties")
      .then((r) => r.json())
      .then((data) => {
        setNotificaties(data.notificaties || []);
        setOngelezen(data.ongelezen || 0);
      })
      .catch(() => {});
  }, [session]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!session?.user) return null;

  async function markAsRead(id: string) {
    await fetch(`/api/notificaties/${id}`, { method: "PUT" });
    setNotificaties((prev) =>
      prev.map((n) => (n.id === id ? { ...n, gelezen: true } : n))
    );
    setOngelezen((prev) => Math.max(0, prev - 1));
  }

  async function markAllRead() {
    await fetch("/api/notificaties/mark-all-read", { method: "POST" });
    setNotificaties((prev) => prev.map((n) => ({ ...n, gelezen: true })));
    setOngelezen(0);
  }

  const recent = notificaties.slice(0, 5);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-1 text-white/80 hover:text-white"
        aria-label={`Notificaties${ongelezen > 0 ? ` (${ongelezen} ongelezen)` : ""}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {ongelezen > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
            {ongelezen > 9 ? "9+" : ongelezen}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 shadow-lg rounded min-w-[320px] border border-gray-200 dark:border-slate-600 z-50">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-slate-600 flex items-center justify-between">
            <span className="text-sm font-semibold">Notificaties</span>
            {ongelezen > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-blue-600 hover:underline"
              >
                Alles gelezen
              </button>
            )}
          </div>

          {recent.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              Geen notificaties
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {recent.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-gray-100 dark:border-slate-700 last:border-0 text-sm ${
                    !n.gelezen ? "bg-blue-50 dark:bg-slate-750" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold shrink-0 mt-0.5 ${
                        TYPE_COLORS[n.type] || TYPE_COLORS.info
                      }`}
                    >
                      {TYPE_ICONS[n.type] || TYPE_ICONS.info}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 dark:text-slate-200">
                        {n.link ? (
                          <Link
                            href={n.link}
                            onClick={() => {
                              if (!n.gelezen) markAsRead(n.id);
                              setOpen(false);
                            }}
                            className="hover:underline"
                          >
                            {n.titel}
                          </Link>
                        ) : (
                          n.titel
                        )}
                      </div>
                      <div className="text-gray-500 dark:text-slate-400 text-xs mt-0.5 line-clamp-2">
                        {n.bericht}
                      </div>
                      <div className="text-gray-400 dark:text-slate-500 text-xs mt-1">
                        {new Date(n.createdAt).toLocaleDateString("nl-NL", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    {!n.gelezen && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        className="text-xs text-blue-500 hover:text-blue-700 shrink-0"
                        title="Markeer als gelezen"
                      >
                        <span className="w-2 h-2 bg-blue-500 rounded-full inline-block" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="px-4 py-2 border-t border-gray-200 dark:border-slate-600 text-center">
            <Link
              href="/notificaties"
              onClick={() => setOpen(false)}
              className="text-xs text-blue-600 hover:underline"
            >
              Alle notificaties bekijken
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
