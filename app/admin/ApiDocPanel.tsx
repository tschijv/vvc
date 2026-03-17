"use client";

import Link from "next/link";

export default function ApiDocPanel() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-4 min-w-0">
          <span className="font-semibold text-gray-800 whitespace-nowrap">Externe API (v1)</span>
          <span className="text-sm text-gray-500 truncate hidden sm:inline">REST API voor integratie met externe systemen</span>
          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">
            Actief
          </span>
        </div>
        <div className="flex items-center gap-3 ml-4">
          <Link
            href="/api/v1/docs"
            className="text-sm text-[#1a6ca8] hover:underline font-medium whitespace-nowrap"
          >
            Documentatie →
          </Link>
        </div>
      </div>
    </div>
  );
}
