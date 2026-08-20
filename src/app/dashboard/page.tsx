import { redirect } from "next/navigation";
import Link from "next/link";
import { and, eq, or, isNull, count, desc, inArray, ne } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users, messages, likes, photos } from "@/lib/db/schema";
import { limitsFor, effectiveTier } from "@/lib/plans";
import { Icon, ProfileCard, PhotoGrid } from "../_home/pieces";
import MemberSidebar from "../_shared/member-sidebar";
import LogoutButton from "./logout-button";
import SpotlightButton from "./spotlight-button";

const TONES = ["p1", "p5", "p3", "p4", "p6", "p2"] as const;

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  if (!user) redirect("/login");

  const activeTier = effectiveTier(user.tier, user.tierExpiresAt);
  const limits = limitsFor(activeTier);
  const unlimited = !Number.isFinite(limits.messages);
  const messagesLeft = unlimited ? null : Math.max(limits.messages - user.messagesUsed, 0);

  const [[unread], [likesReceived], recentMsgs, iLiked, likedMe] = await Promise.all([
    db.select({ value: count() }).from(messages)
      .where(and(eq(messages.toUserId, user.id), isNull(messages.readAt))),
    db.select({ value: count() }).from(likes)
      .where(and(eq(likes.toUserId, user.id), eq(likes.liked, true))),
    db.select().from(messages)
      .where(or(eq(messages.toUserId, user.id), eq(messages.fromUserId, user.id)))
      .orderBy(desc(messages.createdAt)).limit(4),
    db.select({ toUserId: likes.toUserId }).from(likes)
      .where(and(eq(likes.fromUserId, user.id), eq(likes.liked, true))),
    db.select({ fromUserId: likes.fromUserId }).from(likes)
      .where(and(eq(likes.toUserId, user.id), eq(likes.liked, true))),
  ]);

  const likedMeSet = new Set(likedMe.map((r) => r.fromUserId));
  const matchCount = iLiked.filter((r) => likedMeSet.has(r.toUserId)).length;

  // Discover strip
  const discover = await db
    .select({ id: users.id, name: users.name, age: users.age, location: users.location })
    .from(users)
    .where(and(eq(users.isBanned, false), eq(users.isPublished, true), ne(users.id, user.id)))
    .orderBy(desc(users.createdAt))
    .limit(4);

  // Names + cover photos for the recent-messages list and discover strip
  const otherIds = [
    ...new Set([
      ...recentMsgs.map((m) => (m.fromUserId === user.id ? m.toUserId : m.fromUserId)),
      ...discover.map((d) => d.id),
    ]),
  ];
  const people = otherIds.length
    ? await db.select({ id: users.id, name: users.name }).from(users).where(inArray(users.id, otherIds))
    : [];
  const nameById = new Map(people.map((p) => [p.id, p.name]));
  const coverPhotos = otherIds.length
    ? await db.select().from(photos).where(inArray(photos.userId, otherIds))
    : [];
  const photoByUser = new Map<number, string>();
  for (const ph of coverPhotos) {
    if (!photoByUser.has(ph.userId)) photoByUser.set(ph.userId, `/api/media/${ph.key}`);
  }

  return (
    <div className="flex min-h-screen">
      <MemberSidebar tier={activeTier} active="Dashboard" />

      <div className="flex-1 min-w-0 p-6 sm:p-8">
        {/* Topbar */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div>
            <div className="font-mono text-[11px] tracking-[2px] uppercase text-gold-bright">
              Welcome back
            </div>
            <h2 className="text-2xl font-serif">{user.name}</h2>
          </div>
          {activeTier === "vip" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-bright/15 border border-gold-bright/35 text-gold-bright text-[11px] font-semibold px-3 py-1.5">
              <Icon name="crown" /> VIP member
            </span>
          ) : activeTier === "plus" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-bright/15 border border-gold-bright/35 text-gold-bright text-[11px] font-semibold px-3 py-1.5">
              <Icon name="bolt" /> Plus member
            </span>
          ) : (
            <span className="inline-flex rounded-full border border-border-hair text-stone text-[11px] font-semibold px-3 py-1.5">
              Free member
            </span>
          )}
          <div className="flex-1" />
          {user.isAdmin && (
            <Link href="/admin" className="rounded-[10px] border border-border-hair px-4 py-2 text-sm">
              Admin
            </Link>
          )}
          <LogoutButton />
        </div>

        {/* Upgrade strip */}
        {activeTier === "free" && (
          <div className="rounded-[18px] border border-border-hair bg-surface/60 backdrop-blur-xl px-5 py-5 mb-6 flex justify-between items-center flex-wrap gap-3">
            <div>
              <div className="font-semibold text-sm">You are on the Free plan</div>
              <div className="text-stone text-xs mt-0.5">
                Upgrade to Plus for unlimited chat, or VIP for Profile Spotlight.
              </div>
            </div>
            <Link
              href="/pricing"
              className="rounded-[12px] bg-gradient-to-b from-gold-bright to-gold px-5 py-2.5 text-sm font-semibold text-[#2a1c05]"
            >
              Upgrade now
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <DStat icon="search" label="Plan" value={activeTier.toUpperCase()} />
          <DStat
            icon="msg"
            label="Messages left"
            value={unlimited ? "Unlimited" : `${messagesLeft} / ${limits.messages}`}
          />
          <DStat icon="heart" label="People who liked you" value={String(likesReceived.value)} locked={activeTier === "free"} />
          <DStat icon="star" label="Matches" value={String(matchCount)} />
        </div>

        {/* Who liked you + recent messages */}
        <div className="flex gap-5 mt-6 flex-wrap">
          <div className="flex-[2] min-w-[320px] rounded-[18px] border border-border-hair bg-surface p-5">
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="text-[15px] font-semibold">Who liked you</h3>
              {activeTier === "free" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-bright/15 border border-gold-bright/35 text-gold-bright text-[11px] font-semibold px-2.5 py-1">
                  <Icon name="lock" /> Plus feature
                </span>
              )}
            </div>
            {activeTier === "free" ? (
              <>
                <PhotoGrid unlocked={0} total={likesReceived.value} />
                <Link
                  href="/pricing"
                  className="inline-block mt-4 rounded-[12px] bg-gradient-to-b from-gold-bright to-gold px-5 py-2.5 text-sm font-semibold text-[#2a1c05]"
                >
                  Unlock with Plus →
                </Link>
              </>
            ) : (
              <Link
                href="/likes-me"
                className="inline-block rounded-[12px] bg-gradient-to-b from-rose-bright to-rose px-5 py-2.5 text-sm font-semibold text-white"
              >
                See who liked you →
              </Link>
            )}
          </div>

          <div className="flex-1 min-w-[260px] rounded-[18px] border border-border-hair bg-surface p-5">
            <h3 className="text-[15px] font-semibold mb-3.5">Recent messages</h3>
            {recentMsgs.length === 0 ? (
              <p className="text-stone text-xs">No messages yet.</p>
            ) : (
              recentMsgs.map((m) => {
                const otherId = m.fromUserId === user.id ? m.toUserId : m.fromUserId;
                return (
                  <Link
                    key={m.id}
                    href={`/messages/${otherId}`}
                    className="flex gap-2.5 py-2.5 border-b border-white/[0.04] last:border-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-surface-2 overflow-hidden shrink-0 flex items-center justify-center text-xs">
                      {photoByUser.get(otherId) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photoByUser.get(otherId)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        (nameById.get(otherId) ?? "?")[0]
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-semibold">{nameById.get(otherId) ?? "Unknown"}</div>
                      <div className="text-stone text-[11.5px] truncate">{m.body}</div>
                    </div>
                  </Link>
                );
              })
            )}
            <div className="text-stone text-[11px] mt-3">
              {unread.value} unread
            </div>
          </div>
        </div>

        {/* Discover */}
        <div className="flex items-baseline justify-between mt-7 mb-3">
          <h3 className="text-[15px] font-semibold">Discover</h3>
          <Link href="/browse" className="text-stone text-xs hover:text-ivory">Browse all →</Link>
        </div>
        {discover.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {discover.map((d, i) => (
              <ProfileCard
                key={d.id}
                id={d.id}
                name={d.name}
                age={d.age}
                loc={d.location || "Bangladesh"}
                tone={TONES[i % TONES.length]}
                photo={photoByUser.get(d.id) ?? undefined}
              />
            ))}
          </div>
        ) : (
          <p className="text-stone text-sm">No other profiles yet.</p>
        )}

        <div className="mt-7 flex gap-2.5 flex-wrap">
          <SpotlightButton
            isVip={activeTier === "vip"}
            initiallyActive={Boolean(user.spotlightUntil && user.spotlightUntil.getTime() > Date.now())}
          />
          <Link href="/profile/edit" className="rounded-[14px] border border-border-hair px-6 py-3 text-sm font-semibold">
            Edit your profile
          </Link>
        </div>
      </div>
    </div>
  );
}

function DStat({
  icon, label, value, locked,
}: { icon: string; label: string; value: string; locked?: boolean }) {
  return (
    <div className="rounded-[16px] border border-border-hair bg-surface p-4 relative">
      <div className="w-8 h-8 rounded-[9px] bg-gold-bright/10 flex items-center justify-center text-gold-bright">
        <Icon name={icon} />
      </div>
      <div className={`font-mono text-xl mt-3 ${locked ? "blur-[5px]" : ""}`}>{value}</div>
      <div className="text-stone text-xs mt-1">{label}</div>
      {locked && (
        <span className="absolute top-3.5 right-3.5 text-gold-bright">
          <Icon name="lock" />
        </span>
      )}
    </div>
  );
}
