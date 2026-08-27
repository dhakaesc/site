import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { videos } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { getMediaBucket } from "@/lib/media";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const videoId = Number(id);
  if (!Number.isInteger(videoId)) {
    return NextResponse.json({ error: "Bad video id." }, { status: 400 });
  }

  // Scoped to the session user, so one member cannot delete another's video
  // by guessing an id.
  const [row] = await db
    .select()
    .from(videos)
    .where(and(eq(videos.id, videoId), eq(videos.userId, session.userId)))
    .limit(1);

  if (!row) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  await db.delete(videos).where(eq(videos.id, videoId));

  // Drop the object too - a deleted row would otherwise leave R2 paying for
  // a file nothing references.
  try {
    const bucket = await getMediaBucket();
    await bucket.delete(row.key);
  } catch (err) {
    console.error("R2 delete failed for", row.key, err);
  }

  return NextResponse.json({ ok: true });
}
