"use client";

export default function DemoStartButton() {
  return (
    <button
      onClick={() => {
        const start = (window as unknown as Record<string, (idx?: number) => void>).__startVvcDemo;
        if (start) start(0);
        else alert("Demo player niet geladen. Vernieuw de pagina.");
      }}
      className="inline-flex items-center gap-2 bg-[#e35b10] hover:bg-[#c44b0a] text-white font-semibold px-6 py-3 rounded-lg transition-colors text-base shadow-md"
    >
      <span className="text-lg">&#9654;</span>
      Start geautomatiseerde demo
    </button>
  );
}
