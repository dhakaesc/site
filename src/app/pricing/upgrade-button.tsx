"use client";

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

  function handleUpgrade() {
    router.push(
      signedIn ? `/upgrade?tier=${tier}` : `/register?next=/upgrade?tier=${tier}`
    );
  }

  return (
    <button
      onClick={handleUpgrade}
      className="w-full rounded-[14px] bg-gradient-to-b from-gold-bright to-gold py-3 text-sm font-semibold text-[#2a1c05]"
    >
      Upgrade to {tierName}
    </button>
  );
}
