import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { createToken } from "@/lib/auth/tokens";
import { sendVerificationEmail } from "@/lib/email";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const [user] = await db
    .select({ name: users.name, email: users.email, emailVerifiedAt: users.emailVerifiedAt })
    .from(users)
    .where(eq(users.id, session.userId));

  if (!user) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (user.emailVerifiedAt) {
    return NextResponse.json({ ok: true, alreadyVerified: true });
  }

  const token = await createToken(session.userId, "verify");
  await sendVerificationEmail({ to: user.email, name: user.name, token });

  return NextResponse.json({ ok: true });
}
