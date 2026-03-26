"use client";

import { useCallback, useEffect, useRef, useState } from "react";
const sanitize = (html: string, opts?: Record<string, unknown>) => {
  if (typeof window === "undefined") return html;
  const DOMPurify = require("dompurify");
  const fn = DOMPurify.default?.sanitize ?? DOMPurify.sanitize;
  return fn ? fn(html, opts) : html;
};

interface KaartViewerProps {
  viewId: string;
  organisatieId: string;
  organisatieNaam?: string;
}

/**
 * Parse the SVG content to extract its natural width/height.
 * Tries viewBox first, then width/height attributes.
 */
function parseSvgDimensions(svg: string): {
  width: number;
  height: number;
} | null {
  // Try viewBox first: viewBox="x y width height"
  const viewBoxMatch = svg.match(/viewBox=["']([^"']+)["']/);
  if (viewBoxMatch) {
    const parts = viewBoxMatch[1].trim().split(/[\s,]+/).map(Number);
    if (parts.length >= 4 && parts[2] > 0 && parts[3] > 0) {
      return { width: parts[2], height: parts[3] };
    }
  }

  // Fallback: width/height attributes
  const wMatch = svg.match(/\bwidth=["'](\d+(?:\.\d+)?)/);
  const hMatch = svg.match(/\bheight=["'](\d+(?:\.\d+)?)/);
  if (wMatch && hMatch) {
    return { width: parseFloat(wMatch[1]), height: parseFloat(hMatch[1]) };
  }

  return null;
}

export default function KaartViewer({
  viewId,
  organisatieId,
  organisatieNaam,
}: KaartViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [svgDimensions, setSvgDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pan & zoom state
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const translateStart = useRef({ x: 0, y: 0 });
  const didDrag = useRef(false);
  const PAN_THRESHOLD = 4; // pixels before pan activates

  // Fit SVG to container, centered, with padding
  const fitToContainer = useCallback(() => {
    if (!containerRef.current || !svgDimensions) return;

    const container = containerRef.current;
    const containerW = container.clientWidth;
    const containerH = container.clientHeight;
    const padding = 24; // px padding around the SVG

    const availW = containerW - padding * 2;
    const availH = containerH - padding * 2;

    const scaleX = availW / svgDimensions.width;
    const scaleY = availH / svgDimensions.height;
    const newScale = Math.min(scaleX, scaleY, 2); // cap at 2x for small SVGs

    // Center the SVG in the container
    const scaledW = svgDimensions.width * newScale;
    const scaledH = svgDimensions.height * newScale;
    const offsetX = (containerW - scaledW) / 2;
    const offsetY = (containerH - scaledH) / 2;

    setScale(newScale);
    setTranslate({ x: offsetX, y: offsetY });
  }, [svgDimensions]);

  // Fetch SVG when viewId or organisatieId changes
  useEffect(() => {
    if (!viewId || !organisatieId) return;

    setLoading(true);
    setError(null);
    setSvgContent(null);
    setSvgDimensions(null);
    setScale(1);
    setTranslate({ x: 0, y: 0 });

    fetch(`/api/kaart?viewId=${viewId}&organisatieId=${organisatieId}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(
            data.error || `Fout bij ophalen kaart (${res.status})`
          );
        }
        return res.text();
      })
      .then((svg) => {
        const dims = parseSvgDimensions(svg);
        setSvgDimensions(dims);
        // Add target="_blank" to all <a> links so they open in new tabs
        const svgWithTargets = svg
          .replace(/<a\s/gi, '<a target="_blank" rel="noopener noreferrer" ')
          .replace(/xlink:href=/gi, 'href=');
        setSvgContent(svgWithTargets);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [viewId, organisatieId]);

  // Auto-fit when SVG loads, container resizes, or becomes visible
  useEffect(() => {
    if (!svgContent || !svgDimensions || !containerRef.current) return;

    // Initial fit with delay for modal animation
    const timer = setTimeout(() => fitToContainer(), 150);

    // ResizeObserver for reliable container dimension tracking
    const observer = new ResizeObserver(() => {
      fitToContainer();
    });
    observer.observe(containerRef.current);

    // Window resize fallback
    const handleResize = () => fitToContainer();
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [svgContent, svgDimensions, fitToContainer]);

  // Wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.min(Math.max(scale * delta, 0.05), 5);

      // Zoom towards mouse position
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const newTranslateX =
          mouseX - ((mouseX - translate.x) * newScale) / scale;
        const newTranslateY =
          mouseY - ((mouseY - translate.y) * newScale) / scale;
        setTranslate({ x: newTranslateX, y: newTranslateY });
      }

      setScale(newScale);
    },
    [scale, translate]
  );

  // Pan handlers — use a drag threshold so clicks on SVG links work
  const mouseDownTarget = useRef<EventTarget | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      mouseDownTarget.current = e.target;
      didDrag.current = false;
      panStart.current = { x: e.clientX, y: e.clientY };
      translateStart.current = { ...translate };
    },
    [translate]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (mouseDownTarget.current === null) return;
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist >= PAN_THRESHOLD) {
        if (!isPanning) setIsPanning(true);
        didDrag.current = true;
        setTranslate({
          x: translateStart.current.x + dx,
          y: translateStart.current.y + dy,
        });
      }
    },
    [isPanning]
  );

  const handleMouseUp = useCallback(() => {
    mouseDownTarget.current = null;
    setIsPanning(false);
  }, []);

  // Download SVG
  const downloadSvg = useCallback(() => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `applicatielandschap${organisatieNaam ? `-${organisatieNaam}` : ""}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }, [svgContent, organisatieNaam]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <svg
            className="animate-spin h-8 w-8 mx-auto mb-3 text-[#1a6ca8]"
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
          <p className="text-gray-600 text-sm">
            Kaart wordt gegenereerd door GEMMA Online...
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Dit kan enkele seconden duren
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700 font-medium">Fout bij laden kaart</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!svgContent) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500 text-sm">
          Selecteer een view en organisatie om de kaart te genereren
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-white/90 backdrop-blur rounded-lg shadow-md border border-gray-200 p-1">
        <button
          onClick={() => {
            const newScale = Math.min(scale * 1.25, 5);
            // Zoom from center of container
            const container = containerRef.current;
            if (container) {
              const cx = container.clientWidth / 2;
              const cy = container.clientHeight / 2;
              setTranslate({
                x: cx - ((cx - translate.x) * newScale) / scale,
                y: cy - ((cy - translate.y) * newScale) / scale,
              });
            }
            setScale(newScale);
          }}
          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded text-lg"
          title="Inzoomen"
        >
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
          </svg>
        </button>
        <button
          onClick={() => {
            const newScale = Math.max(scale * 0.8, 0.05);
            const container = containerRef.current;
            if (container) {
              const cx = container.clientWidth / 2;
              const cy = container.clientHeight / 2;
              setTranslate({
                x: cx - ((cx - translate.x) * newScale) / scale,
                y: cy - ((cy - translate.y) * newScale) / scale,
              });
            }
            setScale(newScale);
          }}
          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded text-lg"
          title="Uitzoomen"
        >
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
        </button>
        <button
          onClick={fitToContainer}
          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded"
          title="Passend maken"
        >
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
        <div className="w-px h-5 bg-gray-200" />
        <span className="text-xs text-gray-500 px-1.5 tabular-nums min-w-[3rem] text-center">
          {Math.round(scale * 100)}%
        </span>
        <div className="w-px h-5 bg-gray-200" />
        <button
          onClick={downloadSvg}
          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded"
          title="Download SVG"
        >
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      </div>

      {/* SVG container */}
      <div
        ref={containerRef}
        className="overflow-hidden bg-white rounded-lg border border-gray-200"
        style={{
          height: "70vh",
          cursor: isPanning ? "grabbing" : "grab",
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={(e) => {
          // If user dragged, prevent any link navigation
          if (didDrag.current) {
            e.preventDefault();
          }
        }}
      >
        <div
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transformOrigin: "0 0",
            transition: isPanning ? "none" : "transform 0.15s ease-out",
          }}
          dangerouslySetInnerHTML={{ __html: sanitize(svgContent, { USE_PROFILES: { svg: true } }) }}
        />
      </div>
    </div>
  );
}
