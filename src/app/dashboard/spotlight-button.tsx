"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SpotlightButton({
  isVip,
  initiallyActive,
}: {
  isVip: boolean;
  initiallyActive: boolean;
}) {
  const router = useRouter();
  const [active, setActive] = useState(initiallyActive);
  const [loading, setLoading] = useState(false);

  if (!isVip) {
    return (
      <a
        href="/pricing"
        className="rounded-[14px] border border-border-hair px-6 py-3 text-sm font-semibold text-stone"
      >
        Spotlight (VIP)
      </a>
    );
  }

  async function activate() {
    setLoading(true);
    const res = await fetch("/api/spotlight", { method: "POST" });
    setLoading(false);
    if (res.ok) {
      setActive(true);
      router.refresh();
    }
  }

  if (active) {
    return (
      <span className="rounded-[14px] border border-gold-bright/40 bg-gold-bright/10 px-6 py-3 text-sm font-semibold text-gold-bright">
        Spotlight active
      </span>
    );
  }

  return (
    <button
      onClick={activate}
      disabled={loading}
      className="rounded-[14px] border border-border-hair px-6 py-3 text-sm font-semibold disabled:opacity-60"
    >
      {loading ? "Activating…" : "Activate spotlight"}
    </button>
  );
}
