import { NextRequest, NextResponse } from "next/server";
import { eq, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { videos, users } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import {
  getMediaBucket,
  assertValidVideo,
  videoExtensionFor,
  videoLimitFor,
} from "@/lib/media";
import { effectiveTier } from "@/lib/plans";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(videos)
    .where(eq(videos.userId, session.userId))
    .orderBy(asc(videos.position));

  const [user] = await db
    .select({ tier: users.tier, tierExpiresAt: users.tierExpiresAt })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  const limit = videoLimitFor(
    effectiveTier(user?.tier ?? "free", user?.tierExpiresAt)
  );

  return NextResponse.json({
    videos: rows,
    limit: Number.isFinite(limit) ? limit : null,
    used: rows.length,
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }

  try {
    assertValidVideo(file);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid video." },
      { status: 400 }
    );
  }

  const [user] = await db
    .select({ tier: users.tier, tierExpiresAt: users.tierExpiresAt })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  const existing = await db
    .select({ id: videos.id })
    .from(videos)
    .where(eq(videos.userId, session.userId));

  const limit = videoLimitFor(
    effectiveTier(user?.tier ?? "free", user?.tierExpiresAt)
  );
  if (existing.length >= limit) {
    return NextResponse.json(
      { error: `Your plan allows up to ${limit} video${limit === 1 ? "" : "s"}. Upgrade for more.` },
      { status: 403 }
    );
  }

  const key = `users/${session.userId}/video-${crypto.randomUUID()}.${videoExtensionFor(file.type)}`;
  const bucket = await getMediaBucket();

  // Stream straight into R2 rather than buffering the whole file again.
  await bucket.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  });

  const [video] = await db
    .insert(videos)
    .values({
      userId: session.userId,
      key,
      contentType: file.type,
      sizeBytes: file.size,
      position: existing.length,
    })
    .returning();

  return NextResponse.json({ video });
}
