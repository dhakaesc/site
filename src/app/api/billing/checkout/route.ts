import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";

const schema = z.object({
  tier: z.enum(["plus", "vip"]),
});

/**
 * Checkout entry point.
 *
 * No payment provider is wired up yet — doing that requires a real merchant
 * account (SSLCOMMERZ / bKash for BDT, or Stripe) with credentials that only
 * the account owner can create. Until those exist this endpoint deliberately
 * fails loudly rather than pretending an upgrade succeeded, because silently
 * granting a paid tier without taking payment would be worse than an error.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  return NextResponse.json(
    {
      error: "Payments aren't set up yet.",
      message:
        "Card and bKash payments are coming soon. Contact support to upgrade in the meantime.",
    },
    { status: 503 }
  );
}
