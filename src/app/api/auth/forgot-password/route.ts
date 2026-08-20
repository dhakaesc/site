import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createToken } from "@/lib/auth/tokens";
import { sendPasswordResetEmail } from "@/lib/email";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  // Always respond the same way whether or not the account exists —
  // otherwise this endpoint becomes a way to check which emails are registered.
  const [user] = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.email, parsed.data.email.toLowerCase()))
    .limit(1);

  if (user) {
    const token = await createToken(user.id, "reset");
    await sendPasswordResetEmail({ to: user.email, name: user.name, token });
  }

  return NextResponse.json({
    ok: true,
    message: "If that email has an account, a reset link is on its way.",
  });
}
