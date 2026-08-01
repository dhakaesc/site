import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { paymentRequests } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { TIER_PRICES, PAYMENT_METHODS } from "@/lib/payments";

const schema = z.object({
  tier: z.enum(["plus", "vip"]),
  method: z.enum(PAYMENT_METHODS),
  senderNumber: z
    .string()
    .trim()
    .regex(/^01[3-9]\d{8}$/, "Enter a valid 11-digit Bangladeshi number."),
  transactionId: z.string().trim().min(4).max(60),
});

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(paymentRequests)
    .where(eq(paymentRequests.userId, session.userId))
    .orderBy(desc(paymentRequests.createdAt))
    .limit(10);

  return NextResponse.json({ requests: rows });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          parsed.error.issues[0]?.message ?? "Please check the details you entered.",
      },
      { status: 400 }
    );
  }

  const { tier, method, senderNumber, transactionId } = parsed.data;

  // Don't let someone queue up several pending requests at once.
  const [existingPending] = await db
    .select({ id: paymentRequests.id })
    .from(paymentRequests)
    .where(
      and(
        eq(paymentRequests.userId, session.userId),
        eq(paymentRequests.status, "pending")
      )
    )
    .limit(1);

  if (existingPending) {
    return NextResponse.json(
      {
        error:
          "You already have a payment awaiting review. We'll activate your plan shortly.",
      },
      { status: 409 }
    );
  }

  // transaction_id is UNIQUE in the schema, so a duplicate submission
  // (whether by the same user or someone reusing an ID) fails here.
  try {
    const [request] = await db
      .insert(paymentRequests)
      .values({
        userId: session.userId,
        tier,
        amount: TIER_PRICES[tier],
        method,
        senderNumber,
        transactionId: transactionId.toUpperCase(),
      })
      .returning();

    return NextResponse.json({ request });
  } catch {
    return NextResponse.json(
      {
        error:
          "That transaction ID has already been submitted. Please check and try again.",
      },
      { status: 409 }
    );
  }
}
