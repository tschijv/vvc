"use client";

import Link from "next/link";
import { useState } from "react";

export default function WachtwoordVergetenPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    try {
      const res = await fetch("/api/auth/wachtwoord-vergeten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Er is een fout opgetreden.");
        setLoading(false);
        return;
      }

      setSent(true);
    } catch {
      setError("Er is een fout opgetreden. Probeer het later opnieuw.");
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
          <h1 className="text-xl font-bold text-[#1a6ca8] mb-2">E-mail verzonden</h1>
          <p className="text-sm text-gray-600 mb-6">
            Als dit e-mailadres bij ons bekend is, ontvangt u een e-mail met
            instructies om uw wachtwoord te herstellen.
          </p>
          <Link
            href="/auth/login"
            className="text-sm text-[#1a6ca8] hover:underline font-medium"
          >
            Terug naar inloggen
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
        <h1 className="text-2xl font-bold text-[#1a6ca8] mb-2">
          Wachtwoord vergeten
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Vul uw e-mailadres in. U ontvangt een link om een nieuw wachtwoord in
          te stellen.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a6ca8] text-white py-2.5 px-4 rounded font-medium hover:bg-[#155a8c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Bezig met verzenden..." : "Herstelmail versturen"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link
            href="/auth/login"
            className="text-[#1a6ca8] hover:underline font-medium"
          >
            Terug naar inloggen
          </Link>
        </p>
      </div>
    </div>
  );
}
