"use client";

import { useState, useRef, useEffect } from "react";

export default function DeployPanel() {
  const [deploying, setDeploying] = useState(false);
  const [lines, setLines] = useState<{ type: string; text: string }[]>([]);
  const [done, setDone] = useState<{ success: boolean; url?: string } | null>(null);
  const [showTerminal, setShowTerminal] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  async function handleDeploy() {
    if (deploying) return;
    if (!confirm("Weet je zeker dat je naar productie wilt deployen?")) return;

    setDeploying(true);
    setDone(null);
    setLines([]);
    setShowTerminal(true);

    try {
      const res = await fetch("/api/admin/deploy", { method: "POST" });

      if (!res.ok || !res.body) {
        setDone({ success: false });
        setLines((l) => [...l, { type: "error", text: "Fout bij starten deployment" }]);
        setDeploying(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let allOutput = "";

      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const event of events) {
          const match = event.match(/^data: (.+)$/m);
          if (!match) continue;

          try {
            const { type, data } = JSON.parse(match[1]);

            if (type === "stdout" || type === "stderr") {
              allOutput += data;
              // Split op newlines voor nette weergave
              const newLines = data.split("\n").filter((l: string) => l.trim());
              setLines((prev) => [
                ...prev,
                ...newLines.map((text: string) => ({ type, text })),
              ]);
            } else if (type === "done") {
              const exitCode = parseInt(data);
              const urlMatch = allOutput.match(
                /https:\/\/[^\s]+\.vercel\.app[^\s]*/
              );
              setDone({
                success: exitCode === 0,
                url: urlMatch?.[0],
              });
            } else if (type === "error") {
              setLines((prev) => [...prev, { type: "error", text: data }]);
              setDone({ success: false });
            }
          } catch {
            // ignore parse errors
          }
        }
      }
    } catch {
      setDone({ success: false });
      setLines((l) => [...l, { type: "error", text: "Netwerk fout bij deployment" }]);
    } finally {
      setDeploying(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">Deploy naar productie</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Deploy de huidige code naar Vercel productie
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lines.length > 0 && !deploying && (
            <button
              onClick={() => setShowTerminal((v) => !v)}
              className="px-3 py-2 rounded-md text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              {showTerminal ? "Verberg log" : "Toon log"}
            </button>
          )}
          <button
            onClick={handleDeploy}
            disabled={deploying}
            className={`px-4 py-2 rounded-md text-sm font-medium text-white transition-colors ${
              deploying
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#1a6ca8] hover:bg-[#15567f]"
            }`}
          >
            {deploying ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Deploying…
              </span>
            ) : (
              "🚀 Deploy"
            )}
          </button>
        </div>
      </div>

      {/* Status banner */}
      {done && (
        <div
          className={`mb-3 p-3 rounded-md text-sm ${
            done.success
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          {done.success ? (
            <div className="flex items-center justify-between">
              <p className="text-green-800 font-medium">✅ Deployment geslaagd!</p>
              {done.url && (
                <a
                  href={done.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-700 underline text-xs"
                >
                  {done.url}
                </a>
              )}
            </div>
          ) : (
            <p className="text-red-800 font-medium">❌ Deployment mislukt</p>
          )}
        </div>
      )}

      {/* Live terminal */}
      {showTerminal && lines.length > 0 && (
        <div
          ref={terminalRef}
          className="bg-gray-900 rounded-lg p-4 font-mono text-xs max-h-80 overflow-y-auto"
        >
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-700">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-400 text-[10px] ml-2">
              npx vercel --prod --yes
            </span>
            {deploying && (
              <span className="ml-auto flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-[10px]">live</span>
              </span>
            )}
          </div>
          {lines.map((line, i) => (
            <div
              key={i}
              className={`leading-5 ${
                line.type === "error"
                  ? "text-red-400"
                  : line.type === "stderr"
                  ? "text-yellow-300"
                  : "text-green-300"
              }`}
            >
              <span className="text-gray-600 select-none mr-2">
                {String(i + 1).padStart(3)}
              </span>
              {line.text}
            </div>
          ))}
          {deploying && (
            <div className="text-gray-500 animate-pulse mt-1">▌</div>
          )}
        </div>
      )}
    </div>
  );
}
