"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Props {
  entityType: "pakket" | "organisatie" | "leverancier";
  entityId: string;
}

export default function FavorietButton({ entityType, entityId }: Props) {
  const { data: session } = useSession();
  const [isFavoriet, setIsFavoriet] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/favorieten")
      .then((r) => r.json())
      .then((data) => {
        const found = data.favorieten?.some(
          (f: { entityType: string; entityId: string }) =>
            f.entityType === entityType && f.entityId === entityId
        );
        setIsFavoriet(!!found);
      })
      .catch((err) => console.error("Failed to fetch favorieten:", err));
  }, [session, entityType, entityId]);

  if (!session?.user) return null;

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/favorieten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType, entityId }),
      });
      const data = await res.json();
      setIsFavoriet(data.favoriet);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="inline-flex items-center gap-1 text-sm transition-colors print:hidden"
      title={isFavoriet ? "Verwijder uit favorieten" : "Toevoegen aan favorieten"}
      aria-label={isFavoriet ? "Verwijder uit favorieten" : "Toevoegen aan favorieten"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={isFavoriet ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={isFavoriet ? 0 : 1.5}
        className={`w-5 h-5 transition-colors ${
          isFavoriet ? "text-red-500" : "text-gray-400 hover:text-red-400"
        } ${loading ? "opacity-50" : ""}`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}
