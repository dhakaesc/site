import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { photos, users } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { getMediaBucket, assertValidImage, extensionFor } from "@/lib/media";
import { isPhotoRole, SINGLE_ROLES, type PhotoRole } from "@/lib/photos";

const ALBUM_LIMIT = 30;

async function requireAdmin() {
  const session = await getSession();
  if (!session?.isAdmin) return null;
  return session;
}

/**
 * Only ever touch profiles admin created. A real member's photos are theirs -
 * an admin swapping someone's avatar from the back office is not a feature.
 */
async function loadAdminProfile(targetId: number) {
  const [target] = await db
    .select({ id: users.id, profileSource: users.profileSource })
    .from(users)
    .where(eq(users.id, targetId));
  if (!target || target.profileSource !== "admin") return null;
  return target;
}

/** Drop the object from R2. A storage miss must not fail the request - the row
 *  is what the site reads, and an orphaned object is harmless. */
async function deleteObject(key: string) {
  try {
    const bucket = await getMediaBucket();
    await bucket.delete(key);
  } catch (err) {
    console.error("R2 delete failed for", key, err);
  }
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

  if (!(await loadAdminProfile(targetId))) {
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

  // An unknown or missing role falls back to "album" rather than erroring, so
  // an older client that sends no role still uploads gallery photos.
  const rawRole = form?.get("role");
  const role: PhotoRole = isPhotoRole(rawRole) ? rawRole : "album";

  try {
    assertValidImage(file);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid image." },
      { status: 400 }
    );
  }

  const existing = await db
    .select({ id: photos.id, key: photos.key, role: photos.role })
    .from(photos)
    .where(eq(photos.userId, targetId));

  const albumCount = existing.filter((p) => p.role === "album").length;

  if (role === "album" && albumCount >= ALBUM_LIMIT) {
    return NextResponse.json(
      { error: `Up to ${ALBUM_LIMIT} album photos allowed.` },
      { status: 403 }
    );
  }

  const key = `users/${targetId}/${crypto.randomUUID()}.${extensionFor(file.type)}`;
  const bucket = await getMediaBucket();
  const bytes = await file.arrayBuffer();
  await bucket.put(key, bytes, { httpMetadata: { contentType: file.type } });

  // Profile and cover hold one photo each. The old row has to go BEFORE the
  // insert, or the partial unique index rejects it.
  const replaced = SINGLE_ROLES.includes(role)
    ? existing.filter((p) => p.role === role)
    : [];

  if (replaced.length > 0) {
    await db
      .delete(photos)
      .where(and(eq(photos.userId, targetId), eq(photos.role, role)));
  }

  const [photo] = await db
    .insert(photos)
    .values({
      userId: targetId,
      key,
      role,
      position: role === "album" ? albumCount : 0,
    })
    .returning();

  // Only bin the old object once the replacement is safely recorded.
  for (const old of replaced) await deleteObject(old.key);

  return NextResponse.json({ photo });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const { userId } = await params;
  const targetId = Number(userId);
  const photoId = Number(new URL(req.url).searchParams.get("photoId"));
  if (!Number.isInteger(targetId) || !Number.isInteger(photoId)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!(await loadAdminProfile(targetId))) {
    return NextResponse.json(
      { error: "Not an admin-created profile." },
      { status: 400 }
    );
  }

  const [row] = await db
    .select({ id: photos.id, key: photos.key })
    .from(photos)
    .where(and(eq(photos.id, photoId), eq(photos.userId, targetId)));

  if (!row) {
    return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  }

  await db.delete(photos).where(eq(photos.id, row.id));
  await deleteObject(row.key);

  return NextResponse.json({ ok: true });
}
