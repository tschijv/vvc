"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isEditing =
        tag === "input" || tag === "textarea" || tag === "select" ||
        (e.target as HTMLElement)?.isContentEditable;

      if (e.key === "/" && !isEditing) {
        e.preventDefault();
        router.push("/zoeken");
        // Focus the search input after navigation
        setTimeout(() => {
          const input = document.querySelector<HTMLInputElement>(
            'input[name="q"]'
          );
          input?.focus();
        }, 300);
      }

      if (e.key === "Escape") {
        (document.activeElement as HTMLElement)?.blur();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return null;
}
