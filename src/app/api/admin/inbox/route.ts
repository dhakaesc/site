import { NextResponse } from "next/server";
import { and, eq, or, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { messages, users } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";

async function requireAdmin() {
  const session = await getSession();
  if (!session?.isAdmin) return null;
  return session;
}

/** Every pair of users that has exchanged at least one message. */
export async function GET(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const userA = Number(searchParams.get("userA"));
  const userB = Number(searchParams.get("userB"));

  // A specific thread was requested.
  if (Number.isInteger(userA) && Number.isInteger(userB)) {
    const thread = await db
      .select()
      .from(messages)
      .where(
        or(
          and(eq(messages.fromUserId, userA), eq(messages.toUserId, userB)),
          and(eq(messages.fromUserId, userB), eq(messages.toUserId, userA))
        )
      )
      .orderBy(asc(messages.createdAt));

    const people = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(or(eq(users.id, userA), eq(users.id, userB)));
    const nameById = new Map(people.map((p) => [p.id, p.name]));

    return NextResponse.json({
      thread: thread.map((m) => ({
        id: m.id,
        body: m.body,
        fromUserId: m.fromUserId,
        fromName: nameById.get(m.fromUserId) ?? "Unknown",
        createdAt: m.createdAt,
      })),
    });
  }

  // Otherwise: list every conversation pair, most recently active first.
  const all = await db
    .select()
    .from(messages)
    .orderBy(asc(messages.createdAt));

  const pairMap = new Map<
    string,
    { userA: number; userB: number; lastMessageAt: Date; messageCount: number }
  >();
  for (const m of all) {
    const [a, b] = [m.fromUserId, m.toUserId].sort((x, y) => x - y);
    const key = `${a}-${b}`;
    const existing = pairMap.get(key);
    if (existing) {
      existing.lastMessageAt = m.createdAt;
      existing.messageCount += 1;
    } else {
      pairMap.set(key, { userA: a, userB: b, lastMessageAt: m.createdAt, messageCount: 1 });
    }
  }

  const pairs = [...pairMap.values()].sort(
    (a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime()
  );

  const allUserIds = [...new Set(pairs.flatMap((p) => [p.userA, p.userB]))];
  const people =
    allUserIds.length > 0
      ? await db.select({ id: users.id, name: users.name }).from(users)
      : [];
  const nameById = new Map(people.filter((p) => allUserIds.includes(p.id)).map((p) => [p.id, p.name]));

  return NextResponse.json({
    conversations: pairs.map((p) => ({
      userA: { id: p.userA, name: nameById.get(p.userA) ?? "Unknown" },
      userB: { id: p.userB, name: nameById.get(p.userB) ?? "Unknown" },
      lastMessageAt: p.lastMessageAt,
      messageCount: p.messageCount,
    })),
  });
}
