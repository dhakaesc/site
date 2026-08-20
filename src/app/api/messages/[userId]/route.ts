import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq, or, asc, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { messages, users, likes, blocks } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { limitsFor, effectiveTier } from "@/lib/plans";

/** Two users may chat only if they have both liked each other. */
async function areMatched(a: number, b: number) {
  const rows = await db
    .select({ fromUserId: likes.fromUserId })
    .from(likes)
    .where(
      and(
        eq(likes.liked, true),
        or(
          and(eq(likes.fromUserId, a), eq(likes.toUserId, b)),
          and(eq(likes.fromUserId, b), eq(likes.toUserId, a))
        )
      )
    );
  return rows.length === 2;
}

/** True if either user has blocked the other. */
async function isBlocked(a: number, b: number) {
  const rows = await db
    .select({ id: blocks.id })
    .from(blocks)
    .where(
      or(
        and(eq(blocks.blockerUserId, a), eq(blocks.blockedUserId, b)),
        and(eq(blocks.blockerUserId, b), eq(blocks.blockedUserId, a))
      )
    )
    .limit(1);
  return rows.length > 0;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { userId } = await params;
  const otherId = Number(userId);
  if (!Number.isInteger(otherId)) {
    return NextResponse.json({ error: "Invalid user." }, { status: 400 });
  }

  if (!(await areMatched(session.userId, otherId))) {
    return NextResponse.json(
      { error: "You can only message people you've matched with." },
      { status: 403 }
    );
  }

  if (await isBlocked(session.userId, otherId)) {
    return NextResponse.json(
      { error: "This conversation is no longer available." },
      { status: 403 }
    );
  }

  const [other] = await db
    .select({ id: users.id, name: users.name, age: users.age })
    .from(users)
    .where(eq(users.id, otherId))
    .limit(1);

  if (!other) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const thread = await db
    .select()
    .from(messages)
    .where(
      or(
        and(
          eq(messages.fromUserId, session.userId),
          eq(messages.toUserId, otherId)
        ),
        and(
          eq(messages.fromUserId, otherId),
          eq(messages.toUserId, session.userId)
        )
      )
    )
    .orderBy(asc(messages.createdAt));

  // Mark their messages to me as read.
  await db
    .update(messages)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(messages.fromUserId, otherId),
        eq(messages.toUserId, session.userId),
        isNull(messages.readAt)
      )
    );

  return NextResponse.json({
    other,
    messages: thread.map((m) => ({
      id: m.id,
      body: m.body,
      fromMe: m.fromUserId === session.userId,
      createdAt: m.createdAt,
    })),
  });
}

const sendSchema = z.object({
  body: z.string().trim().min(1).max(2000),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { userId } = await params;
  const otherId = Number(userId);
  if (!Number.isInteger(otherId) || otherId === session.userId) {
    return NextResponse.json({ error: "Invalid recipient." }, { status: 400 });
  }

  const parsed = sendSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Message can't be empty." },
      { status: 400 }
    );
  }

  if (!(await areMatched(session.userId, otherId))) {
    return NextResponse.json(
      { error: "You can only message people you've matched with." },
      { status: 403 }
    );
  }

  if (await isBlocked(session.userId, otherId)) {
    return NextResponse.json(
      { error: "This conversation is no longer available." },
      { status: 403 }
    );
  }

  const [me] = await db
    .select({
      tier: users.tier,
      tierExpiresAt: users.tierExpiresAt,
      messagesUsed: users.messagesUsed,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  const limits = limitsFor(
    effectiveTier(me?.tier ?? "free", me?.tierExpiresAt)
  );

  // Free members have both a total message cap and a cap on how many
  // distinct people they can message. Paid tiers skip both.
  if (Number.isFinite(limits.messages)) {
    if ((me?.messagesUsed ?? 0) >= limits.messages) {
      return NextResponse.json(
        {
          error: `You've used all ${limits.messages} free messages. Upgrade to Plus for unlimited messaging.`,
          upgradeRequired: true,
        },
        { status: 403 }
      );
    }

    const distinct = await db
      .selectDistinct({ toUserId: messages.toUserId })
      .from(messages)
      .where(eq(messages.fromUserId, session.userId));

    const alreadyMessaged = distinct.map((d) => d.toUserId);
    if (
      !alreadyMessaged.includes(otherId) &&
      alreadyMessaged.length >= limits.people
    ) {
      return NextResponse.json(
        {
          error: `Free members can message up to ${limits.people} people. Upgrade to Plus to message anyone.`,
          upgradeRequired: true,
        },
        { status: 403 }
      );
    }
  }

  const [message] = await db
    .insert(messages)
    .values({
      fromUserId: session.userId,
      toUserId: otherId,
      body: parsed.data.body,
    })
    .returning();

  if (Number.isFinite(limits.messages)) {
    await db
      .update(users)
      .set({ messagesUsed: sql`${users.messagesUsed} + 1` })
      .where(eq(users.id, session.userId));
  }

  return NextResponse.json({
    message: {
      id: message.id,
      body: message.body,
      fromMe: true,
      createdAt: message.createdAt,
    },
  });
}
