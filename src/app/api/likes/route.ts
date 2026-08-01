import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { likes } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";

const bodySchema = z.object({
  toUserId: z.number().int(),
  liked: z.boolean(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const { toUserId, liked } = parsed.data;
  if (toUserId === session.userId) {
    return NextResponse.json(
      { error: "You can't like your own profile." },
      { status: 400 }
    );
  }

  await db
    .insert(likes)
    .values({ fromUserId: session.userId, toUserId, liked })
    .onConflictDoUpdate({
      target: [likes.fromUserId, likes.toUserId],
      set: { liked },
    });

  let matched = false;
  if (liked) {
    const [reciprocal] = await db
      .select()
      .from(likes)
      .where(
        and(
          eq(likes.fromUserId, toUserId),
          eq(likes.toUserId, session.userId),
          eq(likes.liked, true)
        )
      )
      .limit(1);
    matched = Boolean(reciprocal);
  }

  return NextResponse.json({ ok: true, matched });
}
