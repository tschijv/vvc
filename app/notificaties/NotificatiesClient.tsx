"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  info: "bg-blue-100 text-blue-700 border-blue-200",
  warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
  error: "bg-red-100 text-red-700 border-red-200",
  success: "bg-green-100 text-green-700 border-green-200",
};

const TYPE_LABELS: Record<string, string> = {
  info: "Info",
  warning: "Waarschuwing",
  error: "Fout",
  success: "Succes",
};

export default function NotificatiesClient({
  initialNotificaties,
  initialOngelezen,
  currentFilter,
}: {
  initialNotificaties: Notificatie[];
  initialOngelezen: number;
  currentFilter: string;
}) {
  const router = useRouter();
  const [notificaties, setNotificaties] = useState(initialNotificaties);
  const [ongelezen, setOngelezen] = useState(initialOngelezen);

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

  const filters = [
    { key: "alle", label: "Alle" },
    { key: "ongelezen", label: `Ongelezen (${ongelezen})` },
    { key: "gelezen", label: "Gelezen" },
  ];

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex gap-1">
          {filters.map((f) => (
            <Link
              key={f.key}
              href={`/notificaties${f.key !== "alle" ? `?filter=${f.key}` : ""}`}
              className={`px-3 py-1.5 text-sm rounded border ${
                currentFilter === f.key
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
        {ongelezen > 0 && (
          <button
            onClick={async () => {
              await markAllRead();
              router.refresh();
            }}
            className="ml-auto text-sm text-blue-600 hover:underline"
          >
            Alles als gelezen markeren
          </button>
        )}
      </div>

      {/* Notification list */}
      {notificaties.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto mb-3 opacity-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <p>Geen notificaties gevonden</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notificaties.map((n) => (
            <div
              key={n.id}
              className={`border rounded p-4 ${
                !n.gelezen
                  ? "bg-blue-50 dark:bg-slate-800 border-blue-200 dark:border-blue-800"
                  : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 mt-0.5 ${
                    TYPE_COLORS[n.type] || TYPE_COLORS.info
                  }`}
                >
                  {TYPE_LABELS[n.type] || n.type}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800 dark:text-slate-200">
                    {n.link ? (
                      <Link href={n.link} className="hover:underline text-blue-700">
                        {n.titel}
                      </Link>
                    ) : (
                      n.titel
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                    {n.bericht}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-slate-500 mt-2">
                    {new Date(n.createdAt).toLocaleDateString("nl-NL", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                {!n.gelezen && (
                  <button
                    onClick={() => markAsRead(n.id)}
                    className="text-xs text-blue-600 hover:underline shrink-0"
                  >
                    Gelezen
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
