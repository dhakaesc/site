import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { blocks } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";

const bodySchema = z.object({ userId: z.number().int() });

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  if (parsed.data.userId === session.userId) {
    return NextResponse.json(
      { error: "You can't block yourself." },
      { status: 400 }
    );
  }

  await db
    .insert(blocks)
    .values({ blockerUserId: session.userId, blockedUserId: parsed.data.userId })
    .onConflictDoNothing();

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  await db
    .delete(blocks)
    .where(
      and(
        eq(blocks.blockerUserId, session.userId),
        eq(blocks.blockedUserId, parsed.data.userId)
      )
    );

  return NextResponse.json({ ok: true });
}
