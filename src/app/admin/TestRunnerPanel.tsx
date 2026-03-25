"use client";

import { useState, useRef, useEffect } from "react";

type TestType = "unit" | "e2e";

export default function TestRunnerPanel() {
  const [running, setRunning] = useState(false);
  const [testType, setTestType] = useState<TestType>("unit");
  const [lines, setLines] = useState<{ type: string; text: string }[]>([]);
  const [done, setDone] = useState<{ success: boolean; summary?: string } | null>(null);
  const [showTerminal, setShowTerminal] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  async function handleRun() {
    if (running) return;
    setRunning(true);
    setDone(null);
    setLines([]);
    setShowTerminal(true);

    try {
      const res = await fetch(`/api/admin/run-tests?type=${testType}`, { method: "POST" });
      if (!res.body) throw new Error("Geen response stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";
        for (const part of parts) {
          if (!part.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(part.slice(6));
            if (event.type === "done") {
              setDone({ success: event.data === "success", summary: event.summary });
            } else {
              setLines((prev) => [...prev, { type: event.type, text: event.data }]);
            }
          } catch {}
        }
      }
    } catch (err) {
      setLines((prev) => [...prev, { type: "error", text: String(err) }]);
      setDone({ success: false });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Tests draaien</h3>

      <div className="flex items-center gap-3 mb-3">
        <select
          value={testType}
          onChange={(e) => setTestType(e.target.value as TestType)}
          disabled={running}
          className="border border-gray-300 dark:border-slate-600 rounded px-3 py-1.5 text-sm dark:bg-slate-700 dark:text-white"
        >
          <option value="unit">Unit tests (Vitest)</option>
          <option value="e2e">E2E tests (Playwright)</option>
        </select>

        <button
          onClick={handleRun}
          disabled={running}
          className="px-4 py-1.5 bg-[#1a6ca8] text-white text-sm rounded hover:bg-[#155a8c] disabled:opacity-50 transition-colors"
        >
          {running ? "Bezig..." : "▶ Start tests"}
        </button>
      </div>

      {done && (
        <div className={`text-sm font-medium mb-2 ${done.success ? "text-green-600" : "text-red-600"}`}>
          {done.success ? "✅ Alle tests geslaagd" : "❌ Tests gefaald"}
          {done.summary && <span className="text-gray-500 ml-2">({done.summary})</span>}
        </div>
      )}

      {showTerminal && (
        <div
          ref={terminalRef}
          className="bg-gray-900 text-gray-100 rounded p-3 text-xs font-mono max-h-[400px] overflow-y-auto mt-2"
        >
          {lines.map((line, i) => (
            <div
              key={i}
              className={
                line.type === "error" ? "text-red-400" :
                line.type === "stderr" ? "text-yellow-400" :
                "text-gray-300"
              }
            >
              {line.text}
            </div>
          ))}
          {running && <div className="text-blue-400 animate-pulse">Running...</div>}
        </div>
      )}
    </div>
  );
}
