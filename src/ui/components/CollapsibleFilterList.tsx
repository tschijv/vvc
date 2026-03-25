"use client";

import { useState } from "react";
import Link from "next/link";

export default function CollapsibleFilterList({
  title,
  items,
  initialCount = 5,
  activeValue,
  baseHref,
  paramName,
}: {
  title: string;
  items: { label: string; count: number; value?: string }[];
  initialCount?: number;
  /** Currently selected filter value (single-select toggle) */
  activeValue?: string;
  /** Base URL to append ?paramName=value to (e.g. "/organisaties/abc?tab=koppelingen&buitenOrganisatie=ja") */
  baseHref?: string;
  /** Query param name for this filter (e.g. "standaard") */
  paramName?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded ? items : items.slice(0, initialCount);
  const hasMore = items.length > initialCount;
  const isClickable = baseHref && paramName;

  function buildHref(value: string): string {
    if (!baseHref || !paramName) return "#";
    const url = new URL(baseHref, "http://localhost");
    if (activeValue === value) {
      url.searchParams.delete(paramName);
    } else {
      url.searchParams.set(paramName, value);
    }
    return `${url.pathname}${url.search}`;
  }

  return (
    <div>
      <h3 className="font-bold text-sm mb-2">{title}</h3>
      <div className="space-y-1.5 text-sm">
        {visibleItems.map((item) => {
          const val = item.value ?? item.label;
          const isActive = activeValue === val;
          const content = (
            <>
              <input
                type="checkbox"
                readOnly
                checked={isActive}
                className="rounded border-gray-300"
              />
              <span className={isActive ? "text-gray-900 font-medium" : "text-gray-700"}>
                {item.label} ({item.count})
              </span>
            </>
          );

          if (isClickable) {
            return (
              <Link
                key={val}
                href={buildHref(val)}
                className="flex items-center gap-2 hover:underline"
              >
                {content}
              </Link>
            );
          }

          return (
            <label key={val} className="flex items-center gap-2">
              {content}
            </label>
          );
        })}
      </div>
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[#1a6ca8] hover:underline text-xs mt-2 font-medium"
        >
          {expanded
            ? "Minder tonen"
            : `Meer ${title.toLowerCase()} tonen (${items.length - initialCount})`}
        </button>
      )}
    </div>
  );
}
