"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { SamenwerkingKaartItem } from "@/service/samenwerking-kaart";
import Spinner from "@/ui/components/Spinner";
import ErrorAlert from "@/ui/components/ErrorAlert";

// ─── Types ──────────────────────────────────────────────────────────────────

interface GeoProperties {
  statcode: string; // e.g. "GM0518"
  statnaam: string;
  [key: string]: unknown;
}

interface SamenwerkingKaartProps {
  samenwerkingen: SamenwerkingKaartItem[];
}

// ─── Constants ──────────────────────────────────────────────────────────────

const MEMBER_COLOR = "#1a6ca8";
const NON_MEMBER_COLOR = "#e5e7eb";
const HOVER_COLOR = "#e35b10";

const NL_BOUNDS: L.LatLngBoundsExpression = [
  [50.75, 3.3],
  [53.55, 7.25],
];

const NL_CENTER: L.LatLngExpression = [52.2, 5.3];

/** Strip "GM" prefix from GeoJSON statcode to get bare CBS code. */
function cbsFromStatcode(statcode: string): string {
  return statcode.replace("GM", "");
}

// ─── Fit Bounds Component ───────────────────────────────────────────────────

function FitBounds() {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(NL_BOUNDS, { padding: [10, 10] });
    setTimeout(() => {
      const currentZoom = map.getZoom();
      map.setZoom(currentZoom + 1);
    }, 100);
  }, [map]);
  return null;
}

// ─── Legend Component ───────────────────────────────────────────────────────

function Legenda({
  samenwerking,
}: {
  samenwerking: SamenwerkingKaartItem | null;
}) {
  if (!samenwerking) return null;

  return (
    <div className="absolute top-2.5 right-2.5 z-[400] bg-white dark:bg-gray-800 rounded-md px-3.5 py-2.5 shadow-md text-xs">
      <div className="font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
        {samenwerking.naam}
      </div>
      {samenwerking.type && (
        <div className="text-gray-500 dark:text-gray-400 mb-1">
          Type: {samenwerking.type}
        </div>
      )}
      <div className="text-gray-500 dark:text-gray-400 mb-2">
        {samenwerking.organisaties.length} deelnemende gemeente
        {samenwerking.organisaties.length !== 1 ? "n" : ""}
      </div>
      <div className="flex items-center gap-1.5 mb-0.5">
        <span
          className="inline-block w-4 h-3 rounded-sm border border-black/10"
          style={{ background: MEMBER_COLOR }}
        />
        <span className="text-gray-600 dark:text-gray-300">Deelnemer</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span
          className="inline-block w-4 h-3 rounded-sm border border-black/10"
          style={{ background: NON_MEMBER_COLOR }}
        />
        <span className="text-gray-400 dark:text-gray-500">Overig</span>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function SamenwerkingKaart({
  samenwerkingen,
}: SamenwerkingKaartProps) {
  const [geojson, setGeojson] = useState<FeatureCollection | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const geoJsonRef = useRef<L.GeoJSON | null>(null);

  const setGeoJsonRef = useCallback((ref: L.GeoJSON | null) => {
    geoJsonRef.current = ref;
  }, []);

  const selectedSamenwerking = useMemo(
    () => samenwerkingen.find((s) => s.id === selectedId) ?? null,
    [samenwerkingen, selectedId]
  );

  // Build a Set of CBS codes and names for the selected samenwerking
  const memberCbsCodes = useMemo(() => {
    if (!selectedSamenwerking) return new Set<string>();
    return new Set(
      selectedSamenwerking.organisaties
        .filter((o) => o.cbsCode)
        .map((o) => o.cbsCode!)
    );
  }, [selectedSamenwerking]);

  const memberNames = useMemo(() => {
    if (!selectedSamenwerking) return new Set<string>();
    return new Set(
      selectedSamenwerking.organisaties.map((o) => o.naam.toLowerCase())
    );
  }, [selectedSamenwerking]);

  // Load GeoJSON
  useEffect(() => {
    async function loadGeoJson() {
      try {
        const res = await fetch("/data/gemeenten.geojson");
        if (!res.ok) throw new Error("GeoJSON laden mislukt");
        const data = await res.json();
        setGeojson(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Fout bij laden");
      } finally {
        setLoading(false);
      }
    }
    loadGeoJson();
  }, []);

  /** Check if a GeoJSON feature is a member of the selected samenwerking. */
  const isMember = useCallback(
    (feature: Feature<Geometry, GeoProperties>): boolean => {
      if (!selectedSamenwerking) return false;
      const code = cbsFromStatcode(feature.properties.statcode);
      if (memberCbsCodes.has(code)) return true;
      const naam = feature.properties.statnaam?.toLowerCase();
      if (naam && memberNames.has(naam)) return true;
      return false;
    },
    [selectedSamenwerking, memberCbsCodes, memberNames]
  );

  // Style each feature
  const style = useCallback(
    (feature: Feature<Geometry, GeoProperties> | undefined) => {
      if (!feature) return {};
      const member = isMember(feature);

      return {
        fillColor: selectedId ? (member ? MEMBER_COLOR : NON_MEMBER_COLOR) : NON_MEMBER_COLOR,
        weight: 1,
        opacity: 1,
        color: "white",
        fillOpacity: member ? 0.85 : 0.5,
      };
    },
    [selectedId, isMember]
  );

  // Hover + click handlers
  const onEachFeature = useCallback(
    (feature: Feature<Geometry, GeoProperties>, layer: L.Layer) => {
      const naam = feature.properties.statnaam;
      const member = isMember(feature);
      const code = cbsFromStatcode(feature.properties.statcode);

      // Popup with gemeente name and optional link
      const popupContent = `
        <div style="font-size:13px;">
          <strong>${naam}</strong>
          ${selectedId && member ? '<br/><span style="color:#1a6ca8;">Deelnemer</span>' : ""}
          <br/><a href="/gemeenten/${code}" style="color:#1a6ca8;text-decoration:underline;font-size:12px;">Bekijk gemeente</a>
        </div>
      `;
      layer.bindPopup(popupContent);

      layer.on({
        mouseover: (e: L.LeafletMouseEvent) => {
          const target = e.target as L.Path;
          target.setStyle({ weight: 2, color: HOVER_COLOR, fillOpacity: 0.95 });
          target.bringToFront();
        },
        mouseout: (e: L.LeafletMouseEvent) => {
          geoJsonRef.current?.resetStyle(e.target);
        },
      });
    },
    [selectedId, isMember]
  );

  if (loading) {
    return (
      <div className="h-[700px] bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 text-sm">
        <Spinner label="Kaart laden..." />
      </div>
    );
  }

  if (error) return <ErrorAlert message={`Fout bij laden kaart: ${error}`} />;
  if (!geojson) return null;

  return (
    <div>
      {/* Dropdown selector */}
      <div className="mb-4">
        <label
          htmlFor="samenwerking-select"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Selecteer een samenwerkingsverband
        </label>
        <select
          id="samenwerking-select"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full max-w-md border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1a6ca8] focus:border-transparent"
        >
          <option value="">Kies een samenwerkingsverband...</option>
          {samenwerkingen.map((s) => (
            <option key={s.id} value={s.id}>
              {s.naam}
              {s.type ? ` (${s.type})` : ""}
              {` — ${s.organisaties.length} gemeenten`}
            </option>
          ))}
        </select>
      </div>

      {/* Map */}
      <div className="relative z-0 h-[700px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <Legenda samenwerking={selectedSamenwerking} />
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
            key={selectedId || "none"}
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

      {/* Member list */}
      {selectedSamenwerking && (
        <div className="mt-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Deelnemende gemeenten ({selectedSamenwerking.organisaties.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedSamenwerking.organisaties.map((o) => (
              <span
                key={o.naam}
                className="inline-block px-2 py-0.5 text-xs bg-blue-50 dark:bg-blue-900/30 text-[#1a6ca8] dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded"
              >
                {o.naam}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
