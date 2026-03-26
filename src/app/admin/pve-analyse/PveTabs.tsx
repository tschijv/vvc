"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import type { PveTab } from "./pve-data";

interface TabDef {
  key: PveTab;
  label: string;
  count?: number;
}

interface PveTabsProps {
  tabs: TabDef[];
  children: Record<PveTab, ReactNode>;
}

export default function PveTabs({ tabs, children }: PveTabsProps) {
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get("tab") as PveTab) || "samenvatting";

  return (
    <>
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/admin/pve-analyse?tab=${t.key}`}
            scroll={false}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
              activeTab === t.key
                ? "border-[#1a6ca8] text-[#1a6ca8]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span
                className={`ml-1.5 text-xs px-1.5 py-0.5 rounded ${
                  activeTab === t.key
                    ? "bg-[#1a6ca8] text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {t.count}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Tab content */}
      {children[activeTab]}
    </>
  );
}
