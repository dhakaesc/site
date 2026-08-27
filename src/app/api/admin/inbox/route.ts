import { NextResponse } from "next/server";
import { and, eq, or, asc, sql as raw } from "drizzle-orm";
import { db } from "@/lib/db";
import { messages, users, photos, adminAuditLogs } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { pickProfilePhoto } from "@/lib/photos";

async function requireAdmin() {
  const session = await getSession();
  if (!session?.isAdmin) return null;
  return session;
}

type Row = Record<string, unknown>;
function rowsOf(result: unknown): Row[] {
  if (Array.isArray(result)) return result as Row[];
  const r = result as { rows?: Row[] };
  return r?.rows ?? [];
}

/**
 * Admin Open Inbox, shaped like the prototype: a grid of every profile with
 * its message count, then a three-pane view of one profile's inbox.
 *
 * Three modes:
 *   (no params)            -> profile grid
 *   ?profile=ID            -> that profile's conversation list
 *   ?profile=ID&with=ID    -> one thread + the other party's contact details
 *
 * Aggregation happens in Postgres. Reading a thread writes an audit row: the
 * privacy page promises members that message access is limited to moderation,
 * which only means anything if each read is attributable.
 */
export async function GET(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const profileId = Number(searchParams.get("profile"));
  const withId = Number(searchParams.get("with"));
  const hasProfile = Number.isInteger(profileId) && profileId > 0;
  const hasWith = Number.isInteger(withId) && withId > 0;

  // ---- Mode 3: one thread --------------------------------------------------
  if (hasProfile && hasWith) {
    const thread = await db
      .select({
        id: messages.id,
        body: messages.body,
        fromUserId: messages.fromUserId,
        readAt: messages.readAt,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(
        or(
          and(eq(messages.fromUserId, profileId), eq(messages.toUserId, withId)),
          and(eq(messages.fromUserId, withId), eq(messages.toUserId, profileId))
        )
      )
      .orderBy(asc(messages.createdAt));

    const [other] = await db
      .select({
        id: users.id,
        name: users.name,
        age: users.age,
        email: users.email,
        phone: users.phone,
        location: users.location,
        tier: users.tier,
        isBanned: users.isBanned,
        identityStatus: users.identityStatus,
        createdAt: users.createdAt,
        lastSeenAt: users.lastSeenAt,
      })
      .from(users)
      .where(eq(users.id, withId))
      .limit(1);

    const [owner] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, profileId))
      .limit(1);

    try {
      await db.insert(adminAuditLogs).values({
        adminUserId: session.userId,
        action: "read_conversation",
        targetType: "conversation",
        targetId: `${Math.min(profileId, withId)}-${Math.max(profileId, withId)}`,
        detail: `${owner?.name ?? profileId} / ${other?.name ?? withId} - ${thread.length} messages`,
      });
    } catch (err) {
      console.error("audit log write failed", err);
    }

    return NextResponse.json({
      contact: other
        ? {
            ...other,
            verified: other.identityStatus === "verified",
            // No IP is recorded anywhere at present - see the note in the UI.
            ip: null,
          }
        : null,
      ownerName: owner?.name ?? "",
      // "mine" = sent BY the profile whose inbox we are looking at, so the
      // bubbles read the same way they do for that member.
      thread: thread.map((m) => ({
        id: m.id,
        body: m.body,
        mine: m.fromUserId === profileId,
        read: Boolean(m.readAt),
        createdAt: m.createdAt,
      })),
    });
  }

  // ---- Mode 2: one profile's conversations ---------------------------------
  if (hasProfile) {
    const result = await db.execute(raw`
      -- other_id is computed once in \`base\` so both the GROUP BY and the
      -- DISTINCT ON can refer to it as a plain column. Repeating the CASE
      -- expression instead fails with 42P10: the driver turns each
      -- occurrence into a different bind parameter ($1 vs $5), so Postgres
      -- does not consider them the same expression.
      with base as (
        select
          case when from_user_id = ${profileId} then to_user_id else from_user_id end as other_id,
          from_user_id, to_user_id, body, read_at, created_at
        from messages
        where from_user_id = ${profileId} or to_user_id = ${profileId}
      ),
      convo as (
        select
          other_id,
          count(*)::int                                                    as message_count,
          max(created_at)                                                  as last_message_at
        from base
        group by other_id
      ),
      unread_counts as (
        select other_id, count(*)::int as unread
        from base
        where read_at is null and from_user_id = other_id
        group by other_id
      ),
      latest as (
        select distinct on (other_id)
          other_id, body as last_message, from_user_id as last_from_user_id
        from base
        order by other_id, created_at desc
      )
      select c.other_id, c.message_count, coalesce(uc.unread, 0) as unread,
             c.last_message_at, l.last_message, l.last_from_user_id,
             u.name, u.age, u.is_banned, u.tier
      from convo c
      join latest l on l.other_id = c.other_id
      left join unread_counts uc on uc.other_id = c.other_id
      left join users u on u.id = c.other_id
      order by c.last_message_at desc
      limit 200
    `);

    const rows = rowsOf(result);
    const [profile] = await db
      .select({ id: users.id, name: users.name, gender: users.gender })
      .from(users)
      .where(eq(users.id, profileId))
      .limit(1);

    return NextResponse.json({
      profile: profile ?? null,
      conversations: rows.map((r) => ({
        id: Number(r.other_id),
        name: (r.name as string) ?? "Deleted user",
        age: r.age as number | null,
        tier: (r.tier as string) ?? "free",
        isBanned: Boolean(r.is_banned),
        messageCount: Number(r.message_count),
        unread: Number(r.unread),
        lastMessage: (r.last_message as string) ?? "",
        lastMessageMine: Number(r.last_from_user_id) === profileId,
        lastMessageAt: r.last_message_at,
      })),
    });
  }

  // ---- Mode 1: profile grid ------------------------------------------------
  // Every member, with how many messages their inbox holds. Profiles with
  // traffic float to the top; quiet ones still appear so a moderator can go
  // looking rather than only reacting.
  const result = await db.execute(raw`
    select
      u.id, u.name, u.gender, u.tier, u.is_banned, u.profile_source,
      coalesce(m.total, 0)::int  as message_count,
      coalesce(m.unread, 0)::int as unread,
      m.last_message_at
    from users u
    left join (
      -- Each message counts towards both participants' inboxes, so unnest
      -- sender and recipient into one row per side and group by that.
      select
        t.uid,
        count(*)::int                                        as total,
        count(*) filter (where read_at is null
                         and to_user_id = t.uid)::int        as unread,
        max(created_at)                                      as last_message_at
      from messages
      cross join lateral (values (from_user_id), (to_user_id)) as t(uid)
      group by t.uid
    ) m on m.uid = u.id
    where u.is_admin = false
    order by coalesce(m.total,0) desc, u.name asc
    limit 300
  `);

  const rows = rowsOf(result);
  const ids = rows.map((r) => Number(r.id));

  // One photo query for the whole grid rather than one per card.
  const allPhotos =
    ids.length > 0
      ? await db
          .select({
            userId: photos.userId,
            key: photos.key,
            role: photos.role,
            position: photos.position,
          })
          .from(photos)
          .orderBy(asc(photos.position))
      : [];

  const photosByUser = new Map<number, typeof allPhotos>();
  for (const p of allPhotos) {
    if (!ids.includes(p.userId)) continue;
    photosByUser.set(p.userId, [...(photosByUser.get(p.userId) ?? []), p]);
  }

  const profiles = [];
  for (const r of rows) {
    const id = Number(r.id);
    const avatar = pickProfilePhoto(photosByUser.get(id) ?? []);
    profiles.push({
      id,
      name: (r.name as string) ?? "",
      gender: ((r.gender as string) ?? "").toLowerCase(),
      tier: (r.tier as string) ?? "free",
      isBanned: Boolean(r.is_banned),
      isModelProfile: r.profile_source === "admin",
      messageCount: Number(r.message_count),
      unread: Number(r.unread),
      lastMessageAt: r.last_message_at ?? null,
      avatar: avatar ? `/api/media/${avatar.key}` : null,
    });
  }

  return NextResponse.json({ profiles });
}

export const dynamic = "force-dynamic";
