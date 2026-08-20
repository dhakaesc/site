import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, photos } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { getMediaBucket } from "@/lib/media";

async function requireAdmin() {
  const session = await getSession();
  if (!session?.isAdmin) return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      age: users.age,
      gender: users.gender,
      location: users.location,
      bio: users.bio,
      adminCategory: users.adminCategory,
      adminNote: users.adminNote,
      isPublished: users.isPublished,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.profileSource, "admin"))
    .orderBy(desc(users.createdAt));

  if (rows.length === 0) {
    return NextResponse.json({ profiles: [] });
  }

  const ids = rows.map((r) => r.id);
  const allPhotos = await db.select().from(photos);
  const photosByUser = new Map<number, string[]>();
  for (const p of allPhotos) {
    if (!ids.includes(p.userId)) continue;
    const list = photosByUser.get(p.userId) ?? [];
    list.push(`/api/media/${p.key}`);
    photosByUser.set(p.userId, list);
  }

  return NextResponse.json({
    profiles: rows.map((r) => ({ ...r, photos: photosByUser.get(r.id) ?? [] })),
  });
}

const createSchema = z.object({
  name: z.string().trim().min(2).max(100),
  age: z.number().int().min(18).max(100),
  gender: z.enum(["male", "female", "other"]),
  category: z.enum(["model", "influencer", "other"]),
  location: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(500).optional(),
  published: z.boolean().default(false),
  adminNote: z.string().trim().max(500).optional(),
});

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const { name, age, gender, category, location, bio, published, adminNote } = parsed.data;

  // Placeholder credentials: this account is not meant to be logged into
  // day-to-day. If the real person later wants to use it themselves, an
  // admin can issue them a password-reset link, same as any other member.
  const placeholderEmail = `model-${crypto.randomUUID()}@internal.amoura.local`;
  const passwordHash = await hashPassword(crypto.randomUUID() + crypto.randomUUID());

  const [profile] = await db
    .insert(users)
    .values({
      name,
      age,
      gender,
      email: placeholderEmail,
      phone: "",
      passwordHash,
      location: location ?? "",
      bio: bio ?? "",
      profileSource: "admin",
      adminCategory: category,
      adminNote: adminNote ?? "",
      isPublished: published,
      // Admin-created profiles are a known, trusted party — no phone-call
      // verification step needed for these specifically.
      identityStatus: "verified",
    })
    .returning({ id: users.id });

  return NextResponse.json({ profile });
}

const patchSchema = z.object({
  userId: z.number().int(),
  isPublished: z.boolean().optional(),
  category: z.enum(["model", "influencer", "other"]).optional(),
  name: z.string().trim().min(2).max(100).optional(),
  age: z.number().int().min(18).max(100).optional(),
  location: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(500).optional(),
  adminNote: z.string().trim().max(500).optional(),
});

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const { userId, category, ...rest } = parsed.data;
  const updates: Record<string, unknown> = { ...rest };
  if (category !== undefined) updates.adminCategory = category;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  // Only ever touch profiles we created — never repurpose a real member's account.
  const [updated] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, userId))
    .returning({ id: users.id, profileSource: users.profileSource });

  if (updated?.profileSource !== "admin") {
    return NextResponse.json(
      { error: "Not an admin-created profile." },
      { status: 400 }
    );
  }

  return NextResponse.json({ profile: updated });
}

const deleteSchema = z.object({ userId: z.number().int() });

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const parsed = deleteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const [target] = await db
    .select({ id: users.id, profileSource: users.profileSource })
    .from(users)
    .where(eq(users.id, parsed.data.userId));

  if (!target || target.profileSource !== "admin") {
    return NextResponse.json(
      { error: "Not an admin-created profile." },
      { status: 400 }
    );
  }

  // Clean up R2 objects before deleting the row (photos cascade-delete in
  // the DB, but the underlying files in the bucket would otherwise leak).
  const theirPhotos = await db.select().from(photos).where(eq(photos.userId, target.id));
  if (theirPhotos.length > 0) {
    const bucket = await getMediaBucket();
    await Promise.all(theirPhotos.map((p) => bucket.delete(p.key)));
  }

  await db.delete(users).where(eq(users.id, target.id));

  return NextResponse.json({ ok: true });
}
