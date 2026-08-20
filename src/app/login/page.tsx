"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-[22px] border border-border-hair bg-surface/80 backdrop-blur-xl p-8">
        <div className="mb-6 text-center">
          <div className="font-serif italic text-2xl">♥ AMOURA</div>
          <p className="text-stone text-sm mt-2">Welcome back</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="block text-xs text-stone mb-1.5">Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field-input"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-stone">Password</span>
              <a href="/forgot-password" className="text-xs text-gold-bright">
                Forgot password?
              </a>
            </span>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field-input"
              placeholder="Your password"
            />
          </label>

          {error && <p className="text-danger text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[14px] bg-gradient-to-b from-rose-bright to-rose py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="text-stone text-xs text-center mt-6">
          New here?{" "}
          <a href="/register" className="text-gold-bright">
            Create a free profile
          </a>
        </p>
      </div>
    </main>
  );
}
