"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!token) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
          <h1 className="text-xl font-bold text-red-600 mb-2">
            Ongeldige link
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Deze link is ongeldig. Vraag een nieuwe herstelmail aan.
          </p>
          <Link
            href="/auth/wachtwoord-vergeten"
            className="text-sm text-[#1a6ca8] hover:underline font-medium"
          >
            Nieuw verzoek indienen
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const wachtwoord = formData.get("wachtwoord") as string;
    const wachtwoord2 = formData.get("wachtwoord2") as string;

    if (wachtwoord !== wachtwoord2) {
      setError("Wachtwoorden komen niet overeen.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/wachtwoord-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, wachtwoord }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Er is een fout opgetreden.");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Er is een fout opgetreden. Probeer het later opnieuw.");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
          <h1 className="text-xl font-bold text-[#1a6ca8] mb-2">
            Wachtwoord gewijzigd
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Uw wachtwoord is succesvol gewijzigd. U kunt nu inloggen met uw
            nieuwe wachtwoord.
          </p>
          <Link
            href="/auth/login"
            className="inline-block bg-[#1a6ca8] text-white py-2.5 px-6 rounded font-medium hover:bg-[#155a8c] transition-colors"
          >
            Inloggen
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
        <h1 className="text-2xl font-bold text-[#1a6ca8] mb-2">
          Nieuw wachtwoord
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Kies een nieuw wachtwoord voor uw account.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="wachtwoord"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nieuw wachtwoord{" "}
              <span className="text-gray-400 font-normal">(min. 8 tekens)</span>
            </label>
            <input
              id="wachtwoord"
              name="wachtwoord"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1a6ca8] focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="wachtwoord2"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Wachtwoord bevestigen
            </label>
            <input
              id="wachtwoord2"
              name="wachtwoord2"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1a6ca8] focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a6ca8] text-white py-2.5 px-4 rounded font-medium hover:bg-[#155a8c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Bezig met opslaan..." : "Wachtwoord wijzigen"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function WachtwoordResetPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto mt-16 text-center text-gray-500">
          Laden...
        </div>
      }
    >
      <ResetForm />
    </Suspense>
  );
}
