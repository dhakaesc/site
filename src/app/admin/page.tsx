import { redirect } from "next/navigation";
import { count, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, messages, photos } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import AdminUsersTable from "./users-table";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.isAdmin) redirect("/dashboard");

  const [[totalUsers], [totalMessages], [totalPhotos], [paidUsers]] =
    await Promise.all([
      db.select({ value: count() }).from(users),
      db.select({ value: count() }).from(messages),
      db.select({ value: count() }).from(photos),
      db.select({ value: count() }).from(users).where(eq(users.tier, "plus")),
    ]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar scrolls independently of the main panel. */}
      <aside className="w-[250px] shrink-0 border-r border-border-hair bg-surface p-5 overflow-y-auto">
        <div className="font-serif italic text-lg mb-6">♥ AMOURA</div>
        <nav className="space-y-1 text-sm">
          <div className="rounded-[10px] bg-surface-2 px-3 py-2">Overview</div>
          <a
            href="/dashboard"
            className="block rounded-[10px] px-3 py-2 text-stone hover:text-ivory"
          >
            My dashboard
          </a>
          <a
            href="/browse"
            className="block rounded-[10px] px-3 py-2 text-stone hover:text-ivory"
          >
            Browse
          </a>
          <a
            href="/messages"
            className="block rounded-[10px] px-3 py-2 text-stone hover:text-ivory"
          >
            Messages
          </a>
        </nav>
      </aside>

      {/* Main panel scrolls independently of the sidebar. */}
      <main className="flex-1 min-w-0 overflow-y-auto p-8">
        <h1 className="font-serif text-2xl mb-6">Admin overview</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Stat label="Total users" value={totalUsers.value} />
          <Stat label="Plus members" value={paidUsers.value} />
          <Stat label="Messages sent" value={totalMessages.value} />
          <Stat label="Photos uploaded" value={totalPhotos.value} />
        </div>

        <AdminUsersTable />
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[14px] border border-border-hair bg-surface p-4">
      <div className="font-mono text-2xl">{value}</div>
      <div className="text-stone text-xs mt-1">{label}</div>
    </div>
  );
}
