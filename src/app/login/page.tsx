"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthShell from "../_shared/auth-shell";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

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

    router.push(next);
    router.refresh();
  }

  return (
    <AuthShell title="Welcome back" sub="Sign in to continue browsing.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-stone mb-1.5">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field-input"
            placeholder="you@email.com"
          />
        </div>

        <div>
          <span className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-stone">Password</label>
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
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-danger text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-[14px] bg-gradient-to-b from-rose-bright to-rose py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-stone text-center text-[13px] mt-5">
        New here?{" "}
        <a href="/register" className="text-gold-bright">
          Create a free profile
        </a>
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
