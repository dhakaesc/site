"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);
    const data = await res.json().catch(() => ({}));
    setMessage(data.message ?? "If that email has an account, a reset link is on its way.");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-[22px] border border-border-hair bg-surface/80 backdrop-blur-xl p-8">
        <div className="mb-6 text-center">
          <div className="font-serif italic text-2xl">♥ AMOURA</div>
          <p className="text-stone text-sm mt-2">Reset your password</p>
        </div>

        {message ? (
          <p className="text-stone text-sm text-center">{message}</p>
        ) : (
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

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[14px] bg-gradient-to-b from-rose-bright to-rose py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <p className="text-stone text-xs text-center mt-6">
          <a href="/login" className="text-gold-bright">
            Back to log in
          </a>
        </p>
      </div>
    </main>
  );
}
