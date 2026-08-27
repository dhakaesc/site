import Link from "next/link";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { effectiveTier } from "@/lib/plans";
import UpgradeButton from "./upgrade-button";

/**
 * Every bullet here is something the product actually does today, except the
 * ones flagged `soon` — those render as "Coming soon" rather than a tick, so
 * nobody pays for a feature that does not exist yet. If you add a bullet,
 * point at the code that delivers it first.
 */
const TIERS = [
  {
    id: "free",
    name: "Free",
    price: "৳0",
    badge: null,
    features: [
      { text: "20 profile visits / month" },
      { text: "3 photos per profile" },
      { text: "1 profile video" },
      { text: "5 messages to up to 5 people" },
    ],
  },
  {
    id: "plus",
    name: "Plus",
    price: "৳1,250/mo",
    badge: "Most popular",
    features: [
      { text: "Unlimited profile visits" },
      { text: "Up to 15 photos" },
      { text: "Up to 5 videos" },
      { text: "Unlimited messaging" },
      { text: "See who liked you" },
    ],
  },
  {
    id: "vip",
    name: "VIP",
    price: "৳3,500/mo",
    badge: null,
    features: [
      { text: "Everything in Plus" },
      { text: "All 30 photos + 10 videos" },
      { text: "Profile Spotlight in search" },
      { text: "Dedicated relationship concierge" },
      { text: "Live video call with matches", soon: true },
    ],
  },
] as const;

export default async function PricingPage() {
  const session = await getSession();

  // Read the tier from the database rather than the session token: the
  // token is issued at login and would be stale after an upgrade.
  let currentTier = "free";
  if (session) {
    const [user] = await db
      .select({ tier: users.tier, tierExpiresAt: users.tierExpiresAt })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);
    if (user) currentTier = effectiveTier(user.tier, user.tierExpiresAt);
  }

  return (
    <div className="px-6 py-12 max-w-5xl mx-auto">
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
          const isCurrent = currentTier === tier.id;
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
                {tier.features.map((f) => {
                  const soon = "soon" in f && f.soon;
                  return (
                    <li
                      key={f.text}
                      className={`text-[13px] flex gap-2 ${soon ? "text-stone" : ""}`}
                    >
                      <span className={soon ? "text-stone-dim" : "text-success"}>
                        {soon ? "○" : "✓"}
                      </span>
                      <span>
                        {f.text}
                        {soon && (
                          <span className="ml-1.5 text-[10px] rounded-full border border-border-hair px-1.5 py-0.5 text-stone-dim align-middle">
                            Coming soon
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
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
    </div>
  );
}
