import { redirect } from "next/navigation";
import { and, count, eq, sum } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, messages, photos, paymentRequests } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import AdminUsersTable from "./users-table";
import AdminPaymentsTable from "./payments-table";
import AdminSidebar from "./admin-sidebar";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.isAdmin) redirect("/dashboard");

  const [
    [totalUsers],
    [totalMessages],
    [totalPhotos],
    [approvedPayments],
    [pendingPayments],
    [revenue],
  ] = await Promise.all([
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(messages),
    db.select({ value: count() }).from(photos),
    db
      .select({ value: count() })
      .from(paymentRequests)
      .where(eq(paymentRequests.status, "approved")),
    db
      .select({ value: count() })
      .from(paymentRequests)
      .where(eq(paymentRequests.status, "pending")),
    db
      .select({ value: sum(paymentRequests.amount) })
      .from(paymentRequests)
      .where(eq(paymentRequests.status, "approved")),
  ]);

  const totalRevenue = Number(revenue.value ?? 0);

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar active="Dashboard" />

      {/* Main panel scrolls independently of the sidebar. */}
      <main className="flex-1 min-w-0 overflow-y-auto p-8">
        <h1 className="font-serif text-2xl mb-6">Admin overview</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <Stat label="Total users" value={String(totalUsers.value)} />
          <Stat
            label="Paid signups"
            value={String(approvedPayments.value)}
            highlight
          />
          <Stat
            label="Revenue"
            value={`৳${totalRevenue.toLocaleString()}`}
            highlight
          />
          <Stat label="Pending payments" value={String(pendingPayments.value)} />
          <Stat label="Messages sent" value={String(totalMessages.value)} />
          <Stat label="Photos uploaded" value={String(totalPhotos.value)} />
        </div>

        <AdminPaymentsTable />
        <AdminUsersTable />
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-[14px] border p-4 ${
        highlight
          ? "border-gold/40 bg-gold/10"
          : "border-border-hair bg-surface"
      }`}
    >
      <div
        className={`font-mono text-xl ${highlight ? "text-gold-bright" : ""}`}
      >
        {value}
      </div>
      <div className="text-stone text-xs mt-1">{label}</div>
    </div>
  );
}
