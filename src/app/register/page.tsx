"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "../_shared/auth-shell";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "female",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        age: Number(form.age),
        gender: form.gender,
        email: form.email,
        phone: form.phone,
        password: form.password,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }

    router.push("/profile/edit");
    router.refresh();
  }

  return (
    <AuthShell
      title="Create your profile"
      sub="Takes about 2 minutes. Free to join."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-stone mb-1.5">I am a</label>
          <div className="flex gap-2">
            {[
              { v: "female", l: "Woman" },
              { v: "male", l: "Man" },
              { v: "other", l: "Other" },
            ].map((o) => (
              <button
                key={o.v}
                type="button"
                onClick={() => setForm({ ...form, gender: o.v })}
                className={`flex-1 rounded-full py-2.5 text-xs font-semibold border ${
                  form.gender === o.v
                    ? "bg-rose/15 border-rose/35 text-[#F3B4BE]"
                    : "border-border-hair text-stone"
                }`}
              >
                {o.l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-stone mb-1.5">Full name</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="field-input"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-xs text-stone mb-1.5">Age</label>
          <input
            required
            type="number"
            min={18}
            max={100}
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
            className="field-input"
            placeholder="25"
          />
        </div>

        <div>
          <label className="block text-xs text-stone mb-1.5">
            Phone number <span className="text-rose-bright">*</span>
          </label>
          <input
            required
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="field-input"
            placeholder="+880 1XXX-XXXXXX"
          />
        </div>

        <div>
          <label className="block text-xs text-stone mb-1.5">Email</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="field-input"
            placeholder="you@email.com"
          />
        </div>

        <div>
          <label className="block text-xs text-stone mb-1.5">Password</label>
          <input
            required
            type="password"
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="field-input"
            placeholder="Create a password"
          />
        </div>

        <p className="text-stone text-[11px] -mt-1">
          Your phone number is never shown publicly — we call it once to verify
          your account, and it is used only for account security.
        </p>

        {error && <p className="text-danger text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-[14px] bg-gradient-to-b from-rose-bright to-rose py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create free profile"}
        </button>
      </form>

      <p className="text-stone text-center text-[13px] mt-5">
        Already a member?{" "}
        <a href="/login" className="text-gold-bright">
          Sign in
        </a>
      </p>
    </AuthShell>
  );
}
