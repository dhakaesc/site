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
      phone: users.phone,
      age: users.age,
      gender: users.gender,
      identityStatus: users.identityStatus,
      identityVerifiedAt: users.identityVerifiedAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(300);

  return NextResponse.json({ users: rows });
}

const patchSchema = z.object({
  userId: z.number().int(),
  status: z.enum(["pending", "verified", "rejected"]),
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

  const { userId, status } = parsed.data;

  const [updated] = await db
    .update(users)
    .set({
      identityStatus: status,
      identityVerifiedAt: status === "pending" ? null : new Date(),
      identityVerifiedByUserId: status === "pending" ? null : session.userId,
    })
    .where(eq(users.id, userId))
    .returning({ id: users.id, identityStatus: users.identityStatus });

  return NextResponse.json({ user: updated });
}
