"use client";

import Link from "next/link";
import { useState } from "react";

export default function RegistrerenPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const naam = formData.get("naam") as string;
    const email = formData.get("email") as string;
    const wachtwoord = formData.get("wachtwoord") as string;
    const wachtwoord2 = formData.get("wachtwoord2") as string;
    const organisatieType = formData.get("organisatieType") as string;
    const organisatieNaam = formData.get("organisatieNaam") as string;

    if (wachtwoord !== wachtwoord2) {
      setError("Wachtwoorden komen niet overeen.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/registreren", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ naam, email, wachtwoord, organisatieType, organisatieNaam }),
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
          <div className="text-4xl mb-4">✅</div>
          <h1 className="text-xl font-bold text-[#1a6ca8] mb-2">Aanmelding ontvangen</h1>
          <p className="text-sm text-gray-600 mb-6">
            Uw registratie is ontvangen en wordt beoordeeld door een beheerder.
            U ontvangt bericht zodra uw account is geactiveerd.
          </p>
          <Link
            href="/auth/login"
            className="text-sm text-[#1a6ca8] hover:underline font-medium"
          >
            ← Terug naar inloggen
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
        <h1 className="text-2xl font-bold text-[#1a6ca8] mb-2">Registreren</h1>
        <p className="text-sm text-gray-500 mb-6">
          Meld u en uw organisatie aan voor de Voorzieningencatalogus.
          Na beoordeling door een beheerder wordt uw account geactiveerd.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="naam" className="block text-sm font-medium text-gray-700 mb-1">
              Naam
            </label>
            <input
              id="naam"
              name="naam"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1a6ca8] focus:border-transparent"
              placeholder="Uw volledige naam"
            />
          </div>

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
              placeholder="uw@organisatie.nl"
            />
          </div>

          <div>
            <label htmlFor="wachtwoord" className="block text-sm font-medium text-gray-700 mb-1">
              Wachtwoord <span className="text-gray-400 font-normal">(min. 8 tekens)</span>
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
            <label htmlFor="wachtwoord2" className="block text-sm font-medium text-gray-700 mb-1">
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

          <fieldset className="border border-gray-200 rounded p-4">
            <legend className="text-sm font-medium text-gray-700 px-1">Type organisatie</legend>
            <div className="flex gap-6 mt-1">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="radio" name="organisatieType" value="leverancier" required className="text-[#1a6ca8]" />
                Leverancier
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="radio" name="organisatieType" value="gemeente" className="text-[#1a6ca8]" />
                Gemeente
              </label>
            </div>
          </fieldset>

          <div>
            <label htmlFor="organisatieNaam" className="block text-sm font-medium text-gray-700 mb-1">
              Naam van uw organisatie
            </label>
            <input
              id="organisatieNaam"
              name="organisatieNaam"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1a6ca8] focus:border-transparent"
              placeholder="Bijv. Centric of uw organisatienaam"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a6ca8] text-white py-2.5 px-4 rounded font-medium hover:bg-[#155a8c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Bezig met registreren..." : "Registreren"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Al een account?{" "}
          <Link href="/auth/login" className="text-[#1a6ca8] hover:underline font-medium">
            Inloggen
          </Link>
        </p>
      </div>
    </div>
  );
}
