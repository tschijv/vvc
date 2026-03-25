"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { progressToStars, STAR_LABELS } from "@/process/progress";
import Spinner from "@/ui/components/Spinner";
import ErrorAlert from "@/ui/components/ErrorAlert";

// ─── Types ──────────────────────────────────────────────────────────────────

interface GemeenteProgress {
  id: string;
  naam: string;
  cbsCode: string | null;
  progress: number;
  aantalPakketten: number;
}

interface GeoProperties {
  statcode: string; // e.g. "GM0518"
  statnaam: string;
  [key: string]: unknown;
}

// ─── Color Scale ────────────────────────────────────────────────────────────

const STAR_COLORS: Record<number, string> = {
  0: "#d1d5db", // geen data (gray)
  1: "#1a237e", // 1 ster — donkerblauw
  2: "#1565c0", // 2 sterren — blauw
  3: "#42a5f5", // 3 sterren — lichtblauw
  4: "#9c7ab5", // 4 sterren — paars/mauve
  5: "#80deea", // 5 sterren — cyaan
};

/** Strip "GM" prefix from GeoJSON statcode to get bare CBS code. */
function cbsFromStatcode(statcode: string): string {
  return statcode.replace("GM", "");
}

// ─── Map bounds for Netherlands ─────────────────────────────────────────────

const NL_BOUNDS: L.LatLngBoundsExpression = [
  [50.75, 3.3],
  [53.55, 7.25],
];

const NL_CENTER: L.LatLngExpression = [52.2, 5.3];

// ─── Fit Bounds Component ───────────────────────────────────────────────────

function FitBounds() {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(NL_BOUNDS, { padding: [10, 10] });
    // Zoom in one extra level compared to the auto-fitted level
    setTimeout(() => {
      const currentZoom = map.getZoom();
      map.setZoom(currentZoom + 1);
    }, 100);
  }, [map]);
  return null;
}

// ─── Legend Component ───────────────────────────────────────────────────────

function Legenda() {
  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 400,
        background: "white",
        borderRadius: 6,
        padding: "10px 14px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        fontSize: 12,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 6, color: "#374151" }}>
        Voortgang
      </div>
      {[1, 2, 3, 4, 5].map((stars) => (
        <div
          key={stars}
          style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}
        >
          <span
            style={{
              width: 16,
              height: 12,
              background: STAR_COLORS[stars],
              borderRadius: 2,
              display: "inline-block",
              border: "1px solid rgba(0,0,0,0.1)",
            }}
          />
          <span style={{ color: "#4b5563" }}>{STAR_LABELS[stars]}</span>
        </div>
      ))}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
        <span
          style={{
            width: 16,
            height: 12,
            background: STAR_COLORS[0],
            borderRadius: 2,
            display: "inline-block",
            border: "1px solid rgba(0,0,0,0.1)",
          }}
        />
        <span style={{ color: "#9ca3af" }}>Geen data</span>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function NederlandKaart() {
  const [geojson, setGeojson] = useState<FeatureCollection | null>(null);
  const [gemeenteData, setGemeenteData] = useState<Map<string, GemeenteProgress>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const geoJsonRef = useRef<L.GeoJSON | null>(null);

  // Stable ref callback (avoids re-creation on every render)
  const setGeoJsonRef = useCallback((ref: L.GeoJSON | null) => {
    geoJsonRef.current = ref;
  }, []);

  // Load GeoJSON + gemeente data
  useEffect(() => {
    async function loadData() {
      try {
        const [geoRes, dataRes] = await Promise.all([
          fetch("/data/gemeenten.geojson"),
          fetch("/api/kaart/gemeenten"),
        ]);

        if (!geoRes.ok) throw new Error("GeoJSON laden mislukt");
        if (!dataRes.ok) throw new Error("Gemeente data laden mislukt");

        const geoData = await geoRes.json();
        const { data } = await dataRes.json();

        // Build lookup: cbsCode → GemeenteProgress
        const map = new Map<string, GemeenteProgress>();
        for (const g of data as GemeenteProgress[]) {
          if (g.cbsCode) map.set(g.cbsCode, g);
        }

        setGeojson(geoData);
        setGemeenteData(map);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Fout bij laden");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Style each feature
  const style = useCallback(
    (feature: Feature<Geometry, GeoProperties> | undefined) => {
      if (!feature) return {};
      const code = cbsFromStatcode(feature.properties.statcode);
      const gemeente = gemeenteData.get(code);
      const stars = gemeente ? progressToStars(gemeente.progress) : 0;

      return {
        fillColor: STAR_COLORS[stars],
        weight: 1,
        opacity: 1,
        color: "white",
        fillOpacity: 0.85,
      };
    },
    [gemeenteData]
  );

  // Hover + click handlers
  const onEachFeature = useCallback(
    (feature: Feature<Geometry, GeoProperties>, layer: L.Layer) => {
      const code = cbsFromStatcode(feature.properties.statcode);
      const gemeente = gemeenteData.get(code);
      const naam = gemeente?.naam || feature.properties.statnaam;
      const stars = gemeente ? progressToStars(gemeente.progress) : 0;
      const pakketten = gemeente?.aantalPakketten ?? 0;

      layer.bindTooltip(
        `<strong>${naam}</strong><br/>` +
          `${STAR_LABELS[stars]}${gemeente ? ` (${gemeente.progress}%)` : ""}<br/>` +
          `${pakketten} pakket${pakketten !== 1 ? "ten" : ""}`,
        { sticky: true, className: "gemeente-tooltip" }
      );

      layer.on({
        mouseover: (e: L.LeafletMouseEvent) => {
          const target = e.target as L.Path;
          target.setStyle({ weight: 2, color: "#1a6ca8", fillOpacity: 0.95 });
          target.bringToFront();
        },
        mouseout: (e: L.LeafletMouseEvent) => {
          geoJsonRef.current?.resetStyle(e.target);
        },
        click: () => {
          if (gemeente) window.location.href = `/gemeenten/${gemeente.id}`;
        },
      });
    },
    [gemeenteData]
  );

  if (loading) {
    return (
      <div className="h-[800px] bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 text-sm">
        <Spinner label="Kaart laden..." />
      </div>
    );
  }

  if (error) return <ErrorAlert message={`Fout bij laden kaart: ${error}`} />;
  if (!geojson) return null;

  return (
    <div className="relative z-0 h-[800px] rounded-lg overflow-hidden border border-gray-200">
      <Legenda />
      <MapContainer
        center={NL_CENTER}
        zoom={7}
        style={{ height: "100%", width: "100%", background: "#f0f4f8" }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        />
        <GeoJSON
          ref={setGeoJsonRef}
          data={geojson}
          style={style as L.StyleFunction}
          onEachFeature={
            onEachFeature as (
              feature: Feature<Geometry, Record<string, unknown>>,
              layer: L.Layer
            ) => void
          }
        />
        <FitBounds />
      </MapContainer>
    </div>
  );
}
