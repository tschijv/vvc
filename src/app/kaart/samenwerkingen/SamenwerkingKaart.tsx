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
import type { SamenwerkingKaartData } from "@/service/samenwerking-kaart";
import Spinner from "@/ui/components/Spinner";
import ErrorAlert from "@/ui/components/ErrorAlert";

// ─── Types ──────────────────────────────────────────────────────────────────

interface GeoProperties {
  statcode: string; // e.g. "GM0518"
  statnaam: string;
  [key: string]: unknown;
}

interface SamenwerkingKaartProps {
  samenwerkingen: SamenwerkingKaartData[];
}

// ─── Constants ──────────────────────────────────────────────────────────────

const NON_MEMBER_COLOR = "#f3f4f6";
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

function FitBounds({ bounds }: { bounds?: L.LatLngBoundsExpression }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 12 });
    } else {
      map.fitBounds(NL_BOUNDS, { padding: [10, 10] });
      setTimeout(() => {
        const currentZoom = map.getZoom();
        map.setZoom(currentZoom + 1);
      }, 100);
    }
  }, [map, bounds]);
  return null;
}

// ─── Legend Item ─────────────────────────────────────────────────────────────

function LegendItem({
  samenwerking,
  isActive,
  onClick,
}: {
  samenwerking: SamenwerkingKaartData;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg border transition-all hover:shadow-sm ${
        isActive
          ? "border-[#1a6ca8] bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700"
          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
      }`}
    >
      <div className="flex items-start gap-2">
        <span
          className="inline-block w-3.5 h-3.5 rounded-full mt-0.5 shrink-0 border border-black/10"
          style={{ backgroundColor: samenwerking.kleur }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
              {samenwerking.naam}
            </span>
            {samenwerking.type && (
              <span className="inline-block px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                {samenwerking.type}
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {samenwerking.stats.aantalLeden} leden
            {" \u00b7 "}
            {samenwerking.stats.totaalPakketten} pakketten
            {" \u00b7 "}
            {samenwerking.stats.totaalKoppelingen} koppelingen
            {" \u00b7 "}
            {samenwerking.stats.gemiddeldeVoortgang}% voortgang
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function SamenwerkingKaart({
  samenwerkingen,
}: SamenwerkingKaartProps) {
  const [geojson, setGeojson] = useState<FeatureCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [fitBounds, setFitBounds] = useState<L.LatLngBoundsExpression | undefined>(undefined);
  const geoJsonRef = useRef<L.GeoJSON | null>(null);

  const setGeoJsonRef = useCallback((ref: L.GeoJSON | null) => {
    geoJsonRef.current = ref;
  }, []);

  // Build lookup: cbsCode -> samenwerking color (first match wins)
  // Also build: cbsCode -> list of samenwerkingen (for popups)
  const { colorMap, membershipMap, nameToColorMap, nameToMembershipMap } = useMemo(() => {
    const colorMap = new Map<string, string>();
    const membershipMap = new Map<string, SamenwerkingKaartData[]>();
    const nameToColorMap = new Map<string, string>();
    const nameToMembershipMap = new Map<string, SamenwerkingKaartData[]>();

    for (const sw of samenwerkingen) {
      for (const lid of sw.leden) {
        if (lid.cbsCode) {
          if (!colorMap.has(lid.cbsCode)) {
            colorMap.set(lid.cbsCode, sw.kleur);
          }
          if (!membershipMap.has(lid.cbsCode)) {
            membershipMap.set(lid.cbsCode, []);
          }
          membershipMap.get(lid.cbsCode)!.push(sw);
        }
        // Also map by lowercased name for fallback matching
        const lowerNaam = lid.naam.toLowerCase();
        if (!nameToColorMap.has(lowerNaam)) {
          nameToColorMap.set(lowerNaam, sw.kleur);
        }
        if (!nameToMembershipMap.has(lowerNaam)) {
          nameToMembershipMap.set(lowerNaam, []);
        }
        nameToMembershipMap.get(lowerNaam)!.push(sw);
      }
    }

    return { colorMap, membershipMap, nameToColorMap, nameToMembershipMap };
  }, [samenwerkingen]);

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

  /** Get color for a feature based on samenwerking membership. */
  const getFeatureColor = useCallback(
    (feature: Feature<Geometry, GeoProperties>): string => {
      const code = cbsFromStatcode(feature.properties.statcode);
      if (colorMap.has(code)) return colorMap.get(code)!;
      const naam = feature.properties.statnaam?.toLowerCase();
      if (naam && nameToColorMap.has(naam)) return nameToColorMap.get(naam)!;
      return NON_MEMBER_COLOR;
    },
    [colorMap, nameToColorMap]
  );

  /** Get samenwerkingen for a feature. */
  const getFeatureMemberships = useCallback(
    (feature: Feature<Geometry, GeoProperties>): SamenwerkingKaartData[] => {
      const code = cbsFromStatcode(feature.properties.statcode);
      if (membershipMap.has(code)) return membershipMap.get(code)!;
      const naam = feature.properties.statnaam?.toLowerCase();
      if (naam && nameToMembershipMap.has(naam))
        return nameToMembershipMap.get(naam)!;
      return [];
    },
    [membershipMap, nameToMembershipMap]
  );

  // Style each feature
  const style = useCallback(
    (feature: Feature<Geometry, GeoProperties> | undefined) => {
      if (!feature) return {};
      const color = getFeatureColor(feature);
      const isMember = color !== NON_MEMBER_COLOR;

      // If a samenwerking is focused, dim non-members of that samenwerking
      let opacity = isMember ? 0.75 : 0.4;
      if (focusedId) {
        const memberships = getFeatureMemberships(feature);
        const isFocusMember = memberships.some((m) => m.id === focusedId);
        opacity = isFocusMember ? 0.9 : 0.2;
      }

      return {
        fillColor: color,
        weight: 1,
        opacity: 1,
        color: "#000000",
        fillOpacity: opacity,
      };
    },
    [getFeatureColor, getFeatureMemberships, focusedId]
  );

  // Hover + click handlers
  const onEachFeature = useCallback(
    (feature: Feature<Geometry, GeoProperties>, layer: L.Layer) => {
      const naam = feature.properties.statnaam;
      const code = cbsFromStatcode(feature.properties.statcode);
      const memberships = getFeatureMemberships(feature);

      // Build popup content
      const samenwerkingLines = memberships.length > 0
        ? memberships
            .map(
              (sw) =>
                `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${sw.kleur};margin-right:4px;"></span>${sw.naam}`
            )
            .join("<br/>")
        : '<span style="color:#9ca3af;">Geen samenwerkingsverband</span>';

      const popupContent = `
        <div style="font-size:13px;max-width:250px;">
          <strong>${naam}</strong>
          <div style="margin-top:4px;font-size:12px;line-height:1.6;">${samenwerkingLines}</div>
          <a href="/gemeenten/${code}" style="color:#1a6ca8;text-decoration:underline;font-size:12px;display:inline-block;margin-top:4px;">Bekijk gemeente →</a>
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
    [getFeatureMemberships]
  );

  /** Handle clicking a legend item: zoom to that samenwerking's area. */
  const handleLegendClick = useCallback(
    (sw: SamenwerkingKaartData) => {
      if (!geojson) return;

      // Toggle focus
      if (focusedId === sw.id) {
        setFocusedId(null);
        setFitBounds(undefined);
        return;
      }

      setFocusedId(sw.id);

      // Find bounds for this samenwerking's member gemeenten
      const cbsCodes = new Set(
        sw.leden.filter((l) => l.cbsCode).map((l) => l.cbsCode!)
      );
      const names = new Set(sw.leden.map((l) => l.naam.toLowerCase()));

      const bounds = L.latLngBounds([]);
      for (const feature of geojson.features) {
        const props = feature.properties as GeoProperties;
        const code = cbsFromStatcode(props.statcode);
        const naam = props.statnaam?.toLowerCase();
        if (cbsCodes.has(code) || (naam && names.has(naam))) {
          const layer = L.geoJSON(feature);
          bounds.extend(layer.getBounds());
        }
      }

      if (bounds.isValid()) {
        setFitBounds(bounds);
      }
    },
    [geojson, focusedId]
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
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Map */}
      <div className="flex-1 min-w-0">
        <div className="relative z-0 h-[700px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
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
              key={focusedId || "all"}
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
            <FitBounds bounds={fitBounds} />
          </MapContainer>
        </div>
      </div>

      {/* Legend panel */}
      <div className="w-full lg:w-80 xl:w-96 shrink-0">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Samenwerkingsverbanden ({samenwerkingen.length})
            </h2>
            {focusedId && (
              <button
                onClick={() => {
                  setFocusedId(null);
                  setFitBounds(undefined);
                }}
                className="text-xs text-[#1a6ca8] dark:text-blue-400 hover:underline mt-1"
              >
                Toon alles
              </button>
            )}
          </div>
          <div className="p-3 space-y-2 max-h-[620px] overflow-y-auto">
            {samenwerkingen.map((sw) => (
              <LegendItem
                key={sw.id}
                samenwerking={sw}
                isActive={focusedId === sw.id}
                onClick={() => handleLegendClick(sw)}
              />
            ))}
            {samenwerkingen.length === 0 && (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                Geen samenwerkingsverbanden gevonden.
              </p>
            )}
          </div>
          {/* Color legend for non-members */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block w-3.5 h-3 rounded-sm border border-black/10"
                style={{ background: NON_MEMBER_COLOR }}
              />
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Geen samenwerkingsverband
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
