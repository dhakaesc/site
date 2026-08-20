import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { peekToken, consumeToken } from "@/lib/auth/tokens";
import { hashPassword } from "@/lib/auth/password";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(72),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const userId = await peekToken(parsed.data.token, "reset");
  if (!userId) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired. Request a new one." },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
  await consumeToken(parsed.data.token);

  return NextResponse.json({ ok: true });
}
