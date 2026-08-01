import { NextResponse } from "next/server";
import { and, eq, notInArray, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, photos, likes } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const alreadyDecided = await db
    .select({ toUserId: likes.toUserId })
    .from(likes)
    .where(eq(likes.fromUserId, session.userId));

  const excludeIds = [
    session.userId,
    ...alreadyDecided.map((r) => r.toUserId),
  ];

  const candidates = await db
    .select({
      id: users.id,
      name: users.name,
      age: users.age,
      bio: users.bio,
      location: users.location,
    })
    .from(users)
    .where(
      and(eq(users.isBanned, false), notInArray(users.id, excludeIds))
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
