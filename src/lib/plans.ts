export type Tier = "free" | "plus" | "vip";

/**
 * Free members get a deliberately small allowance — the product strategy is
 * to convert them to a paid plan, so these limits are the main upgrade lever.
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

export function isPaid(tier: string) {
  return tier === "plus" || tier === "vip";
}
