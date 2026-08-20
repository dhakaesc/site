import { NextResponse } from "next/server";
import { and, eq, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, photos } from "@/lib/db/schema";
import { categoryTitle } from "@/lib/categories";

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

  const theirPhotos = await db
    .select({ key: photos.key })
    .from(photos)
    .where(eq(photos.userId, userId))
    .orderBy(asc(photos.position));

  return NextResponse.json({
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
      photos: theirPhotos.map((p) => `/api/media/${p.key}`),
    },
  });
}
