import { NextResponse } from "next/server";
import { and, eq, or, desc, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { messages, users, photos, likes, blocks } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";

/**
 * Returns the people this user can chat with (mutual matches), each with
 * their most recent message and unread count.
 */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const me = session.userId;

  // Mutual matches: I liked them AND they liked me.
  const iLiked = await db
    .select({ toUserId: likes.toUserId })
    .from(likes)
    .where(and(eq(likes.fromUserId, me), eq(likes.liked, true)));

  const likedMe = await db
    .select({ fromUserId: likes.fromUserId })
    .from(likes)
    .where(and(eq(likes.toUserId, me), eq(likes.liked, true)));

  const likedMeSet = new Set(likedMe.map((r) => r.fromUserId));
  let matchIds = iLiked
    .map((r) => r.toUserId)
    .filter((id) => likedMeSet.has(id));

  if (matchIds.length === 0) {
    return NextResponse.json({ conversations: [] });
  }

  const blockRows = await db
    .select({
      blockerUserId: blocks.blockerUserId,
      blockedUserId: blocks.blockedUserId,
    })
    .from(blocks)
    .where(or(eq(blocks.blockerUserId, me), eq(blocks.blockedUserId, me)));

  const blockedIds = new Set(
    blockRows.map((r) => (r.blockerUserId === me ? r.blockedUserId : r.blockerUserId))
  );
  matchIds = matchIds.filter((id) => !blockedIds.has(id));

  if (matchIds.length === 0) {
    return NextResponse.json({ conversations: [] });
  }

  const matchUsers = await db
    .select({ id: users.id, name: users.name, age: users.age })
    .from(users)
    .where(inArray(users.id, matchIds));

  const matchPhotos = await db
    .select()
    .from(photos)
    .where(inArray(photos.userId, matchIds));

  const avatarByUser = new Map<number, string>();
  for (const p of matchPhotos) {
    if (!avatarByUser.has(p.userId)) {
      avatarByUser.set(p.userId, `/api/media/${p.key}`);
    }
  }

  const allMessages = await db
    .select()
    .from(messages)
    .where(or(eq(messages.fromUserId, me), eq(messages.toUserId, me)))
    .orderBy(desc(messages.createdAt));

  const conversations = matchUsers.map((u) => {
    const thread = allMessages.filter(
      (m) =>
        (m.fromUserId === me && m.toUserId === u.id) ||
        (m.fromUserId === u.id && m.toUserId === me)
    );
    const last = thread[0];
    const unread = thread.filter(
      (m) => m.toUserId === me && m.readAt === null
    ).length;

    return {
      user: { ...u, avatar: avatarByUser.get(u.id) ?? null },
      lastMessage: last
        ? { body: last.body, createdAt: last.createdAt, fromMe: last.fromUserId === me }
        : null,
      unread,
    };
  });

  // Most recently active conversations first, then matches with no messages.
  conversations.sort((a, b) => {
    const at = a.lastMessage?.createdAt
      ? new Date(a.lastMessage.createdAt).getTime()
      : 0;
    const bt = b.lastMessage?.createdAt
      ? new Date(b.lastMessage.createdAt).getTime()
      : 0;
    return bt - at;
  });

  return NextResponse.json({ conversations });
}
