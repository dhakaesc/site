"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UpgradeButton({
  tier,
  tierName,
  signedIn,
}: {
  tier: string;
  tierName: string;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade() {
    if (!signedIn) {
      router.push("/register");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier }),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Couldn't start checkout.");
      return;
    }

    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
      return;
    }

    // Payment provider not configured yet — the API tells us so explicitly.
    setError(data.message ?? "Payments aren't available yet.");
  }

  return (
    <div>
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="w-full rounded-[14px] bg-gradient-to-b from-gold-bright to-gold py-3 text-sm font-semibold text-[#2a1c05] disabled:opacity-60"
      >
        {loading ? "Starting…" : `Upgrade to ${tierName}`}
      </button>
      {error && <p className="text-danger text-xs mt-2">{error}</p>}
    </div>
  );
}
