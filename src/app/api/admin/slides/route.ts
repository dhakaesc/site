import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { slides } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { getMediaBucket, assertValidImage, extensionFor } from "@/lib/media";

async function requireAdmin() {
  const session = await getSession();
  if (!session?.isAdmin) return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const rows = await db.select().from(slides).orderBy(asc(slides.position), asc(slides.id));
  return NextResponse.json({
    slides: rows.map((r) => ({ ...r, imageUrl: `/api/media/${r.imageKey}` })),
  });
}

/**
 * Create a slide. Sent as multipart form data because it carries the image.
 */
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const file = form.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Please choose an image." }, { status: 400 });
  }
  try {
    assertValidImage(file);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid image." },
      { status: 400 }
    );
  }

  const parsed = z
    .object({
      title: z.string().trim().min(2).max(200),
      eyebrow: z.string().trim().max(120).optional(),
      description: z.string().trim().max(500).optional(),
      ctaLabel: z.string().trim().max(60).optional(),
      ctaHref: z.string().trim().max(200).optional(),
      isPublished: z.enum(["true", "false"]).optional(),
    })
    .safeParse({
      title: form.get("title"),
      eyebrow: form.get("eyebrow") ?? undefined,
      description: form.get("description") ?? undefined,
      ctaLabel: form.get("ctaLabel") ?? undefined,
      ctaHref: form.get("ctaHref") ?? undefined,
      isPublished: form.get("isPublished") ?? undefined,
    });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const key = `slides/${crypto.randomUUID()}.${extensionFor(file.type)}`;
  const bucket = await getMediaBucket();
  await bucket.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });

  const existing = await db.select({ id: slides.id }).from(slides);

  const [slide] = await db
    .insert(slides)
    .values({
      imageKey: key,
      title: parsed.data.title,
      eyebrow: parsed.data.eyebrow ?? "",
      description: parsed.data.description ?? "",
      ctaLabel: parsed.data.ctaLabel || "Create free profile",
      ctaHref: parsed.data.ctaHref || "/register",
      position: existing.length,
      isPublished: parsed.data.isPublished !== "false",
    })
    .returning();

  return NextResponse.json({ slide });
}

const patchSchema = z.object({
  id: z.number().int(),
  title: z.string().trim().min(2).max(200).optional(),
  eyebrow: z.string().trim().max(120).optional(),
  description: z.string().trim().max(500).optional(),
  ctaLabel: z.string().trim().max(60).optional(),
  ctaHref: z.string().trim().max(200).optional(),
  isPublished: z.boolean().optional(),
  position: z.number().int().min(0).optional(),
});

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }
  const { id, ...updates } = parsed.data;
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }
  const [slide] = await db.update(slides).set(updates).where(eq(slides.id, id)).returning();
  return NextResponse.json({ slide });
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const parsed = z.object({ id: z.number().int() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const [target] = await db.select().from(slides).where(eq(slides.id, parsed.data.id));
  if (!target) {
    return NextResponse.json({ error: "Slide not found." }, { status: 404 });
  }

  // Remove the underlying object too, otherwise it leaks in the bucket.
  try {
    const bucket = await getMediaBucket();
    await bucket.delete(target.imageKey);
  } catch (e) {
    console.error("Could not delete slide image", target.imageKey, e);
  }

  await db.delete(slides).where(eq(slides.id, parsed.data.id));
  return NextResponse.json({ ok: true });
}
