import { NextResponse } from "next/server";
import { and, eq, asc, ne, or, isNull, desc, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, photos } from "@/lib/db/schema";
import { categoryTitle } from "@/lib/categories";
import { presenceLabel, isOnline } from "@/lib/presence";
import { getSession } from "@/lib/auth/session";
import { limitsFor, effectiveTier } from "@/lib/plans";

/**
 * Public profile view. No session required - someone arriving from an ad
 * can look at a profile before signing up. Deliberately returns only what
 * is safe to show publicly: never email, phone, or any internal note.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = Number(id);
  if (!Number.isInteger(userId)) {
    return NextResponse.json({ error: "Invalid profile." }, { status: 400 });
  }

  const [profile] = await db
    .select({
      id: users.id,
      name: users.name,
      age: users.age,
      gender: users.gender,
      bio: users.bio,
      location: users.location,
      category: users.category,
      identityStatus: users.identityStatus,
      spotlightUntil: users.spotlightUntil,
      lastSeenAt: users.lastSeenAt,
    })
    .from(users)
    .where(
      and(
        eq(users.id, userId),
        eq(users.isBanned, false),
        eq(users.isPublished, true)
      )
    );

  if (!profile) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  // What the *viewer* is entitled to see. Free members get a small preview,
  // which is the main reason to upgrade.
  const viewer = await getSession();
  let viewerTier = "free";
  if (viewer) {
    const [me] = await db
      .select({ tier: users.tier, tierExpiresAt: users.tierExpiresAt })
      .from(users)
      .where(eq(users.id, viewer.userId));
    if (me) viewerTier = effectiveTier(me.tier, me.tierExpiresAt);
  }
  const photoAllowance = limitsFor(viewerTier).photos;

  const theirPhotos = await db
    .select({ key: photos.key })
    .from(photos)
    .where(eq(photos.userId, userId))
    .orderBy(asc(photos.position));

  // A few other profiles to look at next: same category first, then anyone else.
  const relatedRows = await db
    .select({
      id: users.id, name: users.name, age: users.age,
      location: users.location, category: users.category,
    })
    .from(users)
    .where(
      and(
        ne(users.id, userId),
        eq(users.isBanned, false),
        eq(users.isPublished, true)
      )
    )
    .orderBy(
      desc(sql`CASE WHEN ${users.category} = ${profile.category ?? ""} THEN 1 ELSE 0 END`),
      desc(users.createdAt)
    )
    .limit(5);

  const relatedPhotos = relatedRows.length
    ? await db
        .select({ userId: photos.userId, key: photos.key, position: photos.position })
        .from(photos)
        .where(inArray(photos.userId, relatedRows.map((r) => r.id)))
        .orderBy(asc(photos.position))
    : [];
  const coverFor = new Map<number, string>();
  for (const ph of relatedPhotos) {
    if (!coverFor.has(ph.userId)) coverFor.set(ph.userId, `/api/media/${ph.key}`);
  }

  return NextResponse.json({
    related: relatedRows.map((r) => ({
      id: r.id, name: r.name, age: r.age,
      location: r.location, photo: coverFor.get(r.id) ?? null,
    })),
    profile: {
      id: profile.id,
      name: profile.name,
      age: profile.age,
      gender: profile.gender,
      bio: profile.bio,
      location: profile.location,
      category: profile.category,
      categoryTitle: categoryTitle(profile.category),
      verified: profile.identityStatus === "verified",
      spotlighted: Boolean(
        profile.spotlightUntil && profile.spotlightUntil.getTime() > Date.now()
      ),
      presence: presenceLabel(profile.lastSeenAt),
      online: isOnline(profile.lastSeenAt),
      totalPhotos: theirPhotos.length,
      photos: theirPhotos.slice(0, photoAllowance).map((p) => `/api/media/${p.key}`),
      photosVisible: Math.min(theirPhotos.length, photoAllowance),
      photoAllowance,
      viewerTier,
    },
  });
}
