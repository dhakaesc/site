import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";

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
      email: users.email,
      age: users.age,
      gender: users.gender,
      tier: users.tier,
      messagesUsed: users.messagesUsed,
      isBanned: users.isBanned,
      isAdmin: users.isAdmin,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(200);

  return NextResponse.json({ users: rows });
}

const patchSchema = z.object({
  userId: z.number().int(),
  tier: z.enum(["free", "plus", "vip"]).optional(),
  isBanned: z.boolean().optional(),
  resetMessages: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const { userId, tier, isBanned, resetMessages } = parsed.data;

  const updates: Record<string, unknown> = {};
  if (tier !== undefined) updates.tier = tier;
  if (isBanned !== undefined) updates.isBanned = isBanned;
  if (resetMessages) updates.messagesUsed = 0;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  // Guard: an admin can't ban themselves out of the dashboard.
  if (userId === session.userId && isBanned === true) {
    return NextResponse.json(
      { error: "You can't ban your own account." },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      tier: users.tier,
      isBanned: users.isBanned,
      messagesUsed: users.messagesUsed,
    });

  return NextResponse.json({ user: updated });
}
