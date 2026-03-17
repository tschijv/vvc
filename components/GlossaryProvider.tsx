"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface BegripEntry {
  term: string;
  definitie: string;
  synoniemen: string[];
  uri: string;
}

export interface GlossaryTermInfo {
  definitie: string;
  uri: string;
}

interface GlossaryContextType {
  begrippen: BegripEntry[];
  termMap: Map<string, GlossaryTermInfo>; // lowercase term/synoniem → { definitie, uri }
  loaded: boolean;
}

const GlossaryContext = createContext<GlossaryContextType>({
  begrippen: [],
  termMap: new Map(),
  loaded: false,
});

export function useGlossary() {
  return useContext(GlossaryContext);
}

export default function GlossaryProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [begrippen, setBegrippen] = useState<BegripEntry[]>([]);
  const [termMap, setTermMap] = useState<Map<string, GlossaryTermInfo>>(
    new Map()
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/begrippen")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: BegripEntry[]) => {
        setBegrippen(data);

        // Build lookup map: lowercase term/synoniem → { definitie, uri }
        const map = new Map<string, GlossaryTermInfo>();
        for (const b of data) {
          map.set(b.term.toLowerCase(), {
            definitie: b.definitie,
            uri: b.uri,
          });
          for (const syn of b.synoniemen || []) {
            if (syn && !map.has(syn.toLowerCase())) {
              map.set(syn.toLowerCase(), {
                definitie: b.definitie,
                uri: b.uri,
              });
            }
          }
        }
        setTermMap(map);
        setLoaded(true);
      })
      .catch(() => {
        setLoaded(true);
      });
  }, []);

  return (
    <GlossaryContext.Provider value={{ begrippen, termMap, loaded }}>
      {children}
    </GlossaryContext.Provider>
  );
}
