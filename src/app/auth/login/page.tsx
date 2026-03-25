"use client";

import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Onjuist e-mailadres of wachtwoord.");
      setLoading(false);
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
        <h1 className="text-2xl font-bold text-[#1a6ca8] mb-2">Inloggen</h1>
        <p className="text-sm text-gray-500 mb-6">
          Log in om het applicatieportfolio van gemeenten te bekijken.
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
          <p>Gemeente: gemeente1@swc.nl / test2026</p>
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
