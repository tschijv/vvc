"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { demoSections } from "@/ui/demo-sections";

const STORAGE_KEY = "vvc-demo";

type DemoState = {
  active: boolean;
  sectionIndex: number;
  phase: "navigating" | "narrating" | "actions" | "paused" | "done";
};

function loadState(): DemoState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveState(state: DemoState) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function clearState() {
  sessionStorage.removeItem(STORAGE_KEY);
}

/* ── Audio helper: MP3 met fallback naar speechSynthesis ── */
function audioFilePath(sectionNr: number): string {
  return `/audio/demo/section-${String(sectionNr).padStart(2, "0")}.mp3`;
}

async function checkAudioExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

export default function DemoPlayer() {
  const router = useRouter();
  const [state, setState] = useState<DemoState | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const usingAudioRef = useRef(false); // tracks whether we're using <audio> or speechSynthesis

  // Load state on mount
  useEffect(() => {
    const saved = loadState();
    if (saved?.active) {
      setState(saved);
    }
  }, []);

  /** Stop any currently playing audio/speech */
  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (speechRef.current) {
      speechSynthesis.cancel();
      speechRef.current = null;
    }
    setSpeaking(false);
  }, []);

  /** Called when narration finishes (either MP3 or speech) */
  const onNarrationEnd = useCallback(() => {
    setSpeaking(false);
    audioRef.current = null;
    speechRef.current = null;
    // Wait, then advance
    timerRef.current = setTimeout(() => {
      advanceSection();
    }, 2000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Try playing MP3, fall back to speechSynthesis */
  const playNarration = useCallback(
    async (sectionNr: number, text: string) => {
      stopPlayback();

      const mp3Url = audioFilePath(sectionNr);
      const hasMP3 = await checkAudioExists(mp3Url);

      if (hasMP3) {
        // Use pre-generated MP3
        usingAudioRef.current = true;
        const audio = new Audio(mp3Url);
        audioRef.current = audio;
        setSpeaking(true);

        audio.onended = onNarrationEnd;
        audio.onerror = () => {
          // MP3 failed, fall back to speech
          console.warn("MP3 afspelen mislukt, fallback naar spraaksynthese");
          playFallbackSpeech(text);
        };

        try {
          await audio.play();
        } catch {
          playFallbackSpeech(text);
        }
      } else {
        // No MP3, use browser speech
        playFallbackSpeech(text);
      }
    },
    [stopPlayback, onNarrationEnd],
  );

  /** Browser speech synthesis fallback */
  const playFallbackSpeech = useCallback(
    (text: string) => {
      usingAudioRef.current = false;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "nl-NL";
      utterance.rate = 1.0;

      const voices = speechSynthesis.getVoices();
      const nlVoice = voices.find((v) => v.lang.startsWith("nl"));
      if (nlVoice) utterance.voice = nlVoice;

      speechRef.current = utterance;
      setSpeaking(true);

      utterance.onend = onNarrationEnd;
      utterance.onerror = onNarrationEnd;

      speechSynthesis.speak(utterance);
    },
    [onNarrationEnd],
  );

  // Handle narration when state changes to "narrating"
  useEffect(() => {
    if (!state?.active || state.phase !== "narrating") return;

    const section = demoSections[state.sectionIndex];
    if (!section) return;

    // Check if we're on the right page
    const currentPath = window.location.pathname + window.location.search;
    const targetPath = section.link;
    if (!currentPath.startsWith(targetPath.split("?")[0])) {
      // Navigate first, narration will resume after navigation
      const newState = { ...state, phase: "navigating" as const };
      setState(newState);
      saveState(newState);
      router.push(section.link);
      return;
    }

    // Start narration
    const text = `Onderdeel ${section.nr}: ${section.titel}. ${section.toelichting}`;
    playNarration(section.nr, text);

    return () => {
      stopPlayback();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.phase, state?.sectionIndex]);

  // After navigation, start narrating
  useEffect(() => {
    if (!state?.active || state.phase !== "navigating") return;

    // Small delay to let the page render
    const timer = setTimeout(() => {
      const newState = { ...state, phase: "narrating" as const };
      setState(newState);
      saveState(newState);
    }, 1500);

    return () => clearTimeout(timer);
  }, [state]);

  const advanceSection = useCallback(() => {
    setState((prev) => {
      if (!prev) return prev;
      const nextIndex = prev.sectionIndex + 1;
      if (nextIndex >= demoSections.length) {
        const done = { ...prev, phase: "done" as const };
        saveState(done);
        return done;
      }
      const next: DemoState = {
        active: true,
        sectionIndex: nextIndex,
        phase: "navigating",
      };
      saveState(next);
      const section = demoSections[nextIndex];
      queueMicrotask(() => router.push(section.link));
      return next;
    });
  }, [router]);

  const startDemo = useCallback(
    (fromIndex = 0) => {
      const initial: DemoState = {
        active: true,
        sectionIndex: fromIndex,
        phase: "navigating",
      };
      setState(initial);
      saveState(initial);
      const section = demoSections[fromIndex];
      router.push(section.link);
    },
    [router],
  );

  const stopDemo = useCallback(() => {
    stopPlayback();
    if (timerRef.current) clearTimeout(timerRef.current);
    clearState();
    setState(null);
  }, [stopPlayback]);

  const pauseDemo = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    } else {
      speechSynthesis.pause();
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    setState((prev) => {
      if (!prev) return prev;
      const paused = { ...prev, phase: "paused" as const };
      saveState(paused);
      return paused;
    });
  }, []);

  const resumeDemo = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
    } else {
      speechSynthesis.resume();
    }
    setState((prev) => {
      if (!prev) return prev;
      const resumed = { ...prev, phase: "narrating" as const };
      saveState(resumed);
      return resumed;
    });
  }, []);

  const skipSection = useCallback(() => {
    stopPlayback();
    if (timerRef.current) clearTimeout(timerRef.current);
    advanceSection();
  }, [advanceSection, stopPlayback]);

  const goToSection = useCallback(
    (index: number) => {
      stopPlayback();
      if (timerRef.current) clearTimeout(timerRef.current);
      const next: DemoState = {
        active: true,
        sectionIndex: index,
        phase: "navigating",
      };
      setState(next);
      saveState(next);
      const section = demoSections[index];
      router.push(section.link);
    },
    [router, stopPlayback],
  );

  // Expose startDemo globally so the demo page button can trigger it
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__startVvcDemo = startDemo;
    (window as unknown as Record<string, unknown>).__stopVvcDemo = stopDemo;
    return () => {
      delete (window as unknown as Record<string, unknown>).__startVvcDemo;
      delete (window as unknown as Record<string, unknown>).__stopVvcDemo;
    };
  }, [startDemo, stopDemo]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!state?.active) return;
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.key === "Escape") {
        stopDemo();
        e.preventDefault();
      }
      if (e.key === " " && state.phase === "paused") {
        resumeDemo();
        e.preventDefault();
      }
      if (e.key === " " && state.phase === "narrating") {
        pauseDemo();
        e.preventDefault();
      }
      if (e.key === "ArrowRight") {
        skipSection();
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state, stopDemo, resumeDemo, pauseDemo, skipSection]);

  if (!state?.active) return null;

  const section = demoSections[state.sectionIndex];
  const isDone = state.phase === "done";
  const isPaused = state.phase === "paused";

  return (
    <>
      {/* Title bar - top */}
      {section && !isDone && (
        <div
          style={{
            position: "fixed",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(26, 108, 168, 0.95)",
            color: "white",
            padding: "10px 24px",
            borderRadius: 8,
            zIndex: 99999,
            fontFamily: "system-ui, sans-serif",
            fontSize: 15,
            fontWeight: 600,
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            pointerEvents: "none",
          }}
        >
          {section.nr}. {section.titel}
        </div>
      )}

      {/* Subtitle bar - bottom */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 99999,
          background: "rgba(0,0,0,0.88)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.3)",
        }}
      >
        {/* Subtitle text */}
        {section && !isDone && (
          <div
            style={{
              padding: "12px 24px 8px",
              fontSize: 14,
              lineHeight: 1.5,
              textAlign: "center",
              maxWidth: 900,
              margin: "0 auto",
            }}
          >
            {section.toelichting}
          </div>
        )}

        {isDone && (
          <div
            style={{
              padding: "12px 24px 8px",
              fontSize: 14,
              textAlign: "center",
            }}
          >
            Demo voltooid!
          </div>
        )}

        {/* Controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            padding: "8px 24px 12px",
            fontSize: 13,
          }}
        >
          {/* Progress */}
          <span style={{ color: "#999", minWidth: 60 }}>
            {state.sectionIndex + 1} / {demoSections.length}
          </span>

          {/* Section selector */}
          <select
            value={state.sectionIndex}
            onChange={(e) => goToSection(Number(e.target.value))}
            style={{
              background: "#333",
              color: "white",
              border: "1px solid #555",
              borderRadius: 4,
              padding: "4px 8px",
              fontSize: 12,
              maxWidth: 200,
            }}
          >
            {demoSections.map((s, i) => (
              <option key={s.nr} value={i}>
                {s.nr}. {s.titel}
              </option>
            ))}
          </select>

          {/* Pause/Resume */}
          {!isDone && (
            <button
              onClick={isPaused ? resumeDemo : pauseDemo}
              style={{
                background: "#555",
                color: "white",
                border: "none",
                borderRadius: 4,
                padding: "6px 14px",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              {isPaused ? "▶ Hervat" : "⏸ Pauze"}
            </button>
          )}

          {/* Skip */}
          {!isDone && (
            <button
              onClick={skipSection}
              style={{
                background: "#555",
                color: "white",
                border: "none",
                borderRadius: 4,
                padding: "6px 14px",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              ⏭ Volgende
            </button>
          )}

          {/* Stop */}
          <button
            onClick={stopDemo}
            style={{
              background: "#c44",
              color: "white",
              border: "none",
              borderRadius: 4,
              padding: "6px 14px",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            ✕ Stop
          </button>

          {/* Audio indicator */}
          {speaking && (
            <span style={{ color: "#4ade80", fontSize: 11 }}>
              {usingAudioRef.current ? "🔊 HD" : "🔊"}
            </span>
          )}

          {/* Keyboard hints */}
          <span style={{ color: "#666", fontSize: 11 }}>
            Spatie = pauze · → = volgende · Esc = stop
          </span>
        </div>
      </div>
    </>
  );
}
