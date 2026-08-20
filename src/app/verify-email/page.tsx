"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("This link is missing its token.");
      return;
    }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? "Verification failed.");
          setStatus("error");
          return;
        }
        setStatus("ok");
      })
      .catch(() => {
        setStatus("error");
        setError("Something went wrong.");
      });
  }, [token]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-[22px] border border-border-hair bg-surface/80 backdrop-blur-xl p-8 text-center">
        <div className="font-serif italic text-2xl mb-4">♥ AMOURA</div>

        {status === "loading" && (
          <p className="text-stone text-sm">Verifying…</p>
        )}
        {status === "ok" && (
          <>
            <p className="text-stone text-sm mb-4">Your email is verified.</p>
            <a
              href="/dashboard"
              className="inline-block rounded-[14px] bg-gradient-to-b from-rose-bright to-rose py-3 px-6 text-sm font-semibold text-white"
            >
              Go to dashboard
            </a>
          </>
        )}
        {status === "error" && (
          <p className="text-danger text-sm">{error}</p>
        )}
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailInner />
    </Suspense>
  );
}
