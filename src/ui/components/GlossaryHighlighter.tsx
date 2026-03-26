"use client";

import { useMemo, useState, useRef, useCallback } from "react";
import DOMPurify from "isomorphic-dompurify";
import { useGlossary, type GlossaryTermInfo } from "./GlossaryProvider";

interface GlossaryHighlighterProps {
  children?: string;
  html?: string;
}

/**
 * Highlights glossary terms in text with a dotted underline and tooltip.
 *
 * Usage:
 *   <GlossaryHighlighter>Some text with terms</GlossaryHighlighter>
 *   <GlossaryHighlighter html="<p>Some HTML with terms</p>" />
 */
export default function GlossaryHighlighter({
  children,
  html,
}: GlossaryHighlighterProps) {
  const { termMap, loaded } = useGlossary();

  // Build a regex that matches all known terms (longest first)
  const regex = useMemo(() => {
    if (!loaded || termMap.size === 0) return null;

    const terms = Array.from(termMap.keys())
      .filter((t) => t.length >= 3) // Skip very short terms
      .sort((a, b) => b.length - a.length); // Longest first

    if (terms.length === 0) return null;

    const escaped = terms.map((t) =>
      t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    );
    return new RegExp(`\\b(${escaped.join("|")})\\b`, "gi");
  }, [termMap, loaded]);

  if (!loaded || !regex) {
    if (html) {
      return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />;
    }
    return <>{children}</>;
  }

  if (html) {
    // For HTML content: use data attributes + global tooltip handler
    const processed = html.replace(
      /(<[^>]+>)|([^<]+)/g,
      (match, tag, text) => {
        if (tag) return tag;
        return highlightTextHtml(text, regex, termMap);
      }
    );
    return (
      <GlossaryHtmlWrapper html={processed} />
    );
  }

  if (typeof children === "string") {
    return <HighlightedText text={children} regex={regex} termMap={termMap} />;
  }

  return <>{children}</>;
}

/** Renders highlighted text as React elements with interactive tooltips */
function HighlightedText({
  text,
  regex,
  termMap,
}: {
  text: string;
  regex: RegExp;
  termMap: Map<string, GlossaryTermInfo>;
}) {
  const parts: (string | { match: string; info: GlossaryTermInfo })[] = [];
  let lastIndex = 0;
  const seen = new Set<number>();

  // Reset regex lastIndex
  regex.lastIndex = 0;
  let m: RegExpExecArray | null;

  while ((m = regex.exec(text)) !== null) {
    if (seen.has(m.index)) continue;

    const info = termMap.get(m[0].toLowerCase());
    if (!info) continue;

    for (let i = m.index; i < m.index + m[0].length; i++) seen.add(i);

    if (m.index > lastIndex) {
      parts.push(text.slice(lastIndex, m.index));
    }
    parts.push({ match: m[0], info });
    lastIndex = m.index + m[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return (
    <span>
      {parts.map((part, i) =>
        typeof part === "string" ? (
          part
        ) : (
          <GlossaryTerm key={i} term={part.match} info={part.info} />
        )
      )}
    </span>
  );
}

/** Single glossary term with interactive tooltip */
function GlossaryTerm({
  term,
  info,
}: {
  term: string;
  info: GlossaryTermInfo;
}) {
  const [show, setShow] = useState(false);
  const hideTimeout = useRef<ReturnType<typeof setTimeout>>(null);

  const handleEnter = useCallback(() => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    setShow(true);
  }, []);

  const handleLeave = useCallback(() => {
    hideTimeout.current = setTimeout(() => setShow(false), 50);
  }, []);

  // Convert URI to browsable SKOSMOS page URL
  const bronUrl = info.uri
    ? info.uri.replace("/id/begrip/", "/nl/page/begrip/")
    : null;

  return (
    <span
      className="glossary-term"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {term}
      {show && (
        <span
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#1f2937",
            color: "white",
            padding: "0.5rem 0.75rem",
            borderRadius: "0.375rem",
            fontSize: "0.8125rem",
            lineHeight: 1.4,
            maxWidth: 320,
            width: "max-content",
            whiteSpace: "normal",
            zIndex: 50,
            boxShadow: "0 4px 6px rgba(0,0,0,0.15)",
            display: "flex",
            flexDirection: "column",
            gap: "0.375rem",
          }}
        >
          <span style={{ display: "block" }}>{info.definitie}</span>
          {bronUrl && (
            <a
              href={bronUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                color: "#93c5fd",
                fontSize: "0.75rem",
                textDecoration: "none",
                borderTop: "1px solid rgba(255,255,255,0.15)",
                paddingTop: "0.25rem",
                marginTop: "0.125rem",
              }}
            >
              Bekijk in begrippenkader →
            </a>
          )}
          {/* Arrow */}
          <span
            style={{
              position: "absolute",
              bottom: -5,
              left: "50%",
              transform: "translateX(-50%)",
              border: "5px solid transparent",
              borderTopColor: "#1f2937",
              borderBottom: 0,
            }}
          />
        </span>
      )}
    </span>
  );
}

/** Wrapper for HTML content with glossary data attributes — uses global event delegation */
function GlossaryHtmlWrapper({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    definitie: string;
    uri: string;
    rect: DOMRect;
  } | null>(null);
  const hideTimeout = useRef<ReturnType<typeof setTimeout>>(null);

  const showTooltip = useCallback(
    (el: HTMLElement) => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
      const definitie = el.getAttribute("data-definitie") || "";
      const uri = el.getAttribute("data-uri") || "";
      const rect = el.getBoundingClientRect();
      setTooltip({ definitie, uri, rect });
    },
    []
  );

  const hideTooltip = useCallback(() => {
    hideTimeout.current = setTimeout(() => setTooltip(null), 50);
  }, []);

  const keepTooltip = useCallback(() => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
  }, []);

  const bronUrl = tooltip
    ? tooltip.uri.replace("/id/begrip/", "/nl/page/begrip/")
    : "";

  // Clamp tooltip horizontally so it stays within the viewport
  const tooltipLeft = tooltip
    ? Math.max(
        170,
        Math.min(
          tooltip.rect.left + tooltip.rect.width / 2,
          (typeof window !== "undefined" ? window.innerWidth : 900) - 170
        )
      )
    : 0;

  return (
    <>
      <div
        ref={containerRef}
        onMouseOver={(e) => {
          const target = (e.target as HTMLElement).closest(
            ".glossary-term"
          ) as HTMLElement | null;
          if (target) {
            showTooltip(target);
          } else {
            hideTooltip();
          }
        }}
        onMouseLeave={hideTooltip}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
      />
      {tooltip && (
        <div
          onMouseEnter={keepTooltip}
          onMouseLeave={hideTooltip}
          style={{
            position: "fixed",
            top: tooltip.rect.top - 8,
            left: tooltipLeft,
            transform: "translate(-50%, -100%)",
            background: "#1f2937",
            color: "white",
            padding: "0.5rem 0.75rem",
            borderRadius: "0.375rem",
            fontSize: "0.8125rem",
            lineHeight: 1.4,
            maxWidth: 320,
            width: "max-content",
            whiteSpace: "normal",
            zIndex: 50,
            boxShadow: "0 4px 6px rgba(0,0,0,0.15)",
            display: "flex",
            flexDirection: "column" as const,
            gap: "0.375rem",
            pointerEvents: "auto" as const,
          }}
        >
          <span style={{ display: "block" }}>{tooltip.definitie}</span>
          {bronUrl && (
            <a
              href={bronUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                color: "#93c5fd",
                fontSize: "0.75rem",
                textDecoration: "none",
                borderTop: "1px solid rgba(255,255,255,0.15)",
                paddingTop: "0.25rem",
                marginTop: "0.125rem",
              }}
            >
              Bekijk in begrippenkader →
            </a>
          )}
          {/* Arrow */}
          <span
            style={{
              position: "absolute",
              bottom: -5,
              left: "50%",
              transform: "translateX(-50%)",
              border: "5px solid transparent",
              borderTopColor: "#1f2937",
              borderBottom: 0,
            }}
          />
        </div>
      )}
    </>
  );
}

/** For HTML mode: generates data-attribute spans */
function highlightTextHtml(
  text: string,
  regex: RegExp,
  termMap: Map<string, GlossaryTermInfo>
): string {
  const seen = new Set<number>();

  return text.replace(regex, (match, _group, offset) => {
    if (seen.has(offset)) return match;

    const info = termMap.get(match.toLowerCase());
    if (!info) return match;

    for (let i = offset; i < offset + match.length; i++) seen.add(i);

    const escapedDef = info.definitie
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    const escapedUri = info.uri
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;");

    return `<span class="glossary-term" data-definitie="${escapedDef}" data-uri="${escapedUri}">${match}</span>`;
  });
}
