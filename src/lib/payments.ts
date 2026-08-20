export const TIER_PRICES = {
  plus: 1250,
  vip: 3500,
} as const;

export type PaidTier = keyof typeof TIER_PRICES;

/** How long a paid plan lasts after approval. */
export const SUBSCRIPTION_DAYS = 30;

/**
 * Numbers users send money to. These come from env vars so they can be
 * changed without a code deploy, with a placeholder fallback so the page
 * still renders (and clearly shows it needs configuring) if unset.
 */
export function getPaymentNumbers() {
  return {
    bkash: process.env.BKASH_NUMBER ?? "01726844679",
    nagad: process.env.NAGAD_NUMBER ?? "Not configured yet",
  };
}

export const PAYMENT_METHODS = ["bkash", "nagad"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
