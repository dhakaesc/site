import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import AdminSidebar from "../admin-sidebar";
import BannedUsersTable from "./banned-users-table";

export default async function AdminBannedPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.isAdmin) redirect("/dashboard");

  const banned = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      tier: users.tier,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.isBanned, true));

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar active="Banned Users" />
      <main className="flex-1 min-w-0 overflow-y-auto p-8">
        <h1 className="font-serif text-2xl mb-1">Banned Users</h1>
        <p className="text-stone text-sm mb-6">
          {banned.length} {banned.length === 1 ? "account is" : "accounts are"} currently banned.
        </p>
        <BannedUsersTable initial={banned.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))} />
      </main>
    </div>
  );
}
