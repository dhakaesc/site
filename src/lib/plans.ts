export type Tier = "free" | "plus" | "vip";

/**
 * Free members get a deliberately small allowance — the product strategy is
 * to convert them to a paid plan, so these limits are the main upgrade lever.
 */
/**
 * NOTE: `videos` is a placeholder for a feature that is NOT built — there is no
 * video table, upload route or player anywhere in the app. Nothing reads it.
 * Do not advertise video on the pricing page until that changes.
 */
export const PLAN_LIMITS = {
  free: {
    messages: 5,
    people: 5, // max distinct people a free member can message
    photos: 3,
    videos: 1,
    profileVisits: 20,
  },
  plus: {
    messages: Infinity,
    people: Infinity,
    photos: 15,
    videos: 5,
    profileVisits: Infinity,
  },
  vip: {
    messages: Infinity,
    people: Infinity,
    photos: 30,
    videos: 10,
    profileVisits: Infinity,
  },
} as const;

export function limitsFor(tier: string) {
  return PLAN_LIMITS[(tier as Tier) in PLAN_LIMITS ? (tier as Tier) : "free"];
}

/**
 * The tier a member is actually entitled to right now.
 *
 * Paid plans are time-limited, so an expired subscription falls back to
 * free rather than staying paid forever. Every entitlement check should
 * go through this instead of reading `user.tier` directly.
 */
export function effectiveTier(
  tier: string,
  tierExpiresAt: Date | string | null | undefined
): Tier {
  if (tier === "free" || !(tier in PLAN_LIMITS)) return "free";
  if (!tierExpiresAt) return "free";

  const expiry =
    tierExpiresAt instanceof Date ? tierExpiresAt : new Date(tierExpiresAt);
  return expiry.getTime() > Date.now() ? (tier as Tier) : "free";
}

export function isPaid(tier: string) {
  return tier === "plus" || tier === "vip";
}
