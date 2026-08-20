import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      tier: users.tier,
      isAdmin: users.isAdmin,
      lastSeenAt: users.lastSeenAt,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  // Every page calls this on load, so it doubles as the presence heartbeat.
  // Only written when the stored value is stale, to avoid a write per request.
  if (user && (!user.lastSeenAt || Date.now() - user.lastSeenAt.getTime() > 60_000)) {
    await db
      .update(users)
      .set({ lastSeenAt: new Date() })
      .where(eq(users.id, session.userId));
  }

  return NextResponse.json({ user: user ?? null });
}
