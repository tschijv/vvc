"use client";

import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useRef, Suspense } from "react";

function TotpInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, "").split("").slice(0, 6);

  const handleChange = (index: number, char: string) => {
    // Only allow digits
    if (char && !/^\d$/.test(char)) return;

    const newDigits = [...digits];
    newDigits[index] = char;
    const newValue = newDigits.join("").trim();
    onChange(newValue);

    // Auto-advance to next box
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
          autoFocus={i === 0}
          aria-label={`Cijfer ${i + 1} van 6`}
          className="w-12 h-14 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6ca8] focus:border-transparent bg-white dark:bg-slate-700 dark:border-slate-500 dark:text-slate-100"
        />
      ))}
    </div>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const raw = searchParams.get("callbackUrl") || "/";
  const callbackUrl = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTotp, setShowTotp] = useState(false);
  const [totpToken, setTotpToken] = useState("");
  const [savedEmail, setSavedEmail] = useState("");
  const [savedPassword, setSavedPassword] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Save credentials for TOTP resubmit
    if (!showTotp) {
      setSavedEmail(email);
      setSavedPassword(password);
    }

    const result = await signIn("credentials", {
      email: showTotp ? savedEmail : email,
      password: showTotp ? savedPassword : password,
      totpToken: showTotp ? totpToken : undefined,
      redirect: false,
    });

    if (result?.error) {
      if (result.code === "TOTP_REQUIRED") {
        setShowTotp(true);
        setTotpToken("");
        setLoading(false);
        return;
      }
      if (result.code === "TOTP_INVALID") {
        setError("Ongeldige verificatiecode. Probeer opnieuw.");
        setTotpToken("");
        setLoading(false);
        return;
      }
      setError("Onjuist e-mailadres of wachtwoord.");
      setLoading(false);
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  async function handleTotpSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email: savedEmail,
      password: savedPassword,
      totpToken,
      redirect: false,
    });

    if (result?.error) {
      if (result.code === "TOTP_INVALID") {
        setError("Ongeldige verificatiecode. Probeer opnieuw.");
        setTotpToken("");
        setLoading(false);
        return;
      }
      setError("Er ging iets mis. Probeer opnieuw.");
      setLoading(false);
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  if (showTotp) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold text-[#1a6ca8] dark:text-blue-400 mb-2">
            Tweestapsverificatie
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
            Voer de 6-cijferige code in uit je authenticator-app.
          </p>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleTotpSubmit} className="space-y-6">
            <TotpInput value={totpToken} onChange={setTotpToken} />

            <button
              type="submit"
              disabled={loading || totpToken.length < 6}
              className="w-full bg-[#1a6ca8] text-white py-2.5 px-4 rounded font-medium hover:bg-[#155a8c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Verifiëren..." : "Verifiëren"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowTotp(false);
                setTotpToken("");
                setError("");
              }}
              className="w-full text-sm text-[#1a6ca8] dark:text-blue-400 hover:underline"
            >
              Terug naar inloggen
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
        <h1 className="text-2xl font-bold text-[#1a6ca8] mb-2">Inloggen</h1>
        <p className="text-sm text-gray-500 mb-6">
          Log in om het applicatieportfolio te bekijken.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-mailadres
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1a6ca8] focus:border-transparent"
              placeholder="uw@email.nl"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Wachtwoord
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1a6ca8] focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a6ca8] text-white py-2.5 px-4 rounded font-medium hover:bg-[#155a8c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Bezig met inloggen..." : "Inloggen"}
          </button>

          <p className="text-right">
            <a href="/auth/wachtwoord-vergeten" className="text-sm text-[#1a6ca8] hover:underline">
              Wachtwoord vergeten?
            </a>
          </p>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Nog geen account?{" "}
          <a href="/auth/registreren" className="text-[#1a6ca8] hover:underline font-medium">
            Registreer uw organisatie
          </a>
        </p>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded text-xs text-gray-600">
          <p className="font-semibold text-[#1a6ca8] mb-1">Test-accounts:</p>
          <p>Admin: admin@swc.nl / admin2026</p>
          <p>Beheerder: gemeente1@swc.nl / test2026</p>
          <p>Leverancier: leverancier1@swc.nl / test2026</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto mt-16 text-center text-gray-500">Laden...</div>}>
      <LoginForm />
    </Suspense>
  );
}
