import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { effectiveTier } from "@/lib/plans";

const SPOTLIGHT_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const [user] = await db
    .select({ spotlightUntil: users.spotlightUntil })
    .from(users)
    .where(eq(users.id, session.userId));

  const active = Boolean(
    user?.spotlightUntil && user.spotlightUntil.getTime() > Date.now()
  );

  return NextResponse.json({
    active,
    spotlightUntil: user?.spotlightUntil ?? null,
  });
}

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const [user] = await db
    .select({ tier: users.tier, tierExpiresAt: users.tierExpiresAt })
    .from(users)
    .where(eq(users.id, session.userId));

  const tier = effectiveTier(user?.tier ?? "free", user?.tierExpiresAt);
  if (tier !== "vip") {
    return NextResponse.json(
      { error: "Spotlight is a VIP feature.", upgradeRequired: true },
      { status: 403 }
    );
  }

  const spotlightUntil = new Date(Date.now() + SPOTLIGHT_DURATION_MS);
  await db.update(users).set({ spotlightUntil }).where(eq(users.id, session.userId));

  return NextResponse.json({ active: true, spotlightUntil });
}
