import { NextRequest, NextResponse } from "next/server";
import { and, eq, notInArray, inArray, or, gte, lte, ilike } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, photos, likes, blocks } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const gender = searchParams.get("gender"); // male | female | other
  const minAge = Number(searchParams.get("minAge"));
  const maxAge = Number(searchParams.get("maxAge"));
  const location = searchParams.get("location")?.trim();

  const alreadyDecided = await db
    .select({ toUserId: likes.toUserId })
    .from(likes)
    .where(eq(likes.fromUserId, session.userId));

  // Hide anyone in a block relationship with me, in either direction.
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

  const blockedIds = blockRows.map((r) =>
    r.blockerUserId === session.userId ? r.blockedUserId : r.blockerUserId
  );

  const excludeIds = [
    session.userId,
    ...alreadyDecided.map((r) => r.toUserId),
    ...blockedIds,
  ];

  const filters = [eq(users.isBanned, false), notInArray(users.id, excludeIds)];
  if (gender === "male" || gender === "female" || gender === "other") {
    filters.push(eq(users.gender, gender));
  }
  if (Number.isInteger(minAge) && minAge >= 18) {
    filters.push(gte(users.age, minAge));
  }
  if (Number.isInteger(maxAge) && maxAge >= 18) {
    filters.push(lte(users.age, maxAge));
  }
  if (location) {
    filters.push(ilike(users.location, `%${location}%`));
  }

  const candidates = await db
    .select({
      id: users.id,
      name: users.name,
      age: users.age,
      bio: users.bio,
      location: users.location,
    })
    .from(users)
    .where(and(...filters))
    .limit(20);

  if (candidates.length === 0) {
    return NextResponse.json({ profiles: [] });
  }

  const candidateIds = candidates.map((c) => c.id);
  const allPhotos = await db
    .select()
    .from(photos)
    .where(inArray(photos.userId, candidateIds));

  const photosByUser = new Map<number, string[]>();
  for (const p of allPhotos) {
    const list = photosByUser.get(p.userId) ?? [];
    list.push(`/api/media/${p.key}`);
    photosByUser.set(p.userId, list);
  }

  const profiles = candidates.map((c) => ({
    ...c,
    photos: photosByUser.get(c.id) ?? [],
  }));

  return NextResponse.json({ profiles });
}
