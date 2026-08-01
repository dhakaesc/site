import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { paymentRequests, users } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { SUBSCRIPTION_DAYS } from "@/lib/payments";

async function requireAdmin() {
  const session = await getSession();
  return session?.isAdmin ? session : null;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const rows = await db
    .select({
      id: paymentRequests.id,
      tier: paymentRequests.tier,
      amount: paymentRequests.amount,
      method: paymentRequests.method,
      senderNumber: paymentRequests.senderNumber,
      transactionId: paymentRequests.transactionId,
      status: paymentRequests.status,
      adminNote: paymentRequests.adminNote,
      createdAt: paymentRequests.createdAt,
      reviewedAt: paymentRequests.reviewedAt,
      userId: users.id,
      userName: users.name,
      userEmail: users.email,
    })
    .from(paymentRequests)
    .innerJoin(users, eq(paymentRequests.userId, users.id))
    .orderBy(desc(paymentRequests.createdAt))
    .limit(200);

  return NextResponse.json({ payments: rows });
}

const reviewSchema = z.object({
  requestId: z.number().int(),
  action: z.enum(["approve", "reject"]),
  note: z.string().max(500).optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const parsed = reviewSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const { requestId, action, note } = parsed.data;

  const [request] = await db
    .select()
    .from(paymentRequests)
    .where(eq(paymentRequests.id, requestId))
    .limit(1);

  if (!request) {
    return NextResponse.json({ error: "Request not found." }, { status: 404 });
  }

  if (request.status !== "pending") {
    return NextResponse.json(
      { error: `This payment was already ${request.status}.` },
      { status: 409 }
    );
  }

  await db
    .update(paymentRequests)
    .set({
      status: action === "approve" ? "approved" : "rejected",
      adminNote: note ?? "",
      reviewedByUserId: session.userId,
      reviewedAt: new Date(),
    })
    .where(eq(paymentRequests.id, requestId));

  if (action === "approve") {
    const [member] = await db
      .select({ tierExpiresAt: users.tierExpiresAt, tier: users.tier })
      .from(users)
      .where(eq(users.id, request.userId))
      .limit(1);

    // If they still have time left on the same plan, extend it rather
    // than cutting the remaining days short.
    const now = new Date();
    const base =
      member?.tier === request.tier &&
      member.tierExpiresAt &&
      member.tierExpiresAt > now
        ? member.tierExpiresAt
        : now;

    const expiresAt = new Date(base);
    expiresAt.setDate(expiresAt.getDate() + SUBSCRIPTION_DAYS);

    await db
      .update(users)
      .set({ tier: request.tier, tierExpiresAt: expiresAt })
      .where(eq(users.id, request.userId));
  }

  return NextResponse.json({ ok: true });
}
