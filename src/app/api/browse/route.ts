import { NextRequest, NextResponse } from "next/server";
import { and, eq, notInArray, inArray, or, gte, lte, ilike, desc, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, photos, likes, blocks } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { CATEGORY_SLUGS } from "@/lib/categories";
import { pickProfilePhoto } from "@/lib/photos";

export async function GET(req: NextRequest) {
  // Browsing is public - a visitor arriving from an ad can look around
  // before signing up. Only acting (like/pass/message) needs a session.
  const session = await getSession();

  const { searchParams } = new URL(req.url);
  const gender = searchParams.get("gender"); // male | female | other
  const minAge = Number(searchParams.get("minAge"));
  const maxAge = Number(searchParams.get("maxAge"));
  const location = searchParams.get("location")?.trim();
  const category = searchParams.get("category")?.trim();

  let excludeIds: number[] = [];

  if (session) {
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

    excludeIds = [
      session.userId,
      ...alreadyDecided.map((r) => r.toUserId),
      ...blockedIds,
    ];
  }

  const filters = [eq(users.isBanned, false), eq(users.isPublished, true)];
  if (excludeIds.length > 0) {
    filters.push(notInArray(users.id, excludeIds));
  }
  if (category && CATEGORY_SLUGS.includes(category)) {
    filters.push(eq(users.category, category));
  }
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
      spotlightUntil: users.spotlightUntil,
      identityStatus: users.identityStatus,
    })
    .from(users)
    .where(and(...filters))
    // Active VIP spotlight users first, then everyone else.
    .orderBy(
      desc(sql`CASE WHEN ${users.spotlightUntil} > now() THEN 1 ELSE 0 END`)
    )
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
  for (const id of candidateIds) {
    const mine = allPhotos.filter((p) => p.userId === id);
    // Avatar first: browse cards show photo[0], and that must be the photo
    // marked as the profile photo, not whatever row the query returned first.
    const avatar = pickProfilePhoto(mine);
    const ordered = avatar ? [avatar, ...mine.filter((p) => p.key !== avatar.key)] : mine;
    photosByUser.set(id, ordered.map((p) => `/api/media/${p.key}`));
  }

  const profiles = candidates.map((c) => ({
    id: c.id,
    name: c.name,
    age: c.age,
    bio: c.bio,
    location: c.location,
    spotlighted: Boolean(c.spotlightUntil && c.spotlightUntil.getTime() > Date.now()),
    verified: c.identityStatus === "verified",
    photos: photosByUser.get(c.id) ?? [],
  }));

  return NextResponse.json({ profiles });
}
