import { NextResponse } from "next/server";
import { and, countDistinct, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, profileViews, messages } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { limitsFor, effectiveTier } from "@/lib/plans";

/**
 * What the signed-in member has used this month, for the meters shown on
 * Browse. Everything here is counted from real rows — nothing is estimated.
 */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ usage: null });

  const [me] = await db
    .select({ tier: users.tier, tierExpiresAt: users.tierExpiresAt, messagesUsed: users.messagesUsed })
    .from(users)
    .where(eq(users.id, session.userId));

  if (!me) return NextResponse.json({ usage: null });

  const tier = effectiveTier(me.tier, me.tierExpiresAt);
  const limits = limitsFor(tier);

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [views] = await db
    .select({ value: countDistinct(profileViews.viewedUserId) })
    .from(profileViews)
    .where(
      and(
        eq(profileViews.viewerUserId, session.userId),
        gte(profileViews.createdAt, monthStart)
      )
    );

  const [people] = await db
    .select({ value: countDistinct(messages.toUserId) })
    .from(messages)
    .where(eq(messages.fromUserId, session.userId));

  const asNumber = (n: number) => (Number.isFinite(n) ? n : null); // null = unlimited

  return NextResponse.json({
    usage: {
      tier,
      views: { used: views?.value ?? 0, limit: asNumber(limits.profileVisits) },
      messages: { used: me.messagesUsed, limit: asNumber(limits.messages) },
      people: { used: people?.value ?? 0, limit: asNumber(limits.people) },
    },
  });
}
