import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth/password";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { createToken } from "@/lib/auth/tokens";
import { sendVerificationEmail } from "@/lib/email";

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  age: z.number().int().min(18).max(100),
  gender: z.enum(["male", "female", "other"]),
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, age, gender, email, password } = parsed.data;

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(users)
    .values({
      name,
      age,
      gender,
      email: email.toLowerCase(),
      passwordHash,
    })
    .returning();

  const token = await createSessionToken({
    userId: user.id,
    tier: user.tier as "free" | "plus" | "vip",
    isAdmin: user.isAdmin,
  });
  await setSessionCookie(token);

  // Best-effort: registration must not fail if this errors. Awaited (not
  // fire-and-forget) because Cloudflare Workers can kill unawaited work
  // once the response is sent.
  try {
    const verifyToken = await createToken(user.id, "verify");
    await sendVerificationEmail({ to: user.email, name: user.name, token: verifyToken });
  } catch (err) {
    console.error("Failed to send verification email:", err);
  }

  return NextResponse.json({
    user: { id: user.id, name: user.name, tier: user.tier },
  });
}
