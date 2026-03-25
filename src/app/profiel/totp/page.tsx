"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Breadcrumbs from "@/ui/components/Breadcrumbs";

function TotpCodeInput({
  value,
  onChange,
  autoFocusFirst,
}: {
  value: string;
  onChange: (val: string) => void;
  autoFocusFirst?: boolean;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, "").split("").slice(0, 6);

  const handleChange = (index: number, char: string) => {
    if (char && !/^\d$/.test(char)) return;
    const newDigits = [...digits];
    newDigits[index] = char;
    onChange(newDigits.join("").trim());
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          autoFocus={autoFocusFirst && i === 0}
          aria-label={`Cijfer ${i + 1} van 6`}
          className="w-12 h-14 text-center text-2xl font-mono border border-gray-300 dark:border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6ca8] focus:border-transparent bg-white dark:bg-slate-700 dark:text-slate-100"
        />
      ))}
    </div>
  );
}

type SetupStep = "idle" | "loading" | "qr" | "verifying" | "success";
type DisableStep = "idle" | "confirm" | "verifying";

export default function TotpPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [totpEnabled, setTotpEnabled] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [setupStep, setSetupStep] = useState<SetupStep>("idle");
  const [disableStep, setDisableStep] = useState<DisableStep>("idle");
  const [secret, setSecret] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/profiel/totp");
      return;
    }
    if (status === "authenticated" && session?.user) {
      setIsAdmin(session.user.role === "ADMIN");
      // Fetch current TOTP status
      fetch("/api/profiel")
        .then((res) => res.json())
        .then((data) => {
          setTotpEnabled(data.user?.totpEnabled ?? false);
          setPageLoading(false);
        })
        .catch(() => {
          setPageLoading(false);
        });
    }
  }, [status, session, router]);

  const handleStartSetup = async () => {
    setSetupStep("loading");
    setError("");
    try {
      const res = await fetch("/api/totp/setup");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Er ging iets mis");
      }
      const data = await res.json();
      setSecret(data.secret);
      setQrCodeDataUrl(data.qrCodeDataUrl);
      setSetupStep("qr");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis");
      setSetupStep("idle");
    }
  };

  const handleVerifyAndEnable = async () => {
    setSetupStep("verifying");
    setError("");
    try {
      const res = await fetch("/api/totp/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, token }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Ongeldige code");
      }
      setSetupStep("success");
      setTotpEnabled(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis");
      setToken("");
      setSetupStep("qr");
    }
  };

  const handleDisable = async () => {
    setDisableStep("verifying");
    setError("");
    try {
      const res = await fetch("/api/totp/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Ongeldige code");
      }
      setTotpEnabled(false);
      setDisableStep("idle");
      setToken("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis");
      setToken("");
      setDisableStep("confirm");
    }
  };

  if (status === "loading" || pageLoading) {
    return (
      <div>
        <div className="h-4 w-48 bg-gray-200 dark:bg-slate-700 animate-pulse rounded mb-4" />
        <div className="h-7 w-64 bg-gray-200 dark:bg-slate-700 animate-pulse rounded mb-4" />
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg p-6">
          <div className="h-40 bg-gray-100 dark:bg-slate-700 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Mijn profiel", href: "/profiel" },
          { label: "Tweestapsverificatie", href: "/profiel/totp" },
        ]}
      />
      <h1 className="text-2xl font-bold text-[#1a6ca8] dark:text-blue-400 mb-4">
        Tweestapsverificatie (2FA)
      </h1>

      {/* Admin exemption notice */}
      {isAdmin && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            2FA is niet vereist voor administrators. Je account heeft altijd toegang zonder tweestapsverificatie.
          </p>
        </div>
      )}

      {/* Current status */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-600">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Status</h2>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                totpEnabled
                  ? "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300"
                  : "bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-slate-400"
              }`}
            >
              {totpEnabled ? "Actief" : "Inactief"}
            </span>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          {/* TOTP not enabled - show enable flow */}
          {!totpEnabled && setupStep === "idle" && (
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                Tweestapsverificatie voegt een extra beveiligingslaag toe aan je account.
                Na het inschakelen moet je bij het inloggen naast je wachtwoord ook een code
                uit je authenticator-app invoeren.
              </p>
              <button
                onClick={handleStartSetup}
                className="px-4 py-2 bg-[#1a6ca8] text-white rounded text-sm font-medium hover:bg-[#155a8c] transition-colors"
              >
                2FA Inschakelen
              </button>
            </div>
          )}

          {setupStep === "loading" && (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-[#1a6ca8] border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-sm text-gray-500 dark:text-slate-400">QR-code genereren...</p>
            </div>
          )}

          {/* QR code step */}
          {setupStep === "qr" && (
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                  Scan de QR-code met je authenticator-app (bijv. Google Authenticator, Authy, of 1Password).
                </p>

                {/* QR Code */}
                <div className="flex justify-center mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrCodeDataUrl}
                    alt="QR-code voor tweestapsverificatie"
                    className="w-64 h-64 border border-gray-200 dark:border-slate-600 rounded-lg"
                  />
                </div>

                {/* Manual entry key */}
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">
                    Kun je de QR-code niet scannen? Voer deze sleutel handmatig in:
                  </p>
                  <code className="text-sm font-mono text-gray-900 dark:text-slate-100 select-all break-all">
                    {secret}
                  </code>
                </div>
              </div>

              {/* Verify token */}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3 text-center">
                  Voer de 6-cijferige code uit je app in ter verificatie:
                </p>
                <TotpCodeInput value={token} onChange={setToken} autoFocusFirst />
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setSetupStep("idle");
                    setToken("");
                    setError("");
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-500 text-gray-700 dark:text-slate-300 rounded text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleVerifyAndEnable}
                  disabled={token.length < 6}
                  className="px-4 py-2 bg-[#1a6ca8] text-white rounded text-sm font-medium hover:bg-[#155a8c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Verifiëren en inschakelen
                </button>
              </div>
            </div>
          )}

          {setupStep === "verifying" && (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-[#1a6ca8] border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-sm text-gray-500 dark:text-slate-400">Code verifiëren...</p>
            </div>
          )}

          {/* Success */}
          {setupStep === "success" && (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">
                  Tweestapsverificatie is ingeschakeld!
                </p>
                <p className="text-sm text-green-700 dark:text-green-400">
                  Vanaf nu moet je bij het inloggen een code uit je authenticator-app invoeren.
                </p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">
                  Belangrijk
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Bewaar je authenticator app. Bij verlies moet een administrator je 2FA resetten.
                </p>
              </div>

              <button
                onClick={() => router.push("/profiel")}
                className="px-4 py-2 bg-[#1a6ca8] text-white rounded text-sm font-medium hover:bg-[#155a8c] transition-colors"
              >
                Terug naar profiel
              </button>
            </div>
          )}

          {/* TOTP enabled - show disable flow */}
          {totpEnabled && disableStep === "idle" && setupStep !== "success" && (
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                Tweestapsverificatie is actief op je account. Bij het inloggen wordt
                gevraagd om een code uit je authenticator-app.
              </p>
              <button
                onClick={() => {
                  setDisableStep("confirm");
                  setToken("");
                  setError("");
                }}
                className="px-4 py-2 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 rounded text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                2FA Uitschakelen
              </button>
            </div>
          )}

          {disableStep === "confirm" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Voer je huidige verificatiecode in om 2FA uit te schakelen:
              </p>
              <TotpCodeInput value={token} onChange={setToken} autoFocusFirst />
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setDisableStep("idle");
                    setToken("");
                    setError("");
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-500 text-gray-700 dark:text-slate-300 rounded text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleDisable}
                  disabled={token.length < 6}
                  className="px-4 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  2FA Uitschakelen
                </button>
              </div>
            </div>
          )}

          {disableStep === "verifying" && (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-sm text-gray-500 dark:text-slate-400">Code verifiëren...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
