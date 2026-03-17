"use client";

import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      className="text-sm bg-[#1a6ca8] text-white px-3 py-1.5 rounded hover:bg-[#15587f] transition"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? "✓ Gekopieerd!" : "Kopieer prompt"}
    </button>
  );
}
