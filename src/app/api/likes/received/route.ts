import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, photos, likes, blocks } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { effectiveTier, isPaid } from "@/lib/plans";
import { or } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const [me] = await db
    .select({ tier: users.tier, tierExpiresAt: users.tierExpiresAt })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  const tier = effectiveTier(me?.tier ?? "free", me?.tierExpiresAt);

  // People who liked me.
  const likedMe = await db
    .select({ fromUserId: likes.fromUserId })
    .from(likes)
    .where(and(eq(likes.toUserId, session.userId), eq(likes.liked, true)));

  // Exclude people I've already decided on (already liked/passed them —
  // those show up as matches or are gone, not in this "new likes" list).
  const alreadyDecided = await db
    .select({ toUserId: likes.toUserId })
    .from(likes)
    .where(eq(likes.fromUserId, session.userId));
  const decidedIds = new Set(alreadyDecided.map((r) => r.toUserId));

  const blockRows = await db
    .select({
      blockerUserId: blocks.blockerUserId,
      blockedUserId: blocks.blockedUserId,
    })
    .from(blocks)
    .where(
      or(
        eq(blocks.blockerUserId, session.userId),
        eq(blocks.blockedUserId, session.userId)
      )
    );
  const blockedIds = new Set(
    blockRows.map((r) =>
      r.blockerUserId === session.userId ? r.blockedUserId : r.blockerUserId
    )
  );

  const candidateIds = likedMe
    .map((r) => r.fromUserId)
    .filter((id) => !decidedIds.has(id) && !blockedIds.has(id));

  const count = candidateIds.length;

  if (!isPaid(tier)) {
    // Free tier: tell them the count so it's a real upgrade hook, but not who.
    return NextResponse.json({ locked: true, count, people: [] });
  }

  if (candidateIds.length === 0) {
    return NextResponse.json({ locked: false, count: 0, people: [] });
  }

  const people = await db
    .select({
      id: users.id,
      name: users.name,
      age: users.age,
      location: users.location,
    })
    .from(users)
    .where(and(eq(users.isBanned, false), inArray(users.id, candidateIds)));

  const allPhotos = await db
    .select()
    .from(photos)
    .where(inArray(photos.userId, candidateIds));

  const photoByUser = new Map<number, string>();
  for (const p of allPhotos) {
    if (!photoByUser.has(p.userId)) {
      photoByUser.set(p.userId, `/api/media/${p.key}`);
    }
  }

  return NextResponse.json({
    locked: false,
    count: people.length,
    people: people.map((p) => ({ ...p, photo: photoByUser.get(p.id) ?? null })),
  });
}
