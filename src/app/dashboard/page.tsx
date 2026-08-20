import { redirect } from "next/navigation";
import Link from "next/link";
import { and, eq, or, isNull, count } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users, messages, likes, paymentRequests } from "@/lib/db/schema";
import { limitsFor, effectiveTier } from "@/lib/plans";
import LogoutButton from "./logout-button";
import SpotlightButton from "./spotlight-button";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (!user) redirect("/login");

  const activeTier = effectiveTier(user.tier, user.tierExpiresAt);
  const limits = limitsFor(activeTier);
  const unlimited = !Number.isFinite(limits.messages);
  const messagesLeft = unlimited
    ? null
    : Math.max(limits.messages - user.messagesUsed, 0);

  const [[unread], [likesReceived], [pendingPayment]] = await Promise.all([
    db
      .select({ value: count() })
      .from(messages)
      .where(
        and(eq(messages.toUserId, user.id), isNull(messages.readAt))
      ),
    db
      .select({ value: count() })
      .from(likes)
      .where(and(eq(likes.toUserId, user.id), eq(likes.liked, true))),
    db
      .select({ tier: paymentRequests.tier })
      .from(paymentRequests)
      .where(
        and(
          eq(paymentRequests.userId, user.id),
          eq(paymentRequests.status, "pending")
        )
      )
      .limit(1),
  ]);

  return (
    <main className="min-h-screen px-6 py-10 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="font-serif italic text-xl">♥ AMOURA</div>
        <div className="flex items-center gap-3">
          {user.isAdmin && (
            <Link
              href="/admin"
              className="text-sm text-gold-bright rounded-[10px] border border-border-hair px-4 py-2"
            >
              Admin
            </Link>
          )}
          <LogoutButton />
        </div>
      </div>

      <div className="rounded-[22px] border border-border-hair bg-surface p-8">
        <h1 className="font-serif text-2xl mb-1">
          Welcome, {user.name.split(" ")[0]}
        </h1>
        <p className="text-stone text-sm mb-6">
          You are on the{" "}
          <span className="text-gold-bright font-semibold capitalize">
            {activeTier}
          </span>{" "}
          plan
          {activeTier !== "free" && user.tierExpiresAt && (
            <>
              {" "}
              until{" "}
              {new Date(user.tierExpiresAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </>
          )}
          .
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Stat label="Plan" value={activeTier.toUpperCase()} />
          <Stat
            label="Messages left"
            value={
              unlimited ? "Unlimited" : `${messagesLeft} / ${limits.messages}`
            }
          />
          <Stat label="Unread" value={String(unread.value)} />
          <Stat label="Likes received" value={String(likesReceived.value)} />
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <Link
            href="/browse"
            className="rounded-[14px] bg-gradient-to-b from-rose-bright to-rose px-6 py-3 text-sm font-semibold text-white"
          >
            Browse profiles
          </Link>
          <Link
            href="/messages"
            className="rounded-[14px] border border-border-hair px-6 py-3 text-sm font-semibold"
          >
            Messages
          </Link>
          <Link
            href="/likes-me"
            className="rounded-[14px] border border-border-hair px-6 py-3 text-sm font-semibold"
          >
            Who liked you
          </Link>
          <SpotlightButton
            isVip={activeTier === "vip"}
            initiallyActive={Boolean(
              user.spotlightUntil && user.spotlightUntil.getTime() > Date.now()
            )}
          />
          <Link
            href="/profile/edit"
            className="rounded-[14px] border border-border-hair px-6 py-3 text-sm font-semibold"
          >
            Edit your photos
          </Link>
        </div>

        {pendingPayment && (
          <div className="rounded-[14px] border border-gold/40 bg-gold/10 px-5 py-4 mt-6 text-[13px]">
            <p className="text-gold-bright font-semibold text-sm mb-1">
              Your {pendingPayment.tier.toUpperCase()} payment is being verified
            </p>
            <p className="text-stone">
              We're checking your transaction now and you'll get an email as
              soon as your plan is live — usually within a few hours. Nothing
              else is needed from you.
            </p>
          </div>
        )}

        {activeTier === "free" && !pendingPayment && (
          <Link
            href="/pricing"
            className="inline-block mt-6 rounded-[14px] bg-gradient-to-b from-gold-bright to-gold px-6 py-3 text-sm font-semibold text-[#2a1c05]"
          >
            Upgrade to Plus
          </Link>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-border-hair bg-surface-2 p-4">
      <div className="text-lg font-semibold font-mono">{value}</div>
      <div className="text-stone text-xs mt-1">{label}</div>
    </div>
  );
}
