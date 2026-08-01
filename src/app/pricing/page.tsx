import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import UpgradeButton from "./upgrade-button";

const TIERS = [
  {
    id: "free",
    name: "Free",
    price: "৳0",
    badge: null,
    features: [
      "20 profile visits / month",
      "3 photos per profile",
      "1 free video per profile",
      "5 messages to up to 5 people",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    price: "৳1,250/mo",
    badge: "Most popular",
    features: [
      "Unlimited profile visits",
      "Up to 15 photos",
      "Up to 5 videos",
      "Unlimited messaging",
      "See who liked you",
    ],
  },
  {
    id: "vip",
    name: "VIP",
    price: "৳3,500/mo",
    badge: "Video call",
    features: [
      "Everything in Plus",
      "All 30 photos + 10 videos",
      "Live video call with matches",
      "Profile Spotlight in search",
      "Dedicated relationship concierge",
    ],
  },
] as const;

export default async function PricingPage() {
  const session = await getSession();

  return (
    <main className="min-h-screen px-6 py-12 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <Link href="/" className="font-serif italic text-xl">
          ♥ AMOURA
        </Link>
        <Link
          href={session ? "/dashboard" : "/login"}
          className="text-sm text-stone hover:text-ivory"
        >
          {session ? "Dashboard" : "Log in"}
        </Link>
      </div>

      <div className="text-center mb-10">
        <h1 className="font-serif text-3xl mb-2">Choose your membership</h1>
        <p className="text-stone text-sm">
          Upgrade any time. Cancel any time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {TIERS.map((tier) => {
          const isCurrent = (session?.tier ?? "free") === tier.id;
          const featured = tier.id === "plus";

          return (
            <div
              key={tier.id}
              className={`rounded-[22px] border p-7 flex flex-col ${
                featured
                  ? "border-border-hair-2 bg-surface-2"
                  : "border-border-hair bg-surface"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-stone">{tier.name}</span>
                {tier.badge && (
                  <span className="text-[10px] rounded-full bg-gold/20 text-gold-bright px-2.5 py-1">
                    {tier.badge}
                  </span>
                )}
              </div>

              <div className="font-mono text-3xl my-3">{tier.price}</div>

              <ul className="space-y-2 mb-6 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="text-[13px] flex gap-2">
                    <span className="text-success">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div className="rounded-[14px] border border-border-hair py-3 text-center text-sm text-stone">
                  Your current plan
                </div>
              ) : tier.id === "free" ? (
                <Link
                  href={session ? "/dashboard" : "/register"}
                  className="rounded-[14px] border border-border-hair py-3 text-center text-sm font-semibold"
                >
                  {session ? "Dashboard" : "Start free"}
                </Link>
              ) : (
                <UpgradeButton
                  tier={tier.id}
                  tierName={tier.name}
                  signedIn={Boolean(session)}
                />
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
