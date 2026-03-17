"use client";

import { useEffect, useRef, useState } from "react";

export default function SwaggerUI() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load Swagger UI from CDN
    const loadSwaggerUI = async () => {
      try {
        // Add CSS
        if (!document.getElementById("swagger-ui-css")) {
          const link = document.createElement("link");
          link.id = "swagger-ui-css";
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/swagger-ui-dist@5/swagger-ui.css";
          document.head.appendChild(link);
        }

        // Add JS
        await new Promise<void>((resolve, reject) => {
          if ((window as unknown as Record<string, unknown>).SwaggerUIBundle) {
            resolve();
            return;
          }
          const script = document.createElement("script");
          script.src = "https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Kan Swagger UI niet laden"));
          document.head.appendChild(script);
        });

        // Wait for preset script
        await new Promise<void>((resolve, reject) => {
          if ((window as unknown as Record<string, unknown>).SwaggerUIStandalonePreset) {
            resolve();
            return;
          }
          const script = document.createElement("script");
          script.src = "https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Kan Swagger UI preset niet laden"));
          document.head.appendChild(script);
        });

        // Initialize Swagger UI
        const SwaggerUIBundle = (window as unknown as Record<string, unknown>).SwaggerUIBundle as (config: Record<string, unknown>) => void;
        const SwaggerUIStandalonePreset = (window as unknown as Record<string, unknown>).SwaggerUIStandalonePreset as unknown;

        if (containerRef.current) {
          SwaggerUIBundle({
            url: "/api/v1/openapi",
            domNode: containerRef.current,
            deepLinking: true,
            presets: [
              (window as unknown as Record<string, unknown>).SwaggerUIBundle &&
                ((window as unknown as Record<string, unknown>).SwaggerUIBundle as Record<string, unknown>).presets &&
                (((window as unknown as Record<string, unknown>).SwaggerUIBundle as Record<string, unknown>).presets as Record<string, unknown>).apis,
              SwaggerUIStandalonePreset,
            ].filter(Boolean),
            plugins: [
              (window as unknown as Record<string, unknown>).SwaggerUIBundle &&
                ((window as unknown as Record<string, unknown>).SwaggerUIBundle as Record<string, unknown>).plugins &&
                (((window as unknown as Record<string, unknown>).SwaggerUIBundle as Record<string, unknown>).plugins as Record<string, unknown>).DownloadUrl,
            ].filter(Boolean),
            layout: "StandaloneLayout",
            tryItOutEnabled: true,
            defaultModelsExpandDepth: 2,
            defaultModelExpandDepth: 2,
            docExpansion: "list",
            filter: true,
            showExtensions: true,
            showCommonExtensions: true,
          });
        }

        setLoaded(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Onbekende fout");
      }
    };

    loadSwaggerUI();
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <p className="text-red-700 font-medium">Fout bij laden API documentatie</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Opnieuw proberen
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {!loaded && (
        <div className="flex items-center justify-center h-96">
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
            <p className="text-gray-600 text-sm">API documentatie laden...</p>
          </div>
        </div>
      )}
      <div ref={containerRef} />
    </>
  );
}
