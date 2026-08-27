import { NextResponse } from "next/server";
import { and, eq, or, asc, sql as raw } from "drizzle-orm";
import { db } from "@/lib/db";
import { messages, users, adminAuditLogs } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";

async function requireAdmin() {
  const session = await getSession();
  if (!session?.isAdmin) return null;
  return session;
}

const PAGE_SIZE = 50;

type PairRow = {
  user_a: number;
  user_b: number;
  a_name: string | null;
  a_email: string | null;
  a_tier: string | null;
  a_banned: boolean | null;
  a_source: string | null;
  b_name: string | null;
  b_email: string | null;
  b_tier: string | null;
  b_banned: boolean | null;
  b_source: string | null;
  message_count: number;
  unread: number;
  last_message_at: string;
  last_message: string;
  last_from_user_id: number;
};

/**
 * Read-only view of member conversations, for safety review.
 *
 * The pair list is aggregated in Postgres. The previous version pulled every
 * row of `messages` AND every row of `users` into the worker on each page
 * load and grouped them in JS - fine at four test messages, dead well before
 * this is a real business.
 *
 * least()/greatest() collapses (a to b) and (b to a) into one conversation
 * key; DISTINCT ON pulls each pair's newest line for the list preview.
 */
export async function GET(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const userA = Number(searchParams.get("userA"));
  const userB = Number(searchParams.get("userB"));

  // ---- One thread ---------------------------------------------------------
  if (Number.isInteger(userA) && Number.isInteger(userB) && userA > 0 && userB > 0) {
    const thread = await db
      .select({
        id: messages.id,
        body: messages.body,
        fromUserId: messages.fromUserId,
        toUserId: messages.toUserId,
        readAt: messages.readAt,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(
        or(
          and(eq(messages.fromUserId, userA), eq(messages.toUserId, userB)),
          and(eq(messages.fromUserId, userB), eq(messages.toUserId, userA))
        )
      )
      .orderBy(asc(messages.createdAt));

    const people = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        tier: users.tier,
        isBanned: users.isBanned,
        profileSource: users.profileSource,
      })
      .from(users)
      .where(or(eq(users.id, userA), eq(users.id, userB)));

    const byId = new Map(people.map((p) => [p.id, p]));

    // Best-effort: a logging failure must never block a moderator mid-review.
    try {
      await db.insert(adminAuditLogs).values({
        adminUserId: session.userId,
        action: "read_conversation",
        targetType: "conversation",
        targetId: `${Math.min(userA, userB)}-${Math.max(userA, userB)}`,
        detail: `${byId.get(userA)?.name ?? userA} / ${byId.get(userB)?.name ?? userB} - ${thread.length} messages`,
      });
    } catch (err) {
      console.error("audit log write failed", err);
    }

    return NextResponse.json({
      participants: [userA, userB].map((id) => {
        const p = byId.get(id);
        return {
          id,
          name: p?.name ?? "Deleted user",
          email: p?.email ?? "",
          tier: p?.tier ?? "free",
          isBanned: p?.isBanned ?? false,
          isModelProfile: p?.profileSource === "admin",
        };
      }),
      thread: thread.map((m) => ({
        id: m.id,
        body: m.body,
        fromUserId: m.fromUserId,
        toUserId: m.toUserId,
        fromName: byId.get(m.fromUserId)?.name ?? "Unknown",
        toName: byId.get(m.toUserId)?.name ?? "Unknown",
        read: Boolean(m.readAt),
        createdAt: m.createdAt,
      })),
    });
  }

  // ---- Conversation list --------------------------------------------------
  const q = (searchParams.get("q") ?? "").trim();
  const page = Math.max(0, Number(searchParams.get("page") ?? 0) || 0);
  const like = `%${q}%`;

  const result = await db.execute(raw`
    with pairs as (
      select
        least(from_user_id, to_user_id)                          as user_a,
        greatest(from_user_id, to_user_id)                       as user_b,
        count(*)::int                                            as message_count,
        count(*) filter (where read_at is null)::int             as unread,
        max(created_at)                                          as last_message_at
      from messages
      group by 1, 2
    ),
    latest as (
      select distinct on (least(from_user_id, to_user_id), greatest(from_user_id, to_user_id))
        least(from_user_id, to_user_id)    as user_a,
        greatest(from_user_id, to_user_id) as user_b,
        body                               as last_message,
        from_user_id                       as last_from_user_id
      from messages
      order by 1, 2, created_at desc
    )
    select
      p.user_a, p.user_b, p.message_count, p.unread, p.last_message_at,
      l.last_message, l.last_from_user_id,
      a.name as a_name, a.email as a_email, a.tier as a_tier,
      a.is_banned as a_banned, a.profile_source as a_source,
      b.name as b_name, b.email as b_email, b.tier as b_tier,
      b.is_banned as b_banned, b.profile_source as b_source
    from pairs p
    join latest l on l.user_a = p.user_a and l.user_b = p.user_b
    left join users a on a.id = p.user_a
    left join users b on b.id = p.user_b
    where ${q === ""} or (
      a.name ilike ${like} or a.email ilike ${like} or
      b.name ilike ${like} or b.email ilike ${like}
    )
    order by p.last_message_at desc
    limit ${PAGE_SIZE + 1}
    offset ${page * PAGE_SIZE}
  `);

  const rows = (Array.isArray(result) ? result : result.rows) as unknown as PairRow[];
  const hasMore = rows.length > PAGE_SIZE;

  const conversations = rows.slice(0, PAGE_SIZE).map((r) => ({
    userA: {
      id: r.user_a,
      name: r.a_name ?? "Deleted user",
      email: r.a_email ?? "",
      tier: r.a_tier ?? "free",
      isBanned: r.a_banned ?? false,
      isModelProfile: r.a_source === "admin",
    },
    userB: {
      id: r.user_b,
      name: r.b_name ?? "Deleted user",
      email: r.b_email ?? "",
      tier: r.b_tier ?? "free",
      isBanned: r.b_banned ?? false,
      isModelProfile: r.b_source === "admin",
    },
    messageCount: r.message_count,
    unread: r.unread,
    lastMessageAt: r.last_message_at,
    lastMessage: r.last_message,
    lastMessageFromUserId: r.last_from_user_id,
  }));

  return NextResponse.json({ conversations, hasMore });
}
