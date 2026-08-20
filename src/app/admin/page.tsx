import { redirect } from "next/navigation";
import Link from "next/link";
import { and, count, eq, gte, sum } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, messages, paymentRequests, reports } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { effectiveTier } from "@/lib/plans";
import AdminUsersTable from "./users-table";
import AdminPaymentsTable from "./payments-table";
import AdminSidebar from "./admin-sidebar";
import { Icon } from "../_home/pieces";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.isAdmin) redirect("/dashboard");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    allUsers,
    [me],
    [messagesToday],
    [revenueThisMonth],
    [pendingVerifications],
    [openReports],
  ] = await Promise.all([
    db
      .select({
        id: users.id,
        tier: users.tier,
        tierExpiresAt: users.tierExpiresAt,
        createdAt: users.createdAt,
      })
      .from(users),
    db
      .select({ name: users.name, tier: users.tier, tierExpiresAt: users.tierExpiresAt })
      .from(users)
      .where(eq(users.id, session.userId)),
    db
      .select({ value: count() })
      .from(messages)
      .where(gte(messages.createdAt, startOfToday)),
    db
      .select({ value: sum(paymentRequests.amount) })
      .from(paymentRequests)
      .where(and(eq(paymentRequests.status, "approved"), gte(paymentRequests.createdAt, startOfMonth))),
    db.select({ value: count() }).from(users).where(eq(users.identityStatus, "pending")),
    db.select({ value: count() }).from(reports).where(eq(reports.status, "open")),
  ]);

  const tierCounts = { free: 0, plus: 0, vip: 0 };
  for (const u of allUsers) {
    tierCounts[effectiveTier(u.tier, u.tierExpiresAt)] += 1;
  }

  // Daily signups for the last 30 days, oldest first.
  const dayBuckets = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    dayBuckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const u of allUsers) {
    if (u.createdAt >= thirtyDaysAgo) {
      const key = u.createdAt.toISOString().slice(0, 10);
      if (dayBuckets.has(key)) dayBuckets.set(key, (dayBuckets.get(key) ?? 0) + 1);
    }
  }
  const counts = [...dayBuckets.values()];
  const maxCount = Math.max(1, ...counts);
  const points = counts
    .map((c, i) => {
      const x = (i / (counts.length - 1)) * 400;
      const y = 110 - (c / maxCount) * 100;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const myTier = effectiveTier(me?.tier ?? "free", me?.tierExpiresAt);
  const needsAttentionTotal = pendingVerifications.value + openReports.value;

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar active="Dashboard" />

      <main className="flex-1 min-w-0 overflow-y-auto p-8">
        {/* Topbar */}
        <div className="flex items-center gap-4 mb-6">
          <div>
            <div className="font-mono text-[11px] tracking-[2px] uppercase text-gold-bright">
              Welcome back
            </div>
            <h2 className="text-2xl font-serif">{me?.name ?? "Admin"}</h2>
          </div>
          <TierPill tier={myTier} />
          <div className="flex-1" />
          <div className="relative w-9 h-9 rounded-full bg-surface border border-border-hair flex items-center justify-center text-stone">
            <Icon name="bell" />
            {needsAttentionTotal > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-danger text-white text-[9px] font-bold flex items-center justify-center px-1">
                {needsAttentionTotal}
              </span>
            )}
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-bright to-gold flex items-center justify-center text-[#2a1c05] font-serif font-semibold">
            {(me?.name ?? "A")[0]}
          </div>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <DStat icon="users" label="Total profiles" value={allUsers.length.toLocaleString()} />
          <DStat
            icon="dollar"
            label="Revenue this month"
            value={`৳${Number(revenueThisMonth.value ?? 0).toLocaleString()}`}
          />
          <DStat icon="inbox" label="Messages sent today" value={messagesToday.value.toLocaleString()} />
        </div>

        {/* Members by tier */}
        <h3 className="text-[15px] font-semibold mt-6 mb-3">Members by tier</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-[16px] border border-border-hair bg-surface p-4">
            <div className="w-8 h-8 rounded-[9px] bg-white/[0.06] flex items-center justify-center text-stone">
              <Icon name="users" />
            </div>
            <div className="font-mono text-2xl mt-3">{tierCounts.free.toLocaleString()}</div>
            <div className="text-stone text-xs mt-1">Free members</div>
          </div>
          <div className="rounded-[16px] border border-gold-bright/35 bg-surface p-4">
            <div className="w-8 h-8 rounded-[9px] bg-gold-bright/15 flex items-center justify-center text-gold-bright">
              <Icon name="bolt" />
            </div>
            <div className="font-mono text-2xl mt-3 text-gold-bright">{tierCounts.plus.toLocaleString()}</div>
            <div className="text-stone text-xs mt-1">Plus members</div>
          </div>
          <div className="rounded-[16px] border border-gold bg-surface p-4">
            <div className="w-8 h-8 rounded-[9px] bg-gold-bright/20 flex items-center justify-center text-gold-bright">
              <Icon name="crown" />
            </div>
            <div className="font-mono text-2xl mt-3 text-gold-bright">{tierCounts.vip.toLocaleString()}</div>
            <div className="text-stone text-xs mt-1">VIP members</div>
          </div>
        </div>

        {/* Chart + needs attention */}
        <div className="flex gap-5 mt-6 flex-wrap">
          <div className="flex-[2] min-w-[320px] rounded-[18px] border border-border-hair bg-surface p-5">
            <h3 className="text-[15px] font-semibold mb-3">Signups, last 30 days</h3>
            <svg viewBox="0 0 400 120" className="w-full h-[120px]">
              <polyline points={points} fill="none" stroke="var(--gold)" strokeWidth="2.5" />
            </svg>
          </div>
          <div className="flex-1 min-w-[260px] rounded-[18px] border border-border-hair bg-surface p-5">
            <h3 className="text-[15px] font-semibold mb-3.5">Needs attention</h3>
            <Link
              href="/admin/verification"
              className="flex justify-between text-[12.5px] py-2 border-b border-white/5 hover:text-ivory text-stone"
            >
              <span>Pending verifications</span>
              <span className="rounded-full bg-gold-bright/15 border border-gold-bright/35 text-gold-bright text-[11px] font-semibold px-2.5 py-0.5">
                {pendingVerifications.value}
              </span>
            </Link>
            <Link
              href="/admin/reports"
              className="flex justify-between text-[12.5px] py-2 border-b border-white/5 hover:text-ivory text-stone"
            >
              <span>Reported profiles</span>
              <span className="rounded-full bg-danger/15 border border-danger/35 text-danger text-[11px] font-semibold px-2.5 py-0.5">
                {openReports.value}
              </span>
            </Link>
            <Link
              href="/admin/tickets"
              className="flex justify-between text-[12.5px] py-2 hover:text-ivory text-stone"
            >
              <span>Support tickets open</span>
              <span className="rounded-full bg-info/15 border border-info/35 text-info text-[11px] font-semibold px-2.5 py-0.5">
                0
              </span>
            </Link>
          </div>
        </div>

        {/* Quick actions */}
        <h3 className="text-[15px] font-semibold mt-6 mb-3">Quick actions</h3>
        <div className="flex gap-2.5 flex-wrap mb-8">
          <Link
            href="/admin/verification"
            className="inline-flex items-center gap-1.5 rounded-[10px] bg-gradient-to-b from-gold-bright to-gold text-[#2a1c05] text-sm font-semibold px-4 py-2"
          >
            <Icon name="check" /> Review verifications
          </Link>
          <Link
            href="/admin/inbox"
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-border-hair text-sm px-4 py-2"
          >
            <Icon name="inbox" /> Open Inbox
          </Link>
          <Link
            href="/admin/cms"
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-border-hair text-sm px-4 py-2"
          >
            <Icon name="layout" /> Edit site content
          </Link>
        </div>

        <AdminPaymentsTable />
        <AdminUsersTable />
      </main>
    </div>
  );
}

function DStat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-border-hair bg-surface p-4">
      <div className="w-8 h-8 rounded-[9px] bg-gold-bright/10 flex items-center justify-center text-gold-bright">
        <Icon name={icon} />
      </div>
      <div className="font-mono text-2xl mt-3">{value}</div>
      <div className="text-stone text-xs mt-1">{label}</div>
    </div>
  );
}

function TierPill({ tier }: { tier: "free" | "plus" | "vip" }) {
  if (tier === "vip") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-bright/15 border border-gold-bright/35 text-gold-bright text-[11px] font-semibold px-3 py-1.5">
        <Icon name="crown" /> VIP member
      </span>
    );
  }
  if (tier === "plus") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-bright/15 border border-gold-bright/35 text-gold-bright text-[11px] font-semibold px-3 py-1.5">
        <Icon name="bolt" /> Plus member
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-border-hair text-stone text-[11px] font-semibold px-3 py-1.5">
      Free member
    </span>
  );
}
