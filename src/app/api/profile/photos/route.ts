import { NextRequest, NextResponse } from "next/server";
import { eq, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { photos, users } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import {
  getMediaBucket,
  assertValidImage,
  extensionFor,
  photoLimitFor,
} from "@/lib/media";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(photos)
    .where(eq(photos.userId, session.userId))
    .orderBy(asc(photos.position));

  return NextResponse.json({ photos: rows });
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
    assertValidImage(file);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid image." },
      { status: 400 }
    );
  }

  const [user] = await db
    .select({ tier: users.tier })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  const existing = await db
    .select({ id: photos.id })
    .from(photos)
    .where(eq(photos.userId, session.userId));

  const limit = photoLimitFor(user?.tier ?? "free");
  if (existing.length >= limit) {
    return NextResponse.json(
      {
        error: `Your plan allows up to ${limit} photos. Upgrade for more.`,
      },
      { status: 403 }
    );
  }

  const key = `users/${session.userId}/${crypto.randomUUID()}.${extensionFor(
    file.type
  )}`;

  const bucket = await getMediaBucket();
  const bytes = await file.arrayBuffer();
  await bucket.put(key, bytes, {
    httpMetadata: { contentType: file.type },
  });

  const [photo] = await db
    .insert(photos)
    .values({ userId: session.userId, key, position: existing.length })
    .returning();

  return NextResponse.json({ photo });
}
