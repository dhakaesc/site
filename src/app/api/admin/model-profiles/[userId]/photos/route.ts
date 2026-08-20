import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { photos, users } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { getMediaBucket, assertValidImage, extensionFor } from "@/lib/media";

async function requireAdmin() {
  const session = await getSession();
  if (!session?.isAdmin) return null;
  return session;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const { userId } = await params;
  const targetId = Number(userId);
  if (!Number.isInteger(targetId)) {
    return NextResponse.json({ error: "Invalid profile." }, { status: 400 });
  }

  // Only ever upload into profiles admin itself created - never onto a
  // real member's account without them doing it themselves.
  const [target] = await db
    .select({ id: users.id, profileSource: users.profileSource })
    .from(users)
    .where(eq(users.id, targetId));

  if (!target || target.profileSource !== "admin") {
    return NextResponse.json(
      { error: "Not an admin-created profile." },
      { status: 400 }
    );
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

  const existing = await db
    .select({ id: photos.id })
    .from(photos)
    .where(eq(photos.userId, targetId));

  if (existing.length >= 30) {
    return NextResponse.json({ error: "Up to 30 photos allowed." }, { status: 403 });
  }

  const key = `users/${targetId}/${crypto.randomUUID()}.${extensionFor(file.type)}`;
  const bucket = await getMediaBucket();
  const bytes = await file.arrayBuffer();
  await bucket.put(key, bytes, { httpMetadata: { contentType: file.type } });

  const [photo] = await db
    .insert(photos)
    .values({ userId: targetId, key, position: existing.length })
    .returning();

  return NextResponse.json({ photo });
}
