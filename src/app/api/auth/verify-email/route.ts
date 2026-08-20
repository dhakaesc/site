import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { peekToken, consumeToken } from "@/lib/auth/tokens";

const schema = z.object({ token: z.string().min(1) });

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Missing token." }, { status: 400 });
  }

  const userId = await peekToken(parsed.data.token, "verify");
  if (!userId) {
    return NextResponse.json(
      { error: "This verification link is invalid or has expired." },
      { status: 400 }
    );
  }

  await db
    .update(users)
    .set({ emailVerifiedAt: new Date() })
    .where(eq(users.id, userId));
  await consumeToken(parsed.data.token);

  return NextResponse.json({ ok: true });
}
